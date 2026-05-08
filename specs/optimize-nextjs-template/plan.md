# Plan: Optimize Next.js Template

## Overview

本方案目标是在不改变模板核心定位的前提下，把当前 `apps/web` 的默认工程基线调整到更符合 Next.js 16 + React 19 App Router 最佳实践的状态。

优化范围聚焦于 4 条主线：

- 页面数据读取改为 server-first，避免整页客户端拉取内部 API
- 收敛 Server / Client 边界与认证态读取路径
- 补齐 App Router 路由约定、根布局能力和站内导航约定
- 让登录流程与示例 Route Handler 更贴近 Next.js 当前推荐模式

本次方案是对现有模板做增量重构，不新增业务能力，不改变数据库模型，也不引入新的前端数据层。

## Stack Detected

- Next.js 16.x from `apps/web/package.json`
- React 19.x from `apps/web/package.json`
- React DOM 19.x from `apps/web/package.json`
- Tailwind CSS 4.x from `apps/web/package.json`
- TypeScript 5.x from `apps/web/package.json`

## Current State Summary

当前代码已经具备可运行的基础模板闭环，但默认结构存在几类明显偏差：

- 受保护示例页和 token 管理页是整页 `'use client'`，首屏依赖浏览器再请求内部 API
- dashboard layout 已读取 session user，但子页面仍会重复读取
- 站内导航仍使用原生 `<a>`
- `app/` 目录缺少 `error.tsx`、`not-found.tsx`、`loading.tsx` 等基础边界文件
- 根布局 metadata 很薄，未接入 `next/font`
- 登录页仍采用客户端 `fetch('/api/auth/login')` 提交模式
- 示例 Route Handler 的 JSON body 处理较松散，校验边界不统一

这些问题都集中在模板默认工程基线，而不是底层数据库或认证模型本身。

## Key Design Decisions

### Decision 1: 示例页面改为 server-first，局部交互下沉到 client island

- **来源**: https://nextjs.org/docs/app/building-your-application/data-fetching
- **依据**: Next.js App Router 默认鼓励在 Server Components 中获取数据，再把交互性最强的部分拆给 Client Components。

方案：

- `examples/page.tsx` 和 `settings/tokens/page.tsx` 改为服务端页面，首屏直接调用 service/auth 层拿数据
- 原有整页客户端逻辑拆成局部交互组件，仅负责表单开关、乐观交互、错误展示等客户端职责
- 模板保留现有 API 路由作为外部访问能力与示例契约，不再把它们作为页面首屏默认数据源

影响：

- 页面首次加载不再依赖 hydration 后二次请求
- service 层成为页面和 Route Handler 的共享数据入口
- 模板会更明确地向使用者传达“内部页面首屏优先走服务端读取”

### Decision 2: 同源表单与变更优先采用 Server Actions

- **来源**: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
- **来源**: https://react.dev/reference/react/useActionState
- **依据**: Next.js 官方将 Server Actions 作为 App Router 中处理同源表单与变更的推荐路径；React 19 提供 `useActionState` 作为表单状态管理入口。

方案：

- 登录页从“客户端 `fetch` 调 API”迁移为服务端 action 驱动的表单提交流程
- 示例 CRUD 表单与 token 创建/撤销优先改为 Server Actions
- 保留 Route Handler，作为 API 示例与外部调用入口，不再作为同源页面交互的默认提交链路

边界：

- 仅对同源页面交互采用 Server Actions
- `/api/v1/*` 与 PAT 访问场景继续保留 Route Handler

### Decision 3: 认证态读取收敛到 dashboard layout，并通过可序列化数据向下传递

- **来源**: https://nextjs.org/docs/app/building-your-application/data-fetching
- **依据**: 同一渲染链路内应避免重复读取相同服务端数据，尤其是 layout 已经完成访问控制时。

方案：

- `(dashboard)/layout.tsx` 保持登录态保护入口职责
- layout 读取到的最小用户数据通过 props 或共享服务端边界向子树传递
- dashboard 首页不再重复执行独立用户查询

注意：

- 该决策只收敛 dashboard 树内的重复读取
- 不额外引入全局状态容器

### Decision 4: 补齐 App Router 约定文件，建立模板级兜底边界

