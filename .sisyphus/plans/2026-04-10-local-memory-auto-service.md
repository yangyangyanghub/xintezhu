# Local Memory Auto Service Plan

## TL;DR
> **Summary**: Unify OpenCode hook-based memory ingestion onto `.local-memory` by adding a lazy-start resident local service path, a hook-side HTTP client with readiness probing, and a lightweight local outbox for retry/replay.
> **Deliverables**:
> - OpenCode hooks stop treating `.memory` direct-write as the primary path
> - `.local-memory` exposes a real readiness contract for auto-ingest
> - Hook events auto-start the service when needed, then POST to `/api/ingest`
> - Failed deliveries are queued locally and replayed without duplicate ingestion
> **Effort**: Large
> **Parallel**: YES - 2 waves
> **Critical Path**: Event/status contract → Service readiness/lazy-start → Hook bridge → Outbox/replay → Docs/tests/verification

## Context
### Original Request
采用方案1：轻量常驻本地服务 + hook 自动上报，实现真正自动记忆；并通过只读探索先形成设计/计划。

### Interview Summary
- 用户明确选择方案1，不走“每次单独拉 CLI ingest”路线。
- 用户明确选择服务生命周期：**懒启动自拉起**。
- 目标是“真正自动记忆”，不能要求用户每次手工盯着后台服务。

### Metis Review (gaps addressed)
- 已把“进程活着”和“真正可接收事件”拆开：计划中会新增 **readiness** 而不只保留 liveness。
- 已把失败补偿写入范围：采用轻量本地 outbox/spool + replay，而不是复杂消息队列。
- 已把关键边界写死：hook 自动上报不能阻塞主流程过久，必须有单实例启动锁和幂等去重。

## Work Objectives
### Core Objective
把当前分叉的记忆接入链路（`.opencode/plugin/memory-system` 直写 `.memory` vs `.local-memory` 新 core）统一为“OpenCode hook → resident local service → Memory Core ingest”的可靠自动链路。

### Deliverables
- `.local-memory` 提供可判定 readiness 的本地服务
- `.opencode/plugin/memory-system` 改为通过本地 HTTP 客户端自动上报到 `/api/ingest`
- 服务未启动时自动拉起并重试
- 上报失败时写入本地 outbox，服务恢复后自动 replay
- `eventId` 作为幂等键，状态查询语义统一

### Definition of Done (verifiable conditions with commands)
- `bun test ./.local-memory/src/test/http.server.test.ts ./.local-memory/src/test/http.ingest-search.test.ts ./.local-memory/src/test/integration.test.ts ./.local-memory/src/test/adapter.task18.test.ts` 全绿
- 新增 plugin/bridge/outbox 相关测试全绿
- 冷启动状态下触发一次 `message.updated` hook，服务被自动拉起且事件成功入库
- 服务不可用时，事件被写入本地 outbox；服务恢复后 replay 成功且不重复
- 不再以 `.opencode/plugin/memory-system` 直写 `.memory` 作为主路径

### Must Have
- resident local service 的 **liveness** 和 **readiness** 区分明确
- hook 侧支持探活 → 自拉起 → 重试上报
- 单实例启动锁，避免并发 hook 惊群拉起多个服务实例
- 本地 outbox/spool 有容量、TTL、清理策略
- ingestion 以 `eventId` 去重，replay 不产生重复记忆

### Must NOT Have
- 不引入外部队列、云服务或分布式组件
- 不重写 Memory Core 分类/检索/投影主逻辑
- 不把 hook 失败直接扩散成主业务失败
- 不继续保留“双主路径”：新链路落地后，旧 `.memory` 直写只能作为明确回退，不再是默认

## Verification Strategy
> ZERO HUMAN INTERVENTION - all verification is agent-executed.
- Test decision: tests-after（已有核心测试基础，新增 bridge/outbox 测试）
- QA policy: 每个任务都必须同时覆盖 happy path 与 failure path
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Execution Strategy
### Parallel Execution Waves
Wave 1: 契约与服务面
- Task 1 统一事件/状态契约与 readiness 语义
- Task 2 增加 resident service 懒启动与单实例治理

Wave 2: hook 自动链路
- Task 3 将 `.opencode/plugin/memory-system` 改为 HTTP bridge 主路径
- Task 4 增加 outbox/replay/幂等补偿
- Task 5 文档、迁移说明与回归测试对齐

### Dependency Matrix (full, all tasks)
- Task 1 blocks Task 2, 3, 4, 5
- Task 2 blocks Task 3, 4, 5
- Task 3 blocks Task 4, 5
- Task 4 blocks Task 5
- Task 5 blocks Final Verification Wave

