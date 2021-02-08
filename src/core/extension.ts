import * as micromatch from "micromatch";
import fetch from "node-fetch";
import * as vscode from "vscode";
import { CaseInsensitiveMap } from "../collections";
import { localize } from "../i18n";

import { IExtension, IExtensionMeta, QueryFilterType, QueryFlag } from "../types";
import { clearSpinner, showReloadBox, showSpinner } from "../utils";
import { ExtensionStorage } from "./storage";


export class Extension {
  private static _instance: Extension;

  private _storage: ExtensionStorage;

  private constructor() {
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

      await this.installExtensions(uids);

      let disabled = this._storage.getDisabledExtension(uids).map(id => queriedExtensions.get(id)?.displayName || id);
      if (disabled.length) {
        vscode.commands.executeCommand('workbench.extensions.action.showDisabledExtensions');
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

  private async installExtensions(ids: string[]) {
    let steps = 0
    let total = ids.length;

    for (const id of ids) {
      try {
        steps++;
        showSpinner(localize("toast.settings.installing.extension", id), steps, total);
        await this.installExtension(id);
      } catch (error) {
        console.log(error);
      }
    }

    clearSpinner();
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


  private async installExtension(id: string) {
    try {
      await vscode.commands.executeCommand('workbench.extensions.installExtension', id);
      return true;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * 卸载扩展
   */
  // @ts-ignore
  private async uninstallExtension(id: string) {
    try {
      await vscode.commands.executeCommand('workbench.extensions.uninstallExtension', id);
      return true;
    } catch (error) {
      throw new Error(error);
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
}
