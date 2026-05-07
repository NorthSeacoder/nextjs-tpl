# Plan: Bootstrap Next.js Template

## Overview

本方案目标是把当前仓库落地为一个可复用的 Next.js 全栈模板，满足以下基线：

- 单用户、自部署、agent-friendly
- monorepo/workspace 结构
- shared infra first：NAS 生产默认复用公共基础设施
- 数据库默认接入公共 PostgreSQL，并采用共享 database + 独立 schema 隔离
- v1 即包含登录、受保护页面、PAT 管理页、示例 CRUD、OpenAPI 基础和 Docker/CI 路径

当前仓库尚未进入实现阶段，计划将以“从零搭出最小闭环”为主，而不是在既有系统上做增量改造。

## Key Design Decisions

### 1. Monorepo as the default shape

仓库第一版直接采用 monorepo/workspace，而不是先做单应用再拆分。

原因：

- `packages/db`、`packages/api-contract`、`packages/config` 的边界在模板阶段就已明确
- 能避免后续把“模板基线能力”重新从 `apps/web` 中抽离
- 更适合后续业务项目直接复用共享包和命令结构

初始包边界：

- `apps/web`：Next.js App Router 应用、页面、API route、middleware
- `packages/db`：Drizzle schema、client、migration、seed
- `packages/api-contract`：OpenAPI 文档和契约导出
- `packages/config`：tsconfig、eslint 等共享工程配置
- `packages/ui`：仅放通用基础 UI，不承载业务逻辑

### 2. Shared PostgreSQL with schema isolation

数据库采用共享 PostgreSQL + 项目独立 schema 作为默认实现路径。

原因：

- 与 NAS shared infra first 原则一致
- 比每项目自带 Postgres 更节省资源、更少运维面
- 比独立 database 更符合“接入公共实例”的常态路径

方案约束：

- `DATABASE_URL` 指向共享 database
- `DATABASE_SCHEMA` 明确当前项目 schema
- migration、seed、查询 client 都必须显式绑定当前 schema
- 仅在没有公共 PostgreSQL 或隔离要求明显更高时，才退回独立 database / 独立容器 fallback

### 3. V1 includes PAT management, not just reservation hooks

第一版直接交付 PAT 管理页和对应接口，而不是只保留扩展位。

原因：

- spec 已将 agent-friendly 作为模板目标
- 对外 API 如果没有稳定 token 管理入口，模板在自动化接入场景下不完整
- PAT 和 audit log 在模板阶段统一打通，后续业务项目复制成本最低

边界：

- v1 只做单用户下的 token 创建、查看、撤销
- 不做复杂 scope 模型、审批流或多角色权限

### 4. Deployment and CI split

Docker 能力分两层：

- 仓库内必须有本地和服务器侧直接构建 / 运行路径
- GitHub Actions 负责稳定分支自动构建并推送镜像

原因：

- self-host first 决定了本地和 NAS 侧不能依赖 CI 才能构建
- release 分支自动出镜像能减少重复操作，适合模板推广后复用

### 5. Minimal closed loop over maximal feature set

第一版只交付能证明模板成立的最小闭环：

- 登录
- 受保护页面
- PAT 管理
- 示例 CRUD
- migration + seed
- OpenAPI 基础
- Docker / NAS / GitHub Actions 最小可运行样例

明确不进入第一版的内容：

- Redis / worker / queue
- OAuth / SSO / RBAC
- Stripe / mail / object storage
- 多租户和复杂实时协作

## Planned Architecture

### Repository Modules

`apps/web` 负责：

- 公共首页、登录页、dashboard、settings、examples
- session cookie 登录与 middleware 鉴权
- PAT 管理 UI
- 内部 API 与 `/api/v1/*`

`packages/db` 负责：

- 表结构定义
- schema-aware 数据库连接
- migration / seed 执行入口
- 与 Web 层解耦的数据访问基础

`packages/api-contract` 负责：

- `v1.yaml` 或等价 OpenAPI 文档
- 对应请求/响应 schema 的复用出口

`packages/config` 负责：

- TypeScript / ESLint / 其他基础配置共享

`packages/ui` 负责：

- 基础 UI 组件、layout 原语、状态组件
- 不承载业务行为或数据访问逻辑

### Runtime Layers

运行时按四层组织：

1. route/page 层：处理页面入口与 API 路由
2. auth/app service 层：处理 session、PAT、example item 等业务流程
3. db access 层：通过 `packages/db` 暴露 schema-aware client
4. infra/config 层：env 校验、Docker、CI、deployment 文档

## Data Flow and Interface Boundaries

### Auth flow

1. 用户访问 `/login`
2. 登录 API 校验管理员账号
3. 成功后签发 HTTP-only session cookie
4. middleware 拦截 `(dashboard)` 及受保护 API
5. `/settings` 读取当前 session 并展示账号与 token 管理能力

边界要求：

- session auth 用于 Web 页面
- PAT auth 用于 `/api/v1/*`
- 两种鉴权路径在 service 层共享用户与审计逻辑，但 token 解析方式不同

