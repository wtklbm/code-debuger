import * as vscode from "vscode";
import { getProvider, getSuportLanguages } from "../configs";
import { clearSpinner, EXEC_ERROR, getFileNoExtension, getWorkspaceFolder, isDir, isFile, registerCommand, showSpinner, tryExecCmdSync } from "../utils";
import * as fs from 'fs-extra';
import { Extension } from "./extension";
import { localize } from "../i18n";

export function initCommand(context: vscode.ExtensionContext) {
  vscode.commands.executeCommand('setContext', 'code-debuger:languages', getSuportLanguages());

  registerCommand(context, "code-debuger.debugFile", debugFile);
}

async function debugFile(uri: vscode.Uri) {
  console.log("debug file: ", JSON.stringify(uri))

  // 快捷键调用时，uri未定义
  if (!uri) {
    if (vscode.window.activeTextEditor) {
      uri =  vscode.window.activeTextEditor.document.uri;
    } else {
      return;
    }
  }

  if (uri.scheme === "file") {
    let provider = await getProvider(uri);
    if (!provider) return;

    // 扩展
    if (provider.extensions) {
      const hasUninstalled = await Extension.instance.checkToInstall(provider.extensions);
      if (hasUninstalled) {
        return;
      }
    }

    // 编译命令
    if (provider.commands) {
      let workspace = getWorkspaceFolder(uri);
      if (workspace) {
        process.chdir(workspace);
      }
      
      for (const key in provider.commands) {
        let cmd = provider.commands[key];
        showSpinner(localize('toast.spinner.runing', cmd));

        // 执行命令报错
        if (tryExecCmdSync(cmd) === EXEC_ERROR) {
          clearSpinner();
          vscode.window.showErrorMessage(localize('error.command', cmd));
          return;
        }
      }
      clearSpinner();
    }

    // 自定义命令
    if (provider.configuration.command) {
      return vscode.commands.executeCommand(provider.configuration.command);
    }


    // @ts-ignore
    vscode.debug.startDebugging(undefined, provider.configuration);
    vscode.debug.onDidTerminateDebugSession(e => {
      if (e.configuration.type === provider?.configuration.type ||
        e.configuration.type === 'lldb' ||
        e.configuration.name === provider?.configuration.name ||
        e.configuration.program === provider?.configuration.program) {
        clearLLDB(uri);
      }
    })
    vscode.commands.executeCommand ('workbench.debug.action.focusRepl');
  }
}


function clearLLDB(uri: vscode.Uri) {
  let outfile = getFileNoExtension(uri);
  if (isFile(outfile)) {
    fs.unlinkSync(outfile);
  }

  let outdir = `${outfile}.dSYM`;
  if (isDir(outdir)) {
    fs.removeSync(outdir);
  }
}