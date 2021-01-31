import { findMoudlePath, isFile } from "../utils";
import * as path from 'path';
import * as vscode from "vscode";

const Providers = {
  "javascript": {
    name: 'Node',
    type: 'node',
  },
  "typescript": {
    name: "Typescript",
    type: "node",
  },
  "python": {
    name: 'Python',
    type: 'python',
  },
  "go": {
    name: 'go',
    type: 'go',
    
  },
  "dart": {
    name: 'Dart',
    type: 'dart',
  },
  "coffeescript": {
    name: 'Coffee',
    type: 'node',
  }
}

export async function getProvider(uri: vscode.Uri, cwd: string, ...args: any[]) {
  if (!isFile(uri.fsPath)) return;

  let document = await getDocument(uri);

  // @ts-ignore
  let provider = Providers[document.languageId];
  if (!provider) {
    return;
  }

  const base = {
    request: 'launch',
    program: uri.fsPath, 
    cwd, 
    args, 
    smartStep: true,
    sourceMaps: true,
    stopOnEntry: false
  };

  if (document.languageId === "typescript") {
    let tsnodePath = findMoudlePath(uri.fsPath, 'ts-node')
    if (tsnodePath) {
      return Object.assign(base, provider, {runtimeArgs: ["-r", path.join(tsnodePath, 'register')]});
    } else {
      vscode.window.showErrorMessage('调试 typescript 需要 ts-node');
    }
  } else {
    return Object.assign(base, provider);
  }

  // let ext = path.extname(filePath);
  // if (ext[0] === ".") {
  //   ext = ext.substring(1, ext.length);
  // }

  

  // if (ext === "js") {
  //   return Object.assign(base, Providers.javascript);
  // } else if (ext === "ts") {
  //   let tsnodePath = findMoudlePath(uri.fsPath, 'ts-node')
  //   if (tsnodePath) {
  //     return Object.assign(base, Providers.typescript, {runtimeArgs: ["-r", path.join(tsnodePath, 'register')]});
  //   } else {
  //     vscode.window.showErrorMessage('调试 typescript 需要 ts-node');
  //   }
  // } else if (ext === "py") {
  //   return Object.assign(base, Providers.python);
  // }

  return;
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