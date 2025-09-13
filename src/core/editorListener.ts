import * as vscode from "vscode";
import { getProvider } from "../configs";
import { Extension } from "./extension";


class ActiveTextEditorListener {
  private disposer?: vscode.Disposable;

  constructor() {
    // 首次立即检查
    if (vscode.window.activeTextEditor) {
      this.onChange(vscode.window.activeTextEditor);
    }

    this.disposer = vscode.window.onDidChangeActiveTextEditor(editor => {
      this.onChange(editor);
    });
  }

  public dispose() {
    this.disposer?.dispose();
  }

  private async onChange(editor: vscode.TextEditor | undefined, resetCache?: boolean) {
    if (!editor) {
      return;
    }

    let doc = editor.document;
    let provider = await getProvider(doc.uri);
    if (provider && provider.extensions) {
      await Extension.instance.checkToInstall(provider.extensions, doc.uri);
    }
  }
}

export function initEditorListener() {
  new ActiveTextEditorListener();
}
