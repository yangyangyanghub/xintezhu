# Local Memory Keyword-First Default Plan

## TL;DR
> **Summary**: Reframe `.local-memory` so keyword/BM25 retrieval is the normal default operating mode, while semantic retrieval remains an optional capability when an embedding provider is explicitly configured and healthy.
> **Deliverables**:
> - Provider/status contract updated so `embedding.provider = none` is healthy by default
> - CLI/HTTP/default retrieval entrypoints changed to `keyword`
> - Semantic/hybrid capability semantics clarified without breaking existing APIs
> - Context assembly, docs, and tests aligned to the new default
> **Effort**: Medium
> **Parallel**: YES - 2 waves
> **Critical Path**: Status contract → Retrieval defaults/behavior → Context/docs/tests → verification

## Context
### Original Request
采用方案A：keyword-first / BM25-first 作为默认检索架构，弱化对 Ollama embedding 的依赖；embedding 保留为可选增强。

### Interview Summary
- 用户确认采用方案A。
- 用户明确选择：**无 embedding 时属于默认正常模式**，不是 degraded。
- 用户明确选择：**CLI / HTTP 默认搜索模式改为 `keyword`**。
- 本轮只规划默认配置、状态语义、默认检索入口、文档与测试同步；**不新增 rerank 子系统**，也不引入新的 embedding 服务。

### Metis Review (gaps addressed)
- 已补齐关键决策：CLI/HTTP 默认检索模式由 `hybrid` 改为 `keyword`。
- 已明确 guardrail：把“未配置能力”和“显式配置后失败”区分为两类状态，不能继续共用 degraded。
- 已纳入边界：`semantic` 显式请求在无 embedding 时必须返回一致的 capability-unavailable 语义；`hybrid` 在无 embedding 时可继续使用 keyword 路径，但不再叫 degraded fallback。

## Work Objectives
### Core Objective
把 `.local-memory` 从“默认无 embedding 但对外自称 degraded”调整为“默认 keyword-first 正常运行，semantic 是可选增强能力”的一致架构。

### Deliverables
- Provider/status contract 调整完毕
- Retrieval 默认入口与 capability 语义调整完毕
- Context assembly 跟随新的默认入口
- API/CLI/RUNBOOK/provider docs/testing 全部对齐

### Definition of Done (verifiable conditions with commands)
- `bun test ./.local-memory/src/test/provider.router.test.ts ./.local-memory/src/test/adapter.status.test.ts ./.local-memory/src/test/retrieval.semantic.test.ts ./.local-memory/src/test/http.ingest-search.test.ts ./.local-memory/src/test/context.assembly.test.ts` 全绿
- `bun test ./.local-memory/src/test/` 全绿
- `bun run .local-memory/src/index.ts search --query "TypeScript"` 在未配置 embedding 时默认走 `keyword`
- `POST /api/search` 不带 `mode` 时返回 `mode: "keyword"`
- `GET /health` / 状态接口不再把 `embedding.provider = none` 描述为 degraded

### Must Have
- `embedding.provider = none` = healthy default
- 仅当显式配置 embedding provider 且其初始化/健康检查失败时，才进入 degraded
- CLI / HTTP 默认搜索模式改为 `keyword`
- `semantic` 与 `hybrid` 保持 API 兼容
- 文档明确“keyword-first 是默认推荐路径，embedding 是可选增强”

### Must NOT Have
- 不新增新 provider 类型
- 不新增 rerank/重排框架
- 不把 `semantic` 请求静默改成 keyword 成功返回（除非计划中特别指定；本次不这么做）
- 不顺手重写 retrieval ranking 算法
- 不改动与本次状态语义无关的 ingestion/promotion/projection 逻辑

## Verification Strategy
> ZERO HUMAN INTERVENTION - all verification is agent-executed.
- Test decision: tests-after（现有代码库已有完整测试基础）
- QA policy: 每个任务都附带 agent-executed 场景
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Execution Strategy
### Parallel Execution Waves
Wave 1: 状态契约与默认入口
- Task 1 Provider/status contract 重定义
- Task 2 Retrieval 默认入口与 capability 语义对齐

Wave 2: 跟随面与用户可见输出
- Task 3 Context assembly 与调用面跟随 keyword-first 默认
- Task 4 文档、配置 schema、测试与 smoke 对齐

