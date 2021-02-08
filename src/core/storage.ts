import { Environment } from "./environment";
import * as sqlite from 'better-sqlite3';
import { IDisableExtension } from "../types";

const DISABLE_EXTENSION_KEY = 'extensionsIdentifiers/disabled'

export class ExtensionStorage {
  private static _instance: ExtensionStorage;
  private db;

  private constructor() {
    let env = Environment.create();
    this.db = sqlite(env.globalStorageFilePath);
  }

  public static create() {
    if (!ExtensionStorage._instance) {
      ExtensionStorage._instance = new ExtensionStorage();
    }

    return ExtensionStorage._instance;
  }

  public getAllDisabledExtensions() {
    let extensions: IDisableExtension[] = [];
    
    try {
      let value = this.db.prepare(`SELECT value FROM ItemTable WHERE key='${DISABLE_EXTENSION_KEY}'`).get();
      let res = JSON.parse(value.value);
      if (Array.isArray(res)) {
        extensions = extensions.concat(res);
      }
    } catch (error) {
      console.error(error);
    }

    return extensions;
  }

  public getDisabledExtension(ids: string[]): string[] {
    let all = this.getAllDisabledExtensions();
    let res = all.filter(e => ids.includes(e.id)).map(e => e.id);

    return res;
  }

  /**
   * @deprecated 启用扩展
   * @param ids 
   */
  public enableExtensions(ids: string[]) {
    let all = this.getAllDisabledExtensions();
    let res = all.filter(e => !ids.includes(e.id));

    this.update(res);
  }

  private update(data: IDisableExtension[]) {
    try {
      let res = this.db.prepare(`UPDATE ItemTable SET value='${JSON.stringify(data)}' WHERE key='${DISABLE_EXTENSION_KEY}'`).run();
      if (res.changes > 0) {
        return;
      }

      this.db.prepare(`INSERT OR REPLACE INTO ItemTable (key, value) VALUES (${DISABLE_EXTENSION_KEY}, ${JSON.stringify(data)})`).run();
    } catch (error) {
      console.error(error);
    }
  }
}