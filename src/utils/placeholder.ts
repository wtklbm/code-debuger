import * as vscode from "vscode";
import * as path from "path";


const PlaceHolders = [
  {regex: /\$\{workspaceFolder\}/g, val: getWorkspaceFolder},
  {regex: /\$\{workspaceRootFolderName\}/g, val: getWorkspaceRootFolderName},
  {regex: /\$\{file\}/g, val: getFile},
  {regex: /\$\{fileNoExtension\}/g, val: getFileNoExtension},
  {regex: /\$\{relativeFile\}/g, val: getRelativeFile},
  {regex: /\$\{fileBasenameNoExtension\}/g, val: getFileBasenameNoExtension},
  {regex: /\$\{fileBasename\}/g, val: getFileBasename},
  {regex: /\$\{fileDirname\}/g, val: getFileDirname},
  {regex: /\$\{fileExtname\}/g, val: getFileExtname}
];

export function getReplacedString(message: string, uri: vscode.Uri) {
  let result = message;
  PlaceHolders.forEach(placeholder => {
    result = result.replace(placeholder.regex, placeholder.val(uri) || '');
  })

  return result;
}

export function getWorkspaceFolder(uri: vscode.Uri) {
  if (vscode.workspace.workspaceFolders) {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
    return workspaceFolder?.uri.fsPath;
  }

  return;
}

export function getWorkspaceRootFolderName(uri: vscode.Uri) {
  let workspacePath = getWorkspaceFolder(uri);
  if (workspacePath) {
    return path.basename(workspacePath);
  }

  return;
}

export function getFile(uri: vscode.Uri) {
  return uri.fsPath;
}

export function getFileNoExtension(uri: vscode.Uri) {
  let filepath = getFile(uri);
  let extension = path.extname(filepath);
  return filepath.substring(0, filepath.length - extension.length);
}

export function getRelativeFile(uri: vscode.Uri) {
  return path.relative(getFile(uri), getWorkspaceFolder(uri) || '');
}

export function getFileBasenameNoExtension(uri: vscode.Uri) {
  let filepath = getFile(uri);
  return path.basename(filepath, path.extname(filepath));
}

export function getFileBasename(uri: vscode.Uri) {
  return path.basename(getFile(uri));
}

export function getFileDirname(uri: vscode.Uri) {
  return path.dirname(getFile(uri));
}

export function getFileExtname(uri: vscode.Uri) {
  return path.dirname(getFile(uri));
}