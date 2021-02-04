import * as fs from 'fs-extra'

export * from './locale'
export * from './api'
export * from './node'
export * from './placeholder'

/**
 * Format the template with specified values.
 *
 * For example:
 *
 * With the template `"Hello, {0} and {1}!"` and the values `["Jack", "Rose"]`, you'll get `"Hello, Jack and Rose!"`.
 *
 * @param {string} template The template string.
 * @param {...any[]} values The values.
 */
export function format(template: string, ...values: any[]) {
  if (template == null) {
      return template;
  }

  return values.reduce((prev, value, index) => {
      return prev.replace(new RegExp(`\\{${index}\\}`, "gm"), value);
  }, template);
}

export function isFile(filePath: string) {
  return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
}

export function isDir(dir: string) {
  return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
}

export function delay ( ms: number ) {
  return new Promise ( resolve => setTimeout ( resolve, ms ) );
}

export function isPlainObject(val: any): boolean {
  return Object.prototype.toString.call(val) === '[object Object]';
}

export function isString(val: any): val is string {
  return typeof val === 'string' || val instanceof String;
}

export function isFunction(val: any): val is Function {
  return typeof val === 'function';
}

