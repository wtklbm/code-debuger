import * as vscode from "vscode";
import { getProvider, getSuportLanguages } from "../configs";
import { clearSpinner, EXEC_ERROR, getFileNoExtension, getWorkspaceFolder, isDir, isFile, registerCommand, showSpinner, tryExecCmdSync } from "../utils";
import * as fs from 'fs-extra';
import { Extension } from "./extension";
import { localize } from "../i18n";
import * as path from "path";

export function initCommand(context: vscode.ExtensionContext) {
  vscode.commands.executeCommand('setContext', 'code-debuger:languages', getSuportLanguages());

  registerCommand(context, "code-debuger.debugFile", debugFile);
}

async function debugFile(uri: vscode.Uri) {
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
      const installResult = await Extension.instance.checkToInstall(provider.extensions, uri);
      // 如果用户点击了取消（installResult 为 null），或者有扩展被安装（installResult 为 true），则不再继续执行
      if (installResult === true || installResult === null) {
        return;
      }
      // 如果用户点击了跳过（installResult 为 false），则显示执行失败的提示
      if (installResult === false) {
        // 使用 provider?.configuration.name 作为提示
        const languageId = (await vscode.workspace.openTextDocument(uri)).languageId;
        const firstCmd = provider?.configuration.name || languageId;
        vscode.window.showErrorMessage(localize('error.command.extensions', firstCmd));
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
          vscode.window.showErrorMessage(localize('error.command.extensions', provider?.configuration.name || cmd));
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
      if (e.configuration.name === 'Rust') {
        fs.emptyDirSync(path.join(e.configuration.cwd, '.debug'))
        fs.removeSync(path.join(e.configuration.cwd, '.debug'))
      } else if (e.configuration.type === provider?.configuration.type ||
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