### Agent Dispatch Summary (wave → task count → categories)
- Wave 1 → 2 tasks → deep
- Wave 2 → 3 tasks → deep / unspecified-high / writing

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [x] 1. Unify event and status contracts for automatic ingestion

  **What to do**: Normalize the core contracts so hook events, ingest status lookup, and startup/readiness semantics are decision-complete for an auto-service model. Add native `session.created` support instead of continuing to down-map it to `session.idle`. Split HTTP liveness from readiness. Fix status lookup so callers can reliably query by business `eventId`.
  **Must NOT do**: Do not leave `/health`, `/api/status`, and ingest status returning mutually inconsistent meanings. Do not keep `session.created` as an undocumented alias.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: touches contracts spanning core types, routes, and adapter/plugin callers
  - Skills: `[]`
  - Omitted: [`systematic-debugging`] - this is a controlled contract redesign, not unknown bug triage

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: [2, 3, 4, 5] | Blocked By: []

  **References**:
  - Pattern: `.local-memory/src/types/index.ts` - current event type contract
  - Pattern: `.local-memory/contracts/v1-event-schema.json` - schema must match runtime event contract
  - Pattern: `.local-memory/src/adapter/opencode.ts:159-176` - `session.created` currently mapped to `session.idle`
  - Pattern: `.local-memory/src/http/routes.ts` - current `/health` is only static liveness
  - Pattern: `.local-memory/src/http/handlers/ingest.ts` - ingest/status handlers
  - Pattern: `.local-memory/src/ingest/gateway.ts` - status lookup path and event ingestion boundary
  - Test: `.local-memory/src/test/event-contract.test.ts`
  - Test: `.local-memory/src/test/http.server.test.ts`
  - Test: `.local-memory/src/test/http.ingest-search.test.ts`

  **Acceptance Criteria** (agent-executable only):
  - [ ] `session.created` is a first-class event contract across types/schema/tests
  - [ ] `/health` remains liveness-only and a new readiness surface explicitly proves ingest readiness
  - [ ] Ingest status lookup accepts or clearly returns the correct identifier semantics for `eventId` vs internal ingestion id
  - [ ] Existing tests are updated so contract semantics are explicit and non-contradictory

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Event contract matches runtime behavior
    Tool: Bash
    Steps: bun test ./.local-memory/src/test/event-contract.test.ts ./.local-memory/src/test/http.server.test.ts
    Expected: schema, routes, and health/readiness tests all pass with no undocumented event aliasing
    Evidence: .sisyphus/evidence/task-1-contracts.txt

  Scenario: Ingest status semantics are queryable
    Tool: Bash
    Steps: bun test ./.local-memory/src/test/http.ingest-search.test.ts
    Expected: status lookup path uses documented ids and returns deterministic results
    Evidence: .sisyphus/evidence/task-1-ingest-status.txt
  ```

  **Commit**: YES | Message: `refactor(memory-core): normalize auto-ingest contracts` | Files: [`.local-memory/src/types/index.ts`, `.local-memory/contracts/v1-event-schema.json`, `.local-memory/src/http/routes.ts`, `.local-memory/src/http/handlers/ingest.ts`, related tests]

- [x] 2. Add resident service lazy-start, readiness probe, and single-instance launch control

  **What to do**: Introduce a small service-launch layer that can determine whether the local service is ready, start it if absent, and prevent concurrent hook-triggered duplicate startups. Define a fixed port/discovery strategy for V1 and a bounded startup timeout. Prefer detached local process launch over requiring the user to keep a manual terminal open.
  **Must NOT do**: Do not build a full daemon manager. Do not rely on static `/health` alone to decide readiness.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: process lifecycle, port probing, and concurrency guards are failure-prone
  - Skills: `[]`
  - Omitted: [`using-git-worktrees`] - not needed for plan execution itself

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: [3, 4, 5] | Blocked By: [1]

  **References**:
  - Pattern: `.local-memory/src/index.ts:1-120` - current `start` lifecycle and signal cleanup
  - Pattern: `.local-memory/src/http/server.ts` - current Bun server bootstrap
  - Pattern: `.local-memory/src/service/core.ts` - initialization path the readiness probe must validate indirectly
  - Pattern: `.local-memory/RUNBOOK.md` - current manual startup documentation to be replaced/aligned
  - External consumer: `.opencode/plugin/memory-system/index.ts` - launcher/bridge caller

  **Acceptance Criteria** (agent-executable only):
  - [ ] Hook-side launcher can determine “service ready” within a bounded timeout
  - [ ] Concurrent launch attempts converge to one service instance
  - [ ] Startup failure returns a structured result that can trigger outbox fallback
  - [ ] No manual terminal is required for the normal automatic-memory path

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Lazy start boots the service once
    Tool: Bash
    Steps: run targeted startup tests that simulate no running service and two concurrent launch attempts
    Expected: one process/lock path wins, both callers observe readiness or a shared success result
    Evidence: .sisyphus/evidence/task-2-lazy-start.txt

  Scenario: Readiness distinguishes alive from usable
    Tool: Bash
    Steps: run tests where HTTP server exists but Memory Core is not ready
    Expected: liveness passes, readiness fails, launcher does not treat service as ingest-ready
    Evidence: .sisyphus/evidence/task-2-readiness.txt
  ```

  **Commit**: YES | Message: `feat(runtime): add lazy-start resident memory service` | Files: [`.local-memory/src/index.ts`, `.local-memory/src/http/server.ts`, new launcher/lock helpers in `.opencode/plugin/memory-system/` or shared runtime helpers, related tests]

