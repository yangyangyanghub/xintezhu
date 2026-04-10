# Local Memory System Work Plan

## TL;DR

> **Quick Summary**: Build a fully local memory platform inspired by Supermemory, with SQLite as runtime truth, Markdown as projected knowledge view, strong automatic writing, conservative promotion, local hybrid retrieval, and a thin OpenCode adapter.
>
> **Deliverables**:
> - Local Memory Core service under `.local-memory/`
> - Runtime truth store with four-layer memory model
> - Hybrid retrieval and minimal relation graph
> - Projection engine that rebuilds `.memory/` deterministically
> - Thin OpenCode adapter with hook forwarding and memory tools
>
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 4 implementation waves + final verification wave
> **Critical Path**: Event contract → runtime schema → ingest pipeline → retrieval baseline → promotion/governance → projection → OpenCode adapter → final verification

---

## Context

### Original Request
Design and plan a local-use memory system by combining Supermemory ideas with the existing workspace memory plugin approach.

### Interview Summary
**Key Discussions**:
- Goal is fully local only; no cloud dependency.
- Existing four-layer memory model must be enhanced, not replaced.
- Retrieval must support local semantic search and local memory relation graph.
- Model layer must be pluggable, defaulting to local providers.
- Implementation should start with an independent local memory service; OpenCode adapter comes after the service.
- V1 uses strong automatic writing.
- Auto capture scope is limited to conversation + development behavior.
- Auto-promotion is limited to stable preferences, long-term rules, stable project conventions, repeated error-solution pairs, and stable architecture patterns.
- Chosen architecture is dual-truth style: database is runtime truth, Markdown is projection only.

**Research Findings**:
- `myk/技术沉淀/OpenCode记忆系统开发.md` already defines the current four-layer memory model, tool concepts, and hook opportunities.
- Supermemory concepts worth borrowing: updates / extends / derives relations, profile/context injection, hybrid retrieval, automatic forgetting, and adapter-style integration boundaries.
- Workspace conventions favor local markdown knowledge projection and clear memory structure.

### Metis Review
**Identified Gaps** (addressed):
- Event schema was not explicit → added dedicated contract/scoping tasks.
- Rollback unit was not explicit → added transaction/batch rollback and audit tasks.
- Manual override semantics were not explicit → added governance tasks for demote, tombstone, freeze, and rollback semantics.
- Projection semantics needed hard guardrails → plan defines one-way deterministic projection only.
- V1 scope inflation risk around graph sophistication and provider abstraction → plan locks graph to minimal typed edges and model layer to one default local path plus abstraction.
- Acceptance criteria needed executable verification → each task includes concrete agent-executable QA scenarios and commands.

---

## Work Objectives

### Core Objective
Build a trustworthy local memory platform that automatically captures selected project observations, stores them in a database-backed four-layer memory model, retrieves them through hybrid local search, promotes only stable knowledge, and projects durable knowledge into Markdown for human consumption.

### Concrete Deliverables
- `.local-memory/` runtime area with database, config, logs, embeddings cache, and audit artifacts
- Memory Core service with ingest, search, context, profile, forget, rollback, and projection rebuild APIs
- Four-layer memory runtime model mapped to database state and projection outputs
- Minimal relation graph with `updates`, `extends`, and `derives`
- OpenCode adapter that forwards hooks and exposes memory tools without embedding memory business logic
- Deterministic `.memory/` projection pipeline

### Definition of Done
- [ ] Memory Core starts locally without network dependency and persists runtime truth under `.local-memory/`
- [ ] Supported OpenCode events are ingested through a stable schema and audited
- [ ] Keyword retrieval works without a model provider; hybrid retrieval works with a configured local provider and degrades safely when unavailable
- [ ] Promotions are auditable and reversible
- [ ] `.memory/` projection can be rebuilt deterministically from runtime truth
- [ ] OpenCode adapter remains thin and delegates all memory logic to Memory Core

### Must Have
- Fully local operation
- One local user on one machine for V1
- Database as runtime truth, Markdown as projection only
- Strong auto-writing with noise control
- Four-layer memory model
- Hybrid retrieval default
- Audit trail and rollback

### Must NOT Have (Guardrails)
- No cloud sync, remote multi-user support, or distributed deployment in V1
- No dashboard or graph UI in V1
- No adapter-side classification, promotion, ranking, or graph logic
- No direct writes into semantic/core from raw events
- No Markdown-as-truth editing workflow in V1
- No model dependency for baseline keyword retrieval and core runtime stability
- No broad client-generalization work beyond a generic core API plus OpenCode-first adapter in V1

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** - ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: UNKNOWN / to be established during implementation
- **Automated tests**: YES (TDD)
- **Framework**: Use the project’s chosen local test runner during implementation; contract tests and repository tests come before integration tests
- **If TDD**: Each task follows RED → GREEN → REFACTOR

### QA Policy
Every task includes agent-executed QA scenarios and evidence outputs under `.sisyphus/evidence/`.

- **API/Backend**: Use Bash with HTTP requests and JSON assertions
- **CLI/Tooling**: Use Bash and structured command output assertions
- **Data/Projection**: Use file existence/content assertions and deterministic rebuild checks
- **Adapter**: Use hook-triggering tests and service request assertions

---

## Execution Strategy

### Parallel Execution Waves

Wave 1 (Start Immediately - contracts and foundations):
├── Task 1: Lock V1 contract, event schema, and guardrails [deep]
├── Task 2: Define runtime storage schema and repository boundaries [deep]
├── Task 3: Define configuration/model-provider contracts [quick]
├── Task 4: Define `.memory/` projection targets and file policy [writing]
└── Task 5: Define test fixtures, sample observations, and evidence conventions [quick]

Wave 2 (After Wave 1 - core runtime implementation tracks):
├── Task 6: Build Memory Core service skeleton and health/config endpoints (depends: 1,2,3) [unspecified-high]
├── Task 7: Build ingest gateway + ingestion event persistence baseline (depends: 1,2,5) [deep]
├── Task 8: Build classifier baseline with rule-first worthStoring/layer/type scoring (depends: 1,2,3,5) [deep]
├── Task 9: Build repository + FTS keyword retrieval baseline (depends: 2,5) [unspecified-high]
└── Task 10: Build governance baseline for audit, rollback unit, and status transitions (depends: 1,2,5) [deep]

Wave 3 (After Wave 2 - semantic, graph, and promotion):
├── Task 11: Build provider router + default local embedding/inference adapters (depends: 3,6) [unspecified-high]
├── Task 12: Build hybrid retrieval and graceful fallback logic (depends: 6,9,11) [deep]
├── Task 13: Build relation engine with minimal typed edges and supersession rules (depends: 7,8,10) [deep]
├── Task 14: Build promotion engine with whitelist and scoring gates (depends: 7,8,10,13) [deep]
└── Task 15: Build profile/context assembly with bounded injection budgets (depends: 8,9,12,14) [quick]

