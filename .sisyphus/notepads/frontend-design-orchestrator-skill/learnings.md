# Learnings: Frontend Design Orchestrator Skill

## 2026-04-10 Session Start

### Plan Overview
- **Goal**: Create a production-grade frontend design orchestrator skill
- **Deliverables**: SKILL.md + references/, DESIGN.md template, eval test suite, benchmark
- **Key Metrics**: ≥80% pass rate, ≥20% improvement over baseline

### Critical Decisions Already Made
1. **Installation Path**: `~/.config/opencode/skill/frontend-design-orchestrator/`
2. **Evaluation Framework**: skill-creator pipeline with `python -m skill_creator.scripts.run_eval`
3. **Output Artifact**: DESIGN.md (generated) + review artifacts only
4. **Template Sections**: 9 standard sections (Visual Theme, Color Palette, Typography, Components, Layout, Depth, Icon System, Responsive, Review Log)

### Non-Goals (Must NOT)
- Implementation code generation
- Live network dependency for core workflow
- Nested references >1 level deep
- Vague acceptance criteria

### Execution Waves
- Wave 1: Contract & Baseline (Tasks 1-3) - Foundation
- Wave 2: Minimal GREEN Skill (Tasks 4-7) - Core
- Wave 3: Review & Specialization (Tasks 8-10) - Extension
- Wave 4: Evaluation & Refinement (Tasks 11-14) - Validation
- Wave 5: Final Verification (F1-F4) - Approval

### Dependencies
- Task 1 blocks Tasks 4-18
- Tasks 4-7 block Tasks 8-10
- Tasks 8-10 block Tasks 11-14
- Tasks 11-14 block F1-F4

### Key Reference Files
- skill-creator SKILL.md: Contract and eval patterns
- web-design-guidelines SKILL.md: Review workflow
- awesome-design-md: DESIGN.md samples
- Vercel Web Design Guidelines: Review rules source

## Conventions

### File Naming
- SKILL.md: Main entry point
- references/*.md: Supporting files by function
- evals/evals.json: Test scenarios
- baseline-runs/: No-skill baseline results
- with-skill-runs/: With-skill test results

### Commit Messages
Format: `<type>(frontend-design-orchestrator): <description>`
- test: Baseline scenarios, evals
- feat: Skill files, templates, references
- docs: Contracts, boundaries, maintenance
- refactor: Feedback-driven improvements

### QA Evidence Path
`.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Open Questions
None at session start - all decisions documented in plan.

## 2026-04-11 Task 2 Baseline Learnings

### Baseline Execution Findings
- `evals/evals.json` for this project should live at repository root, matching the task plan's file targets (`evals/evals.json`, `baseline-runs/*`).
- The baseline runner can use `opencode run --pure --format json` to capture no-skill behavior with raw event logs and token/timing metadata.
- For prompts that attach files, `opencode run` must receive the message before `-f <file>`; otherwise the prompt text is misparsed as a file path.

### Output Capture Conventions
- Each baseline scenario should write to `baseline-runs/<eval_name>/` with:
  - `timing.json`
  - `outputs/raw-events.jsonl`
  - `outputs/assistant-response.md`
- Baseline prompts should explicitly instruct the model to answer inline and avoid write/edit/bash to reduce workspace pollution.
- Running with `--dir <baseline-run-dir>` isolates any accidental file writes inside the scenario sandbox instead of the repo root.

## 2026-04-11 Task 8 Review Rules Learnings

### Review Reference Boundaries
- Vercel Web Interface Guidelines cover much more than accessibility; the most useful review reference should stay checklist-driven across interaction, responsive layout, content/forms, motion/performance, and visual craft.
- For this skill, review rules should stay non-exhaustive and action-oriented so Task 10 can turn them into a concise review workflow instead of a generic audit framework.

### Verification Constraint
- The required review reference lives in the global skill directory (`C:\Users\HP\.config\opencode\skill\frontend-design-orchestrator\references\`), so repository evidence can verify it, but git in `E:\code\my-ai-workspace` cannot version that file directly.

## 2026-04-11 Task 9 Conflict Resolution Learnings

- The installed `frontend-design-orchestrator` skill lives under `C:\Users\HP\.config\opencode\skill\frontend-design-orchestrator\`, so task evidence in this repo must reference the global skill path explicitly.
- For icon-system guidance, conflict detection is more reliable when the doc requires a small inventory table (`source`, `raw_name`, `usage_context`, `status`) before making any library choice.
- Prefix-based namespacing needs both decision rules and a report schema; otherwise the guidance stays conceptual and reviewers cannot verify how a conflict was resolved.

## 2026-04-11 F3 Manual QA Learnings

- Direct filesystem verification is not enough for end-to-end skill QA; the skill must also be discoverable through `get_available_skills` and loadable through `use_skill`.
- This skill's content files currently pass manual structure checks, but the skill registry path is broken because `frontend-design-orchestrator` cannot be resolved by the skill toolchain.
- For future manual QA tasks, treat "file exists" and "skill can actually be invoked" as separate gates.

## 2026-04-11 F3 Manual QA Follow-up

- The direct `skill` loader can load `frontend-design-orchestrator` even though `get_available_skills` and `use_skill` fail for the same name.
- For this project, the practical end-to-end path works: a test `DESIGN.md` was generated at `temp/f3-manual-qa-test-project/DESIGN.md` with icon conflict handling and a populated review log.
- Final QA judgment should distinguish between "workflow works" and "all helper interfaces are consistent"; here the former passes and the latter still has a tooling mismatch.

## 2026-04-11 F4 Scope Fidelity Learnings

- A top-level `Non-goals` section is not sufficient for approval if supporting references still include implementation snippets or runtime package guidance.
- For a design-orchestrator skill, TSX/HTML/CSS examples inside references count as scope leakage even when the main `SKILL.md` says "does NOT generate implementation code".
- Offline compliance should be judged on whether the operational path runs from local reference files; external URLs can remain provenance only, but optional network features like `asset downloads` still weaken scope fidelity.
