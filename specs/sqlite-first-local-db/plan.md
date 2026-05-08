# Plan: SQLite-First Local DB

## Overview

本方案将模板的数据库体验调整为“双模式、单接口”：

- 本地默认使用 SQLite 文件库，目标是零外部依赖、最短启动路径
- 部署场景继续支持 PostgreSQL，目标是保持现有自部署能力并实现低摩擦切换

方案核心不是简单替换连接串，而是把当前 `packages/db` 中“默认 PostgreSQL + schema namespace”这一前提改为“显式 driver 选择 + 方言内聚 + 应用层无感知”。

结果上，模板用户应只需要切换环境变量并执行同一组数据库命令，即可在本地 SQLite 和部署 PostgreSQL 之间切换。

## Current State

当前代码现实：

- `.env.example` 默认要求 PostgreSQL `DATABASE_URL` 和 `DATABASE_SCHEMA`
- `packages/db/src/client.ts` 仅支持 `pg` + `drizzle-orm/node-postgres`
- `packages/db/src/schema/index.ts` 完全基于 `drizzle-orm/pg-core`
- `packages/db/drizzle.config.ts` 固定为 PostgreSQL dialect
- `packages/db/src/seed.ts` 与当前 schema/client 强绑定
- `README.md` Quick Start 仍要求用户先配置数据库连接，再执行 `db:generate / db:migrate / db:seed`
- `compose.dev.yml` 内置本地 Postgres 容器作为开发路径补充

直接结论：

- 现在的模板并不满足“复制后即可本地零依赖启动”
- 当前数据库层没有为多方言预留边界，必须先做模块拆分，再改文档和命令面

## Key Design Decisions

### 1. Driver as a first-class runtime choice

新增显式数据库模式配置，而不是从 `DATABASE_URL` 形态隐式推断。

建议环境变量语义：

- `DATABASE_DRIVER=sqlite | postgres`
- `DATABASE_URL=...`

原因：

- 用户心智更清晰
- 文档可以直接按 driver 组织
- 后续命令、迁移、测试都能统一围绕 driver 分流

### 2. Local default is SQLite file persistence

本地默认 driver 为 `sqlite`，默认 URL 指向仓库内持久化文件。

原因：

- 满足“重启后数据仍在”
- 比 in-memory 更适合模板调试和首次体验
- 不需要额外依赖外部服务

该模式只服务本地开发和快速验证，不要求覆盖生产隔离能力。

### 3. PostgreSQL remains the deployment mode

部署能力不删除，只从“默认路径”降为“显式切换路径”。

约束：

- 切到 PostgreSQL 时，应用层页面、service、API route 不改代码
- 部署文档继续保留 NAS / shared PostgreSQL 路径
- `DATABASE_SCHEMA` 仅在 PostgreSQL 模式下有意义

### 4. Schema definitions split by dialect, not forced into one file

当前 schema 使用 `pg-core`、`jsonb`、schema namespace、timezone timestamp；这些都不适合硬塞进一份跨方言 schema。

因此方案采用：

- `schema/sqlite.ts`
- `schema/postgres.ts`
- `schema/index.ts` 负责按 driver 暴露统一命名的表对象

共识层只保留“实体集合与字段语义一致”，不追求 ORM 层完全复用同一份定义。

### 5. Migrations are driver-specific

迁移产物按 driver 分目录维护，而不是尝试混用一份 migration。

原因：

- SQLite 与 PostgreSQL DDL 能力不同
- 现有 PostgreSQL schema namespace 逻辑无法直接投射到 SQLite
- 强行共用 migration 会让首次启动路径和部署路径都变脆

### 6. Introduce a first-run setup command

新增面向模板用户的 `db:setup` 入口，作为“第一次用模板时该执行什么”的标准答案。

职责：

- 准备本地数据库文件所需前置条件
- 执行当前 driver 对应的 migration
- 执行 seed

该命令是文档入口，不替代保留 `db:migrate` / `db:seed` 这些底层命令。

## Planned Architecture

### Database Config Layer

`packages/db/src/env.ts` 调整为 driver-aware 配置层。

职责：

- 解析 `DATABASE_DRIVER`
- 对不同 driver 做差异化校验
- 为上层暴露统一的已解析配置对象

预期规则：

- `sqlite` 模式必须提供有效文件型 URL
- `postgres` 模式必须提供 PostgreSQL 连接串
- `DATABASE_SCHEMA` 在 `postgres` 模式下必填，在 `sqlite` 模式下忽略或提供安全默认值

### Database Client Layer

`packages/db/src/client.ts` 调整为统一 client 工厂。

职责：

- 根据 driver 初始化对应 Drizzle client
- 对外继续暴露统一 `db` 访问入口
- 隔离底层 `better-sqlite3` 与 `pg` 差异

边界：

- 应用层不得直接依赖具体 driver 包
- 连接初始化错误应在数据库层抛出，而不是散落到业务层

### Schema Layer

`packages/db/src/schema/` 负责同一业务实体的方言分化定义。

实体范围保持不变：

- `users`
- `sessions`
- `api_tokens`
- `audit_logs`
- `example_items`

约束：

- 表名和字段语义在两种 driver 下保持一致
- PostgreSQL 保留现有 schema namespace 思路
- SQLite 不引入额外 namespace 概念

### Migration Layer

数据库迁移改为按 driver 明确分流。

建议结构：

- `packages/db/drizzle/sqlite/`
- `packages/db/drizzle/postgres/`
- driver 对应的 drizzle config

命令层语义：

- `db:generate` 生成当前 driver 的迁移
- `db:migrate` 执行当前 driver 的迁移
- `db:setup` 执行 migrate + seed