Wave 4 (After Wave 3 - projection and adapter integration):
├── Task 16: Build projection engine and deterministic rebuild pipeline (depends: 10,14,15) [writing]
├── Task 17: Build cleanup/decay jobs and stale-state handling (depends: 10,13,14,16) [quick]
├── Task 18: Build OpenCode adapter hook forwarding and tool surface (depends: 1,6,15,16) [unspecified-high]
├── Task 19: Build adapter-to-core integration tests and degraded-mode tests (depends: 18,12,16,17) [deep]
└── Task 20: Build operational commands/docs for local run, rebuild, and audit inspection (depends: 6,10,16,18) [writing]

Wave FINAL (After ALL tasks — 4 parallel reviews, then user okay):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real QA execution of all scenarios (unspecified-high)
└── Task F4: Scope fidelity check (deep)

Critical Path: 1 → 2 → 6 → 7 → 8 → 13 → 14 → 16 → 18 → 19 → FINAL
Parallel Speedup: High, because contracts and runtime layers unlock separate implementation tracks
Max Concurrent: 5

### Dependency Matrix

- **1**: - - 6,7,8,10,18, Wave 1
- **2**: - - 6,7,8,9,10, Wave 1
- **3**: - - 6,8,11, Wave 1
- **4**: - - 16, Wave 1
- **5**: - - 7,8,9,10, Wave 1
- **6**: 1,2,3 - 11,12,18,20, Wave 2
- **7**: 1,2,5 - 13,14, Wave 2
- **8**: 1,2,3,5 - 13,14,15, Wave 2
- **9**: 2,5 - 12,15, Wave 2
- **10**: 1,2,5 - 13,14,16,17,20, Wave 2
- **11**: 3,6 - 12, Wave 3
- **12**: 6,9,11 - 15,19, Wave 3
- **13**: 7,8,10 - 14,17, Wave 3
- **14**: 7,8,10,13 - 15,16,17, Wave 3
- **15**: 8,9,12,14 - 16,18, Wave 3
- **16**: 10,14,15 - 17,18,19,20, Wave 4
- **17**: 10,13,14,16 - 19, Wave 4
- **18**: 1,6,15,16 - 19,20, Wave 4
- **19**: 18,12,16,17 - FINAL, Wave 4
- **20**: 6,10,16,18 - FINAL, Wave 4

### Agent Dispatch Summary

- **Wave 1**: 5 tasks — T1/T2 `deep`, T3/T5 `quick`, T4 `writing`
- **Wave 2**: 5 tasks — T6/T9 `unspecified-high`, T7/T8/T10 `deep`
- **Wave 3**: 5 tasks — T11 `unspecified-high`, T12/T13/T14 `deep`, T15 `quick`
- **Wave 4**: 5 tasks — T16/T20 `writing`, T17 `quick`, T18 `unspecified-high`, T19 `deep`
- **FINAL**: 4 tasks — F1 `oracle`, F2 `unspecified-high`, F3 `unspecified-high`, F4 `deep`

---

## TODOs

- [x] 1. Lock V1 contract, event schema, and guardrails

  **What to do**:
  - Define the authoritative ingestion event schema for V1, including supported event types, required fields, optional metadata, batch identity, and error shape.
  - Freeze V1 scope guardrails in a runtime-facing contract document so later tasks cannot leak cloud sync, UI/dashboard, or adapter-side business logic.
  - Define memory identity/versioning semantics for new, updated, superseded, forgotten, and rolled-back records.
  - Define V1 deployment scope explicitly as one local user on one machine, with OpenCode as the first adapter and a generic-but-minimal core API.

  **Must NOT do**:
  - Do not include unsupported event classes such as full command history, search telemetry, agent reasoning traces, or raw tool payload archives.
  - Do not let Markdown projection become a writable source of truth.

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: this task fixes the decision boundaries for every later task.
  - **Skills**: `[]`
  - **Skills Evaluated but Omitted**:
    - `mcp-builder`: not needed; this is a local service contract task, not an MCP server build.

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4, 5)
  - **Blocks**: 6, 7, 8, 10, 18
  - **Blocked By**: None

  **References**:
  - `myk/技术沉淀/OpenCode记忆系统开发.md` - Existing four-layer model, hooks, and memory tool concepts to preserve
  - `.sisyphus/drafts/local-memory-system-design.md` - Approved design decisions and V1 guardrails
  - `AGENTS.md` - Workspace memory conventions and local knowledge expectations

  **Acceptance Criteria**:
  - [ ] Supported event types are enumerated explicitly.
  - [ ] Versioning / rollback state transitions are defined explicitly.
  - [ ] Out-of-scope items are listed explicitly.

  **QA Scenarios**:
  ```
  Scenario: Contract completeness
    Tool: Bash
    Preconditions: Contract files created in implementation branch
    Steps:
      1. Read the event contract file.
      2. Assert it contains supported event types for message.updated, file.edited, session.idle, session.compacted, git commit, test result, build result.
      3. Assert it contains batchId, sourceType, sourceRef, workspace scope, timestamps, and error schema.
    Expected Result: All required schema sections present and no TBD placeholders remain.
    Failure Indicators: Missing event types, missing batchId, or undefined rollback identity rules.
    Evidence: .sisyphus/evidence/task-1-contract-check.txt

  Scenario: Guardrail exclusions explicit
    Tool: Bash
    Preconditions: V1 scope file exists
    Steps:
      1. Read the V1 guardrail section.
      2. Assert it explicitly excludes cloud sync, dashboard/UI, adapter-side classification, and Markdown-as-truth editing.
    Expected Result: Every excluded scope item is stated explicitly.
    Evidence: .sisyphus/evidence/task-1-guardrails.txt
  ```

  **Commit**: YES
  - Message: `docs(memory-core): lock v1 contract and guardrails`

- [x] 2. Define runtime storage schema and repository boundaries

  **What to do**:
  - Define database schema for memories, relations, evidence, promotions, profiles, embeddings, and ingestion events.
  - Define repository boundaries so retrieval, governance, promotion, and projection operate through a stable persistence layer.
  - Define state machine for `active`, `superseded`, `forgotten`, `archived`, and `reverted` statuses.

  **Must NOT do**:
  - Do not let business logic leak into repository interfaces.
  - Do not mix projection files into runtime persistence responsibilities.

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: schema and boundaries affect every implementation task.
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: 6, 7, 8, 9, 10
  - **Blocked By**: None

  **References**:
  - `.sisyphus/drafts/local-memory-system-design.md` - Approved core tables and runtime truth model
  - `myk/技术沉淀/OpenCode记忆系统开发.md` - Layer mapping and retention expectations

  **Acceptance Criteria**:
  - [ ] All core tables are defined.
  - [ ] Repository interfaces isolate persistence from service policy.
  - [ ] State transitions map to rollback and promotion needs.

  **QA Scenarios**:
  ```
  Scenario: Schema coverage
    Tool: Bash
    Preconditions: Schema file(s) exist
    Steps:
      1. Read the schema definitions.
      2. Assert tables exist for memories, memory_relations, memory_evidence, memory_promotions, profiles, embeddings, ingestion_events.
      3. Assert statuses active, superseded, forgotten, archived, reverted are represented.
    Expected Result: Schema covers all runtime truth entities required by the design.
    Evidence: .sisyphus/evidence/task-2-schema-check.txt

  Scenario: Repository boundary separation
    Tool: Bash
    Preconditions: Repository interface definitions exist
    Steps:
      1. Read repository interfaces.
      2. Assert there is no Markdown projection write logic inside persistence repositories.
    Expected Result: Runtime persistence and projection concerns stay separated.
    Evidence: .sisyphus/evidence/task-2-boundary-check.txt
  ```

  **Commit**: YES
  - Message: `docs(memory-core): define runtime schema and repositories`

