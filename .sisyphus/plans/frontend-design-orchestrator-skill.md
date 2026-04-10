# Frontend Design Orchestrator Skill

## TL;DR
> **Summary**: Create a production-grade frontend design skill that generates DESIGN.md, integrates icon systems, runs Vercel Web Design Guidelines review, and passes full skill-creator evaluation loop.
> **Deliverables**: Complete skill package (SKILL.md + references/), eval test suite with baseline comparisons, and documentation.
> **Effort**: Medium
> **Parallel**: YES - 3 waves
> **Critical Path**: Contract Definition → RED Baselines → GREEN Skill → REFACTOR Loop

## Context
### Original Request
Create a frontend design skill that:
- Generates DESIGN.md as central asset
- Integrates design references from awesome-design-md, ui-skills.com
- Provides icon system selection and conflict resolution
- Includes Vercel Web Design Guidelines review
- Goes through complete skill-creator evaluation loop

### Interview Summary
- **Positioning**: Design Orchestrator - focuses on design decisions, specifications, icon systems, and review processes
- **DESIGN.md role**: Dual role - both core skill reference asset and standalone deliverable
- **Testing**: Full skill-creator evaluation loop (evals, baseline, viewer, review, iteration)
- **Architecture**: Hub-type skill with orchestrator pattern
- **Workflow**: 4-stage serial with gate checks
- **Structure**: SKILL.md (entry) + references/ (split by function) + runtime-generated DESIGN.md

### Metis Review (gaps addressed)
- **Guardrails**: No implementation code generation, no live network dependency for core path, separate template from generated output
- **Scope Risks**: Design→UI implementation drift, icon selection→toolchain automation, review→audit platform
- **Testing Gaps**: No no-skill baseline, no negative tests, no trigger precision tests
- **Key Decisions Made**: Global installation, minimal output (DESIGN.md + review only), overwrite+backup for existing files, 80% pass + 20% delta threshold

## Work Objectives
### Core Objective
Create a production-ready frontend design orchestrator skill that reliably generates high-quality DESIGN.md documents with proper icon systems and passes Vercel guidelines review, validated through complete skill-creator evaluation loop.

### Deliverables
1. Skill package: SKILL.md + references/ directory with all supporting files
2. DESIGN.md template with 9 standard sections
3. Baseline test suite (no-skill runs)
4. With-skill test suite (positive, negative, review-only, update scenarios)
5. Benchmark comparison showing ≥80% pass rate and ≥20% improvement over baseline
6. Documentation: non-goals, provenance, maintenance rules

### Definition of Done
- [ ] Skill installed globally at `~/.config/opencode/skill/frontend-design-orchestrator/`
- [ ] SKILL.md < 300 lines with proper YAML frontmatter
- [ ] All reference files present and complete
- [ ] 6+ eval scenarios covering happy path, negative path, review-only, update, offline, and trigger precision
- [ ] Baseline runs completed and documented
- [ ] With-skill runs achieve ≥80% pass rate
- [ ] With-skill runs show ≥20% improvement over baseline
- [ ] Viewer review completed and feedback incorporated
- [ ] Final verification wave (4 parallel agents) all approve

### Must Have
- Clear trigger conditions in description
- Explicit non-goals section
- Separation of template asset vs generated output
- No-skill baseline for comparison
- Negative test scenarios
- Atomic commits with clear scope

### Must NOT Have
- Implementation code generation
- Live network dependency for core workflow
- Template/output confusion
- Nested references >1 level deep
- Vague acceptance criteria
- "Manual review" steps

## Verification Strategy
> ZERO HUMAN INTERVENTION - all verification is agent-executed.

- **Test decision**: TDD (RED-GREEN-REFACTOR) for skill documentation
- **Framework**: skill-creator evaluation pipeline
- **QA policy**: Every task has agent-executed scenarios with specific commands and assertions
- **Evidence**: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Execution Strategy
### Parallel Execution Waves
> Target: 5-8 tasks per wave.

**Wave 1: Contract & Baseline (Foundation)**
- Task 1: Define contracts (install path, invocation, artifact, evaluation)
- Task 2: Create no-skill baseline scenarios and run them
- Task 3: Document baseline failures and rationalizations

**Wave 2: Minimal GREEN Skill (Core)**
- Task 4: Create SKILL.md with minimal metadata and trigger
- Task 5: Create DESIGN.md template with 9 sections
- Task 6: Create design-sources reference file
- Task 7: Create icon-systems reference file

**Wave 3: Review & Specialization (Extension)**
- Task 8: Create review-rules reference file
- Task 9: Implement icon conflict resolution logic
- Task 10: Implement Vercel review workflow

