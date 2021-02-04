# code debuger

无需配置launch.json即可进行单文件调试，点击右上角虫子图标或者右键菜单都可以。

支持JS、TS、Python、Dart、Coffeescript、Go、C/C++、Rust。

      
![demo](https://gitee.com/genqing/code-debuger/raw/master/res/demo.png)

如果需要其他语言的，欢迎[提需求](https://gitee.com/genqing/code-debuger/issues)

### 与 code runner 的区别
code runner 是run代码，code debuger 是调试代码，也就是你可以下断点、单步调试、查看实时变量信息等。

### 注意事项
1、Code Debuger 会自动安装语言debug必须的Vscode扩展，可能需要reload window。
2、语言的开发环境需要先配置好（例如：go 需要dlv）。