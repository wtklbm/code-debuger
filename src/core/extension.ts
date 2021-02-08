import * as extractZip from "extract-zip";
import * as fs from "fs-extra";
import * as micromatch from "micromatch";
import fetch from "node-fetch";
import * as path from "path";
import * as tmp from "tmp";
import * as vscode from "vscode";
import { CaseInsensitiveMap } from "../collections";
import { localize } from "../i18n";

import { IExtension, IExtensionMeta, QueryFilterType, QueryFlag } from "../types";
import { clearSpinner, getExtensionById, showReloadBox, showSpinner } from "../utils";
import { downloadFile } from "../utils/download";
import { Environment } from "./environment";
import { ExtensionStorage } from "./storage";

tmp.setGracefulCleanup();

export class Extension {
  private static _instance: Extension;

  private _env: Environment;
  private _storage: ExtensionStorage;

  private constructor() {
    this._env = Environment.create();
    this._storage = ExtensionStorage.create();
  }

  public static create(): Extension {
    if (!Extension._instance) {
      Extension._instance = new Extension();
    }

    return Extension._instance;
  }

  public static get instance(): Extension {
    return Extension.create();
  }

  /**
   * 检查并安装扩展
   * @param ids 
   */
  public async checkToInstall(ids: string[]): Promise<boolean> {
    let uids = this.getUninstalled(ids);

    if (uids.length) {
      let queriedExtensions = await this.queryExtensions(uids);
      let extensions: IExtension[] = [];

      queriedExtensions.forEach((ext, key) => {
        let latestVersion = this.getLatestVSIXVersion(ext);
        if (latestVersion) {
          extensions.push({
            id: key,
            name: ext.extensionName.toLowerCase(),
            publisher: ext.publisher.publisherName,
            version: latestVersion
          })
        }
      })

      await this.installExtensions(extensions);

      let disabled = this._storage.getDisabledExtension(uids).map(id => `${queriedExtensions.get(id)?.displayName}`);
      if (disabled.length) {
        showReloadBox(localize('toast.box.enable.extension', disabled.join(',')));
      } else {
        showReloadBox();
      }

      return true;
    }

    return false;
  }

  private getUninstalled(ids: string[]): string[] {
    let result: string[] = [];
    let exts = this.getAll();
    // @ts-ignore
    result = ids.map(id => {
      if (!exts.find(ext => id.toLowerCase() === ext.id.toLowerCase())) {
        return id;
      }
    }).filter(item => !!item)
    
    return result;
  }

  private async installExtensions(extensions: IExtension[]) {
    let steps = 0
    let total = extensions.length;

    for (const item of extensions) {
      try {
        steps++;
        showSpinner(localize("toast.settings.downloading.extension", item.id), steps, total);
        const extension = await this.downloadExtension(item);
        showSpinner(localize("toast.settings.installing.extension", item.id), steps, total);

        await this.extractExtension(extension);
      } catch (error) {

      }
    }

    clearSpinner();

    await this.updateObsolete(extensions);
  }

  /**
   * 获取全部已安装的扩展（不包括禁用的扩展）
   *
   * @param excludedPatterns The glob patterns of the extensions that should be excluded.
   */
  private getAll(excludedPatterns: string[] = []): IExtension[] {
    let item: IExtension;
    const result: IExtension[] = [];
    for (const ext of vscode.extensions.all) {
      if (
        !ext.packageJSON.isBuiltin
        && !excludedPatterns.some((pattern) => micromatch.isMatch(ext.id, pattern, { nocase: true }))
      ) {
        item = {
          id: ext.id,
          name: ext.packageJSON.name,
          publisher: ext.packageJSON.publisher,
          version: ext.packageJSON.version
        };
        result.push(item);
      }
    }
    return result.sort((a, b) => (a.id || "").localeCompare(b.id || ""));
  }

  /**
   * 从扩展市场下载扩展
   */
  private downloadExtension(extension: IExtension): Promise<IExtension> {
    return new Promise((resolve, reject) => {
      // Create a temporary file, the file will be automatically closed and unlinked on process exit.
      tmp.file({ postfix: `.${extension.id}.zip` }, (err, filepath: string) => {
        if (err) {
          reject(err);
          return;
        }

        // Calculates the VSIX download URL.
        extension.downloadURL =
          `https://${extension.publisher}.gallery.vsassets.io/_apis/public/gallery/`
          + `publisher/${extension.publisher}/extension/${extension.name}/${extension.version}/`
          + "assetbyname/Microsoft.VisualStudio.Services.VSIXPackage?install=true";

        downloadFile(extension.downloadURL, filepath).then(() => {
          resolve({ ...extension, vsixFilepath: filepath });
        }).catch(reject);
      });
    });
  }