- [x] 3. Define configuration and model-provider contracts

  **What to do**:
  - Define configuration files for memory behavior, rules, and model providers.
  - Define provider-router contracts for embedding and inference providers.
  - Define rule-first fallback behavior when no local model provider is configured or healthy.

  **Must NOT do**:
  - Do not require semantic models for baseline keyword retrieval.
  - Do not implement multiple provider integrations in V1 contract work beyond the default path and abstraction.

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: this is a focused contract/config task with limited moving parts.
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: 6, 8, 11
  - **Blocked By**: None

  **References**:
  - `.sisyphus/drafts/local-memory-system-design.md` - Provider abstraction and rule-first model usage policy

  **Acceptance Criteria**:
  - [ ] Config contract covers provider choice, model name, fallback mode, and thresholds.
  - [ ] Provider interfaces separate embedding and inference concerns.

  **QA Scenarios**:
  ```
  Scenario: Config contract completeness
    Tool: Bash
    Preconditions: Config schema files exist
    Steps:
      1. Read model and memory config schemas.
      2. Assert they include provider, model, thresholds, fallback/degraded behavior, and local-only constraints.
    Expected Result: Config is sufficient to run with or without semantic providers.
    Evidence: .sisyphus/evidence/task-3-config-check.txt

  Scenario: Provider split correctness
    Tool: Bash
    Preconditions: Provider interfaces exist
    Steps:
      1. Read provider contracts.
      2. Assert embedding and inference are separate interfaces.
    Expected Result: Provider abstraction prevents model lock-in.
    Evidence: .sisyphus/evidence/task-3-provider-check.txt
  ```

  **Commit**: YES
  - Message: `docs(memory-core): define config and provider contracts`

- [x] 4. Define projection targets and Markdown policy

  **What to do**:
  - Define which memory classes project to `.memory/core/` and `.memory/semantic/`.
  - Define one-way projection semantics, rebuild semantics, and manual-edit policy.
  - Define file naming and grouping for projects, decisions, patterns, and error-solutions.

  **Must NOT do**:
  - Do not allow Markdown edits to mutate runtime truth in V1.
  - Do not project unstable working-layer noise.

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: this task is mostly output-structure and policy definition.
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: 16
  - **Blocked By**: None

  **References**:
  - `AGENTS.md` - Existing markdown/Obsidian expectations
  - `.sisyphus/drafts/local-memory-system-design.md` - Projection design and directory model

  **Acceptance Criteria**:
  - [ ] Projection is documented as one-way and deterministic.
  - [ ] File groups and naming policy are explicit.

  **QA Scenarios**:
  ```
  Scenario: Projection policy completeness
    Tool: Bash
    Preconditions: Projection policy file exists
    Steps:
      1. Read the policy.
      2. Assert it states DB is runtime truth, projection is one-way, and manual edits are non-authoritative.
    Expected Result: Projection semantics cannot be misread as bidirectional sync.
    Evidence: .sisyphus/evidence/task-4-projection-policy.txt

  Scenario: Target mapping completeness
    Tool: Bash
    Preconditions: Target mapping exists
    Steps:
      1. Assert stable classes map to explicit target directories under .memory.
    Expected Result: Semantic/core output destinations are fully defined.
    Evidence: .sisyphus/evidence/task-4-target-map.txt
  ```

  **Commit**: YES
  - Message: `docs(memory-core): define markdown projection policy`

- [x] 5. Define test fixtures, sample observations, and evidence conventions

  **What to do**:
  - Define canonical sample events for preference, rule, decision, file edit, test result, build failure, build fix, duplicate event, and malformed payload.
  - Define expected evidence artifact naming for task-level QA.
  - Define deterministic fixtures for keyword-only and hybrid retrieval tests.

  **Must NOT do**:
  - Do not rely on real local model output for core unit tests.
  - Do not leave fixture semantics implicit.

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: tight fixture authoring task that unlocks TDD for many later tasks.
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: 7, 8, 9, 10
  - **Blocked By**: None

  **References**:
  - `.sisyphus/drafts/local-memory-system-design.md` - Auto-capture scope, promotion classes, and degraded retrieval policy

  **Acceptance Criteria**:
  - [ ] Fixture set covers happy path, duplicate, malformed, and degraded cases.
  - [ ] Evidence naming convention is explicit.

  **QA Scenarios**:
  ```
  Scenario: Fixture coverage
    Tool: Bash
    Preconditions: Fixture definitions exist
    Steps:
      1. Read fixture inventory.
      2. Assert it includes preference, rule, decision, file edit, test result, build failure, build fix, duplicate, malformed payload.
    Expected Result: Core TDD inputs are completely defined before implementation.
    Evidence: .sisyphus/evidence/task-5-fixtures.txt

  Scenario: Evidence convention validity
    Tool: Bash
    Preconditions: Evidence convention file exists
    Steps:
      1. Assert evidence paths use task-{N}-{scenario-slug}.{ext} naming.
    Expected Result: QA artifacts will be generated consistently.
    Evidence: .sisyphus/evidence/task-5-evidence-naming.txt
  ```

  **Commit**: YES
  - Message: `docs(memory-core): define fixtures and evidence conventions`

