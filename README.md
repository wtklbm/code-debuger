# Code Debugger

[English README](https://gitee.com/genqing/code-debuger/blob/master/README.en.md)

无需配置launch.json即可进行单文件调试，点击右上角虫子图标或者右键菜单都可以。

支持**JS、TS、Python、Dart、Coffeescript、Go、C/C++、Rust、Bash、Lua**。

      
![demo](https://gitee.com/genqing/code-debuger/raw/master/res/demo.png)

如果需要其他语言的，欢迎[提需求](https://gitee.com/genqing/code-debuger/issues)

## 常见问题
### 1、TypeScript 无法调试
原因是node不支持import引入，将"module"改为"commonjs"即可。
```json
// tsconfig.json
{
  "compilerOptions": {
    "module": "commonjs",
    ...
  }
}
```

## 注意事项
1. Code Debugger 会自动安装语言debug必须的Vscode扩展，可能需要reload window。
2. 语言的开发环境需要先配置好（例如：go 需要dlv）。
3. Bash需要4.0以上版本，mac系统升级Bash请自行百度或者Google。