import * as vscode from 'vscode';
import { initCommand } from './core/command';
import { initEditorListener } from './core/editorListener';
import { setup } from "./i18n";

export async function activate(context: vscode.ExtensionContext) {
  // 设置 i18n
  setup(context.extensionPath);

  // 注册命令
  initCommand(context);

  // 监控文件当前文件
  initEditorListener();
}

export function deactivate() {}
