# Tasks: Bootstrap Next.js Template

## Phase 1: Workspace Bootstrap

- [x] 1.1 初始化 monorepo/workspace 根结构
  - 创建根 `package.json`、`pnpm-workspace.yaml`、`turbo.json`
  - 建立 `apps/web`、`packages/db`、`packages/api-contract`、`packages/config`、`packages/ui` 目录
  - 确保根命令至少覆盖 `dev`、`build`、`lint`、`typecheck`、`test`

- [x] 1.2 建立共享工程配置
  - 在 `packages/config` 中落地共享 TypeScript、ESLint、Prettier 等基础配置
  - 为 `apps/web` 和各 packages 接入共享配置
  - 验证 workspace 内配置能被正确解析

- [x] 1.3 初始化 `apps/web` 的 Next.js 基础骨架
  - 创建 App Router、基础 layout、全局样式、基础页面入口
  - 接入 Tailwind CSS v4 与 UI 基础依赖
  - 确保应用可在空实现下成功启动

## Phase 2: Database and Env Foundation

- [x] 2.1 建立环境变量与启动时校验
  - 定义 `.env.example`
  - 覆盖 `DATABASE_URL`、`DATABASE_SCHEMA`、`SESSION_SECRET`、管理员账号、站点地址、CI 镜像变量等
  - 在运行时统一校验 env，避免业务代码散落读取

- [x] 2.2 初始化 `packages/db`
  - 创建 Drizzle 配置、数据库 client、schema 导出入口
  - 明确所有连接默认绑定 `DATABASE_SCHEMA`
  - 保证 Web 层通过统一 db 入口访问数据库

- [x] 2.3 落地核心数据模型
  - 定义 `users`、`sessions`、`api_tokens`、`audit_logs`、`example_items`
  - 补齐必要索引、唯一约束、外键和时间字段
  - 确保结构与 `data-model.md` 保持一致

- [x] 2.4 建立 migration 和 seed 路径
  - 提供 migration 生成与执行命令
  - 提供 seed 管理员账号与必要初始数据的脚本
  - 验证 migrate/seed 仅作用于当前 schema

- [x] 2.5 提供本地数据库 fallback
  - 增加用于本地独立 Postgres 的 fallback 配置
  - 明确其为备用路径，不影响默认 shared PostgreSQL 方案
  - 验证 fallback 与主路径使用同一套应用配置语义

## Phase 3: Auth and Session Foundation

- [x] 3.1 实现登录与登出链路
  - 在 `apps/web` 中创建登录页与登录/登出接口
  - 完成密码校验、session 创建和销毁
  - 记录登录与登出审计日志

- [x] 3.2 实现受保护页面访问控制
  - 配置 middleware 拦截 `(dashboard)` 及受保护页面
  - 未登录访问跳转到 `/login`
  - 登录后可访问 dashboard 与 settings

- [x] 3.3 抽离 session 相关服务边界
  - 整理 auth service / helper
  - 统一页面鉴权、API 鉴权和审计记录入口
  - 避免页面、route、db 层直接耦合

## Phase 4: PAT and API Foundation

- [x] 4.1 实现 PAT 数据与服务逻辑
  - 支持 token 创建、hash 存储、列表查询、撤销
  - 创建时仅返回一次明文 token
  - 更新 `last_used_at` 并记录审计日志

- [x] 4.2 实现 PAT 管理页
  - 在 `/settings` 提供 token 列表、创建、撤销入口
  - 展示名称、创建时间、最近使用时间、状态
  - 处理创建成功后的“一次性展示明文 token”交互

- [x] 4.3 实现基础 API routes
  - 提供 `/api/health`
  - 提供登录相关接口
  - 提供 `/api/v1/me`
  - 接入 session 与 bearer token 两套鉴权路径

- [x] 4.4 实现 example resource CRUD API
  - 提供 `example_items` 的列表、创建、详情、更新、删除接口
  - 保持内部服务层与 API v1 使用一致的数据访问逻辑
  - 为后续 agent 调用保持清晰响应结构

- [x] 4.5 建立 OpenAPI 契约基础
  - 在 `packages/api-contract` 中创建 v1 文档
  - 覆盖 health、auth、me、PAT、example CRUD 的核心接口
  - 保证契约与实际 API 路由命名和结构一致

## Phase 5: Web Pages and Template UX

- [x] 5.1 完成公开首页与 dashboard 基础页面
  - 首页展示模板定位、登录入口或健康状态信息
  - dashboard 提供登录后默认落点
  - 保持页面结构适合作为后续业务替换基底

- [x] 5.2 完成 settings 页面
  - 展示账号基础信息
  - 集成 PAT 管理入口
  - 预留系统信息或运行信息展示区域

- [x] 5.3 完成 examples CRUD 页面
  - 提供最小列表与表单
  - 覆盖空态、加载态、错误态
  - 验证 Web 页面与 API、数据库链路闭环

- [x] 5.4 抽离基础 UI 状态组件
  - 在 `packages/ui` 或 `apps/web` 中沉淀 loading / empty / error / layout 基础组件
  - 避免把业务逻辑塞入 UI 包

## Phase 6: Docker, NAS, and CI/CD

- [x] 6.1 提供本地 Docker 构建与运行资产
  - 创建 `Dockerfile.web`
  - 创建开发用 compose
  - 确保本地可直接构建和运行应用

- [x] 6.2 提供 NAS 生产部署资产
  - 创建生产 compose
  - 配置 Traefik labels 与外部 `proxy` network 接入
  - 默认只部署 `web` 并连接公共 PostgreSQL

- [x] 6.3 提供 GitHub Actions 镜像自动化
  - 创建在稳定分支（如 `release`）触发的 workflow
  - 复用仓库内 Dockerfile 构建镜像
  - 支持推送到约定 registry

- [x] 6.4 对齐部署文档
  - 更新 README 的最短启动路径
  - 校验 `docs/deployment-nas.md` 与实际 compose / env / workflow 一致
  - 说明 shared infra first 和 fallback 条件

## Phase 7: Verification and Finish

- [x] 7.1 建立基础单元测试
  - 覆盖 env 校验、auth helpers、PAT helpers、schema 相关工具
  - 确保关键基础逻辑有样例测试

- [x] 7.2 建立 API 测试
  - 覆盖 `/api/health`
  - 覆盖登录、登出、`/api/v1/me`
  - 覆盖 PAT 和 example CRUD 的核心请求路径

- [x] 7.3 建立 E2E 测试
  - 覆盖 login -> dashboard
  - 覆盖 settings 中 PAT 创建 / 撤销关键流程
  - 覆盖 examples CRUD 的页面端闭环

- [x] 7.4 执行端到端验收
  - 验证 `pnpm install`、`pnpm dev`、`pnpm build`、`pnpm lint`、`pnpm typecheck`、`pnpm test`
  - 验证 shared PostgreSQL + schema 模式下 migrate/seed 可用
  - 验证本地 Docker 路径与 release 分支镜像自动化路径都成立

- [x] 7.5 收尾并清理模板输出
  - 检查目录、命令、文档、接口命名是否一致
  - 删除实验性占位或无用模板代码
  - 确保仓库可作为新项目起点直接复制使用