- [x] 6. Build Memory Core service skeleton and health/config endpoints

  **What to do**:
  - Create the local Memory Core service scaffold and config loading path.
  - Implement health/status endpoints and basic startup validation for `.local-memory/` runtime directories.
  - Expose a stable internal application boundary so later modules plug into the service instead of bypassing it.

  **Must NOT do**:
  - Do not add retrieval, promotion, or adapter logic directly inside bootstrap code.
  - Do not require network calls during startup.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: service skeleton work spans structure, config, and runtime bootstrapping.
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: 11, 12, 18, 20
  - **Blocked By**: 1, 2, 3

  **References**:
  - `.sisyphus/plans/local-memory-system.md` Tasks 1-3 outputs
  - `.sisyphus/drafts/local-memory-system-design.md` - Service/runtime layout expectations

  **Acceptance Criteria**:
  - [ ] Service starts locally with no network dependency.
  - [ ] Health endpoint returns structured status.
  - [ ] Startup creates or verifies `.local-memory/` runtime paths.

  **QA Scenarios**:
  ```
  Scenario: Local startup works
    Tool: Bash
    Preconditions: Memory Core implemented
    Steps:
      1. Start the Memory Core service locally.
      2. Call GET /health on 127.0.0.1 using the configured local port.
      3. Assert response contains status=ok, localOnly=true, runtimeRoot path.
    Expected Result: Service boots successfully without external dependency.
    Failure Indicators: Startup error, missing runtime root, or network dependency timeout.
    Evidence: .sisyphus/evidence/task-6-health.json

  Scenario: Missing config degrades clearly
    Tool: Bash
    Preconditions: Start service with missing optional model provider config
    Steps:
      1. Launch Memory Core without semantic provider configuration.
      2. Call GET /health.
      3. Assert degraded mode is reported but service remains healthy for keyword-only mode.
    Expected Result: Service reports degraded semantic capability but remains usable.
    Evidence: .sisyphus/evidence/task-6-degraded-health.json
  ```

  **Commit**: YES
  - Message: `feat(memory-core): scaffold service and health endpoints`

- [x] 7. Build ingest gateway and ingestion event persistence baseline

  **What to do**:
  - Implement the authoritative ingestion API using the V1 event schema.
  - Persist ingestion events with normalized payload, batch identity, and processing result.
  - Validate supported versus malformed events before handing off to classifier logic.

  **Must NOT do**:
  - Do not auto-promote anything in this task.
  - Do not silently swallow malformed payloads.

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: the ingestion baseline defines event integrity and later auditability.
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: 13, 14
  - **Blocked By**: 1, 2, 5

  **References**:
  - Task 1 event contract
  - Task 2 storage schema
  - Task 5 sample fixtures

  **Acceptance Criteria**:
  - [ ] Supported events are accepted and persisted.
  - [ ] Malformed events are rejected with structured errors.
  - [ ] Batch identity is persisted for rollback and audit.

  **QA Scenarios**:
  ```
  Scenario: Valid event ingestion
    Tool: Bash (curl)
    Preconditions: Memory Core service running locally
    Steps:
      1. POST a valid message.updated fixture to /ingest.
      2. Assert JSON response contains accepted=true, batchId, ingestionEventId.
      3. Query runtime store or GET event detail endpoint to confirm persistence.
    Expected Result: Valid event is normalized and stored.
    Evidence: .sisyphus/evidence/task-7-valid-ingest.json

  Scenario: Malformed event rejection
    Tool: Bash (curl)
    Preconditions: Memory Core service running locally
    Steps:
      1. POST a malformed event fixture missing required fields.
      2. Assert HTTP 4xx and JSON error fields identify schema violation.
      3. Assert no memory record is created.
    Expected Result: Malformed event is rejected cleanly and auditable.
    Evidence: .sisyphus/evidence/task-7-invalid-ingest.json
  ```

  **Commit**: YES
  - Message: `feat(memory-core): implement ingest gateway baseline`

- [x] 8. Build classifier baseline with rule-first worthStoring and layer/type scoring

  **What to do**:
  - Implement rule-first classification for worthStoring, layer placement, type, importance, and confidence.
  - Use model layer only as optional assistance, never as mandatory baseline logic.
  - Ensure raw events land in working/episodic only at this stage.

  **Must NOT do**:
  - Do not promote to semantic/core here.
  - Do not make model inference mandatory for classifying supported fixtures.

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: this task encodes trust policy and noise control.
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: 13, 14, 15
  - **Blocked By**: 1, 2, 3, 5

  **References**:
  - Task 1 guardrails
  - Task 3 provider fallback contract
  - `myk/技术沉淀/OpenCode记忆系统开发.md` - importance heuristics that may be adapted

  **Acceptance Criteria**:
  - [ ] Supported fixture types get deterministic classification without model dependency.
  - [ ] Ephemeral/noisy fixtures are filtered or downgraded.
  - [ ] No classifier path writes directly to semantic/core.

  **QA Scenarios**:
  ```
  Scenario: Stable preference classification
    Tool: Bash
    Preconditions: Classifier test harness exists
    Steps:
      1. Run classifier against a stable user preference fixture.
      2. Assert worthStoring=true, type=preference, layer in working or episodic, confidence present.
    Expected Result: Stable preference is kept and classified deterministically.
    Evidence: .sisyphus/evidence/task-8-preference-classification.txt

  Scenario: Noise filtering
    Tool: Bash
    Preconditions: Classifier test harness exists
    Steps:
      1. Run classifier against a transient/noise fixture such as “我先试试”.
      2. Assert worthStoring=false or low-importance/low-confidence with no promotion eligibility.
    Expected Result: Noise does not enter the durable memory path.
    Evidence: .sisyphus/evidence/task-8-noise-filter.txt
  ```

  **Commit**: YES
  - Message: `feat(memory-core): implement classifier baseline`

- [x] 9. Build repository and FTS keyword retrieval baseline

  **What to do**:
  - Implement repository operations for storing/retrieving memories and ingestion-linked records.
  - Implement keyword retrieval that works fully locally without embedding providers.
  - Support filtering by status, layer, type, and scope.

  **Must NOT do**:
  - Do not couple keyword retrieval to semantic providers.
  - Do not let superseded/forgotten records leak into default active search results.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: mixed persistence and retrieval implementation with medium complexity.
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: 12, 15
  - **Blocked By**: 2, 5

  **References**:
  - Task 2 schema and repository boundaries
  - Task 5 deterministic retrieval fixtures

  **Acceptance Criteria**:
  - [ ] Keyword retrieval works without local model provider.
  - [ ] Filtering excludes non-active records by default.
  - [ ] Repository operations support later relation/promotion use.

  **QA Scenarios**:
  ```
  Scenario: Keyword retrieval happy path
    Tool: Bash (curl)
    Preconditions: Seed known memory fixtures into runtime store
    Steps:
      1. Query /search with mode=keyword and a known exact term.
      2. Assert response returns expected active memory IDs and excludes irrelevant layers when filters are present.
    Expected Result: Keyword retrieval is correct and deterministic.
    Evidence: .sisyphus/evidence/task-9-keyword-search.json

  Scenario: Superseded exclusion
    Tool: Bash (curl)
    Preconditions: At least one active and one superseded memory share similar content
    Steps:
      1. Query /search in default mode.
      2. Assert superseded memory is absent unless explicitly requested.
    Expected Result: Default retrieval surface remains trustworthy.
    Evidence: .sisyphus/evidence/task-9-status-filter.json
  ```

  **Commit**: YES
  - Message: `feat(memory-core): implement keyword retrieval baseline`

