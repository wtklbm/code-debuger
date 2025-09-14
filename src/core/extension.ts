import * as vscode from "vscode";
import { localize } from "../i18n";

import { clearSpinner, showReloadBox, showSpinner } from "../utils";


export class Extension {
  private static _instance: Extension;
  private context: vscode.ExtensionContext | undefined;
  private static readonly SKIPPED_EXTENSIONS_KEY = 'code-debuger.skippedExtensions';
  private static readonly PROMPT_SHOWN_KEY = 'code-debuger.promptShown';


  private constructor() {
  }

  public static create(): Extension {
    if (!Extension._instance) {
      Extension._instance = new Extension();
    }

    return Extension._instance;
  }

  public static init(context: vscode.ExtensionContext): void {
    Extension.instance.context = context;
  }

  public static get instance(): Extension {
    return Extension.create();
  }

  /**
   * 检查并安装扩展
   * @param ids
   * @param uri 文件URI，用于获取项目级配置
   */
  public async checkToInstall(ids: string[], uri?: vscode.Uri): Promise<boolean> {
    let uids = this.getUninstalled(ids);

    if (uids.length) {
      // 获取扩展提示行为配置
      const promptBehavior = this.getPromptBehavior(uri);

      // 如果配置为从不显示，直接返回
      if (promptBehavior === 'never') {
        return false;
      }

      // 检查是否有用户永久跳过的扩展（skippedExtensions 配置）
      const skippedExtensions = this.getSkippedExtensionsConfig(uri);
      const filteredUids = uids.filter(id => !skippedExtensions.includes(id));

      if (filteredUids.length === 0) {
        // 所有扩展都被用户永久跳过了
        return false;
      }

      // 检查是否已经显示过提示（仅显示一次模式）
      if (promptBehavior === 'once') {
        // 获取项目中已经显示过提示的扩展列表
        const promptShownInProject = this.getPromptShownExtensionsInProject(uri);
        const newUids = filteredUids.filter(id => !promptShownInProject.includes(id));

        if (newUids.length === 0) {
          // 所有扩展在这个项目中都已经显示过提示
          return false;
        }

        // 标记这些扩展为在这个项目中已显示提示
        await this.addToPromptShownExtensionsInProject(newUids, uri);
      }

      // 询问用户是否安装扩展
      const install = await this.promptForExtensionInstallation(filteredUids);
      if (install === true) {
        // 用户点击安装，继续安装流程
        await this.uninstallExtensions(filteredUids);
        await this.installExtensions(filteredUids);
        showReloadBox();
        return true;
      } else if (install === false) {
        // 用户点击跳过，将这些扩展添加到永久跳过列表
        await this.addToSkippedExtensionsConfig(filteredUids, uri);
        return false;
      } else {
        // 用户点击取消或关闭对话框，不添加到跳过列表
        return false;
      }
    }

    // 所有扩展都已安装，返回 false（表示不需要安装任何扩展）
    return false;
  }

  private getUninstalled(ids: string[]): string[] {
    let result: string[] = [];
    let exts = this.getAll();

    // 更精确的扩展 ID 匹配
    const tempResult = ids.map(id => {
      const normalizedId = id.toLowerCase();

      const isInstalled = exts.some(ext => {
        const normalizedExtId = ext.toLowerCase();
        // 完全匹配或 publisher.extension 匹配
        const isMatch = normalizedExtId === normalizedId ||
                       normalizedExtId.endsWith('.' + normalizedId);

        return isMatch;
      });

      if (!isInstalled) {
        return id;
      } else {
        return undefined;
      }
    });

    // 过滤掉 undefined 值
    result = tempResult.filter((item): item is string => item !== undefined);

    return result;
  }

  private async installExtensions(ids: string[]) {
    let steps = 0
    let total = ids.length;

    for (const id of ids) {
      steps++;
      showSpinner(localize("toast.settings.installing.extension", id), steps, total);
      await this.installExtension(id);
    }

    clearSpinner();
  }

  private async uninstallExtensions(ids: string[]) {
    for (const id of ids) {
      await this.uninstallExtension(id);
    }
  }

