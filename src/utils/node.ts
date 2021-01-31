import { execSync } from "child_process";
import * as readPkgUp from 'read-pkg-up';
import * as path from 'path';
import * as fs from "fs-extra";


export function findMoudlePath(fspath: string, mod: string) {
  const root = getNpmGlobalRoot();
  let modPath;
  if (fs.existsSync(path.join(root, mod))) {
    modPath = path.join(root, mod);
  } else {
    modPath = findPkg(fspath, mod);
  }

  if (modPath) {
    return modPath;
  }

  tryExecCmdSync('npm i -g ts-node', '');
  if (fs.existsSync(path.join(root, mod))) {
    return path.join(root, mod);
  }

  return;
}

/**
 * 获取全局的node_modules路径
 */
function getNpmGlobalRoot() {
  return tryExecCmdSync('npm root -g', '').trim();
}

function tryExecCmdSync(cmd: string, fallback: string): string
function tryExecCmdSync(cmd: string, fallback?: string): undefined | string {
  try {
    return execSync(cmd).toString()
  } catch (e) {
    return fallback
  }
}

function findPkg(fspath: string, pkgName: string): string | undefined {
  const res = readPkgUp.sync({cwd: fspath, normalize: false});
  const {root} = path.parse(fspath);
  if (res && res.packageJson && 
    ((res.packageJson.dependencies && res.packageJson.dependencies[pkgName]) ||
    (res.packageJson.devDependencies && res.packageJson.devDependencies[pkgName]) ||
    (fs.existsSync(path.join(path.dirname(res.path), 'node_modules', pkgName))))) {
    // return resolve.sync(pkgName, {basedir: res.path});
    return path.join(path.dirname(res.path), 'node_modules', pkgName);
  } else if (res && res.path) {
    const parent = path.resolve(path.dirname(res.path), '..');
    if (parent !== root) {
      return findPkg(parent, pkgName);
    }
  }

  return;
}