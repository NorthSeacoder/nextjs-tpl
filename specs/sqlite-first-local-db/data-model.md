# Data Model: SQLite-First Local DB

## Purpose

本文件定义 SQLite 与 PostgreSQL 双模式下必须保持一致的数据语义，用于约束 schema 拆分后的收敛面。

它不规定具体 ORM API 或 migration 写法，只定义：

- 哪些实体必须继续存在
- 哪些字段语义必须保持一致
- 哪些 PostgreSQL 特性不能再作为模板默认前提

## Shared Entity Set

两种数据库模式下都必须保留以下实体：

- `users`
- `sessions`
- `api_tokens`
- `audit_logs`
- `example_items`

应用层、service 层、seed 层都应继续使用这组实体名称，不因 driver 不同而改变业务命名。

## Entity Semantics

### users

用途：

- 登录主体
- 管理员 seed 落点
- PAT 归属主体

核心字段语义：

- `id`：主键，唯一标识用户
- `email`：唯一邮箱，用于登录
- `name`：展示名
- `password_hash`：密码哈希
- `created_at`
- `updated_at`

约束：

- `email` 必须唯一
- 模板默认只要求单管理员，但数据模型不锁死为“只能一条”

### sessions

用途：

- Web 登录 session 持久化

核心字段语义：

- `id`
- `user_id`
- `token_hash`
- `expires_at`
- `created_at`

约束：

- `token_hash` 必须唯一
- `user_id` 指向 `users`
- 过期后不得继续用于鉴权

### api_tokens

用途：

- Bearer token 鉴权
- 设置页 PAT 管理

核心字段语义：

- `id`
- `user_id`
- `name`
- `token_hash`
- `scopes`
- `last_used_at`
- `expires_at`
- `revoked_at`
- `created_at`

约束：

- 明文 token 不入库
- `token_hash` 必须唯一
- `revoked_at` 非空表示失效

跨方言说明：

- `scopes` 在 PostgreSQL 中可继续使用 JSON 类能力
- 在 SQLite 中只要求其能表达“字符串数组语义”，不要求底层类型完全一致

### audit_logs

用途：

- 记录关键安全与管理操作

核心字段语义：

- `id`
- `actor_type`
- `actor_id`
- `action`
- `target_type`
- `target_id`
- `metadata`
- `created_at`

约束：

- `metadata` 只要求支持对象语义
- 模板层不要求复杂查询能力

跨方言说明：

- 不要求 SQLite 与 PostgreSQL 使用同一种物理 JSON 列类型
- 只要求应用层读写语义一致

### example_items

用途：

- 模板 CRUD 演示实体

核心字段语义：

- `id`
- `title`
- `status`
- `notes`
- `created_at`
- `updated_at`

约束：

- 字段保持最小闭环
- 不承载真实业务约束

## Cross-Driver Compatibility Rules

### 1. IDs

不要求两种数据库使用同一种底层 ID 生成机制。

要求：

- 应用层视角下，所有主键仍是稳定字符串标识
- seed、auth、CRUD 不依赖特定数据库的 ID 生成语法

### 2. Timestamps

不要求两种数据库使用同一种 timestamp 存储细节。

要求：

- 仍保留 `created_at` / `updated_at` / `expires_at` 等时间字段语义
- 应用层和 API 层获得一致的时间含义

### 3. JSON-like fields

`api_tokens.scopes` 和 `audit_logs.metadata` 不能再默认依赖 PostgreSQL `jsonb`。

要求：

- 两种 driver 下都能表达相同业务语义
- 业务层不关心底层是 JSON 原生列、文本列还是 ORM 序列化处理

### 4. Namespace / Schema isolation

`DATABASE_SCHEMA` 仅属于 PostgreSQL 模式。

要求：

- PostgreSQL 模式继续支持当前项目独立 schema
- SQLite 模式不模拟 schema namespace
- 业务层不得依赖 schema 名称参与运行时逻辑

## State Rules

### Admin seed

- 首次 seed 时，如果不存在管理员邮箱则创建
- 再次执行 seed 不应重复创建管理员

### Session lifecycle

- 登录创建 session
- 登出或失效后 session 不再有效
- 过期 session 不能通过鉴权

### PAT lifecycle

- 创建时返回一次性明文 token
- 持久化层只保存 hash 与元数据
- 使用中可更新 `last_used_at`
- 撤销后设置 `revoked_at`

### Example item lifecycle

- 支持创建、读取、更新、删除
- `status` 仅作演示，不引入复杂状态机

## Modeling Implications for Implementation

实现阶段需要特别注意：

- 不要把 PostgreSQL 专属列类型直接当成模板层领域模型
- 不要把 SQLite 模式简化为“少数字段阉割版”
- 两种模式的差异应停留在 schema/client/migration 层，不扩散到页面和 service 层
