# Data Model: Bootstrap Next.js Template

## Overview

本文件描述模板第一版需要覆盖的核心实体、关系和约束，用于支撑后续实现方案，不等同于最终 migration 文件。

默认前提：

- 所有表位于当前项目的 `DATABASE_SCHEMA`
- 不依赖跨项目共享表
- 单用户优先，但表结构允许未来扩展到多用户

## Entities

### users

用途：

- 存储登录用户
- 支撑设置页与 API token 归属

建议字段：

- `id`
- `email`
- `name`
- `password_hash`
- `created_at`
- `updated_at`

约束：

- `email` 唯一
- 第一版通常只会 seed 一个管理员用户

### sessions

用途：

- 存储 Web 登录 session

建议字段：

- `id`
- `user_id`
- `token_hash`
- `expires_at`
- `created_at`

关系：

- 多条 `sessions` 属于一个 `users`

约束：

- `token_hash` 唯一
- 过期 session 必须可清理

### api_tokens

用途：

- 存储 Personal Access Token 元数据
- 支撑 `/api/v1/*` bearer token 鉴权

建议字段：

- `id`
- `user_id`
- `name`
- `token_hash`
- `scopes`
- `last_used_at`
- `expires_at`
- `revoked_at`
- `created_at`

关系：

- 多条 `api_tokens` 属于一个 `users`

约束：

- 明文 token 不入库
- `token_hash` 唯一
- `revoked_at` 非空表示失效

### audit_logs

用途：

- 记录关键安全和管理操作

建议字段：

- `id`
- `actor_type`
- `actor_id`
- `action`
- `target_type`
- `target_id`
- `metadata`
- `created_at`

建议首批覆盖动作：

- `auth.login`
- `auth.logout`
- `token.create`
- `token.revoke`
- `example_item.create`
- `example_item.update`
- `example_item.delete`

### example_items

用途：

- 提供模板级 CRUD 样例
- 验证页面、API、数据库、测试链路

建议字段：

- `id`
- `title`
- `status`
- `notes`
- `created_at`
- `updated_at`

约束：

- 不承载真实业务语义
- 字段数量控制在最小闭环所需范围

## Relationships

```text
users 1 --- n sessions
users 1 --- n api_tokens
users 1 --- n audit_logs   (via actor_id when actor_type=user)
```

`example_items` 第一版可不强制绑定 `users`，因为模板是单用户优先；若后续需要扩展为多用户项目，可再补 `owner_id` 或等价字段。

## State Rules

### Session

- 创建登录 session 时写入 `sessions`
- 登出时使对应 session 失效
- 过期 session 不能再用于页面鉴权

### API Token

- 创建时生成一次性明文 token，并仅返回一次
- 数据库存 hash 和元数据
- 使用中可更新 `last_used_at`
- 撤销后设置 `revoked_at`

### Example Item

- 支持创建、读取、更新、删除
- 状态字段仅服务演示用途，避免复杂状态机

## Schema Isolation Notes

- 所有实体默认创建在 `DATABASE_SCHEMA`
- migration、seed、运行时查询必须绑定同一 schema
- 不在模板层引入跨 schema 依赖
