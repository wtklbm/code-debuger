import { findMoudlePath, getReplacedString, isFile, isPlainObject } from "../utils";
import * as path from 'path';
import * as vscode from "vscode";
import { AnyObject, Provider } from "../types";
import { localize } from "../i18n";

const Providers: Record<string, Provider> = {
  "javascript": {
    configuration: {
      name: 'Node',
      type: 'node',
    }
  },
  "typescript": {
    configuration: {
      name: "Typescript",
      type: "node",
    }
  },
  "python": {
    configuration: {
      name: 'Python',
      type: 'python',
    },
    extensions: [
      "ms-python.python"
    ]
  },
  "go": {
    configuration: {
      name: 'Golang',
      type: 'go',
    },
    extensions: [
      "golang.go"
    ]
  },
  "dart": {
    configuration: {
      name: 'Dart',
      type: 'dart',
    },
    extensions: [
      "dart-code.dart-code"
    ]
  },
  "coffeescript": {
    configuration: {
      name: 'Coffee',
      type: 'node',
    }
  },
  "c": {
    configuration: {
      name: 'Clang',
      type: 'lldb',
      program: '${fileNoExtension}',
    },
    commands: [
      'gcc -g ${file} -o ${fileNoExtension}'
    ],
    extensions: [
      "vadimcn.vscode-lldb"
    ]
  },
  "cpp": {
    configuration: {
      name: 'C++',
      type: 'lldb',
      program: '${fileNoExtension}',
    },
    commands: [
      'gcc -g ${file} -o ${fileNoExtension} -lstdc++'
    ],
    extensions: [
      "vadimcn.vscode-lldb"
    ]
  },
  "rust": {
    configuration: {
      name: "Rust",
      type: "lldb",
      program: '${fileNoExtension}',
    },
    commands: [
      'rustc -g ${file} -o ${fileNoExtension}'
    ],
    extensions: [
      "vadimcn.vscode-lldb",
      "rust-lang.rust"
    ]
  }
}

export async function getProvider(uri: vscode.Uri, ...args: any[]) {
  if (!isFile(uri.fsPath)) return;

  let document = await getDocument(uri);

  // @ts-ignore
  let provider = Providers[document.languageId];
  if (!provider) {
    return;
  }

  const base: Provider = {
    configuration: {
      request: 'launch',
      program: uri.fsPath, 
      cwd: '${workspaceFolder}', 
      args, 
      smartStep: true,
      sourceMaps: true,
      stopOnEntry: false
    }
  };

  if (document.languageId === "typescript") {
    let tsnodePath = findMoudlePath(uri.fsPath, 'ts-node')
    if (tsnodePath) {
      let configuration = Object.assign(base.configuration, provider.configuration, {runtimeArgs: ["-r", path.join(tsnodePath, 'register')]});
      let result = Object.assign(base, provider, {configuration}) as Provider;
      result = replaceProvider(result, uri) as Provider;
      return result
    } else {
      vscode.window.showErrorMessage(localize('error.no.ts-node'));
    }
  } else {
    let configuration = Object.assign(base.configuration, provider.configuration);
    let result = Object.assign(base, provider, {configuration}) as Provider;
    result = replaceProvider(result, uri) as Provider;
    return result;
  }

  return;
}

export function getSuportLanguages() {
  return Object.keys(Providers);
}

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
    if (typeof value === 'string') {
      if (value.indexOf('${') !== -1) {
        // @ts-ignore
        provider[key] = getReplacedString(value, uri);
      }
    } else if (isPlainObject(value) || Array.isArray(value)) {
      value = replaceProvider(value, uri);
    }
  }

  return provider;
}