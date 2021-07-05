# Code Debugger

Debug code file for mutiple languages: **JS、TS、Python、Dart、Coffeescript、Go、C/C++、Rust、Bash、Lua**.

![demo](https://gitee.com/genqing/code-debuger/raw/master/res/demo.png)

[submit issues](https://gitee.com/genqing/code-debuger/issues)

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