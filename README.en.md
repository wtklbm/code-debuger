# Code Debugger

Debug code file for mutiple languages: **JS、TS、Python、Dart、Coffeescript、Go、C/C++、Rust、Bash、Lua**.

![demo](https://gitee.com/genqing/code-debuger/raw/master/res/demo.png)

[submit issues](https://gitee.com/genqing/code-debuger/issues)

## Fork Notice

This project is a fork version based on [Code Debugger](https://gitee.com/genqing/code-debuger).

### Original Project
- **Original Project URL**: [https://gitee.com/genqing/code-debuger](https://gitee.com/genqing/code-debuger)
- **Original Author**: genqing

### Project Modifications
Based on the original project, this project has been enhanced with the following features:

#### v1.0.0 (2025-09-14)
- Enhanced extension management functionality
  - Added extension prompt behavior configuration (extensionPromptBehavior), supporting 'always', 'once', and 'never' modes
  - Added skipped extensions list configuration (skippedExtensions), supporting project-level and global-level configuration
  - Added prompt shown extensions list configuration (promptShownExtensions), supporting project-level and global-level configuration
  - Improved user interaction interface, providing install, skip, and cancel options
  - Optimized error message display, providing more detailed error information
  - Improved code structure, added new configuration management methods

## Q&A
### 1、TypeScript cannot be debugged
The reason is that node does not support `import`, just change "module" to "commonjs".
```json
// tsconfig.json
{
  "compilerOptions": {
    "module": "commonjs",
    ...
  }
}
```

## Note
1. Code Debugger will automatically install Vscode extensions necessary for language debug, and reload window may be required.
2. The language development environment needs to be configured first (for example: go requires dlv).
3. Bash requires version 4.0 or higher. For mac system to upgrade Bash, please use Baidu or Google.
