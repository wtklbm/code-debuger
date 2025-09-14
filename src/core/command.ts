import * as vscode from "vscode";
import { getProvider, getSuportLanguages } from "../configs";
import {
  clearSpinner,
  getFileNoExtension,
  getWorkspaceFolder,
  isDir,
  isFile,
  registerCommand,
  showSpinner,
} from "../utils";
import { getExecOptions } from "../utils/node";
import * as fs from "fs-extra";
import { Extension } from "./extension";
import { localize } from "../i18n";
import * as path from "path";
import { execSync } from "child_process";

export function initCommand(context: vscode.ExtensionContext) {
  vscode.commands.executeCommand(
    "setContext",
    "code-debuger:languages",
    getSuportLanguages()
  );

  registerCommand(context, "code-debuger.debugFile", debugFile);
}

async function debugFile(uri: vscode.Uri) {
  // 快捷键调用时，uri未定义
  if (!uri) {
    if (vscode.window.activeTextEditor) {
      uri = vscode.window.activeTextEditor.document.uri;
    } else {
      return;
    }
  }

  if (uri.scheme === "file") {
    let provider = await getProvider(uri);
    if (!provider) return;

    // 扩展
    if (provider.extensions) {
      const installResult = await Extension.instance.checkToInstall(
        provider.extensions,
        uri
      );

      // 如果用户点击了取消（installResult 为 null），则不再继续执行
      if (installResult === null) {
        return;
      }

      // 如果有扩展被安装（installResult 为 true），需要重新加载窗口
      if (installResult === true) {
        return;
      }

      // 如果 installResult 为 false，表示所有扩展都已安装，继续执行调试
    }

    // 编译命令
    if (provider.commands) {
      let workspace = getWorkspaceFolder(uri);
      if (workspace) {
        process.chdir(workspace);
      }

      for (const key in provider.commands) {
        let cmd = provider.commands[key];
        showSpinner(localize("toast.spinner.runing", cmd));

        try {
          // 手动执行命令
          const options = getExecOptions();
          execSync(cmd, options);
        } catch (error: any) {
          clearSpinner();
          // 打印完整的错误消息
          const errorMessage = error?.stderr?.toString() || error?.stdout?.toString() || error?.message || error?.toString() || "Unknown error";

          vscode.window.showErrorMessage(
            provider?.configuration.name + `编译失败: '\n${errorMessage}`
          );

          return;
        }
      }
      clearSpinner();
    }

    // 自定义命令
    if (provider.configuration.command) {
      return vscode.commands.executeCommand(provider.configuration.command);
    }

    // 开始调试
    try {
      // @ts-ignore
      await vscode.debug.startDebugging(undefined, provider.configuration);
    } catch (error) {
      vscode.window.showErrorMessage(
        localize(
          "error.command.extensions",
          provider?.configuration.name || "Debug"
        )
      );
      return;
    }

    vscode.debug.onDidTerminateDebugSession((e) => {
      if (e.configuration.name === "Rust") {
        fs.emptyDirSync(path.join(e.configuration.cwd, ".debug"));
        fs.removeSync(path.join(e.configuration.cwd, ".debug"));
      } else if (
        e.configuration.type === provider?.configuration.type ||
        e.configuration.type === "lldb" ||
        e.configuration.name === provider?.configuration.name ||
        e.configuration.program === provider?.configuration.program
      ) {
        clearLLDB(uri);
      }
    });
    vscode.commands.executeCommand("workbench.debug.action.focusRepl");
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

