import * as vscode from 'vscode';
import { localize } from '../i18n';
import { VSCODE_BUILTIN_ENVIRONMENTS } from '../constants';
import { VSCodeEdition } from '../types';

/**
 * Register extension command on VSCode.
 * @param context 
 * @param command 
 * @param callback 
 */
export function registerCommand(context: vscode.ExtensionContext, command: string, callback: (...args: any[]) => void) {
  context.subscriptions.push(vscode.commands.registerCommand(command, callback));
}

/**
 * 显示信息dialog
 * @param message 
 * @param buttons 
 */
export function showConfirmBox(message: string, ...buttons: string[]) {
  return vscode.window.showInformationMessage(message, ...buttons);
}

/**
 * Shows a `Reload VSCode` prompt dialog.
 */
export function showReloadBox(msg?: string): void {
  const reloadButton = localize("toast.box.reload");
  const message = msg || localize("toast.box.reload.message");
  vscode.window.showInformationMessage(message, reloadButton).then((selection) => {
    if (selection === reloadButton) {
      reloadWindow();
    }
  });
}

let spinnerTimer: NodeJS.Timer | null;
const spinner = {
  frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
  interval: 100
};

/**
 * 在statusbar显示进度信息
 * @param message 
 */
export function showSpinner(message: string, progress?: number, total?: number): void {
  clearSpinner();

  let text = "";
  if (progress && total) {
    text = `[${progress}/${total}]`;
  }

  if (message) {
    text = text ? `${text} ${message}` : `${message}`;
  }

  if (text) {
    text = ` ${text.trim()}`;
  }

  let step = 0;
  const frames: string[] = spinner.frames;
  const length = frames.length;
  spinnerTimer = setInterval(() => {
    vscode.window.setStatusBarMessage(`${frames[step]}${message}`);
    step = (step + 1) % length;
  }, spinner.interval);
}

export function clearSpinner(message: string = ''): void {
  if (spinnerTimer) {
    clearInterval(spinnerTimer);
    spinnerTimer = null;
  }

  vscode.window.setStatusBarMessage(message);
}

export function getExtensionById(id: string, ignoreCase = true) {
  if (id != null) {
      if (ignoreCase) {
          const targetId = id.toLocaleLowerCase();
          return vscode.extensions.all.find((ext) => (ext.id.toLocaleLowerCase() === targetId));
      }
      return vscode.extensions.getExtension(id);
  }
  return;
}

/**
 * Gets the builtin-environment of the current running VSCode.
 *
 * @throws {Error} Throws an error when the environment is not found.
 */
export function getVSCodeBuiltinEnvironment() {
  return VSCODE_BUILTIN_ENVIRONMENTS[getVSCodeEdition()];
}

/**
 * Gets the edition of the current running VSCode.
 *
 * @throws {Error} Throws an error when the edition is unknown.
 */
export function getVSCodeEdition() {
  switch (vscode.env.appName) {
      case "Visual Studio Code":
          return VSCodeEdition.STANDARD;

      case "Visual Studio Code - Insiders":
          return VSCodeEdition.INSIDERS;

      case "Visual Studio Code - Exploration":
          return VSCodeEdition.EXPLORATION;

      case "VSCodium":
          return VSCodeEdition.VSCODIUM;

      case "Code - OSS":
          return VSCodeEdition.OSS;

      default:
          throw new Error(localize("error.env.unknown.vscode"));
  }
}

/**
 * 重新启动窗口
 */
export function reloadWindow() {
  vscode.commands.executeCommand('workbench.action.reloadWindow');
}