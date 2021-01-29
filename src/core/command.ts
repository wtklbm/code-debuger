import { ExtensionContext, Uri, window } from "vscode";
import { registerCommand } from "../utils";


export function initCommand(context: ExtensionContext) {
  registerCommand(context, "code-debuger.debugFile", debugFile);
}

function debugFile(uri: Uri) {
  console.log("debug file: ", JSON.stringify(uri))

  // let filePath = window.activeTextEditor?.document.uri.fsPath;
  if (uri.scheme === "file") {
    window.showInformationMessage(uri.fsPath);  
  }
}