**Wave 4: Evaluation & Refinement (Validation)**
- Task 11: Create eval test suite (6+ scenarios)
- Task 12: Run with-skill evals and compare to baseline
- Task 13: Generate benchmark and viewer report
- Task 14: Iterate based on feedback

**Wave 5: Final Verification (Approval)**
- Task 15: Plan compliance audit
- Task 16: Code quality review
- Task 17: Manual QA scenarios
- Task 18: Scope fidelity check

### Dependency Matrix
- Tasks 1-3: Independent (Wave 1)
- Tasks 4-7: Depend on Task 1 (Wave 2)
- Tasks 8-10: Depend on Tasks 4-7 (Wave 3)
- Tasks 11-14: Depend on Tasks 8-10 (Wave 4)
- Tasks 15-18: Depend on Tasks 11-14 (Wave 5)

### Agent Dispatch Summary
- Wave 1: 3 tasks → quick (contracts, baseline, documentation)
- Wave 2: 4 tasks → unspecified-low (file creation)
- Wave 3: 3 tasks → unspecified-low (file creation + logic)
- Wave 4: 4 tasks → deep (evaluation, analysis, iteration)
- Wave 5: 4 tasks → parallel agents (oracle, unspecified-high x2, deep)

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [x] 1. Define Core Contracts

  **What to do**: 
  - Define installation path: `~/.config/opencode/skill/frontend-design-orchestrator/`
  - Define invocation contract: what inputs trigger what outputs
  - Define artifact contract: DESIGN.md (generated) + review artifacts, no token maps or icon manifests
  - Define evaluation contract: `python -m skill_creator.scripts.run_eval`, baseline required, 80% pass + 20% delta threshold
  
  **Must NOT do**: 
  - Do not leave paths or commands unspecified
  - Do not create ambiguous input/output boundaries
  
  **Recommended Agent Profile**:
  - Category: `quick` - Reason: Documenting contracts is straightforward writing task
  - Skills: [] - No special skills needed
  - Omitted: [] - None relevant
  
  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 4-18 | Blocked By: none
  
  **References**:
  - Pattern: `C:\Users\HP\.config\opencode\skill\skill-creator\SKILL.md:1-50` - How skill-creator defines its contracts
  - Schema: `C:\Users\HP\.config\opencode\skill\skill-creator\references\schemas.md` - JSON structures for evals
  
  **Acceptance Criteria** (agent-executable only):
  - [ ] Contract document created at `.sisyphus/drafts/frontend-design-contracts.md`
  - [ ] Installation path is explicit: `~/.config/opencode/skill/frontend-design-orchestrator/`
  - [ ] Evaluation command is explicit: `python -m skill_creator.scripts.run_eval --eval-set <path> --skill-path <path>`
  - [ ] Pass threshold is explicit: ≥80% scenarios pass AND ≥20% improvement over baseline
  
  **QA Scenarios** (MANDATORY):
  ```
  Scenario: Contract completeness check
    Tool: Bash
    Steps: 
      1. Read .sisyphus/drafts/frontend-design-contracts.md
      2. Grep for "installation_path:", "invocation:", "artifacts:", "evaluation_command:", "pass_threshold:"
    Expected: All 5 contract elements are present with non-empty values
    Evidence: .sisyphus/evidence/task-1-contracts-check.txt
  ```
  
  **Commit**: YES | Message: `docs(frontend-design-orchestrator): define core contracts` | Files: [.sisyphus/drafts/frontend-design-contracts.md]