- [x] 10. Build governance baseline for audit, rollback unit, and status transitions

  **What to do**:
  - Implement audit record creation for ingestion, promotion, rollback, and projection actions.
  - Define and implement rollback unit semantics: per memory, per relation, per promotion, per ingestion batch.
  - Implement status transition helpers and tombstone/revert behaviors.
  - Implement manual override controls for demote, freeze, tombstone, and rollback-safe status correction.

  **Must NOT do**:
  - Do not physically delete durable history required for audit in V1.
  - Do not leave rollback without provenance.

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: this task controls trustworthiness and reversibility.
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: 13, 14, 16, 17, 20
  - **Blocked By**: 1, 2, 5

  **References**:
  - Task 1 rollback identity rules
  - Task 2 status/state model
  - `.sisyphus/drafts/local-memory-system-design.md` - auditability and reversibility requirements

  **Acceptance Criteria**:
  - [ ] Every write-affecting action creates an audit record.
  - [ ] Batch rollback can reverse a bad ingestion set.
  - [ ] Status transitions are explicit and queryable.
  - [ ] Manual override actions are auditable and reversible where policy allows.

  **QA Scenarios**:
  ```
  Scenario: Batch rollback
    Tool: Bash (curl)
    Preconditions: Ingest a known batch of valid events
    Steps:
      1. Capture the returned batchId.
      2. POST /rollback for that batchId.
      3. Assert ingested memories become reverted/disabled according to policy and audit entries are written.
    Expected Result: Batch rollback reverses the intended unit only.
    Evidence: .sisyphus/evidence/task-10-batch-rollback.json

  Scenario: Audit presence
    Tool: Bash
    Preconditions: At least one ingest and one rollback executed
    Steps:
      1. Query audit artifacts or API.
      2. Assert entries exist for ingest and rollback with timestamps and source references.
    Expected Result: Every reversible action leaves provenance.
    Evidence: .sisyphus/evidence/task-10-audit-check.txt
  ```

  **Commit**: YES
  - Message: `feat(memory-core): implement governance and audit baseline`

- [x] 11. Build provider router and default local embedding/inference adapters

  **What to do**:
  - Implement provider-router abstraction for embedding and inference provider selection.
  - Implement one default local provider path and one OpenAI-compatible contract surface if needed by configuration.
  - Add explicit degraded behavior when providers are absent, unhealthy, or time out.

  **Must NOT do**:
  - Do not make the service fail closed when providers are missing.
  - Do not couple provider logic directly into classifier/retrieval business rules.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: adapter/plugin style integration with runtime behavior and error handling.
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: 12
  - **Blocked By**: 3, 6

  **References**:
  - Task 3 provider contract
  - Task 6 service runtime boundary

  **Acceptance Criteria**:
  - [ ] Providers can be selected by config.
  - [ ] Missing providers produce degraded-mode behavior, not hard failure.
  - [ ] Embedding and inference are independently swappable.

  **QA Scenarios**:
  ```
  Scenario: Provider router selects local provider
    Tool: Bash
    Preconditions: Configured default local provider
    Steps:
      1. Start service with local provider config.
      2. Query health/provider status endpoint.
      3. Assert provider names and capability flags match config.
    Expected Result: Router honors config and reports capabilities clearly.
    Evidence: .sisyphus/evidence/task-11-provider-status.json

  Scenario: Missing provider degrades safely
    Tool: Bash
    Preconditions: Start service with provider unavailable
    Steps:
      1. Boot service with a missing or failing local provider.
      2. Assert health indicates degraded semantic capability.
      3. Assert keyword-only endpoints remain available.
    Expected Result: Baseline runtime still works.
    Evidence: .sisyphus/evidence/task-11-provider-degraded.json
  ```

  **Commit**: YES
  - Message: `feat(memory-core): add provider router and local adapters`

- [ ] 12. Build hybrid retrieval and graceful fallback logic

  **What to do**:
  - Implement hybrid retrieval that merges keyword and semantic recall.
  - Add rank features for layer, importance, freshness, confidence, and relation boosts.
  - Ensure semantic provider failure degrades to keyword retrieval without breaking responses.

  **Must NOT do**:
  - Do not require graph edges for baseline retrieval correctness.
  - Do not hide degraded behavior from callers.

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: ranking, fallback, and retrieval quality policy interact tightly.
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: 15, 19
  - **Blocked By**: 6, 9, 11

  **References**:
  - `.sisyphus/drafts/local-memory-system-design.md` - retrieval modes and ranking dimensions
  - Task 9 keyword retrieval baseline
  - Task 11 provider degraded behavior

  **Acceptance Criteria**:
  - [ ] Hybrid retrieval returns merged/re-ranked results.
  - [ ] Keyword-only fallback works when semantic provider unavailable.
  - [ ] Responses disclose degraded semantic state when applicable.

  **QA Scenarios**:
  ```
  Scenario: Hybrid retrieval happy path
    Tool: Bash (curl)
    Preconditions: Local provider available and seeded fixture data exists
    Steps:
      1. Query /search with mode=hybrid and a semantic-like question.
      2. Assert expected relevant memory appears in top results.
      3. Assert response includes ranking metadata or mode information.
    Expected Result: Hybrid mode improves recall beyond exact keyword matching.
    Evidence: .sisyphus/evidence/task-12-hybrid-search.json

  Scenario: Semantic fallback
    Tool: Bash (curl)
    Preconditions: Disable semantic provider
    Steps:
      1. Query /search with mode=hybrid.
      2. Assert request succeeds and indicates keyword-only fallback.
    Expected Result: Retrieval remains usable under degraded semantic conditions.
    Evidence: .sisyphus/evidence/task-12-hybrid-fallback.json
  ```

  **Commit**: YES
  - Message: `feat(memory-core): implement hybrid retrieval fallback`

- [ ] 13. Build relation engine with minimal typed edges and supersession rules

  **What to do**:
  - Implement `updates`, `extends`, and `derives` relation handling with conservative rules.
  - Implement supersession so updated facts demote previous active facts without deleting history.
  - Store relation confidence and parent evidence references for derived memories.

  **Must NOT do**:
  - Do not create a complex graph scoring subsystem in V1.
  - Do not allow `derives` to bypass evidence requirements.

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: relation semantics directly affect truth integrity.
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: 14, 17
  - **Blocked By**: 7, 8, 10

  **References**:
  - Supermemory-inspired design notes in `.sisyphus/drafts/local-memory-system-design.md`
  - Task 10 governance state transitions

  **Acceptance Criteria**:
  - [ ] Updates create supersession semantics.
  - [ ] Extends preserves both memories as active.
  - [ ] Derives stores parent evidence and remains conservative.

  **QA Scenarios**:
  ```
  Scenario: Updates relation supersedes prior fact
    Tool: Bash
    Preconditions: Seed old preference/project rule then ingest updated fact
    Steps:
      1. Ingest an old active fact.
      2. Ingest a newer contradictory fact.
      3. Assert relation type=updates and old fact becomes superseded.
    Expected Result: Latest truth is returned by default while history remains auditable.
    Evidence: .sisyphus/evidence/task-13-updates.txt

  Scenario: Derives requires parent evidence
    Tool: Bash
    Preconditions: Relation engine enabled
    Steps:
      1. Trigger a derive candidate from multiple source events.
      2. Assert derived record stores parent evidence references and confidence.
      3. Assert no derive is created when evidence is insufficient.
    Expected Result: Derived memories remain explainable and conservative.
    Evidence: .sisyphus/evidence/task-13-derives.txt
  ```

  **Commit**: YES
  - Message: `feat(memory-core): implement relation engine semantics`