  /**
   * Extracts (install) extension vsix package.
   */
  private extractExtension(extension: IExtension): Promise<IExtension> {
    return new Promise((resolve, reject) => {
      const { vsixFilepath } = extension;
      if (vsixFilepath) {
        tmp.dir({ postfix: `.${extension.id}`, unsafeCleanup: true }, (err1, dirPath: string) => {
          if (err1) {
            reject(localize("error.extract.extension-2", extension.id));
          } else {
            extractZip(vsixFilepath, { dir: dirPath}).then(() => {
              const extPath = this._env.getExtensionDirectory(extension);
                fs.emptyDir(extPath)
                  .then(() => {
                    return fs.copy(path.join(dirPath, "extension"), extPath);
                  })
                  .then(() => {
                    resolve(extension);
                  })
                  .catch((err2) => {
                    reject(localize("error.extract.extension-1", extension.id, err2.message));
                  });
            }).catch(err3 => {
              reject(localize("error.extract.extension-1", extension.id, err3.message));
            })
          }
        });
      } else {
        reject(localize("error.extract.extension-3", extension.id));
      }
    });
  }

  /**
   * 卸载扩展
   */
  // @ts-ignore
  private async uninstallExtension(extension: IExtension): Promise<IExtension> {
    const localExtension = getExtensionById(extension.id);
    const extensionPath = localExtension
      ? localExtension.extensionPath
      : this._env.getExtensionDirectory(extension);
    try {
      await fs.remove(extensionPath);
    } catch (err) {
      throw new Error(localize("error.uninstall.extension", extension.id));
    }
    return extension;
  }

  /**
   * Updates the VSCode `.obsolete` file.
   */
  private async updateObsolete(added: IExtension[] = []): Promise<void> {
    const filepath = this._env.obsoleteFilePath;
    let obsolete: { [extensionFolderName: string]: boolean } | undefined;
    try {
      obsolete = await fs.readJson(filepath);
    } catch (err) {
    }

    if (obsolete) {
      for (const ext of added) {
        delete obsolete[this._env.getExtensionDirectoryName(ext)];
      }

      try {
        if (Object.keys(obsolete).length > 0) {
          await fs.outputJson(filepath, obsolete);
        } else {
          await fs.remove(filepath);
        }
      } catch (err) {
      }
    }
  }

  /**
   * 查询扩展元数据（meta data）
   *
   * @param {string[]} ids The id list of extensions. The id is in the form of: `publisher.name`.
   * @param {string} [proxy] The proxy settings.
   */
  private async queryExtensions(ids: string[]): Promise<CaseInsensitiveMap<string, IExtensionMeta>> {
    const result = new CaseInsensitiveMap<string, IExtensionMeta>();
    if (ids.length > 0) {
      const api = "https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery";

      const data = {
        filters: [
          {
            criteria: ids.map((name) => {
              return {
                filterType: QueryFilterType.NAME,
                value: name
              };
            })
          }
        ],
        flags: QueryFlag.LATEST_VERSION_WITH_FILES
      };

      try {
        // 这里必须添加'user-agent'
        const headers = {
          "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36 Edg/87.0.664.66",
          "content-Type": "application/json",
          "accept": "application/json;api-version=5.1-preview.1"
        };
        const resp = await fetch(api, {
          method: "POST",
          headers,
          body: JSON.stringify(data)
        });
        if (resp.ok) {
          const { results } = await resp.json();
          if (results.length > 0) {
            (results[0].extensions || []).forEach((extension: IExtensionMeta) => {
              // Use extension's fullname as the key.
              result.set(`${extension.publisher.publisherName}.${extension.extensionName}`, extension);
            });
          }
        }
      }
      catch (err) {
      }
    }
    return result;
  }

  /**
   * 获取最新版本的扩展文件（VSIX file）
   *
   * @param {IExtensionMeta} extensionMeta The extension's meta object.
   */
  private getLatestVSIXVersion(extensionMeta: IExtensionMeta): string | undefined {
    const versionMeta = extensionMeta.versions[0];
    return versionMeta ? versionMeta.version : undefined;
  }
}