- [x] 3. Bridge real OpenCode hooks to `/api/ingest` as the primary path

  **What to do**: Replace the old `.memory` direct-write primary path in `.opencode/plugin/memory-system/index.ts` with a thin HTTP bridge that converts hook payloads into `IngestionEventInput`, ensures the service is ready, then POSTs to `/api/ingest`. Keep legacy direct-write only as an explicit emergency fallback switch if needed, not as the default.
  **Must NOT do**: Do not leave both paths active by default. Do not duplicate event normalization logic between plugin and core without a shared contract.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: this is the real cutover point between legacy and new memory systems
  - Skills: `[]`
  - Omitted: [`requesting-code-review`] - review belongs in final verification wave, not mid-plan

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: [4, 5] | Blocked By: [1, 2]

  **References**:
  - Pattern: `.opencode/plugin/memory-system/index.ts` - current real hook registrations and old direct-write path
  - Pattern: `.local-memory/src/adapter/opencode.ts` - existing event normalization logic to follow/reuse
  - Pattern: `.local-memory/src/http/handlers/ingest.ts` - target HTTP contract
  - Test: `.local-memory/src/test/adapter.forwarding.test.ts`
  - Test: `.local-memory/src/test/adapter.task18.test.ts`
  - Test: `.local-memory/src/test/integration.test.ts`

  **Acceptance Criteria** (agent-executable only):
  - [ ] `session.created`, `message.updated`, `session.idle`, `session.compacted`, and `file.edited` all flow to `/api/ingest`
  - [ ] Plugin no longer treats `.memory` direct-write as the default automatic-memory path
  - [ ] Event normalization is shared or contract-driven so plugin and core stay in sync
  - [ ] Hook forwarding remains thin and does not reintroduce local classification logic

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Hook forwarding happy path reaches Memory Core
    Tool: Bash
    Steps: bun test ./.local-memory/src/test/adapter.forwarding.test.ts ./.local-memory/src/test/adapter.task18.test.ts
    Expected: all supported hook events are normalized and accepted by ingest path
    Evidence: .sisyphus/evidence/task-3-hook-bridge.txt

  Scenario: Automatic path uses HTTP bridge instead of direct-write primary
    Tool: Bash
    Steps: run plugin-side integration tests or new bridge tests against a local stub service
    Expected: default plugin flow sends HTTP ingest requests; legacy file-write path is disabled or opt-in only
    Evidence: .sisyphus/evidence/task-3-primary-path.txt
  ```

  **Commit**: YES | Message: `feat(plugin): bridge opencode hooks to local memory ingest` | Files: [`.opencode/plugin/memory-system/index.ts`, new HTTP client/normalizer helpers, related tests]

- [x] 4. Add local outbox, replay worker, and idempotent recovery semantics

  **What to do**: Add a minimal local spool/outbox for failed hook deliveries. If the service is unavailable or launch/retry fails, the event is appended to a local durable queue. On next successful readiness, replay pending events in order with `eventId`-based idempotency. Define max queue size, TTL, and cleanup behavior explicitly.
  **Must NOT do**: Do not build a generalized message broker. Do not allow unbounded spool growth. Do not replay without dedupe guarantees.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: reliability, durability, and idempotency bugs here will silently corrupt trust
  - Skills: `[]`
  - Omitted: [`artistry`] - conventional reliability design is sufficient

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: [5] | Blocked By: [1, 2, 3]

  **References**:
  - Pattern: `.local-memory/src/ingest/gateway.ts` - ingestion boundary and dedupe assumptions
  - Pattern: `.local-memory/src/http/handlers/ingest.ts` - HTTP failure semantics
  - Caller: `.opencode/plugin/memory-system/index.ts` - source of failed hook deliveries
  - Existing tests: `.local-memory/src/test/integration.test.ts`, adapter tests, HTTP ingest tests

  **Acceptance Criteria** (agent-executable only):
  - [ ] Failed hook delivery writes to a local outbox file/queue
  - [ ] On next healthy connection, pending events replay automatically
  - [ ] Replayed events do not create duplicate memories when `eventId` repeats
  - [ ] Outbox enforces documented capacity and retention limits

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Service unavailable writes to outbox
    Tool: Bash
    Steps: run new tests simulating launch failure or ingest timeout
    Expected: event is persisted locally and hook path returns non-blocking fallback result
    Evidence: .sisyphus/evidence/task-4-outbox-write.txt

  Scenario: Recovery replay is idempotent
    Tool: Bash
    Steps: run new replay tests with duplicate eventId values after service recovery
    Expected: pending events are drained once, duplicates do not create duplicate ingestion/memory state
    Evidence: .sisyphus/evidence/task-4-replay-idempotent.txt
  ```

  **Commit**: YES | Message: `feat(plugin): add auto-memory outbox and replay recovery` | Files: [new outbox/replay helpers under `.opencode/plugin/memory-system/`, related tests]