  /**
   * 获取全部已安装的扩展（不包括禁用的扩展）
   *
   * @param excludedPatterns The glob patterns of the extensions that should be excluded.
   */
  private getAll(): string[] {
    const result: string[] = [];
    for (const ext of vscode.extensions.all) {
      if ( !ext.packageJSON.isBuiltin ) {
        result.push(ext.id);
      }
    }
    return result;;
  }

  /**
   * 安装扩展
   * @param id
   */
  private async installExtension(id: string) {
    try {
      await vscode.commands.executeCommand('workbench.extensions.installExtension', id);
      return true;
    } catch (error) {
      console.log(error);
    }

    return false;
  }

  /**
   * 卸载扩展
   */
  private async uninstallExtension(id: string) {
    try {
      await vscode.commands.executeCommand('workbench.extensions.uninstallExtension', id);
      return true;
    } catch (error) {
      console.log(error);
    }
    return false;
  }

  /**
   * 提示用户是否安装扩展
   * @param ids
   */
  private async promptForExtensionInstallation(ids: string[]): Promise<boolean | null> {
    const message = localize("toast.settings.missing.extensions", ids.join(', '));
    const installButton = localize("toast.settings.install.extensions");
    const skipButton = localize("toast.settings.skip.extensions");

    const result = await vscode.window.showInformationMessage(
      message,
      { modal: true },
      installButton,
      skipButton
    );

    if (result === installButton) {
      return true;
    } else if (result === skipButton) {
      return false; // 用户点击跳过，会添加到跳过列表
    } else {
      return null; // 用户点击取消或关闭对话框，不会添加到跳过列表
    }
  }

  /**
   * 获取用户跳过安装的扩展列表
   */
  private getSkippedExtensions(): string[] {
    if (!this.context) {
      return [];
    }

    return this.context.globalState.get<string[]>(Extension.SKIPPED_EXTENSIONS_KEY, []);
  }

  /**
   * 添加扩展到跳过列表
   * @param ids
   */
  // @ts-ignore
  private async _addToSkippedExtensions(ids: string[]): Promise<void> {
    if (!this.context) {
      return;
    }

    const skippedExtensions = this.getSkippedExtensions();
    const newSkippedExtensions = [...new Set([...skippedExtensions, ...ids])];

    await this.context.globalState.update(Extension.SKIPPED_EXTENSIONS_KEY, newSkippedExtensions);
  }

  /**
   * 清除跳过安装的扩展记录
   */
  public async clearSkippedExtensions(): Promise<void> {
    if (!this.context) {
      return;
    }

    await this.context.globalState.update(Extension.SKIPPED_EXTENSIONS_KEY, []);
  }

  /**
   * 获取扩展提示行为配置
   */
  private getPromptBehavior(uri?: vscode.Uri): string {
    // 首先检查项目级配置
    const workspaceConfig = vscode.workspace.getConfiguration('code-debuger', uri);
    const workspaceValue = workspaceConfig.get<string>('extensionPromptBehavior');

    // 如果项目级配置有值，则使用项目级配置
    if (workspaceValue !== undefined) {
      return workspaceValue;
    }

    // 否则使用全局配置
    const globalConfig = vscode.workspace.getConfiguration('code-debuger');
    return globalConfig.get<string>('extensionPromptBehavior', 'once');
  }

  /**
   * 获取跳过的扩展列表
   * @param uri 文件URI
   */
  private getSkippedExtensionsConfig(uri?: vscode.Uri): string[] {
    // 首先检查项目级配置
    const workspaceConfig = vscode.workspace.getConfiguration('code-debuger', uri);
    const workspaceValue = workspaceConfig.get<string[]>('skippedExtensions');

    // 如果项目级配置有值，则使用项目级配置
    if (workspaceValue !== undefined) {
      return workspaceValue;
    }

    // 否则使用全局配置
    const globalConfig = vscode.workspace.getConfiguration('code-debuger');
    return globalConfig.get<string[]>('skippedExtensions', []);
  }