- **来源**: https://nextjs.org/docs/app/getting-started/error-handling
- **来源**: https://nextjs.org/docs/app/api-reference/file-conventions/loading
- **来源**: https://nextjs.org/docs/app/api-reference/file-conventions/not-found
- **依据**: App Router 通过 `error.tsx`、`loading.tsx`、`not-found.tsx` 等文件约定建立错误、加载和 404 处理边界。

方案：

- 在根 `app/` 级别补 `error.tsx` 与 `not-found.tsx`
- 在存在服务端数据读取的关键 segment 补充 `loading.tsx`
- 保持这些边界文件简洁、模板中立，不绑定具体业务文案过深

### Decision 5: 站内导航统一改用 `next/link`

- **来源**: https://nextjs.org/docs/app/getting-started/linking-and-navigating
- **依据**: 官方推荐对内部路由使用 `Link` 实现客户端导航与预取。

方案：

- 首页和 dashboard layout 中的站内 `<a>` 统一替换为 `Link`
- 仅在外链、下载或明确需要 document navigation 时继续保留原生 `<a>`

### Decision 6: 根布局补强 metadata 与字体优化

- **来源**: https://nextjs.org/docs/app/getting-started/metadata-and-og-images
- **来源**: https://nextjs.org/docs/app/getting-started/fonts
- **依据**: App Router 提供 metadata API 与 `next/font` 作为默认推荐基线。

方案：

- 根布局补充 `metadataBase`、默认 title template、描述等站点级 metadata 结构
- 使用 `next/font` 接入模板默认字体
- 保持模板品牌中立，不加入强业务色彩

### Decision 7: Route Handler 输入边界显式化，但不引入重型抽象

- **来源**: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- **依据**: Route Handlers 适合作为 HTTP 边界，输入解析和错误响应应在边界处完成，而不是把不可信 body 直接下传。

方案：

- 为登录、examples、tokens 等 handlers 建立统一的输入解析/校验模式
- 路径参数、必填字段和非法 JSON 都在 handler 边界处理
- 本期不强制引入独立 schema 库；可先用轻量的本地校验函数统一行为

## Planned Architecture Changes

### 1. Page and Component Boundary Refactor

涉及模块：

- `apps/web/src/app/(dashboard)/examples/page.tsx`
- `apps/web/src/app/(dashboard)/settings/tokens/page.tsx`
- 对应新增的局部 client components

设计：

- 页面文件回到 Server Component，负责首屏数据读取
- 表单开关、编辑态、瞬时反馈等交互逻辑移入子级 client component
- 页面级 loading/error 交给 App Router 边界文件，而不是在整页客户端里手写首次加载分支

### 2. Auth Flow Refactor

涉及模块：

- `apps/web/src/app/login/page.tsx`
- `apps/web/src/app/api/auth/login/route.ts`
- `apps/web/src/lib/auth/session.ts`

设计：

- 登录页新增 server action 入口，处理凭据验证、session 创建、失败状态返回和成功跳转
- API login route 继续存在，服务于非表单场景或外部调用，但不再是模板默认网页登录链路
- 认证核心逻辑继续复用 `session.ts`，避免出现 action 和 route 各维护一套鉴权代码

### 3. Shared Service Reuse Across RSC and Handlers

涉及模块：

- `apps/web/src/lib/services/example-service.ts`
- token 相关 service / auth helper
- Route Handlers 与页面调用链

设计：

- 页面和 Route Handler 共享 service 层作为数据访问入口
- 避免页面为了获取首屏数据再绕行 HTTP
- API 和页面只是两类入口，不应拥有两套核心数据流程

### 4. App Router Boundary Files

涉及模块：

- `apps/web/src/app/error.tsx`
- `apps/web/src/app/not-found.tsx`
- `apps/web/src/app/(dashboard)/loading.tsx` 或等效 segment loading

设计：

- 根错误页负责兜底不可恢复渲染错误
- not-found 页面负责统一 404 表达
- loading 页面负责服务端数据读取阶段的基础体验

### 5. Layout and Navigation Baseline

涉及模块：

- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/page.tsx`
- `apps/web/src/app/(dashboard)/layout.tsx`

设计：

- 根布局补 metadata 和 `next/font`
- 所有站内跳转统一迁移到 `Link`
- dashboard layout 继续作为受保护区域入口，并承担共享导航和用户上下文入口职责

### 6. Handler Boundary Utilities

涉及模块：

- `apps/web/src/app/api/auth/login/route.ts`
- `apps/web/src/app/api/v1/examples/route.ts`
- `apps/web/src/app/api/v1/examples/[id]/route.ts`
- `apps/web/src/app/api/tokens/route.ts`
- `apps/web/src/app/api/tokens/[id]/route.ts`

设计：

- 引入统一的轻量输入校验/错误响应辅助函数
- 约束字段缺失、字段类型错误、空字符串、非法参数等常见失败场景
- 保持响应体和状态码行为稳定，避免影响现有 API 契约过大

## Data Flow

### Login Flow

优化前：

1. Client page 收集表单状态
2. `fetch('/api/auth/login')`
3. Route Handler 调 `authenticateUser`
4. 创建 session 后客户端手动 `router.push`

优化后：

1. 登录页 form 直接提交到 server action
2. action 调用共享 auth helper 进行鉴权与 session 创建
3. 失败时返回表单错误状态
4. 成功时服务端直接跳转到 dashboard

结果：

- 页面不再需要自己维护提交链路
- 更符合 App Router 同源表单心智

### Example List / CRUD Flow

优化前：

1. client page 初始空态渲染
2. hydration 后请求 `/api/v1/examples`
3. 再显示列表
4. 新增/编辑/删除继续走内部 API

优化后：

1. Server page 首屏直接读取 `listExamples()`
2. 列表直接随 HTML 返回
3. 交互表单通过 server action 触发变更
4. 变更后依赖 Next.js 刷新/revalidate 机制更新页面

结果：

- 页面首屏不再依赖浏览器再请求一次自身数据
- API 保留给外部访问和契约示例

### Token Management Flow

优化方向与 examples 一致：

- 首屏 token 列表由服务端页面获取
- 创建/撤销 token 改为 server action
- 明文 token 仅在 action 返回成功后展示一次

## Risks and Tradeoffs

### 1. Server Actions 会改变现有页面心智

风险：

- 当前代码以客户端 `fetch` 为主，迁移后调用链会明显变化

权衡：

- 这是模板基线层的有意调整，收益是让后续项目复制到更现代的默认实现

### 2. 页面与 API 双入口并存，容易出现职责漂移

风险：

- 如果没有明确边界，后续又可能回到“页面通过内部 API 取首屏数据”

控制：

- 在 plan 中明确：页面首屏走 service / RSC，Route Handler 服务 HTTP 边界与外部调用

### 3. 轻量输入校验可能不如 schema 库统一

风险：

- 若后续接口增长很快，手写校验函数会变散

权衡：

- 本期以“统一边界行为”优先，先不引入额外重量
- 后续若接口继续扩展，再单独评估 schema 库是否值得引入

### 4. Layout 共享用户数据的传递方式需要克制

风险：

- 若设计过度，容易引入不必要的上下文层

控制：

- 仅传递最小用户展示字段
- 不引入全局 client context 作为默认方案

## Verification Strategy

### Static Verification

- `typecheck` 必须通过
- `lint` 必须通过
- 检查 `app/` 目录路由约定文件是否齐全
- 检查站内链接是否全部迁移为 `Link`

### Functional Verification

- 未登录访问 dashboard 时仍会被重定向到 `/login`
- 登录失败时表单能显示错误
- 登录成功后能进入 dashboard，且 session 生效
- examples 页面首屏在服务端即可渲染列表
- token 页面首屏在服务端即可渲染列表
- examples 的新增、编辑、删除仍可用
- token 的创建、撤销仍可用
- `/api/v1/examples` 与 `/api/tokens` 等现有接口仍保持可调用

### Regression Verification

- 现有 PAT 与 API v1 路径不应因页面重构而失效
- audit log 写入链路不应被登录、CRUD、token 管理改造破坏
- metadata 与字体改造不应改变页面可访问性基础行为

## Out-of-Scope Design Notes

- 不在本期引入 React Query、SWR、Zustand 等客户端状态层
- 不在本期重构数据库 schema 或 service 层为仓储模式
- 不在本期改造为完整设计系统或大规模 UI 重绘
- 不在本期升级 API 版本或重写 OpenAPI 契约

## Readiness for Tasks

当前方案足以进入 `tasks`：

- 范围清楚
- 关键决策已对齐现有代码现实
- 框架特定决策已有官方文档依据
- 没有阻塞拆任务的关键歧义