- [x] 5. Align docs, migration notes, and end-to-end verification for always-on automatic memory

  **What to do**: Update runbooks and plugin docs so the system is described as “lazy-start resident local service + hook auto-reporting,” document the port/readiness/outbox behavior, and add end-to-end smoke tests covering cold start, replay, and status inspection.
  **Must NOT do**: Do not leave old docs implying direct `.memory` file writes are still the primary architecture.

  **Recommended Agent Profile**:
  - Category: `writing` - Reason: heavy docs/contract alignment with some test orchestration
  - Skills: [`chinese-documentation`] - keep Chinese runbook/usage wording crisp and consistent
  - Omitted: [`verification-before-completion`] - verification happens in this task and the final wave, not before planning

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: [F1, F2, F3, F4] | Blocked By: [1, 2, 3, 4]

  **References**:
  - Pattern: `.local-memory/RUNBOOK.md` - current manual-service wording and health examples
  - Pattern: `.opencode/plugin/memory-system/index.ts` - actual integration surface the docs must describe
  - Test: `.local-memory/src/test/http.server.test.ts`
  - Test: `.local-memory/src/test/http.ops.test.ts`
  - Test: `.local-memory/src/test/cli.ops.test.ts`
  - Test: `.local-memory/src/test/integration.test.ts`

  **Acceptance Criteria** (agent-executable only):
  - [ ] Runbook documents lazy-start auto memory, readiness vs liveness, and outbox recovery
  - [ ] End-to-end smoke tests cover cold start, steady-state hook ingestion, failure to outbox, and replay after recovery
  - [ ] Status surfaces show enough information to debug queue size / last failure / readiness state

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Cold start automatic memory works end-to-end
    Tool: Bash
    Steps: run E2E smoke tests that begin with no running local-memory service, trigger a hook event, and verify memory ingestion succeeds after auto-start
    Expected: service starts, event ingests, and status/readiness surfaces reflect healthy steady state
    Evidence: .sisyphus/evidence/task-5-cold-start-e2e.txt

  Scenario: Failure and replay are observable
    Tool: Bash
    Steps: run E2E smoke tests that force service unavailability, inspect status/outbox, then restore service and verify replay drains
    Expected: documented status fields and runbook steps match actual behavior
    Evidence: .sisyphus/evidence/task-5-recovery-e2e.txt
  ```

  **Commit**: YES | Message: `docs(memory): document auto-start resident service and hook ingestion` | Files: [`.local-memory/RUNBOOK.md`, plugin docs, E2E tests]

## Final Verification Wave (MANDATORY — after ALL implementation tasks)
> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.
- [x] F1. Plan Compliance Audit — oracle
- [x] F2. Code Quality Review — unspecified-high
- [x] F3. Real Manual QA — unspecified-high (+ playwright if UI)
- [x] F4. Scope Fidelity Check — deep

## Commit Strategy
- Commit 1: event/status contract + readiness split
- Commit 2: lazy-start launcher + single-instance lock
- Commit 3: plugin HTTP bridge cutover
- Commit 4: outbox/replay/idempotency
- Commit 5: docs + E2E smoke coverage
- Commit 6: final verification fixes only if required

## Success Criteria
- OpenCode hook events reach `.local-memory` automatically without manual `start`
- Service auto-start is reliable and non-blocking
- Temporary outages do not drop events
- Recovery replay is idempotent and observable
- Legacy `.memory` direct-write is no longer the default path for automatic memory
