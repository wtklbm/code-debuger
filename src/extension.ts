import * as vscode from 'vscode';
import { initCommand } from './core/command';
import { setup } from "./i18n";

export function activate(context: vscode.ExtensionContext) {
  // 设置 i18n
  setup(context.extensionPath);

  // 注册命令
	initCommand(context);
}

export function deactivate() {}
