# 修改日志

## 1.0.7（2023.8.23）

- 修复
  1. 修复了 indexdb 只重试一次连接导致三个连接同时连接时失败页面卡死的缺陷

## 1.0.6（2023.7.17）

- 功能
  1. 增加了 getItemList 和 removeItemList 的批量查询和删除函数

## 1.0.5 (2023.7.14)

- 优化
  1. indexdbDB 的操作都增加了等待 connection 连接完成才回调操作
  2. 增加了 perfect-cache 的 debug 模块和修改了日志的输出
