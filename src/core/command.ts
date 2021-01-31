import { ExtensionContext, Uri, debug, commands, workspace } from "vscode";
import { getProvider } from "../configs";
import { registerCommand } from "../utils";


export function initCommand(context: ExtensionContext) {
  registerCommand(context, "code-debuger.debugFile", debugFile);
}

async function debugFile(uri: Uri) {
  console.log("debug file: ", JSON.stringify(uri))

  let workspaceFolder = workspace.getWorkspaceFolder(uri);
  let cwd = workspaceFolder?.uri.fsPath ?? "";

  if (uri.scheme === "file") {
    let provider = await getProvider(uri, cwd);
    if (!provider) return;

    debug.startDebugging(undefined, provider);
    commands.executeCommand ( 'workbench.debug.action.focusRepl' );
  }
}


