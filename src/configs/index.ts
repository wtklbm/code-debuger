import {
  findModulePath,
  getReplacedString,
  isFile,
  isPlainObject,
} from "../utils";
import * as vscode from "vscode";
import { AnyObject, Provider } from "../types";
import { localize } from "../i18n";

const Providers: Record<string, Provider> = {
  javascript: {
    configuration: {
      name: "Node",
      type: "node",
      args: ["--no-warnings"],
      skipFiles: ["<node_internals>/**", "${workspaceFolder}/node_modules/**"],
    },
  },
  typescript: {
    configuration: {
      name: "Typescript",
      type: "node",
      args: ["--no-warnings"],
      skipFiles: ["<node_internals>/**", "${workspaceFolder}/node_modules/**"],
    },
  },
  python: {
    configuration: {
      name: "Python",
      type: "python",
    },
    extensions: ["ms-python.python"],
  },
  go: {
    configuration: {
      name: "Golang",
      type: "go",
    },
    extensions: ["golang.go"],
  },
  dart: {
    configuration: {
      name: "Dart",
      type: "dart",
    },
    extensions: ["dart-code.dart-code"],
  },
  coffeescript: {
    configuration: {
      name: "Coffee",
      type: "node",
    },
  },
  c: {
    configuration: {
      name: "Clang",
      type: "lldb",
      program: "${fileNoExtension}",
    },
    commands: ['gcc -g "${file}" -o "${fileNoExtension}"'],
    extensions: ["vadimcn.vscode-lldb"],
  },
  cpp: {
    configuration: {
      name: "C++",
      type: "lldb",
      program: "${fileNoExtension}",
    },
    commands: ['gcc -g "${file}" -o "${fileNoExtension}" -lstdc++'],
    extensions: ["vadimcn.vscode-lldb"],
  },
  // NOTE 这里仅调试单文件，如需使用完整调试功能，则使用 `rust-analyzer`
  rust: {
    configuration: {
      name: "Rust",
      type: "lldb",
      program: "${workspaceFolder}/target/debug/${fileBasenameNoExtension}",
      env: {
        RUST_BACKTRACE: "full",
        RUST_LOG: "trace",
      },
      sourceLanguages: ["rust"],
    },
    commands: [
      // 先创建编译目录
      "node -e \"require('fs').mkdirSync('${workspaceFolder}/target/debug', { recursive: true })\"",
      // 再编译到目录
      'rustc -g "${file}" -o "${workspaceFolder}/target/debug/${fileBasenameNoExtension}"',
    ],
    extensions: ["vadimcn.vscode-lldb", "rust-lang.rust-analyzer"],
  },
  shellscript: {
    configuration: {
      name: "Bash",
      type: "bashdb",
      // https://github.com/rogalmic/vscode-bash-debug/issues/112
      //terminalKind: "integrated",
    },
    extensions: ["rogalmic.bash-debug"],
  },
  lua: {
    configuration: {
      name: "Lua",
      type: "lrdb",
    },
    extensions: ["satoren.lrdb"],
  },
};

export async function getProvider(uri: vscode.Uri, ...args: string[]) {
  if (!isFile(uri.fsPath)) return;

  const document = await getDocument(uri);
  const provider = Providers[document.languageId];

  if (!provider) {
    return;
  }

  const mergeConfig = (
    extra: Partial<Provider["configuration"]> = {}
  ): Provider["configuration"] => ({
    request: "launch",
    program: uri.fsPath,
    cwd: "${workspaceFolder}",
    console: "internalConsole",
    smartStep: true,
    sourceMaps: true,
    stopOnEntry: false,
    ...provider.configuration,
    ...extra,
    env: { ...provider.configuration.env, ...extra.env },
    args: [
      ...(provider.configuration.args ?? []),
      ...(extra.args ?? []),
      ...args,
    ],
  });

  const buildProvider = (configuration: Provider["configuration"]): Provider =>
    replaceProvider({ ...provider, configuration }, uri) as Provider;

  // ts/js 特殊处理
  if (["typescript", "javascript"].includes(document.languageId)) {
    const tsxAvailable = !!findModulePath(uri.fsPath, "tsx");

    if (tsxAvailable) {
      return buildProvider(
        mergeConfig({ runtimeExecutable: "tsx", program: uri.fsPath })
      );
    }

    // 没有 tsx，尝试 js fallback
    vscode.window.showErrorMessage(localize("error.no.tsx"));

    try {
      const jsFilePath = uri.fsPath.replace(/\.ts$/, ".js");
      const jsFileUri = vscode.Uri.file(jsFilePath);

      await vscode.workspace.fs.stat(jsFileUri);

      return buildProvider(mergeConfig({ program: jsFilePath }));
    } catch {
      vscode.window.showErrorMessage(localize("error.compile.error"));
      return null;
    }
  }

  // 其他语言
  return buildProvider(mergeConfig());
}

export function getSupportLanguages() {
  return Object.keys(Providers);
}

// 导出 Providers 对象以便在其他模块中复用
export { Providers };

async function getDocument(uri: vscode.Uri) {
  const editors = vscode.window.visibleTextEditors;
  for (const key in editors) {
    const editor = editors[key];
    if (editor.document.uri.fsPath === uri.fsPath) {
      return editor.document;
    }
  }

  let document = await vscode.workspace.openTextDocument(uri);
  return document;
}

function replaceProvider(provider: AnyObject | Array<any>, uri: vscode.Uri) {
  for (const key in provider) {
    // @ts-ignore
    let value = provider[key];
    if (typeof value === "string") {
      if (value.indexOf("${") !== -1) {
        // @ts-ignore
        provider[key] = getReplacedString(value, uri);
      }
    } else if (isPlainObject(value) || Array.isArray(value)) {
      value = replaceProvider(value, uri);
    }
  }

  return provider;
}
