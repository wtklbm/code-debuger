import * as vscode from "vscode";
import * as path from "path";
import { getVSCodeSetting } from "./api";


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

// 根据配置来决定是否使用当前文件夹作为工作目录
export function getWorkspaceFolder(uri: vscode.Uri) {
  if (vscode.workspace.workspaceFolders) {
    const fileDirectoryAsCwd = getVSCodeSetting('code-debuger', 'fileDirectoryAsCwd')
    return fileDirectoryAsCwd ? getFileDirname(uri) : vscode.workspace.getWorkspaceFolder(uri)?.uri.fsPath;
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

// 无文件名后缀的文件路径
export function getFileNoExtension(uri: vscode.Uri) {
  let filepath = getFile(uri);
  let extension = path.extname(filepath);
  return filepath.substring(0, filepath.length - extension.length);
}

// 相对工作目录路径
export function getRelativeFile(uri: vscode.Uri) {
  return path.relative(getFile(uri), getWorkspaceFolder(uri) || '');
}

// 无后缀文件名
export function getFileBasenameNoExtension(uri: vscode.Uri) {
  let filepath = getFile(uri);
  return path.basename(filepath, path.extname(filepath));
}

// 文件名
export function getFileBasename(uri: vscode.Uri) {
  return path.basename(getFile(uri));
}

// 是文件夹路径
export function getFileDirname(uri: vscode.Uri) {
  return path.dirname(getFile(uri));
}

export function getFileExtname(uri: vscode.Uri) {
  return path.extname(getFile(uri));
}