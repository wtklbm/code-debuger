/**
 * Represents the editions of VSCode.
 */
export enum VSCodeEdition {
  /**
   * The VSCode Standard Builds.
   */
  STANDARD,

  /**
   * The VSCode Insiders.
   */
  INSIDERS,

  /**
   * The VSCode Exploration Builds.
   */
  EXPLORATION,

  /**
   * The VSCode under FLOSS license, see [VSCodium](https://gitee.com/VSCodium/vscodium).
   */
  VSCODIUM,

  /**
   * The self-compiled version of VSCode under
   * [the default configuration](https://gitee.com/Microsoft/vscode/blob/master/product.json).
   */
  OSS,

  /**
   * The VSCode provided by [Coder](https://coder.com), which is running on a remote or self-hosted server.
   */
  CODER
}
