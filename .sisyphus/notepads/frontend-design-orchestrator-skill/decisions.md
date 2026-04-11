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

## 2026-04-11 Task 8 Decisions

### 8. Review Rules Scope Compression
**Decision**: Compress Vercel Web Interface Guidelines into a practical review checklist with five sections: interaction/accessibility, responsive layout, content/forms, motion/performance, and visual craft.
**Rationale**: The task asks for actionable review rules, not a full accessibility standard or a line-by-line copy of the source material.
**Impact**: `review-rules.md` stays compact enough for skill usage while still covering the key Vercel review surfaces.

### 9. Severity Model
**Decision**: Define `critical`, `major`, and `minor` by release risk and user impact, then attach concrete violation/correction examples.
**Rationale**: The skill needs review output that can be triaged immediately instead of vague “good/bad” notes.
**Impact**: Future review output can map directly to a prioritized fix queue.

### 10. Verification Strategy for Global Skill Files
**Decision**: Verify the global reference file from the workspace repo using evidence files rather than trying to force git tracking for a file outside the repository root.
**Rationale**: The target skill path is not itself a git repository, but the plan still requires auditable QA evidence.
**Impact**: Task completion can be proven with evidence even when the deliverable lives outside version control.

## 2026-04-11 F3 Manual QA Decisions

### 11. F3 Verdict Basis
**Decision**: Mark F3 as `REJECT` instead of `APPROVE`.
**Rationale**: The installed files can be read directly, but the actual skill cannot be discovered or loaded through the skill system (`get_available_skills`, `read_skill_file`, `use_skill` all fail).
**Impact**: The skill content is present, but the end-to-end workflow is not verifiably usable until registry/discovery is fixed.

### 12. Final F3 Verdict Adjustment
**Decision**: Revise the final F3 verdict to `APPROVE`.
**Rationale**: A direct `skill("frontend-design-orchestrator")` load succeeded and was sufficient to generate a real test-project `DESIGN.md`, proving the manual workflow works end-to-end despite helper-tool inconsistency.
**Impact**: F3 passes as manual QA evidence, but follow-up work is still needed to make `get_available_skills` / `read_skill_file` / `use_skill` consistent with the direct skill loader.

## 2026-04-11 F4 Scope Fidelity Decision

### 11. Reject Current Scope Fidelity
**Decision**: Mark F4 as `REJECT`.
**Rationale**: `SKILL.md` holds the correct boundary, but `references/icon-systems.md` and `references/design-sources.md` still include implementation-oriented material (TSX/HTML/CSS snippets, implementation migration wording, `/src/assets/icons/`, `Tailwind UI` as implementation reference, and `asset downloads` wording).
**Impact**: The skill cannot be approved for scope fidelity until references are reduced to design-spec-only guidance.

## 2026-04-11 F2 Quality Decision

### 12. Reject Current Quality Review
**Decision**: Mark F2 as `REJECT`.
**Rationale**: `SKILL.md` passes basic structure checks, but the package still fails quality review because the review contract is inconsistent across files, long references lack navigation structure, and supporting references leak implementation/runtime guidance.
**Impact**: Future approval work should treat F2 and F4 as linked blockers; fixing only wording in `SKILL.md` will not be sufficient.

## 2026-04-11 Fix 2 Scope Cleanup Decision

### 13. Reduce References to Design-Level Guidance Only
**Decision**: Remove implementation snippets and runtime/setup details from `references/icon-systems.md` and `references/design-sources.md`, while preserving their original section structure and design-decision value.
**Rationale**: This skill produces `DESIGN.md` only, so supporting references must guide naming, visual selection, and decision criteria rather than code usage or asset wiring.
**Impact**: Scope fidelity is now enforced not only in `SKILL.md`, but also in the reference materials that the skill consults during design generation.