- [ ] 2. Create No-Skill Baseline Scenarios

  **What to do**:
  - Create 6 eval scenarios without any skill loaded
  - Scenarios: (1) new project minimal brief, (2) new project with reference image, (3) existing DESIGN.md review, (4) icon conflict resolution, (5) implementation request (negative), (6) unrelated frontend code (negative)
  - Run each scenario and capture exact output
  - Document what went wrong, what rationalizations the agent used
  
  **Must NOT do**:
  - Do not use the skill being created
  - Do not create scenarios that are too similar
  
  **Recommended Agent Profile**:
  - Category: `quick` - Reason: Creating test prompts and capturing baseline
  - Skills: [] - No special skills needed
  - Omitted: [] - None relevant
  
  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 11-14 | Blocked By: 1
  
  **References**:
  - Pattern: `C:\Users\HP\.config\opencode\skill\skill-creator\SKILL.md:150-200` - How to create eval scenarios
  - Example: `C:\Users\HP\.config\opencode\skill\skill-creator\examples\CLAUDE_MD_TESTING.md` - Testing methodology
  
  **Acceptance Criteria** (agent-executable only):
  - [ ] File created: `evals/evals.json` with 6 scenarios
  - [ ] Each scenario has: id, prompt, expected_output, assertions (can be empty for now)
  - [ ] Baseline runs completed in `baseline-runs/` directory
  - [ ] Each baseline run has: `timing.json`, `outputs/` directory
  
  **QA Scenarios** (MANDATORY):
  ```
  Scenario: Eval file structure check
    Tool: Bash
    Steps:
      1. Read evals/evals.json
      2. Count number of scenarios
      3. Verify each has id, prompt, expected_output fields
    Expected: Exactly 6 scenarios, each with required fields
    Evidence: .sisyphus/evidence/task-2-evals-check.txt
  ```
  
  **Commit**: YES | Message: `test(frontend-design-orchestrator): add RED baseline scenarios` | Files: [evals/evals.json, baseline-runs/*]

- [ ] 3. Document Baseline Failures

  **What to do**:
  - Analyze each baseline run output
  - Identify where agent failed to produce expected output
  - Document exact rationalizations used (verbatim quotes)
  - Categorize: missing sections, wrong focus, scope drift, tool misuse
  
  **Must NOT do**:
  - Do not make excuses for failures
  - Do not skip documenting verbatim rationalizations
  
  **Recommended Agent Profile**:
  - Category: `quick` - Reason: Documenting analysis
  - Skills: [] - No special skills needed
  - Omitted: [] - None relevant
  
  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 4 | Blocked By: 2
  
  **References**:
  - Pattern: `C:\Users\HP\.config\opencode\skill\skill-creator\agents\analyzer.md` - How to analyze benchmark results
  - Guidance: `C:\Users\HP\.cache\opencode\packages\superpowers@git+https_/github.com/jnMetaCode/superpowers-zh.git\node_modules\superpowers\skills\writing-skills\SKILL.md:100-150` - Rationalization table pattern
  
  **Acceptance Criteria** (agent-executable only):
  - [ ] File created: `baseline-analysis.md`
  - [ ] Each of 6 scenarios has: failure summary, verbatim rationalizations, pattern identified
  - [ ] Rationalization table created with excuse → reality mapping
  
  **QA Scenarios** (MANDATORY):
  ```
  Scenario: Baseline analysis completeness
    Tool: Bash
    Steps:
      1. Read baseline-analysis.md
      2. Count scenario sections
      3. Grep for verbatim quotes (text in quotes)
    Expected: 6 scenario sections, at least 3 verbatim quotes total
    Evidence: .sisyphus/evidence/task-3-analysis-check.txt
  ```
  
  **Commit**: YES | Message: `docs(frontend-design-orchestrator): document baseline failures and rationalizations` | Files: [baseline-analysis.md]

- [ ] 4. Create SKILL.md with Minimal Metadata

  **What to do**:
  - Create `~/.config/opencode/skill/frontend-design-orchestrator/SKILL.md`
  - YAML frontmatter: name, description (with trigger conditions)
  - Body: When to Use, Workflow Overview, Reference Files Index, Quick Start, Common Mistakes
  - Keep < 300 lines
  
  **Must NOT do**:
  - Do not put implementation details in SKILL.md
  - Do not exceed 300 lines
  
  **Recommended Agent Profile**:
  - Category: `quick` - Reason: Creating structured documentation file
  - Skills: [] - No special skills needed
  - Omitted: [] - None relevant
  
  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 8-18 | Blocked By: 1
  
  **References**:
  - Pattern: `C:\Users\HP\.config\opencode\skill\frontend-design\SKILL.md` - Minimal template structure
  - Pattern: `C:\Users\HP\.config\opencode\skill\web-design-guidelines\SKILL.md` - Review-oriented structure
  
  **Acceptance Criteria** (agent-executable only):
  - [ ] File exists at `~/.config/opencode/skill/frontend-design-orchestrator/SKILL.md`
  - [ ] YAML frontmatter has name and description fields
  - [ ] Description starts with "Use when" and includes trigger conditions
  - [ ] File has < 300 lines
  
  **QA Scenarios** (MANDATORY):
  ```
  Scenario: SKILL.md structure validation
    Tool: Bash
    Steps:
      1. Read ~/.config/opencode/skill/frontend-design-orchestrator/SKILL.md
      2. Count lines
      3. Check for YAML frontmatter (--- at start)
      4. Grep for "name:" and "description:"
    Expected: File exists, <300 lines, has frontmatter with name and description
    Evidence: .sisyphus/evidence/task-4-skill-check.txt
  
  Scenario: Trigger description check
    Tool: Bash
    Steps:
      1. Grep description field from SKILL.md
      2. Check if starts with "Use when"
      3. Check if includes "design system", "DESIGN.md", "front-end design"
    Expected: Description has proper trigger conditions
    Evidence: .sisyphus/evidence/task-4-trigger-check.txt
  ```
  
  **Commit**: YES | Message: `feat(frontend-design-orchestrator): add minimal skill metadata` | Files: [~/.config/opencode/skill/frontend-design-orchestrator/SKILL.md]

- [ ] 5. Create DESIGN.md Template

  **What to do**:
  - Create `references/design-md-template.md`
  - Include all 9 standard sections with placeholders
  - Sections: Visual Theme, Color Palette, Typography, Components, Layout, Depth, Icon System, Responsive, Review Log
  
  **Must NOT do**:
  - Do not fill in with specific values (it's a template)
  - Do not skip any of the 9 sections
  
  **Recommended Agent Profile**:
  - Category: `quick` - Reason: Creating template document
  - Skills: [] - No special skills needed
  - Omitted: [] - None relevant
  
  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 8,10 | Blocked By: 1
  
  **References**:
  - Pattern: `https://github.com/VoltAgent/awesome-design-md/tree/main/design-md` - Sample DESIGN.md files
  - Format: `https://stitch.withgoogle.com/docs/design-md/format/` - Official DESIGN.md format
  
  **Acceptance Criteria** (agent-executable only):
  - [ ] File exists at `~/.config/opencode/skill/frontend-design-orchestrator/references/design-md-template.md`
  - [ ] Contains all 9 section headers
  - [ ] Each section has placeholder text or structure
  
  **QA Scenarios** (MANDATORY):
  ```
  Scenario: Template completeness check
    Tool: Bash
    Steps:
      1. Read ~/.config/opencode/skill/frontend-design-orchestrator/references/design-md-template.md
      2. Grep for each section: "Visual Theme", "Color Palette", "Typography", "Components", "Layout", "Depth", "Icon System", "Responsive", "Review Log"
    Expected: All 9 sections present
    Evidence: .sisyphus/evidence/task-5-template-check.txt
  ```
  
  **Commit**: YES | Message: `feat(frontend-design-orchestrator): add DESIGN.md template` | Files: [references/design-md-template.md]

- [ ] 6. Create Design Sources Reference

  **What to do**:
  - Create `references/design-sources.md`
  - Document how to use awesome-design-md samples
  - Document ui-skills.com capability boundaries
  - Include sample style snippets (minimalism, glassmorphism, brutalism)
  
  **Must NOT do**:
  - Do not copy entire DESIGN.md files from awesome-design-md (link instead)
  - Do not create exhaustive style catalog
  
  **Recommended Agent Profile**:
  - Category: `quick` - Reason: Creating reference documentation
  - Skills: [] - No special skills needed
  - Omitted: [] - None relevant
  
  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: none | Blocked By: 1
  
  **References**:
  - Source: `https://github.com/VoltAgent/awesome-design-md` - DESIGN.md collection
  - Source: `https://ui-skills.com/` - Skills aggregation
  
  **Acceptance Criteria** (agent-executable only):
  - [ ] File exists at `~/.config/opencode/skill/frontend-design-orchestrator/references/design-sources.md`
  - [ ] Includes guidance for awesome-design-md usage
  - [ ] Includes ui-skills.com boundaries
  - [ ] Has at least 3 style snippet examples
  
  **QA Scenarios** (MANDATORY):
  ```
  Scenario: Design sources completeness
    Tool: Bash
    Steps:
      1. Read ~/.config/opencode/skill/frontend-design-orchestrator/references/design-sources.md
      2. Grep for "awesome-design-md", "ui-skills.com"
      3. Grep for style names: "minimalism", "glassmorphism", "brutalism"
    Expected: All sources documented, at least 3 styles present
    Evidence: .sisyphus/evidence/task-6-sources-check.txt
  ```
  
  **Commit**: YES | Message: `feat(frontend-design-orchestrator): add design sources reference` | Files: [references/design-sources.md]

- [ ] 7. Create Icon Systems Reference

  **What to do**:
  - Create `references/icon-systems.md`
  - Document better-icons usage for icon retrieval
  - Document Ant Design icons naming and semantics
  - Document iconfont.cn as supplementary source
  - Include naming conventions, size scales, color rules
  
  **Must NOT do**:
  - Do not make network calls mandatory
  - Do not create exhaustive icon catalog
  
  **Recommended Agent Profile**:
  - Category: `quick` - Reason: Creating reference documentation
  - Skills: [] - No special skills needed
  - Omitted: [] - None relevant
  
  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 9 | Blocked By: 1
  
  **References**:
  - Source: `https://github.com/better-auth/better-icons` - Icon retrieval tool
  - Source: `https://github.com/ant-design/ant-design-cli` - Ant Design knowledge
  - Source: `https://www.iconfont.cn/` - Chinese icon resource
  
  **Acceptance Criteria** (agent-executable only):
  - [ ] File exists at `~/.config/opencode/skill/frontend-design-orchestrator/references/icon-systems.md`
  - [ ] Documents all 3 icon sources with usage guidance
  - [ ] Includes naming convention rules
  - [ ] Includes size scale definition
  
  **QA Scenarios** (MANDATORY):
  ```
  Scenario: Icon systems documentation check
    Tool: Bash
    Steps:
      1. Read ~/.config/opencode/skill/frontend-design-orchestrator/references/icon-systems.md
      2. Grep for "better-icons", "ant-design", "iconfont"
      3. Grep for "naming", "size", "prefix"
    Expected: All 3 sources documented with naming and size guidance
    Evidence: .sisyphus/evidence/task-7-icons-check.txt
  ```
  
  **Commit**: YES | Message: `feat(frontend-design-orchestrator): add icon systems reference` | Files: [references/icon-systems.md]

- [ ] 8. Create Review Rules Reference

  **What to do**:
  - Create `references/review-rules.md`
  - Extract Vercel Web Design Guidelines checklist
  - Define severity levels (critical, major, minor)
  - Define revision workflow (how to apply fixes)
  - Include example violations and corrections
  
  **Must NOT do**:
  - Do not create exhaustive accessibility audit checklist
  - Do not expand beyond Vercel guidelines scope
  
  **Recommended Agent Profile**:
  - Category: `quick` - Reason: Creating reference documentation
  - Skills: [] - No special skills needed
  - Omitted: [] - None relevant
  
  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: 10 | Blocked By: 4-7
  
  **References**:
  - Source: Vercel Web Design Guidelines (use webfetch to extract key points)
  - Pattern: `C:\Users\HP\.config\opencode\skill\web-design-guidelines\SKILL.md` - Review-oriented skill
  
  **Acceptance Criteria** (agent-executable only):
  - [ ] File exists at `~/.config/opencode/skill/frontend-design-orchestrator/references/review-rules.md`
  - [ ] Includes checklist items from Vercel guidelines
  - [ ] Defines severity levels with examples
  - [ ] Defines revision workflow steps
  
  **QA Scenarios** (MANDATORY):
  ```
  Scenario: Review rules completeness
    Tool: Bash
    Steps:
      1. Read ~/.config/opencode/skill/frontend-design-orchestrator/references/review-rules.md
      2. Grep for "critical", "major", "minor"
      3. Grep for "accessibility", "performance", "responsive"
      4. Grep for "workflow", "revision"
    Expected: Severity levels defined, key review areas covered, workflow present
    Evidence: .sisyphus/evidence/task-8-review-check.txt
  ```
  
  **Commit**: YES | Message: `feat(frontend-design-orchestrator): add review rules reference` | Files: [references/review-rules.md]

- [ ] 9. Implement Icon Conflict Resolution Logic

  **What to do**:
  - Add icon conflict detection rules to SKILL.md or references/icon-systems.md
  - Define how to detect conflicts (same name, different source)
  - Define resolution strategy (prefix-based namespacing)
  - Define output format for conflict report
  
  **Must NOT do**:
  - Do not implement actual icon downloading
  - Do not create complex AST-based detection
  
  **Recommended Agent Profile**:
  - Category: `quick` - Reason: Adding logic to existing documentation
  - Skills: [] - No special skills needed
  - Omitted: [] - None relevant
  
  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: none | Blocked By: 7
  
  **References**:
  - Pattern: `C:\Users\HP\.config\opencode\skill\baoyu-infographic\SKILL.md` - How to structure multi-source logic
  - Source: `https://github.com/better-auth/better-icons` - Icon naming conventions
  
  **Acceptance Criteria** (agent-executable only):
  - [ ] Icon conflict detection rules documented
  - [ ] Resolution strategy documented with examples
  - [ ] Conflict report format defined
  
  **QA Scenarios** (MANDATORY):
  ```
  Scenario: Icon conflict logic check
    Tool: Bash
    Steps:
      1. Read ~/.config/opencode/skill/frontend-design-orchestrator/references/icon-systems.md
      2. Grep for "conflict", "resolution", "namespace", "prefix"
    Expected: Conflict detection and resolution logic documented
    Evidence: .sisyphus/evidence/task-9-conflict-check.txt
  ```
  
  **Commit**: YES | Message: `feat(frontend-design-orchestrator): add icon conflict resolution` | Files: [references/icon-systems.md]

- [ ] 10. Implement Vercel Review Workflow

  **What to do**:
  - Add review workflow to SKILL.md Quick Start section
  - Define how to invoke Vercel guidelines check
  - Define how to generate problem list
  - Define how to update DESIGN.md based on review
  - Define review log format in DESIGN.md
  
  **Must NOT do**:
  - Do not expand into full accessibility audit platform
  - Do not create automated fixes without user confirmation
  
  **Recommended Agent Profile**:
  - Category: `quick` - Reason: Updating workflow documentation
  - Skills: [] - No special skills needed
  - Omitted: [] - None relevant
  
  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: 11-14 | Blocked By: 8
  
  **References**:
  - Pattern: `C:\Users\HP\.config\opencode\skill\web-design-guidelines\SKILL.md` - Review workflow pattern
  - Source: Vercel Web Design Guidelines
  
  **Acceptance Criteria** (agent-executable only):
  - [ ] Review workflow documented in SKILL.md
  - [ ] Problem list format defined
  - [ ] DESIGN.md update process documented
  - [ ] Review log template included in design-md-template.md
  
  **QA Scenarios** (MANDATORY):
  ```
  Scenario: Review workflow check
    Tool: Bash
    Steps:
      1. Read ~/.config/opencode/skill/frontend-design-orchestrator/SKILL.md
      2. Grep for "review", "Vercel", "problem list", "revision"
      3. Read ~/.config/opencode/skill/frontend-design-orchestrator/references/design-md-template.md
      4. Grep for "Review Log"
    Expected: Review workflow in SKILL.md, Review Log section in template
    Evidence: .sisyphus/evidence/task-10-workflow-check.txt
  ```
  
  **Commit**: YES | Message: `feat(frontend-design-orchestrator): add Vercel review workflow` | Files: [SKILL.md, references/design-md-template.md]

- [ ] 11. Create Complete Eval Test Suite

  **What to do**:
  - Update `evals/evals.json` with assertions for all 6 scenarios
  - Add 2 more scenarios: (7) offline mode, (8) trigger precision (negative)
  - Define assertions for each scenario
  - Create eval_metadata.json for each scenario
  
  **Must NOT do**:
  - Do not create fewer than 8 total scenarios
  - Do not leave assertions empty
  
  **Recommended Agent Profile**:
  - Category: `deep` - Reason: Test design requires careful thought
  - Skills: [] - No special skills needed
  - Omitted: [] - None relevant
  
  **Parallelization**: Can Parallel: NO | Wave 4 | Blocks: 12-14 | Blocked By: 10
  
  **References**:
  - Schema: `C:\Users\HP\.config\opencode\skill\skill-creator\references\schemas.md` - Eval JSON structure
  - Pattern: `C:\Users\HP\.config\opencode\skill\skill-creator\agents\grader.md` - How to write assertions
  
  **Acceptance Criteria** (agent-executable only):
  - [ ] `evals/evals.json` has 8 scenarios with assertions
  - [ ] Each scenario has eval_metadata.json
  - [ ] Assertions are specific and testable
  - [ ] Negative scenarios test for absence of wrong outputs
  
  **QA Scenarios** (MANDATORY):
  ```
  Scenario: Eval suite completeness
    Tool: Bash
    Steps:
      1. Read evals/evals.json
      2. Count scenarios
      3. For each scenario, check assertions field exists and is non-empty
    Expected: Exactly 8 scenarios, all with assertions
    Evidence: .sisyphus/evidence/task-11-evals-complete.txt
  ```
  
  **Commit**: YES | Message: `test(frontend-design-orchestrator): add complete eval test suite` | Files: [evals/evals.json, eval_metadata.json files]

- [ ] 12. Run With-Skill Evals and Compare

  **What to do**:
  - Run all 8 scenarios with the skill loaded
  - Capture timing and outputs
  - Compare to baseline runs
  - Calculate pass rate and delta
  
  **Must NOT do**:
  - Do not skip baseline comparison
  - Do not run scenarios sequentially if they can be parallelized
  
  **Recommended Agent Profile**:
  - Category: `deep` - Reason: Running and analyzing evaluations
  - Skills: [] - No special skills needed
  - Omitted: [] - None relevant
  
  **Parallelization**: Can Parallel: NO | Wave 4 | Blocks: 13-14 | Blocked By: 11
  
  **References**:
  - Pattern: `C:\Users\HP\.config\opencode\skill\skill-creator\SKILL.md:200-300` - How to run evals
  - Tool: `C:\Users\HP\.config\opencode\skill\skill-creator\scripts\run_eval.py`
  
  **Acceptance Criteria** (agent-executable only):
  - [ ] All 8 scenarios run with skill loaded
  - [ ] Each run has timing.json and outputs/
  - [ ] Pass rate calculated (must be ≥80%)
  - [ ] Delta from baseline calculated (must be ≥20%)
  
  **QA Scenarios** (MANDATORY):
  ```
  Scenario: Eval run completeness
    Tool: Bash
    Steps:
      1. List with-skill-runs/ directory
      2. Count run directories
      3. For each, check timing.json exists
    Expected: 8 run directories, each with timing.json
    Evidence: .sisyphus/evidence/task-12-runs-complete.txt
  
  Scenario: Pass rate check
    Tool: Bash
    Steps:
      1. Run grading.json aggregation
      2. Calculate pass rate
    Expected: Pass rate ≥ 80%
    Evidence: .sisyphus/evidence/task-12-pass-rate.txt
  ```
  
  **Commit**: YES | Message: `test(frontend-design-orchestrator): run with-skill evals` | Files: [with-skill-runs/*]

- [ ] 13. Generate Benchmark and Viewer Report

  **What to do**:
  - Run aggregate_benchmark.py to create benchmark.json and benchmark.md
  - Run generate_review.py to create viewer HTML
  - Launch viewer for human review
  - Capture feedback from feedback.json
  
  **Must NOT do**:
  - Do not skip the viewer generation
  - Do not auto-close viewer before user reviews
  
  **Recommended Agent Profile**:
  - Category: `deep` - Reason: Generating and presenting evaluation results
  - Skills: [] - No special skills needed
  - Omitted: [] - None relevant
  
  **Parallelization**: Can Parallel: NO | Wave 4 | Blocks: 14 | Blocked By: 12
  
  **References**:
  - Tool: `C:\Users\HP\.config\opencode\skill\skill-creator\scripts\aggregate_benchmark.py`
  - Tool: `C:\Users\HP\.config\opencode\skill\skill-creator\eval-viewer\generate_review.py`
  
  **Acceptance Criteria** (agent-executable only):
  - [ ] benchmark.json created with comparison data
  - [ ] benchmark.md created with human-readable summary
  - [ ] Viewer HTML generated and launched
  - [ ] feedback.json captured with user comments
  
  **QA Scenarios** (MANDATORY):
  ```
  Scenario: Benchmark generation
    Tool: Bash
    Steps:
      1. Run python -m skill_creator.scripts.aggregate_benchmark <workspace>
      2. Check benchmark.json exists
      3. Check benchmark.md exists
    Expected: Both files created with valid content
    Evidence: .sisyphus/evidence/task-13-benchmark.txt
  ```
  
  **Commit**: YES | Message: `test(frontend-design-orchestrator): generate benchmark and viewer` | Files: [benchmark.json, benchmark.md]

- [ ] 14. Iterate Based on Feedback

  **What to do**:
  - Read feedback.json from viewer
  - Identify issues raised by user
  - Update SKILL.md, references, or evals as needed
  - Re-run failed scenarios
  - Update benchmark comparison
  
  **Must NOT do**:
  - Do not ignore user feedback
  - Do not declare success without addressing feedback
  
  **Recommended Agent Profile**:
  - Category: `deep` - Reason: Requires understanding feedback and making targeted improvements
  - Skills: [] - No special skills needed
  - Omitted: [] - None relevant
  
  **Parallelization**: Can Parallel: NO | Wave 4 | Blocks: 15-18 | Blocked By: 13
  
  **References**:
  - Pattern: `C:\Users\HP\.config\opencode\skill\skill-creator\SKILL.md:300-400` - Iteration loop
  
  **Acceptance Criteria** (agent-executable only):
  - [ ] All feedback items addressed
  - [ ] Updated files have commits
  - [ ] Re-run shows improved pass rate
  - [ ] New benchmark comparison generated
  
  **QA Scenarios** (MANDATORY):
  ```
  Scenario: Feedback resolution
    Tool: Bash
    Steps:
      1. Read feedback.json
      2. For each feedback item, grep for related fix in git log
    Expected: Each feedback item has corresponding commit
    Evidence: .sisyphus/evidence/task-14-feedback.txt
  
  Scenario: Improvement check
    Tool: Bash
    Steps:
      1. Compare old and new benchmark.json pass rates
    Expected: New pass rate ≥ old pass rate
    Evidence: .sisyphus/evidence/task-14-improvement.txt
  ```
  
  **Commit**: YES | Message: `refactor(frontend-design-orchestrator): address review feedback` | Files: [varies based on feedback]

## Final Verification Wave (MANDATORY — after ALL implementation tasks)
> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.

- [ ] F1. Plan Compliance Audit — oracle

  **What to do**: Verify that all TODOs were completed as specified in the plan. Check that all acceptance criteria were met.
  
  **Recommended Agent Profile**:
  - Category: `oracle` - Reason: High-IQ reasoning for compliance verification
  
  **Parallelization**: Can Parallel: YES | Wave 5 | Blocks: none | Blocked By: 14
  
  **Acceptance Criteria**:
  - [ ] All 14 TODOs marked complete
  - [ ] All acceptance criteria verified
  - [ ] No deviations from plan without documented justification
  
  **QA Scenarios**:
  ```
  Scenario: Plan compliance check
    Tool: Read + Grep
    Steps:
      1. Read all evidence files
      2. Check each TODO has corresponding evidence
    Expected: Every TODO has passing evidence
    Evidence: .sisyphus/evidence/F1-compliance.txt
  ```

- [ ] F2. Code Quality Review — unspecified-high

  **What to do**: Review SKILL.md and all reference files for clarity, correctness, and adherence to skill-writing best practices.
  
  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: Thorough review requiring attention to detail
  
  **Parallelization**: Can Parallel: YES | Wave 5 | Blocks: none | Blocked By: 14
  
  **Acceptance Criteria**:
  - [ ] SKILL.md < 300 lines
  - [ ] All references follow consistent formatting
  - [ ] No contradictions or ambiguities
  - [ ] Clear separation of template vs generated output
  
  **QA Scenarios**:
  ```
  Scenario: Code quality check
    Tool: Bash
    Steps:
      1. Count lines in SKILL.md
      2. Check formatting consistency
    Expected: SKILL.md < 300 lines, consistent formatting
    Evidence: .sisyphus/evidence/F2-quality.txt
  ```

- [ ] F3. Real Manual QA — unspecified-high

  **What to do**: Actually use the skill to generate a DESIGN.md for a test project. Verify the workflow works end-to-end.
  
  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: Hands-on QA execution
  
  **Parallelization**: Can Parallel: YES | Wave 5 | Blocks: none | Blocked By: 14
  
  **Acceptance Criteria**:
  - [ ] Skill successfully invoked
  - [ ] DESIGN.md generated with all 9 sections
  - [ ] Icon system selected and documented
  - [ ] Vercel review completed
  
  **QA Scenarios**:
  ```
  Scenario: End-to-end workflow test
    Tool: Interactive
    Steps:
      1. Invoke skill with test prompt
      2. Verify DESIGN.md created
      3. Run review workflow
    Expected: Complete workflow succeeds
    Evidence: .sisyphus/evidence/F3-manual-qa.txt
  ```

- [ ] F4. Scope Fidelity Check — deep

  **What to do**: Verify the skill stays within scope. Check that it doesn't generate implementation code, doesn't require network access for core workflow, and maintains clear boundaries.
  
  **Recommended Agent Profile**:
  - Category: `deep` - Reason: Requires understanding intent vs execution
  
  **Parallelization**: Can Parallel: YES | Wave 5 | Blocks: none | Blocked By: 14
  
  **Acceptance Criteria**:
  - [ ] No implementation code generation
  - [ ] Core workflow works offline
  - [ ] Clear non-goals documented
  - [ ] No scope drift from original request
  
  **QA Scenarios**:
  ```
  Scenario: Scope boundary test
    Tool: Bash
    Steps:
      1. Try to trigger implementation code generation
      2. Verify skill declines or redirects
    Expected: Skill maintains scope boundaries
    Evidence: .sisyphus/evidence/F4-scope.txt
  ```

## Commit Strategy

All commits follow atomic pattern:
1. `test(frontend-design-orchestrator): add RED baseline scenarios and expected failure rubric`
2. `feat(frontend-design-orchestrator): add minimal skill skeleton and trigger metadata`
3. `feat(frontend-design-orchestrator): add DESIGN template and source-reference files`
4. `feat(frontend-design-orchestrator): add icon selection and conflict-resolution guidance`
5. `feat(frontend-design-orchestrator): add Vercel review and revision workflow`
6. `test(frontend-design-orchestrator): add positive, negative, review-only, and update evals`
7. `docs(frontend-design-orchestrator): document boundaries, provenance, and maintenance rules`

**Commit rule**: No commit may mix new capability with unrelated documentation or evaluation changes.

## Success Criteria

1. **Functional**: Skill generates complete DESIGN.md with all 9 sections
2. **Performance**: Eval pass rate ≥80% AND ≥20% improvement over baseline
3. **Quality**: SKILL.md < 300 lines, all references complete
4. **Verification**: All 4 final verification agents approve
5. **User Approval**: Explicit "okay" from user after final verification wave