- [ ] 14. Build promotion engine with whitelist and scoring gates

  **What to do**:
  - Implement the agreed promotion whitelist.
  - Implement rule + confidence + repetition + evidence diversity scoring for promotion.
  - Ensure promotions are logged, reversible, and never triggered for transient noise.

  **Must NOT do**:
  - Do not auto-promote one-off task status or temporary logs.
  - Do not allow `derives` to enter core without strict thresholds and evidence.

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: promotion policy is the main trust boundary of the whole system.
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: 15, 16, 17
  - **Blocked By**: 7, 8, 10, 13

  **References**:
  - `.sisyphus/drafts/local-memory-system-design.md` - approved promotion rules and thresholds
  - Task 10 governance/audit baseline
  - Task 13 relation semantics

  **Acceptance Criteria**:
  - [ ] Only whitelisted stable categories can auto-promote.
  - [ ] Promotion records include trigger scores and evidence references.
  - [ ] Promotion is reversible.

  **QA Scenarios**:
  ```
  Scenario: Stable preference promotes to semantic/core
    Tool: Bash
    Preconditions: Repeated stable preference evidence seeded
    Steps:
      1. Ingest repeated stable preference evidence from multiple sources.
      2. Run promotion evaluation.
      3. Assert promotion occurs only when threshold and evidence requirements are met.
    Expected Result: Stable facts promote; weak evidence does not.
    Evidence: .sisyphus/evidence/task-14-promotion-pass.json

  Scenario: Transient event blocked from promotion
    Tool: Bash
    Preconditions: Seed a one-off temporary build failure or transient status
    Steps:
      1. Run promotion evaluation.
      2. Assert the record remains working/episodic.
    Expected Result: Noise never leaks into durable knowledge layers.
    Evidence: .sisyphus/evidence/task-14-promotion-block.json
  ```

  **Commit**: YES
  - Message: `feat(memory-core): implement promotion engine`

- [ ] 15. Build profile/context assembly with bounded injection budgets

  **What to do**:
  - Implement user/project profile assembly from promoted and relevant memories.
  - Implement bounded context injection budgets for user profile, stable project knowledge, task-relevant memories, and recent episodic context.
  - Ensure context assembly respects active status, confidence, and freshness.

  **Must NOT do**:
  - Do not dump raw episodic noise into context by default.
  - Do not exceed configured context budgets silently.

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: focused assembly/composition logic once retrieval and promotion exist.
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: 16, 18
  - **Blocked By**: 8, 9, 12, 14

  **References**:
  - `.sisyphus/drafts/local-memory-system-design.md` - profile/context budget limits
  - Task 12 retrieval signals
  - Task 14 promotion outputs

  **Acceptance Criteria**:
  - [ ] Context payload respects category budgets.
  - [ ] Active/high-confidence memories are preferred.
  - [ ] Output shape is stable for adapter consumption.

  **QA Scenarios**:
  ```
  Scenario: Context budget enforcement
    Tool: Bash (curl)
    Preconditions: Seed enough memories to exceed each category budget
    Steps:
      1. Request POST /context for a known project/workspace.
      2. Assert user profile <= 5, project stable knowledge <= 8, task relevant <= 5, recent episodic <= 3.
    Expected Result: Context assembly remains bounded and predictable.
    Evidence: .sisyphus/evidence/task-15-context-budget.json

  Scenario: Confidence-aware assembly
    Tool: Bash (curl)
    Preconditions: Seed active high-confidence and low-confidence competing memories
    Steps:
      1. Request POST /context.
      2. Assert higher-confidence active memories are preferred in returned context.
    Expected Result: Context favors trustworthy memories.
    Evidence: .sisyphus/evidence/task-15-context-confidence.json
  ```

  **Commit**: YES
  - Message: `feat(memory-core): implement profile and context assembly`

- [ ] 16. Build projection engine and deterministic rebuild pipeline

  **What to do**:
  - Implement one-way projection from runtime truth to `.memory/` Markdown files.
  - Implement deterministic rebuild from database state for semantic/core outputs.
  - Ensure projection updates reflect promotion, rollback, and supersession rules.

  **Must NOT do**:
  - Do not treat projected Markdown as editable runtime truth.
  - Do not project unstable working-layer noise.

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: stable projection structure plus deterministic file generation.
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: 17, 18, 19, 20
  - **Blocked By**: 10, 14, 15

  **References**:
  - Task 4 projection policy
  - Task 10 rollback semantics
  - Task 14 promotion outputs
  - Task 15 context/profile categories

  **Acceptance Criteria**:
  - [ ] Stable semantic/core memories project to correct Markdown targets.
  - [ ] Rebuild reproduces the same output from runtime truth.
  - [ ] Rollback and supersession update projection correctly.

  **QA Scenarios**:
  ```
  Scenario: Projection rebuild deterministic
    Tool: Bash
    Preconditions: Seed promoted semantic/core records in runtime store
    Steps:
      1. Run POST /rebuild-projection.
      2. Capture generated files under .memory/.
      3. Run rebuild again without changing runtime truth.
      4. Assert file contents are unchanged.
    Expected Result: Projection is deterministic and reproducible.
    Evidence: .sisyphus/evidence/task-16-rebuild-check.txt

  Scenario: Rollback updates projection
    Tool: Bash
    Preconditions: Projected stable memory exists
    Steps:
      1. Roll back the promoted memory.
      2. Re-run projection or trigger automatic projection update.
      3. Assert the affected Markdown content is removed or corrected according to runtime truth.
    Expected Result: Projection never lies after rollback.
    Evidence: .sisyphus/evidence/task-16-rollback-projection.txt
  ```

  **Commit**: YES
  - Message: `feat(memory-core): implement markdown projection`