### Dependency Matrix (full, all tasks)
- Task 1 blocks Task 2, Task 4
- Task 2 blocks Task 3, Task 4
- Task 3 blocks Task 4
- Task 4 blocks Final Verification Wave

### Agent Dispatch Summary
- Wave 1 → 2 tasks → deep/unspecified-high
- Wave 2 → 2 tasks → writing/quick/deep

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [ ] 1. Redefine provider and adapter status semantics for keyword-first default

  **Files:**
  - Modify: `/.local-memory/src/provider/router.ts`
  - Modify: `/.local-memory/src/adapter/opencode.ts`
  - Modify: `/.local-memory/src/types/provider.ts` (if status shape must be clarified)
  - Test: `/.local-memory/src/test/provider.router.test.ts`
  - Test: `/.local-memory/src/test/adapter.status.test.ts`

  **What to do**: Update provider/router and adapter status contracts so `embedding.provider = none` is treated as healthy default capability-off mode, while explicitly configured provider failures remain degraded/error-like states.
  **Must NOT do**: Do not remove semantic capability metadata entirely. Do not conflate “not configured” with “configured but broken”.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: state semantics span provider, adapter, and status consumers
  - Skills: `[]` - no special domain skill needed
  - Omitted: [`systematic-debugging`] - this is a planned semantic refactor, not a live bug hunt

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: [2, 4] | Blocked By: []

  **References**:
  - Pattern: `.local-memory/src/provider/router.ts:165-299` - current degraded semantics live here
  - Pattern: `.local-memory/src/adapter/opencode.ts:127-150` - adapter currently maps semantic unavailable → degraded
  - API/Type: `.local-memory/src/types/provider.ts` - provider status/output contracts to keep consistent
  - Test: `.local-memory/src/test/provider.router.test.ts` - current degraded assertions will need inversion
  - Test: `.local-memory/src/test/adapter.status.test.ts` - current adapter degraded wording assertions

  **Acceptance Criteria** (agent-executable only):
  - [ ] When `embedding.provider = none`, provider status returns `degraded = false`
  - [ ] When `embedding.provider = none`, adapter status returns `healthy = true`, `memoryCoreAvailable = true`
  - [ ] When provider is explicitly configured and init/health fails, status returns degraded with provider-failure reason
  - [ ] No user-facing status string says “No embedding provider configured” is an error path

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Default no-embedding startup is healthy
    Tool: Bash
    Steps: bun test ./.local-memory/src/test/provider.router.test.ts ./.local-memory/src/test/adapter.status.test.ts
    Expected: tests pass with no assertions expecting degraded=true for provider none
    Evidence: .sisyphus/evidence/task-1-provider-status.txt

  Scenario: Explicit provider failure is still degraded
    Tool: Bash
    Steps: bun test ./.local-memory/src/test/provider.router.test.ts
    Expected: degraded remains true only for explicit provider failure path
    Evidence: .sisyphus/evidence/task-1-provider-failure.txt
  ```

  **Commit**: YES | Message: `refactor(provider): make keyword-first default healthy mode` | Files: [`src/provider/router.ts`, `src/adapter/opencode.ts`, related tests/types]

- [ ] 2. Change retrieval defaults to keyword-first while preserving semantic/hybrid compatibility

  **Files:**
  - Modify: `/.local-memory/src/retrieval/service.ts`
  - Modify: `/.local-memory/src/index.ts`
  - Modify: `/.local-memory/src/http/handlers/search.ts`
  - Test: `/.local-memory/src/test/retrieval.semantic.test.ts`
  - Test: `/.local-memory/src/test/http.ingest-search.test.ts`
  - Test: `/.local-memory/src/test/cli.ops.test.ts` or a new focused CLI search test file if current coverage is insufficient

  **What to do**: Make CLI and HTTP search default to `keyword`, retain `semantic` and `hybrid` modes as explicit options, and redefine no-embedding behavior as capability semantics rather than degraded fallback.
  **Must NOT do**: Do not silently convert explicit `semantic` requests into keyword success. Do not rewrite ranking weights beyond what is required by the new mode defaults.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: retrieval behavior, mode contract, and compatibility rules all meet here
  - Skills: `[]`
  - Omitted: [`test-driven-development`] - existing test suite already anchors behavior; no mandate to rewrite around strict TDD workflow

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: [3, 4] | Blocked By: [1]

  **References**:
  - Pattern: `.local-memory/src/retrieval/service.ts:84-140` - current mode resolution / degraded semantics
  - Pattern: `.local-memory/src/index.ts:151-168` - CLI default `mode ?? 'hybrid'`
  - Pattern: `.local-memory/src/http/handlers/search.ts:9-18` - HTTP default `body.mode ?? 'hybrid'`
  - Pattern: `.local-memory/src/retrieval/service.ts:163-220` - semantic request path and similar result mapping
  - Test: `.local-memory/src/test/retrieval.semantic.test.ts` - current error/degraded expectations
  - Test: `.local-memory/src/test/http.ingest-search.test.ts` - HTTP search endpoint behavior

  **Acceptance Criteria** (agent-executable only):
  - [ ] CLI search with no `--mode` defaults to `keyword`
  - [ ] HTTP search with no `mode` field defaults to `keyword`
  - [ ] Explicit `hybrid` without embedding still returns usable results, but not as degraded fallback-from-error semantics
  - [ ] Explicit `semantic` without embedding returns a documented capability-unavailable behavior

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Default search mode is keyword
    Tool: Bash
    Steps: `bun run ./.local-memory/src/index.ts search --query "TypeScript"`; then `bun test ./.local-memory/src/test/http.ingest-search.test.ts ./.local-memory/src/test/cli.ops.test.ts`
    Expected: result.mode = keyword by default
    Evidence: .sisyphus/evidence/task-2-default-mode.txt

  Scenario: Semantic capability unavailable is explicit
    Tool: Bash
    Steps: bun test ./.local-memory/src/test/retrieval.semantic.test.ts
    Expected: explicit semantic request produces documented unavailable behavior; hybrid remains usable
    Evidence: .sisyphus/evidence/task-2-semantic-capability.txt
  ```

  **Commit**: YES | Message: `refactor(retrieval): default search to keyword-first` | Files: [`src/retrieval/service.ts`, `src/index.ts`, `src/http/handlers/search.ts`, related tests]