  /**
   * 将扩展添加到跳过列表
   * @param ids 扩展ID列表
   * @param uri 文件URI
   */
  private async addToSkippedExtensionsConfig(ids: string[], uri?: vscode.Uri): Promise<void> {
    const workspaceConfig = vscode.workspace.getConfiguration('code-debuger', uri);
    const workspaceValue = workspaceConfig.get<string[]>('skippedExtensions');

    // 如果项目级配置已设置，则更新项目级配置
    if (workspaceValue !== undefined) {
      const newSkippedExtensions = [...new Set([...workspaceValue, ...ids])];
      await workspaceConfig.update('skippedExtensions', newSkippedExtensions, vscode.ConfigurationTarget.WorkspaceFolder);
    } else {
      // 否则更新全局配置
      const globalConfig = vscode.workspace.getConfiguration('code-debuger');
      const globalValue = globalConfig.get<string[]>('skippedExtensions', []);
      const newSkippedExtensions = [...new Set([...globalValue, ...ids])];
      await globalConfig.update('skippedExtensions', newSkippedExtensions, vscode.ConfigurationTarget.Global);
    }
  }

  /**
   * 将扩展提示行为配置写入项目配置文件
   * @param value 配置值
   * @param uri 文件URI
   */
  // @ts-ignore
  private async _setWorkspacePromptBehavior(value: string, uri?: vscode.Uri): Promise<void> {
    const workspaceConfig = vscode.workspace.getConfiguration('code-debuger', uri);
    await workspaceConfig.update('extensionPromptBehavior', value, vscode.ConfigurationTarget.WorkspaceFolder);
  }

  /**
   * 获取已经显示过提示的扩展列表（全局）
   */
  private getPromptShownExtensions(): string[] {
    if (!this.context) {
      return [];
    }

    return this.context.globalState.get<string[]>(Extension.PROMPT_SHOWN_KEY, []);
  }

  /**
   * 获取项目中已经显示过提示的扩展列表
   * @param uri 文件URI
   */
  private getPromptShownExtensionsInProject(uri?: vscode.Uri): string[] {
    // 首先检查项目级配置
    const workspaceConfig = vscode.workspace.getConfiguration('code-debuger', uri);
    const workspaceValue = workspaceConfig.get<string[]>('promptShownExtensions');

    // 如果项目级配置有值，则使用项目级配置
    if (workspaceValue !== undefined) {
      return workspaceValue;
    }

    // 否则使用全局配置
    const globalConfig = vscode.workspace.getConfiguration('code-debuger');
    return globalConfig.get<string[]>('promptShownExtensions', []);
  }

  /**
   * 添加扩展到已显示提示列表（全局）
   * @param ids
   */
  // @ts-ignore
  private async _addToPromptShownExtensions(ids: string[]): Promise<void> {
    if (!this.context) {
      return;
    }

    const promptShown = this.getPromptShownExtensions();
    const newPromptShown = [...new Set([...promptShown, ...ids])];

    await this.context.globalState.update(Extension.PROMPT_SHOWN_KEY, newPromptShown);
  }

  /**
   * 添加扩展到项目中已显示提示列表
   * @param ids 扩展ID列表
   * @param uri 文件URI
   */
  private async addToPromptShownExtensionsInProject(ids: string[], uri?: vscode.Uri): Promise<void> {
    const workspaceConfig = vscode.workspace.getConfiguration('code-debuger', uri);
    const workspaceValue = workspaceConfig.get<string[]>('promptShownExtensions');

    // 如果项目级配置已设置，则更新项目级配置
    if (workspaceValue !== undefined) {
      const newPromptShownExtensions = [...new Set([...workspaceValue, ...ids])];
      await workspaceConfig.update('promptShownExtensions', newPromptShownExtensions, vscode.ConfigurationTarget.WorkspaceFolder);
    } else {
      // 否则更新全局配置
      const globalConfig = vscode.workspace.getConfiguration('code-debuger');
      const globalValue = globalConfig.get<string[]>('promptShownExtensions', []);
      const newPromptShownExtensions = [...new Set([...globalValue, ...ids])];
      await globalConfig.update('promptShownExtensions', newPromptShownExtensions, vscode.ConfigurationTarget.Global);
    }
  }

  /**
   * 清除已显示提示的扩展记录（全局）
   */
  public async clearPromptShownExtensions(): Promise<void> {
    if (!this.context) {
      return;
    }

    await this.context.globalState.update(Extension.PROMPT_SHOWN_KEY, []);
  }
}


