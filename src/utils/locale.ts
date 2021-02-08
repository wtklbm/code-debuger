import { NormalizedLocale } from "../types/normalizedLocale";

/**
 * Normalizes the locale string.
 *
 * @param {string} locale The locale string, such as `"zh-CN"`, `"en-US"`...
 */
export function normalize(locale: string | undefined): NormalizedLocale {
    switch (locale) {
        case "zh-cn":
        case "zh-CN":
            return NormalizedLocale.ZH_CN;

        case "en":
        case "en-us":
        case "en-US":
        default:
            return NormalizedLocale.EN_US;
    }
}

/**
 * Gets the normalized VSCode locale.
 */
export function getNormalizedVSCodeLocale(): NormalizedLocale {
  return normalize(getVSCodeLocale());
}

/**
 * Gets the VSCode locale string.
 */
export function getVSCodeLocale(): string | undefined {
  try {
      return JSON.parse(process.env.VSCODE_NLS_CONFIG || "{}").locale;
  } catch (err) {
      return;
  }
}