- [ ] 3. Align context assembly and downstream callers with keyword-first defaults

  **Files:**
  - Modify: `/.local-memory/src/context/assembly.ts`
  - Test: `/.local-memory/src/test/context.assembly.test.ts`
  - Test: `/.local-memory/src/test/integration.test.ts`

  **What to do**: Audit context assembly and any internal callers that currently assume `hybrid` as the retrieval default; switch only those paths that should inherit the new default architecture while preserving context quality gates.
  **Must NOT do**: Do not loosen current budget, confidence, importance, or freshness constraints just to maintain result counts.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: narrower internal-consumer alignment task with test sensitivity
  - Skills: `[]`
  - Omitted: [`brainstorming`] - design already fixed

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: [4] | Blocked By: [2]

  **References**:
  - Pattern: `.local-memory/src/context/assembly.ts:153-176` - `assembleTaskRelevant()` currently hardcodes `hybrid`
  - Test: `.local-memory/src/test/context.assembly.test.ts` - current budget/confidence/freshness expectations
  - Test: `.local-memory/src/test/integration.test.ts` - broader integration coverage touching context behavior

  **Acceptance Criteria** (agent-executable only):
  - [ ] Context assembly uses the intended default retrieval path under scheme A
  - [ ] Existing context budgets (5/8/5/3) remain intact
  - [ ] Confidence/freshness filtering behavior remains unchanged unless explicitly documented

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Context assembly still respects budgets after default switch
    Tool: Bash
    Steps: bun test ./.local-memory/src/test/context.assembly.test.ts
    Expected: all budget and filtering tests pass unchanged or with intentional assertion updates only
    Evidence: .sisyphus/evidence/task-3-context-budgets.txt

  Scenario: Integration path remains healthy
    Tool: Bash
    Steps: bun test ./.local-memory/src/test/integration.test.ts
    Expected: no context-related regressions
    Evidence: .sisyphus/evidence/task-3-integration.txt
  ```

  **Commit**: YES | Message: `refactor(context): align assembly with keyword-first defaults` | Files: [`src/context/assembly.ts`, related tests if needed]

- [ ] 4. Rewrite docs, config schema wording, and regression tests to match keyword-first default

  **Files:**
  - Modify: `/.local-memory/RUNBOOK.md`
  - Modify: `/.local-memory/EMBEDDING_PROVIDER.md`
  - Modify: `/.local-memory/config/v1-provider-config.json`
  - Modify: `/.local-memory/src/test/provider.router.test.ts`
  - Modify: `/.local-memory/src/test/adapter.status.test.ts`
  - Modify: `/.local-memory/src/test/retrieval.semantic.test.ts`
  - Modify: `/.local-memory/src/test/http.ingest-search.test.ts`

  **What to do**: Update all user-facing docs, config schemas, examples, and tests so they describe keyword-first as the normal baseline and embedding as optional enhancement. Remove stale “degraded because no embedding” language everywhere it is now misleading.
  **Must NOT do**: Do not leave contradictory wording between RUNBOOK, provider docs, schema descriptions, API tests, and adapter/provider tests.

  **Recommended Agent Profile**:
  - Category: `writing` - Reason: most of the surface is wording/contract alignment with some test updates
  - Skills: [`chinese-documentation`] - ensure clear Chinese wording across docs and runbook
  - Omitted: [`chinese-commit-conventions`] - commit wording handled separately

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: [F1, F2, F3, F4] | Blocked By: [1, 2, 3]

  **References**:
  - Pattern: `.local-memory/RUNBOOK.md:260-263` - current degraded wording
  - Pattern: `.local-memory/EMBEDDING_PROVIDER.md` - current doc recommends Ollama and frames keyword-only as degraded
  - Pattern: `.local-memory/config/v1-provider-config.json:18-118` - schema descriptions / fallback block wording
  - Test: `.local-memory/src/test/provider.router.test.ts`
  - Test: `.local-memory/src/test/adapter.status.test.ts`
  - Test: `.local-memory/src/test/retrieval.semantic.test.ts`
  - Test: `.local-memory/src/test/http.ingest-search.test.ts`
  - External: Article research summary - Karpathy-style local wiki approach and LycheeMem multi-channel retrieval both support not forcing vector-first defaults

  **Acceptance Criteria** (agent-executable only):
  - [ ] RUNBOOK states keyword/BM25-first as the default recommended mode
  - [ ] Provider docs frame Ollama/local embedding as optional enhancement, not baseline requirement
  - [ ] Config schema descriptions no longer imply `provider: none` is degraded
  - [ ] Regression tests assert the new healthy-default semantics consistently

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Documentation and contract wording are consistent
    Tool: Bash
    Steps: `Select-String -Path .local-memory\RUNBOOK.md,.local-memory\EMBEDDING_PROVIDER.md,.local-memory\config\v1-provider-config.json,.local-memory\src\test\provider.router.test.ts,.local-memory\src\test\adapter.status.test.ts,.local-memory\src\test\retrieval.semantic.test.ts -Pattern 'degraded|No embedding provider configured|fallback to keyword-only'`
    Expected: only explicit provider-failure cases retain degraded wording
    Evidence: .sisyphus/evidence/task-4-wording-audit.txt

  Scenario: Full regression suite passes under keyword-first default
    Tool: Bash
    Steps: bun test ./.local-memory/src/test/
    Expected: full suite green with updated semantics
    Evidence: .sisyphus/evidence/task-4-full-suite.txt
  ```

  **Commit**: YES | Message: `docs(retrieval): document keyword-first default and optional semantic capability` | Files: [`RUNBOOK.md`, `EMBEDDING_PROVIDER.md`, `config/v1-provider-config.json`, affected tests]

## Final Verification Wave (MANDATORY — after ALL implementation tasks)
> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.
- [ ] F1. Plan Compliance Audit — oracle
- [ ] F2. Code Quality Review — unspecified-high
- [ ] F3. Real Manual QA — unspecified-high (+ playwright if UI)
- [ ] F4. Scope Fidelity Check — deep

## Commit Strategy
- Commit 1: provider/adapter status contract
- Commit 2: retrieval default mode + capability semantics
- Commit 3: context alignment
- Commit 4: docs/schema/tests sync
- Commit 5: final verification fixes only if required

## Success Criteria
- Default startup with `embedding.provider = none` is healthy, not degraded
- Search defaults are keyword-first in both CLI and HTTP
- Optional semantic capability remains available when explicitly configured
- Context assembly continues passing budget/quality tests
- All docs and tests describe the same default architecture
