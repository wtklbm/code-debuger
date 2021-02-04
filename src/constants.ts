import { VSCodeEdition } from "./types";

/**
 * The builtin-environments of different VSCode editions.
 */
export const VSCODE_BUILTIN_ENVIRONMENTS: Record<VSCodeEdition, {
  dataDirectoryName: string;
  extensionsDirectoryName: string;
}> = {
  [VSCodeEdition.STANDARD]: {
    dataDirectoryName: "Code",
    extensionsDirectoryName: ".vscode"
  },
  [VSCodeEdition.INSIDERS]: {
    dataDirectoryName: "Code - Insiders",
    extensionsDirectoryName: ".vscode-insiders"
  },
  [VSCodeEdition.EXPLORATION]: {
    dataDirectoryName: "Code - Exploration",
    extensionsDirectoryName: ".vscode-exploration"
  },
  [VSCodeEdition.VSCODIUM]: {
    dataDirectoryName: "VSCodium",
    extensionsDirectoryName: ".vscode-oss"
  },
  [VSCodeEdition.OSS]: {
    dataDirectoryName: "Code - OSS",
    extensionsDirectoryName: ".vscode-oss"
  },
  [VSCodeEdition.CODER]: {
    dataDirectoryName: "Code",
    extensionsDirectoryName: "vscode"
  }
};