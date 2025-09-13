### v1.0.0 2025-09-14

- 增强扩展管理功能
  - 添加扩展提示行为配置(extensionPromptBehavior)，支持'always'、'once'和'never'三种模式
  - 添加跳过扩展列表配置(skippedExtensions)，支持项目级和全局级配置
  - 添加已显示提示扩展列表配置(promptShownExtensions)，支持项目级和全局级配置
  - 改进用户交互界面，提供安装、跳过和取消选项
  - 优化错误消息显示，提供更详细的错误信息
  - 改进代码结构，添加新的配置管理方法

### v0.1.4 2023-12-28

- 增加以当前目录为工作目录选项.

### v0.1.3 2023-12-25

- 修正rust-analyzer的扩展ID. 感谢[@yeluyang](https://gitee.com/yeluyang95)

### v0.1.1 2021-08-18

- Rust改为rust-analyzer扩展. 感谢 [@NightGlow98](https://gitee.com/nightglow98) [@Amin](https://gitee.com/what_time_457323897)
- 增加调试热键：缺省cmd+5

### v0.0.9 2021-05-08

- 修正菜单图标不正常显示问题

### v0.0.8 2021-03-19

- 自动安装必须的语言扩展

### v0.0.7 2021-03-19

- 增加lua调试支持

### v0.0.6 2021-02-14

- 增加bash调试支持

### v0.0.5 2021-02-09

- 重新实现依赖扩展安装

### v0.0.4 2021-02-06

- 更名为Code Debugger

### v0.0.3 2021-02-04

- 增加c/cpp, rust调试支持
- 自动安装调试语言必须的Vscode扩展

### v0.0.1 2021-01-31

- 第一个版本（js、ts、py、go、coffee）
