import * as os from "os";
import * as path from "path";

import { localize } from "../i18n";
import { IExtension, Platform } from "../types";
import { getVSCodeBuiltinEnvironment } from "../utils";


export class Environment {
  public readonly isLinux: boolean;
  public readonly isMac: boolean;
  public readonly isWin: boolean;
  public readonly isPortable: boolean;
  public readonly platform: Platform;
  public readonly extensionsDirectory: string;
  public readonly obsoleteFilePath: string;

  private static _instance: Environment;

  private constructor() {
    this.platform = this._getPlatform();
    this.isLinux = (this.platform === Platform.LINUX);
    this.isMac = (this.platform === Platform.MACINTOSH);
    this.isWin = (this.platform === Platform.WINDOWS);
    this.isPortable = (process.env.VSCODE_PORTABLE != null);

    this.extensionsDirectory = this._getExtensionsDirectory(this.isPortable);
    this.obsoleteFilePath = path.join(this.extensionsDirectory, ".obsolete");
  }

  public static create(): Environment {
    if (!Environment._instance) {
        Environment._instance = new Environment();
    }
    return Environment._instance;
  }

  /**
   * Gets the directory of the extension.
   */
  public getExtensionDirectory(extension: IExtension): string {
    return path.join(this.extensionsDirectory, this.getExtensionDirectoryName(extension));
  }

  /**
   * Gets the directory name of the extension.
   */
  public getExtensionDirectoryName(extension: IExtension): string {
    return `${extension.id}-${extension.version}`;
  }

  /**
   * Gets the extensions directory of VSCode.
   */
  private _getExtensionsDirectory(isPortable: boolean) {
    if (isPortable) {
      // Such as the "/Applications/code-portable-data/extensions" directory in MacOS.
      return path.join(process.env.VSCODE_PORTABLE!, "extensions");
    }

    return path.join(
      os.homedir(),
      getVSCodeBuiltinEnvironment().extensionsDirectoryName,
      "extensions"
    );
  }

  private _getPlatform() {
    if (process.platform === "linux") {
        return Platform.LINUX;
    }
    if (process.platform === "darwin") {
        return Platform.MACINTOSH;
    }
    if (process.platform === "win32") {
        return Platform.WINDOWS;
    }
    throw new Error(localize("error.env.platform.not.supported"));
  }
}