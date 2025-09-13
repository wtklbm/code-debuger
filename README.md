# Code Debugger

[English README](https://gitee.com/genqing/code-debuger/blob/master/README.en.md)

## Fork 说明

本项目是基于 [Code Debugger](https://gitee.com/genqing/code-debuger) 的 fork 版本。

### 原始项目
- **原始项目地址**: [https://gitee.com/genqing/code-debuger](https://gitee.com/genqing/code-debuger)
- **原始作者**: genqing

### 本项目修改内容
在原始项目的基础上，本项目进行了以下增强：

#### v1.0.0 (2025-09-14)
- 增强扩展管理功能
  - 添加扩展提示行为配置(extensionPromptBehavior)，支持'always'、'once'和'never'三种模式
  - 添加跳过扩展列表配置(skippedExtensions)，支持项目级和全局级配置
  - 添加已显示提示扩展列表配置(promptShownExtensions)，支持项目级和全局级配置
  - 改进用户交互界面，提供安装、跳过和取消选项
  - 优化错误消息显示，提供更详细的错误信息
  - 改进代码结构，添加新的配置管理方法

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
