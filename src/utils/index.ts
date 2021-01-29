export * from './locale';
export * from './api'

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

