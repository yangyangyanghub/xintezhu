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
