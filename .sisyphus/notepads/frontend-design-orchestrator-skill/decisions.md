# Decisions: Frontend Design Orchestrator Skill

## Architecture Decisions

### 1. Hub-Type Skill Pattern
**Decision**: Use orchestrator/hub pattern
**Rationale**: Skill focuses on design decisions, specifications, icon systems, and review processes - not implementation
**Impact**: SKILL.md acts as entry point, references/ contain split-by-function files

### 2. DESIGN.md Dual Role
**Decision**: DESIGN.md serves as both core skill reference asset and standalone deliverable
**Rationale**: Template lives in references/, generated output goes to user's project
**Impact**: Clear separation - template ≠ output

### 3. Evaluation Strategy
**Decision**: Full skill-creator evaluation loop (RED-GREEN-REFACTOR)
**Rationale**: Need measurable quality improvement over baseline
**Impact**: Must achieve ≥80% pass rate AND ≥20% delta over baseline

### 4. No Network Dependency
**Decision**: Core workflow must work offline
**Rationale**: Avoid external service failures breaking skill
**Impact**: All reference data embedded in skill files, external sources are supplementary

### 5. Minimal Output
**Decision**: Only DESIGN.md + review artifacts, no token maps or icon manifests
**Rationale**: Keep output focused and manageable
**Impact**: Skill generates documentation, not implementation assets

## Implementation Decisions

### Wave 1: Foundation
- Task 1: Document contracts before any implementation
- Task 2: Create baseline to measure improvement
- Task 3: Analyze failures to guide skill design

### Wave 2: Core
- Task 4: SKILL.md < 300 lines, clear triggers
- Task 5: Template with 9 sections, placeholders only
- Task 6: Reference awesome-design-md and ui-skills.com
- Task 7: Reference better-icons, Ant Design, iconfont.cn

### Wave 3: Extension
- Task 8: Extract Vercel guidelines checklist
- Task 9: Prefix-based namespacing for icon conflicts
- Task 10: Review workflow integrated in SKILL.md

### Wave 4: Validation
- Task 11: 8 total scenarios (6 original + 2 new)
- Task 12: Run all scenarios with skill loaded
- Task 13: Generate benchmark.json, benchmark.md, viewer
- Task 14: Address all feedback before final wave

### Wave 5: Approval
- F1-F4: Parallel verification, ALL must APPROVE
- User explicit "okay" required before completion

## Pending Decisions
None - all decisions made during planning phase.

## 2026-04-11 Task 2 Decisions

### 6. Baseline Artifact Layout
**Decision**: Store baseline artifacts at repo-root `baseline-runs/<eval_name>/` rather than inventing a deeper workspace layout for Task 2.
**Rationale**: The plan acceptance criteria and commit target explicitly reference `baseline-runs/*`, so matching that path keeps Task 2 atomic and reviewable.
**Impact**: Later benchmark aggregation can adapt from this RED baseline layout into the fuller skill-creator workspace if needed.

### 7. Baseline Transport
**Decision**: Use `opencode run --pure --format json` as the no-skill execution path for baseline capture.
**Rationale**: It yields real no-skill model behavior plus event timestamps and token totals without loading the skill under development.
**Impact**: Task 2 produces both qualitative outputs and measurable timing/token evidence for later delta comparison.

### 8. Task 10 Review Log Structure
**Decision**: Record review traceability in the template with `Checklist Basis`, `Problem List`, and `Updated Sections`.
**Rationale**: Task 10 requires not only a review checklist path but also a clear mapping from findings to concrete `DESIGN.md` edits.
**Impact**: Future review runs can show which section changed for each accepted finding without turning the template into a generic audit report.

### 9. Task 10 Source of Truth
**Decision**: Apply the required documentation changes in the installed skill directory at `~/.config/opencode/skill/frontend-design-orchestrator/`.
**Rationale**: The repository plan references the installed skill path as the final artifact location, and no repository-local copy of those two target files exists.
**Impact**: Verification must read the installed skill files directly, while repository evidence records the changes and the git-tracking limitation.
