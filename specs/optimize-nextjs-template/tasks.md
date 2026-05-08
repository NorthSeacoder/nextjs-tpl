# Tasks: Optimize Next.js Template

## Phase 1: App Router Baseline and Shared Foundations

- [x] 1.1 补齐根级 App Router 边界文件
  - 在 `apps/web/src/app` 下新增 `error.tsx`、`not-found.tsx`
  - 为受保护主分段补充 `loading.tsx` 或等效 segment loading 文件
  - 保持文案和样式中立，作为模板默认兜底而非业务页面

- [x] 1.2 强化根布局基础设施
  - 更新 `apps/web/src/app/layout.tsx`
  - 补充更完整的 metadata 基线，包括 `metadataBase`、标题模板和基础描述结构
  - 使用 `next/font` 接入模板默认字体，并确保全局样式与字体变量对齐

- [x] 1.3 统一站内导航实现
  - 更新 `apps/web/src/app/page.tsx`
  - 更新 `apps/web/src/app/(dashboard)/layout.tsx`
  - 将模板内站内跳转从原生 `<a>` 迁移为 `next/link`

- [x] 1.4 收敛 dashboard 树内的用户读取路径
  - 以 `apps/web/src/app/(dashboard)/layout.tsx` 为受保护区域唯一登录态入口
  - 调整 `apps/web/src/app/(dashboard)/dashboard/page.tsx`，避免重复查询当前用户
  - 明确最小用户展示数据的传递方式，不引入新的全局状态层

## Phase 2: Login and Same-Origin Action Flow

- [x] 2.1 抽离登录 server action 和共享认证提交流程
  - 在登录相关模块中新增 server action 入口
  - 复用 `apps/web/src/lib/auth/session.ts` 现有鉴权与 session 创建能力
  - 定义 action 成功、失败和跳转行为，替代页面内手写 `fetch` 提交链路

- [x] 2.2 重构登录页为 action 驱动表单
  - 更新 `apps/web/src/app/login/page.tsx`
  - 去掉当前页面级客户端 `fetch('/api/auth/login')` 提交模式
  - 保留错误反馈、pending 状态和成功后进入 dashboard 的体验

- [x] 2.3 对齐登录 Route Handler 的职责边界
  - 更新 `apps/web/src/app/api/auth/login/route.ts`
  - 保留其作为 HTTP 边界和外部调用示例
  - 避免 route 与 server action 维护两套彼此漂移的认证逻辑

## Phase 3: Server-First Page Refactor

- [x] 3.1 将 examples 页面改为服务端首屏取数
  - 更新 `apps/web/src/app/(dashboard)/examples/page.tsx`
  - 让页面直接复用 `apps/web/src/lib/services/example-service.ts` 获取列表数据
  - 去掉整页 `'use client'` 和首次 hydration 后内部 API 拉取逻辑

- [x] 3.2 拆分 examples 局部 client island
  - 为 examples 表单、编辑态、局部交互创建独立 client component
  - 仅保留交互所需客户端状态，不再承担首屏加载职责
  - 处理空态、操作失败反馈和提交后刷新行为

- [x] 3.3 将 token 管理页改为服务端首屏取数
  - 更新 `apps/web/src/app/(dashboard)/settings/tokens/page.tsx`
  - 服务端直接读取 token 列表作为初始渲染数据
  - 去掉当前整页 `'use client'` 的首次内部 API 请求链路

- [x] 3.4 拆分 token 管理局部 client island
  - 将 token 创建、撤销、明文 token 一次性展示等交互拆到独立 client component
  - 保留必要的瞬时 UI 状态
  - 确保首屏列表与后续交互边界清晰

- [x] 3.5 为 examples 和 token 管理补充同源 server actions
  - 为新增、编辑、删除 example item 提供 server action
  - 为 token 创建、撤销提供 server action
  - 明确页面首屏走 service，页面内变更走 action，外部 HTTP 访问继续走 route handler

## Phase 4: Route Handler Input Boundary Cleanup

- [x] 4.1 建立轻量输入校验与错误响应辅助层
  - 在 `apps/web/src/app/api` 或等效共享位置新增本地校验辅助函数
  - 统一处理非法 JSON、必填字段缺失、空字符串、参数类型不符等错误
  - 保持实现轻量，不引入新的重型校验依赖

- [x] 4.2 收紧 auth 与 tokens handlers 的输入边界
  - 更新 `apps/web/src/app/api/auth/login/route.ts`
  - 更新 `apps/web/src/app/api/tokens/route.ts`
  - 更新 `apps/web/src/app/api/tokens/[id]/route.ts`
  - 让 body、params 和错误响应行为显式一致

- [x] 4.3 收紧 examples handlers 的输入边界
  - 更新 `apps/web/src/app/api/v1/examples/route.ts`
  - 更新 `apps/web/src/app/api/v1/examples/[id]/route.ts`
  - 避免将宽松的 `request.json()` 结果直接下传到 service 层

- [x] 4.4 校验 API 路径在页面重构后仍保持契约稳定
  - 确认 `/api/auth/login`、`/api/tokens`、`/api/v1/examples` 仍可独立访问
  - 保持状态码与响应体语义不发生非必要破坏
  - 检查 PAT 与 session 两套鉴权路径未被误伤

## Phase 5: Verification and Finish

- [x] 5.1 运行静态校验
  - 执行 `lint`
  - 执行 `typecheck`
  - 修复本轮改造引入的类型和约定问题

- [x] 5.2 执行功能验收
  - 验证未登录访问 dashboard 仍会跳转 `/login`
  - 验证登录失败错误反馈、登录成功跳转和 session 生效
  - 验证 examples 页面和 token 页面首屏可直接渲染服务端数据
  - 验证 example CRUD 与 token 创建/撤销仍可用

- [x] 5.3 执行回归验收
  - 验证现有 `/api/v1/examples`、`/api/tokens`、`/api/auth/login` 仍可调用
  - 验证 audit log 写入链路未被登录、CRUD、token 改造破坏
  - 验证根布局 metadata、字体和导航改造未引发基础可访问性问题

- [x] 5.4 收尾清理
  - 删除整页客户端拉取遗留逻辑和无用状态分支
  - 检查页面、action、route、service 之间职责是否清楚
  - 确保模板输出与 `spec`、`plan` 的验收口径一致
