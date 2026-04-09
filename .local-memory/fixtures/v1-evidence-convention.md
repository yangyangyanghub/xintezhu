# Evidence Naming Convention

## Naming Pattern

```
task-{N}-{scenario-slug}.{ext}
```

## Components

| Component | Description | Examples |
|-----------|-------------|----------|
| `task-{N}` | Task number from plan | `task-1`, `task-7`, `final-f1` |
| `{scenario-slug}` | Short descriptive slug | `contract-check`, `valid-ingest`, `batch-rollback` |
| `{ext}` | File extension by content type | `.json`, `.txt`, `.md` |

## Extensions by Content Type

| Content Type | Extension | Example |
|--------------|-----------|---------|
| API responses | `.json` | `task-7-valid-ingest.json` |
| Structured data | `.json` | `task-9-keyword-search.json` |
| Text verification | `.txt` | `task-1-guardrails.txt` |
| Markdown reports | `.md` | `task-16-rebuild-check.md` |
| Evidence archives | `.tar.gz` | `task-19-e2e-evidence.tar.gz` |

## Scenario Slug Conventions

### Contract/Schema Tasks (1-5)
- `contract-check` - Contract completeness
- `guardrails` - Guardrail exclusions
- `schema-check` - Schema coverage
- `boundary-check` - Repository boundaries
- `config-check` - Config validation
- `provider-check` - Provider interfaces
- `projection-policy` - Projection rules
- `target-map` - Target mapping
- `fixtures` - Fixture coverage
- `evidence-naming` - Evidence convention

### Ingest Tasks (6-7)
- `health` - Health endpoint
- `degraded-health` - Degraded mode health
- `valid-ingest` - Valid event ingestion
- `invalid-ingest` - Malformed rejection

### Classification/Retrieval (8-9)
- `preference-classification` - Stable preference
- `noise-filter` - Noise filtering
- `keyword-search` - Keyword retrieval
- `status-filter` - Status filtering

### Governance (10)
- `batch-rollback` - Batch rollback
- `audit-check` - Audit presence

### Provider/Semantic (11-12)
- `provider-status` - Provider selection
- `provider-degraded` - Missing provider
- `hybrid-search` - Hybrid retrieval
- `hybrid-fallback` - Semantic fallback

### Relations/Promotion (13-14)
- `updates` - Updates relation
- `derives` - Derives with evidence
- `promotion-pass` - Promotion success
- `promotion-block` - Promotion blocked

### Context/Projection (15-16)
- `context-budget` - Budget enforcement
- `context-confidence` - Confidence assembly
- `rebuild-check` - Deterministic rebuild
- `rollback-projection` - Rollback updates

### Cleanup/Adapter (17-18)
- `decay` - Episodic decay
- `orphan-relation` - Orphan repair
- `hook-forwarding` - Hook forwarding
- `core-unavailable` - Degraded adapter

### Integration/Runbook (19-20)
- `e2e` - End-to-end lifecycle
- `regression` - Duplicate + rollback
- `runbook-check` - Runbook commands
- `recovery-check` - Recovery procedures

### Final Verification (F1-F4)
- `plan-compliance` - Must-have audit
- `contract-drift` - Contract drift
- `quality-suite` - Test suite
- `boundary-inspection` - Architecture
- `scenario-replay` - Full replay
- `degraded-sweep` - Failure modes
- `scope-containment` - V1 scope
- `boundary-check` - Core reusability

## Storage Location

All evidence files stored in:
```
.sisyphus/evidence/
```

## Example Full Paths

```
.sisyphus/evidence/task-1-contract-check.txt
.sisyphus/evidence/task-7-valid-ingest.json
.sisyphus/evidence/task-10-batch-rollback.json
.sisyphus/evidence/final-f1-plan-compliance.txt
```
