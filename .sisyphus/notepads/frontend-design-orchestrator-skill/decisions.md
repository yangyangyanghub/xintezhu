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
