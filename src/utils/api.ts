import * as vscode from 'vscode';

/**
 * Register extension command on VSCode.
 * @param context 
 * @param command 
 * @param callback 
 */
export function registerCommand(context: vscode.ExtensionContext, command: string, callback: (...args: any[]) => void) {
  context.subscriptions.push(vscode.commands.registerCommand(command, callback));
}