- [ ] 17. Build cleanup, decay jobs, and stale-state handling

  **What to do**:
  - Implement retention/decay jobs for working and episodic layers.
  - Implement cleanup for stale embeddings, stale audit artifacts as allowed, and superseded visibility policy.
  - Implement safe handling of orphaned relations and stale projection targets.

  **Must NOT do**:
  - Do not delete audit history needed for rollback or provenance.
  - Do not let decay jobs demote durable core knowledge accidentally.

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: bounded lifecycle management work after state models are defined.
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: 19
  - **Blocked By**: 10, 13, 14, 16

  **References**:
  - `myk/技术沉淀/OpenCode记忆系统开发.md` - existing retention concepts
  - Task 10 status transitions
  - Task 16 projection rebuild semantics

  **Acceptance Criteria**:
  - [ ] Working/episodic decay policies are enforced.
  - [ ] Durable audit/provenance remains intact.
  - [ ] Orphaned relations and stale projections are repaired or flagged.

  **QA Scenarios**:
  ```
  Scenario: Episodic decay job
    Tool: Bash
    Preconditions: Seed expired episodic records and durable semantic/core records
    Steps:
      1. Run cleanup/decay job.
      2. Assert expired episodic records are archived/expired per policy.
      3. Assert semantic/core records remain untouched.
    Expected Result: Decay is scoped correctly.
    Evidence: .sisyphus/evidence/task-17-decay.txt

  Scenario: Orphan relation repair
    Tool: Bash
    Preconditions: Create or simulate relation pointing to reverted/deleted target state
    Steps:
      1. Run cleanup/repair job.
      2. Assert invalid relation is disabled or repaired and audit logged.
    Expected Result: Graph integrity is preserved under cleanup.
    Evidence: .sisyphus/evidence/task-17-orphan-relation.txt
  ```

  **Commit**: YES
  - Message: `feat(memory-core): add cleanup and decay handling`

- [ ] 18. Build OpenCode adapter hook forwarding and tool surface

  **What to do**:
  - Implement a thin OpenCode adapter that listens to approved hooks and forwards normalized events to Memory Core.
  - Expose memory tools (`remember`, `recall`, `forget`, `consolidate`, `memory_status`) through adapter/API consumption only.
  - Implement startup/runtime checks for Memory Core availability and degraded adapter messaging.

  **Must NOT do**:
  - Do not classify, promote, rank, or build graph logic inside the adapter.
  - Do not directly write `.memory/` from the adapter.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: plugin integration with strict separation-of-concerns rules.
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: 19, 20
  - **Blocked By**: 1, 6, 15, 16

  **References**:
  - `myk/技术沉淀/OpenCode记忆系统开发.md` - existing OpenCode hooks/tool concepts
  - Task 1 event contract
  - Task 15 context output shape
  - Task 16 projection ownership rule

  **Acceptance Criteria**:
  - [ ] Adapter forwards supported hooks only.
  - [ ] Tool surface delegates to Memory Core APIs.
  - [ ] Adapter remains usable/declarative when Memory Core is unavailable.

  **QA Scenarios**:
  ```
  Scenario: Hook forwarding happy path
    Tool: Bash
    Preconditions: OpenCode adapter configured against local Memory Core
    Steps:
      1. Trigger a supported hook event (e.g. message.updated or file.edited) in adapter test harness.
      2. Assert Memory Core receives normalized event and returns acceptance response.
      3. Assert adapter does not perform local classification logic.
    Expected Result: Adapter is thin and forwarding-only.
    Evidence: .sisyphus/evidence/task-18-hook-forwarding.txt

  Scenario: Core unavailable behavior
    Tool: Bash
    Preconditions: Stop Memory Core service
    Steps:
      1. Invoke adapter memory_status or a forwarding action.
      2. Assert adapter reports core unavailable/degraded state clearly without crashing.
    Expected Result: Failure mode is graceful and observable.
    Evidence: .sisyphus/evidence/task-18-core-unavailable.txt
  ```

  **Commit**: YES
  - Message: `feat(opencode-adapter): implement thin hook forwarding`

- [ ] 19. Build adapter-to-core integration tests and degraded-mode tests

  **What to do**:
  - Build end-to-end integration coverage spanning adapter → Memory Core → runtime store → projection.
  - Add degraded-mode suites for missing model provider, core unavailable, duplicate events, rollback, projection rebuild, and stale-state cleanup.
  - Verify adapter remains thin by asserting memory business logic is not duplicated.

  **Must NOT do**:
  - Do not rely only on happy-path tests.
  - Do not leave rollback/projection rebuild untested end-to-end.

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: cross-boundary QA with many failure modes.
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: FINAL
  - **Blocked By**: 18, 12, 16, 17

  **References**:
  - Tasks 12, 16, 17, 18 outputs
  - `.sisyphus/drafts/local-memory-system-design.md` - degraded-mode expectations

  **Acceptance Criteria**:
  - [ ] End-to-end path is covered.
  - [ ] Degraded modes are covered.
  - [ ] Projection rebuild and rollback are covered.

  **QA Scenarios**:
  ```
  Scenario: End-to-end memory lifecycle
    Tool: Bash
    Preconditions: Adapter and Memory Core both running locally
    Steps:
      1. Trigger a supported OpenCode observation through adapter.
      2. Assert it ingests, classifies, optionally promotes, becomes retrievable, and projects correctly when durable.
      3. Assert returned evidence and audit paths are present.
    Expected Result: Full lifecycle works end-to-end.
    Evidence: .sisyphus/evidence/task-19-e2e.json

  Scenario: Duplicate + rollback + rebuild regression
    Tool: Bash
    Preconditions: Existing seeded runtime state
    Steps:
      1. Send duplicate observations.
      2. Assert dedupe or relation behavior matches policy.
      3. Roll back affected batch.
      4. Rebuild projection.
      5. Assert runtime truth and Markdown outputs remain consistent.
    Expected Result: Failure modes remain controlled and reversible.
    Evidence: .sisyphus/evidence/task-19-regression.txt
  ```

  **Commit**: YES
  - Message: `test(opencode-adapter): add integration and degraded-mode coverage`

- [ ] 20. Build operational commands and local runbook for runtime, rebuild, and audit inspection

  **What to do**:
  - Document local startup, shutdown, rebuild-projection, audit inspection, degraded-mode expectations, and recovery steps.
  - Provide concrete commands for running tests, inspecting health, querying search/context, and validating projection rebuilds.
  - Keep the runbook aligned to the actual local runtime topology.

  **Must NOT do**:
  - Do not document unsupported V1 workflows like cloud sync or direct Markdown edits.
  - Do not leave recovery procedures vague.

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: operational handoff and recovery guidance for later executor use.
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4
  - **Blocks**: FINAL
  - **Blocked By**: 6, 10, 16, 18

  **References**:
  - Task 6 service startup/health
  - Task 10 audit/rollback semantics
  - Task 16 rebuild-projection behavior
  - Task 18 adapter usage surface

  **Acceptance Criteria**:
  - [ ] Runbook covers startup, search, context, rebuild, rollback, and degraded scenarios.
  - [ ] Commands map to real local runtime paths and APIs.
  - [ ] Recovery instructions are deterministic.

  **QA Scenarios**:
  ```
  Scenario: Runbook command validity
    Tool: Bash
    Preconditions: Operational docs exist
    Steps:
      1. Execute documented startup, health, search, context, and rebuild commands exactly as written.
      2. Assert commands succeed or produce the documented degraded output.
    Expected Result: Runbook is executable, not aspirational.
    Evidence: .sisyphus/evidence/task-20-runbook-check.txt

  Scenario: Recovery procedure correctness
    Tool: Bash
    Preconditions: Simulate projection drift or provider degraded mode
    Steps:
      1. Follow documented recovery steps.
      2. Assert health, projection, and audit state return to expected values.
    Expected Result: Recovery documentation is sufficient for agent execution.
    Evidence: .sisyphus/evidence/task-20-recovery-check.txt
  ```

  **Commit**: YES
  - Message: `docs(memory-core): add local operations runbook`

