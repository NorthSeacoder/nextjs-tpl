# Tasks: SQLite-First Local DB

## Phase 1: Database Driver Foundation

- [x] 1.1 扩展数据库配置为显式 driver 模式
  - 更新 `packages/db/src/env.ts`，引入 `DATABASE_DRIVER`
  - 定义 `sqlite` 与 `postgres` 的差异化校验规则
  - 明确 `DATABASE_SCHEMA` 仅在 `postgres` 模式下必需

- [x] 1.2 重构数据库 client 为双 driver 统一入口
  - 更新 `packages/db/src/client.ts`
  - 接入 SQLite driver 与 PostgreSQL driver
  - 保持业务层继续通过统一 `db` 入口访问数据库

- [x] 1.3 拆分 schema 为 SQLite / PostgreSQL 两套定义
  - 将 `packages/db/src/schema/index.ts` 拆为方言文件与统一导出入口
  - 保持 `users`、`sessions`、`api_tokens`、`audit_logs`、`example_items` 的统一实体语义
  - 处理 PostgreSQL schema namespace 与 SQLite 无 namespace 的差异

## Phase 2: Migration and Seed Path

- [x] 2.1 为两种 driver 建立独立 migration 配置
  - 拆分 `packages/db/drizzle.config.ts` 或等价配置
  - 为 SQLite 和 PostgreSQL 指向各自 migration 输出目录
  - 确保命令能够根据当前 driver 选择正确配置

- [x] 2.2 调整 `packages/db` 脚本命令面
  - 更新 `packages/db/package.json`
  - 保持 `db:generate`、`db:migrate`、`db:seed`、`db:studio`
  - 让各命令按当前 driver 执行正确方言路径

- [x] 2.3 新增面向首次使用者的 `db:setup` 入口
  - 在根 `package.json` 与需要的包脚本中增加 `db:setup`
  - 让该命令完成当前 driver 的 migrate + seed
  - 明确失败时的报错与成功时的预期输出

- [x] 2.4 让 seed 在双 driver 下保持一致行为
  - 更新 `packages/db/src/seed.ts`
  - 保持管理员存在性检查与幂等创建逻辑
  - 避免依赖 PostgreSQL 专属语法或列行为

## Phase 3: Environment and Local Defaults

- [x] 3.1 改写默认本地环境样例为 SQLite-first
  - 更新 `.env.example`
  - 提供默认 SQLite 文件型 `DATABASE_URL`
  - 保留本地登录、管理员账号、站点地址等必要变量

- [x] 3.2 新增 PostgreSQL 切换环境样例
  - 创建 `.env.postgres.example`
  - 提供 `DATABASE_DRIVER=postgres`、`DATABASE_URL`、`DATABASE_SCHEMA` 示例
  - 清楚标识其适用场景为部署或显式切换

- [x] 3.3 明确本地数据库文件落点与忽略策略
  - 约定 SQLite 文件路径
  - 确认不会污染仓库追踪文件
  - 对齐 `.gitignore` 或等价忽略配置

## Phase 4: App Compatibility and Command Surface

- [x] 4.1 验证现有认证链路在 SQLite 下可用
  - 检查 session、登录、管理员 seed 对双 driver 的兼容性
  - 必要时修正数据库包导出，避免上层感知方言差异
  - 确保未引入新的业务层 driver 分支判断

- [x] 4.2 验证现有 PAT 和 example CRUD 链路在 SQLite 下可用
  - 检查 `scopes`、`metadata`、时间字段、ID 字段的跨方言行为
  - 修正依赖 PostgreSQL 特性的查询或写入逻辑
  - 保持现有页面和 API 的调用方式不变

- [x] 4.3 重新定位本地 `compose.dev.yml`
  - 明确其不再是默认本地开发路径
  - 决定保留为可选容器化验证方案还是做最小对齐说明
  - 避免与 SQLite-first 文档形成冲突

## Phase 5: Documentation Refresh

- [x] 5.1 重写 README 的首次启动路径
  - 将 `cp .env.example .env` + `pnpm db:setup` + `pnpm dev` 设为主路径
  - 明确本地默认数据库为 SQLite 文件库
  - 保留常用数据库命令说明

- [x] 5.2 新增数据库模式文档
  - 创建 `docs/database.md`
  - 说明本地 SQLite 模式与部署 PostgreSQL 模式
  - 单独解释何时切换、切换哪些变量、执行哪些命令

- [x] 5.3 对齐 NAS 部署文档
  - 更新 `docs/deployment-nas.md`
  - 明确 shared PostgreSQL 属于部署推荐模式
  - 消除与 README 默认本地路径的表述冲突

## Phase 6: Verification

- [x] 6.1 补充配置与数据库层测试
  - 覆盖 `DATABASE_DRIVER` 解析
  - 覆盖 SQLite / PostgreSQL 配置校验差异
  - 覆盖 seed 的幂等性与关键基础行为

- [x] 6.2 完成本地 SQLite 启动验收
  - 使用默认 `.env.example`
  - 验证 `pnpm db:setup` 成功
  - 验证 `pnpm dev` 后可完成登录与基础页面访问

- [x] 6.3 完成 PostgreSQL 切换验收
  - 使用 PostgreSQL 环境变量样例
  - 验证 `pnpm db:migrate` / `pnpm db:seed` 可用
  - 验证应用代码无需修改即可运行

- [x] 6.4 完成文档与命令面收尾检查
  - 检查 README、数据库文档、NAS 文档、环境样例之间是否一致
  - 检查命令名与实际脚本是否一致
  - 清理误导性的旧表述