### Seed Layer

`packages/db/src/seed.ts` 保留单入口，但依赖统一 schema 导出和统一 client。

职责保持不变：

- 检查管理员账号是否存在
- 不存在则创建

约束：

- seed 逻辑不得依赖 PostgreSQL 特有语法
- 在 SQLite / PostgreSQL 下行为一致

### Documentation Layer

文档入口重写为 SQLite-first。

文档结构建议：

- `README.md`：最短启动路径、本地默认模式、核心命令
- `docs/database.md`：SQLite 与 PostgreSQL 双模式说明
- `docs/deployment-nas.md`：保留 NAS shared PostgreSQL 路径，但明确其属于部署模式而非本地默认模式
- `.env.example`：默认 SQLite
- `.env.postgres.example`：部署切换示例

## Data Flow and Interface Boundaries

### Local first-run flow

1. 用户复制 `.env.example` 为 `.env`
2. 默认 `DATABASE_DRIVER=sqlite`
3. 用户执行 `pnpm db:setup`
4. 数据库层创建或打开 SQLite 文件
5. migration 执行
6. seed 创建管理员用户
7. 用户执行 `pnpm dev`

边界要求：

- 这是 README 的主路径
- 不要求用户先理解 PostgreSQL、schema 或容器

### PostgreSQL switch flow

1. 用户改用 PostgreSQL 环境变量模板
2. 设置 `DATABASE_DRIVER=postgres`
3. 提供 PostgreSQL `DATABASE_URL` 与 `DATABASE_SCHEMA`
4. 执行 `pnpm db:migrate`
5. 按需执行 `pnpm db:seed`
6. 启动应用或部署容器

边界要求：

- 应用代码路径不变
- 数据库命令名不变
- 切换说明必须独立成文，不埋在实现细节里

### Runtime application flow

页面、API、service 层仍通过 `packages/db` 暴露的统一表对象和 `db` client 工作。

因此本需求的主要边界是“数据库包内部吸收方言差异”，而不是把 driver 判断扩散到业务层。

## Main Change Surfaces

### 1. Root command surface

需要调整根 `package.json`：

- 新增 `db:setup`
- 保持 `db:migrate` / `db:seed` / `db:studio`
- 视实现情况决定是否保留 `db:generate` 的默认入口语义

### 2. Database package

需要改动：

- `packages/db/package.json`
- `packages/db/src/env.ts`
- `packages/db/src/client.ts`
- `packages/db/src/schema/*`
- `packages/db/src/seed.ts`
- `packages/db/drizzle*.ts`

这是本次方案的核心改动面。

### 3. Environment samples

需要改动或新增：

- `.env.example`
- `.env.postgres.example`

### 4. Developer documentation

需要改动或新增：

- `README.md`
- `docs/database.md`
- `docs/deployment-nas.md`

### 5. Local compose path

`compose.dev.yml` 需要重新定位。

推荐处理：

- 不再作为 README 默认本地开发路径
- 保留为“需要容器化本地验证时的可选方案”
- 若继续存在，应明确其与 SQLite-first 默认路径的关系，避免文档冲突

## Risks and Trade-offs

### 1. Cross-dialect schema drift

风险：

- 两套 schema 若维护不一致，会出现字段或默认值漂移

应对：

- 用统一实体命名和字段语义约束
- 用独立 data model 文档定义跨方言共识
- 在测试中覆盖最关键的 seed / auth / CRUD 链路

### 2. Existing PostgreSQL assumptions leak upward

风险：

- 当前 service 层、查询层可能默认依赖 PostgreSQL 字段行为，例如 JSON / timestamp / UUID 默认值

应对：

- 方案要求应用层只依赖统一语义，不依赖 SQL 方言特性
- 在实现时优先修正数据库包导出和 seed/auth 这些基础链路

### 3. Drizzle tooling complexity increases

风险：

- 增加第二种 driver 后，drizzle config、迁移生成和 studio 使用方式会更复杂

应对：

- 把复杂性收敛到 `packages/db` scripts
- 对模板用户暴露稳定的根命令与 README

### 4. NAS deployment docs may become inconsistent

风险：

- 如果 README 改成 SQLite-first，但 NAS 文档还保留“模板默认 PostgreSQL”的表述，会造成冲突

应对：

- 明确区分“本地默认模式”和“部署推荐模式”
- 在文档中用场景而不是抽象概念组织说明

## Validation Strategy

### 1. Configuration validation

验证：

- `sqlite` 模式下默认 env 可通过配置解析
- `postgres` 模式下缺少 `DATABASE_SCHEMA` 会明确失败
- 错误配置能给出可操作的报错

### 2. Local bootstrap validation

验证：

- 新用户按 README 执行 `cp .env.example .env`
- 执行 `pnpm db:setup`
- 执行 `pnpm dev`
- 能完成登录与基础页面访问

### 3. Cross-driver functional validation

验证以下最小闭环在 SQLite / PostgreSQL 下都成立：

- 管理员 seed
- 登录
- session 读写
- PAT 管理
- example CRUD

### 4. Documentation validation

验证：

- README 是否把 SQLite-first 讲成主路径
- 数据库文档是否能单独解释何时切到 PostgreSQL
- NAS 文档是否与新默认路径不冲突

## Blocking Issues

当前没有阻塞进入 `tasks` 的需求级问题。

实现阶段需要重点确认但不阻塞规划的事项：

- SQLite 驱动依赖选择与仓库安装方式
- Drizzle 多方言 migration/studio 命令如何组织到最简
- `compose.dev.yml` 最终是保留为可选路径还是改为 SQLite 对齐的容器化说明