### PAT flow

1. 用户在设置页创建 token
2. 服务层生成明文 token，一次性返回
3. 数据库仅存储 hash 与元数据
4. `/api/v1/*` 使用 bearer token 鉴权
5. 撤销后 token 不再通过鉴权

边界要求：

- 明文 token 只在创建时返回一次
- 列表页展示名称、创建时间、最近使用时间、状态
- revoke 为软失效，不要求物理删除

### Example CRUD flow

1. 页面端访问示例列表和表单
2. 内部 API 或服务层调用 `packages/db`
3. 数据写入 `example_items`
4. API v1 对同一资源暴露 agent-friendly CRUD
5. 契约层同步维护请求/响应结构

### Database config flow

1. env 校验读取 `DATABASE_URL`、`DATABASE_SCHEMA` 等变量
2. `packages/db` 基于 schema 创建 client
3. migration / seed 运行时显式绑定目标 schema
4. NAS 部署与本地 fallback 共享同一组配置语义

## Data Model Scope

本期核心实体：

- `users`
- `sessions`
- `api_tokens`
- `audit_logs`
- `example_items`

其中：

- `users` 支撑单用户登录与设置页
- `sessions` 支撑 cookie 登录态
- `api_tokens` 支撑 PAT 管理与 API 鉴权
- `audit_logs` 支撑关键操作记录，至少覆盖登录、登出、token 创建、token 撤销
- `example_items` 支撑模板 CRUD 闭环

详细字段与关系见 `data-model.md`。

## Main Change Surfaces

### 1. Workspace bootstrap

需要创建：

- 根 `package.json`
- `pnpm-workspace.yaml`
- `turbo.json`
- 共享 tsconfig / lint 配置

### 2. Web application skeleton

需要创建：

- Next.js app router 目录
- auth / dashboard / settings / examples 页面
- middleware 与 layout
- 基础 UI 状态页

### 3. Database package

需要创建：

- Drizzle config
- schema 定义
- client 封装
- migration / seed 入口
- schema-aware env 接线

### 4. API and contract layer

需要创建：

- health / auth / PAT / example CRUD API
- OpenAPI v1 文档
- 请求响应 schema 的共享出口

### 5. Infra and deployment assets

需要创建：

- `Dockerfile.web`
- 开发 / 生产 compose
- Traefik labels 示例
- GitHub Actions docker build/push workflow
- `.env.example`
- README / deployment 文档

### 6. Verification assets

需要创建：

- 单元测试样例
- API 测试样例
- E2E 登录和 CRUD 样例

## Risks and Trade-offs

### 1. Schema isolation support may leak if not enforced consistently

风险：

- 若 migration、seed、runtime client 三者任一未绑定 schema，容易污染共享 database 下的其他对象

应对：

- schema 作为必填 env 参与启动校验
- 所有 db 入口统一走 `packages/db`
- 文档明确禁止在应用层绕过该入口直接创建连接

### 2. PAT + session dual auth increases v1 surface

风险：

- v1 同时交付 session 和 PAT，会拉高 auth、审计、测试范围

应对：

- PAT 仅覆盖单用户和基础 revoke
- 不在第一版引入复杂 scopes 和 token sharing 模型

### 3. Monorepo bootstrap cost is higher at the start

风险：

- 仓库初始化文件会明显增多，第一阶段工程搭建工作量较大

应对：

- 保持包边界少而稳
- 第一版只创建明确有职责的 4 到 5 个包，不提前做过细拆分

### 4. CI/CD may drift from local Docker path

风险：

- 如果 workflow 单独维护构建逻辑，本地和 CI 可能逐渐不一致

应对：

- GitHub Actions 尽量复用仓库内 Dockerfile 和同一套 build args
- README 说明本地构建命令与 CI 触发关系

## Validation Strategy

### 1. Bootstrap validation

- workspace install 能成功
- 基础命令 `dev/build/lint/typecheck/test` 有一致入口

### 2. Database validation

- 在共享 PostgreSQL + 指定 schema 下成功 migrate
- seed 仅写入当前 schema
- 本地 fallback 模式也能完成同样链路

### 3. Auth validation

- 登录成功后进入受保护页面
- 未登录访问受保护页面被重定向
- 登出后 session 失效

### 4. PAT validation

- 设置页可创建 token
- token 仅在创建时返回一次
- bearer token 可访问 `/api/v1/*`
- revoked token 无法继续调用 API

### 5. CRUD validation

- Web 侧完成 example item 增删改查
- API v1 对同一资源完成增删改查

### 6. Deployment validation

- 本地 Docker build / compose 可用
- NAS 生产 compose 默认只启动 `web`
- `release` 分支推送可自动构建并推送镜像

## Open Implementation Notes

- 当前仓库尚无代码基线，计划默认从零创建工程骨架。
- `spec` 已足够进入 `tasks`，当前无阻塞性歧义。
- 后续若在实现前需要更细的数据关系确认，可直接依赖 `data-model.md`，无需再回退到 `clarify`。