---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. Verify all must-haves exist, must-not-haves are absent, and evidence files exist. Reject on any contract drift or missing core deliverable.

  **QA Scenarios**:
  ```
  Scenario: Must-have and guardrail audit
    Tool: Bash
    Preconditions: Implementation complete and all task evidence files exist
    Steps:
      1. Read `.sisyphus/plans/local-memory-system.md` must-have and must-not-have sections.
      2. Cross-check implementation artifacts, test outputs, and runtime behavior against each listed item.
      3. Assert evidence files exist for every completed task under `.sisyphus/evidence/`.
    Expected Result: Every must-have is present, every must-not-have is absent, and evidence coverage is complete.
    Failure Indicators: Any missing deliverable, any forbidden scope item, or any missing evidence file.
    Evidence: .sisyphus/evidence/final-f1-plan-compliance.txt

  Scenario: Contract drift detection
    Tool: Bash
    Preconditions: Runtime endpoints and adapter available
    Steps:
      1. Compare implemented event schema, rollback semantics, and projection semantics against the contract tasks.
      2. Assert no adapter-side classification/promotion logic is present.
    Expected Result: Implementation matches contract boundaries exactly.
    Evidence: .sisyphus/evidence/final-f1-contract-drift.txt
  ```

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run the implementation test suite, static checks, and inspect changed files for adapter leakage, missing rollback coverage, unbounded promotion logic, and projection truth violations.

  **QA Scenarios**:
  ```
  Scenario: Static and test suite pass
    Tool: Bash
    Preconditions: Project build/test commands are available
    Steps:
      1. Run the documented test command set for memory-core and opencode-adapter modules.
      2. Run the documented static analysis / typecheck commands.
      3. Assert all commands exit successfully.
    Expected Result: Build, type checks, and tests all pass with zero failures.
    Failure Indicators: Non-zero exit codes, type errors, or failed tests.
    Evidence: .sisyphus/evidence/final-f2-quality-suite.txt

  Scenario: Architecture boundary inspection
    Tool: Bash
    Preconditions: Source files present
    Steps:
      1. Inspect changed adapter files for classification, promotion, ranking, or projection logic.
      2. Inspect promotion/governance files for missing rollback coverage or unbounded promotion behavior.
    Expected Result: Adapter stays thin and governance logic remains bounded and test-covered.
    Evidence: .sisyphus/evidence/final-f2-boundary-inspection.txt
  ```

- [ ] F3. **Real QA Execution** — `unspecified-high`
  Execute every task QA scenario, including degraded modes (no model provider, duplicate events, rollback, projection rebuild, adapter/core disconnection).

  **QA Scenarios**:
  ```
  Scenario: Full scenario replay
    Tool: Bash
    Preconditions: All implementation tasks complete
    Steps:
      1. Re-run the happy-path QA scenario for every task 1-20 that applies to the implemented system.
      2. Collect outputs for ingest, retrieval, promotion, rollback, projection, and adapter forwarding.
    Expected Result: All previously defined task scenarios pass in one final integrated environment.
    Failure Indicators: Any previously passing task scenario now fails under integrated conditions.
    Evidence: .sisyphus/evidence/final-f3-scenario-replay.txt

  Scenario: Degraded and failure-mode sweep
    Tool: Bash
    Preconditions: Ability to disable local model provider and stop/restart services
    Steps:
      1. Disable semantic provider and assert keyword-only fallback works.
      2. Send duplicate events and assert dedupe/relations behave as specified.
      3. Roll back a batch and rebuild projection.
      4. Stop Memory Core while adapter runs and assert graceful degraded behavior.
    Expected Result: Failure modes remain controlled, reversible, and observable.
    Evidence: .sisyphus/evidence/final-f3-degraded-sweep.txt
  ```

- [ ] F4. **Scope Fidelity Check** — `deep`
  Compare implementation against V1 scope guardrails. Flag any cloud sync, dashboard/UI work, adapter-side memory logic, or Markdown-as-truth drift.

  **QA Scenarios**:
  ```
  Scenario: V1 scope containment
    Tool: Bash
    Preconditions: Final diff or changed file set available
    Steps:
      1. Inspect changed files and runtime capabilities.
      2. Assert there is no cloud sync, no dashboard/UI, no multi-user/distributed support, and no Markdown runtime truth workflow.
    Expected Result: Implementation stays inside the approved V1 box.
    Evidence: .sisyphus/evidence/final-f4-scope-containment.txt

  Scenario: OpenCode-first but core-reusable boundary
    Tool: Bash
    Preconditions: Memory Core and adapter source available
    Steps:
      1. Inspect core APIs and adapter integration points.
      2. Assert core is generic enough for future adapters, but only OpenCode adapter is implemented in V1.
    Expected Result: No premature multi-client expansion work exists, yet the core remains reusable.
    Evidence: .sisyphus/evidence/final-f4-boundary-check.txt
  ```

---

## Commit Strategy

- 1: `feat(memory-core): scaffold service contracts and config`
- 2: `test(memory-core): add ingest gateway contract coverage`
- 3: `feat(memory-core): implement ingest persistence baseline`
- 4: `test(memory-core): add classifier and promotion coverage`
- 5: `feat(memory-core): implement classifier promotion and retrieval baseline`
- 6: `test(memory-core): add relation governance and projection coverage`
- 7: `feat(memory-core): implement relation governance and projection`
- 8: `test(opencode-adapter): add event forwarding integration coverage`
- 9: `feat(opencode-adapter): implement thin adapter integration`

---

## Success Criteria

### Verification Commands
```bash
# Example verification expectations for the completed implementation
# - local memory core starts without network dependency
# - ingest accepts supported events and rejects malformed payloads
# - keyword retrieval works without local model provider
# - hybrid retrieval degrades gracefully when semantic backend unavailable
# - projection rebuild recreates .memory/ from runtime truth deterministically
```

### Final Checklist
- [ ] All must-have capabilities implemented
- [ ] All must-not-have guardrails preserved
- [ ] All module-level tests pass
- [ ] Rollback and audit evidence verified
- [ ] Projection reproducibility verified
