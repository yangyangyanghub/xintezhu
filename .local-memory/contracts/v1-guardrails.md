# V1 Guardrails

## Out-of-Scope Items (Explicitly Excluded)

### Cloud & Distributed Features
- **NO cloud sync** - V1 is strictly local-only
- **NO remote multi-user support** - Single user on single machine only
- **NO distributed deployment** - No clustering, sharding, or replication

### UI & Dashboard
- **NO dashboard** - No web-based management interface
- **NO graph visualization UI** - Relations exist in data only, no visual graph explorer
- **NO real-time monitoring dashboard**

### Adapter-Side Logic
- **NO classification in adapter** - Classification happens in Memory Core only
- **NO promotion in adapter** - Promotion decisions made by Memory Core
- **NO ranking in adapter** - Ranking happens in retrieval layer
- **NO graph logic in adapter** - Relations managed by Memory Core

### Write Patterns
- **NO Markdown-as-truth** - Markdown projection is read-only, never syncs back to DB
- **NO direct semantic/core writes from events** - Events → classifier → working/episodic only
- **NO direct .memory/ writes from adapter** - Projection engine owns all Markdown writes

## V1 Deployment Scope

- **One local user** on **one machine**
- **OpenCode** as the first and primary adapter
- **Generic core API** for future adapter expansion (but only OpenCode implemented in V1)

## Supported Event Types

1. `message.updated` - User/assistant messages
2. `file.edited` - File modifications
3. `session.idle` - Session completion
4. `session.compacted` - Memory consolidation trigger
5. `git.commit` - Version control events
6. `test.result` - Test execution results
7. `build.result` - Build process results

## Unsupported Event Types (V1)

- Command history telemetry
- Search query logging
- Agent reasoning traces
- Raw tool payload archives
- Network request logs
- Performance metrics

## Memory State Transitions

```
new → active (on classification)
active → superseded (on update/derives)
active → forgotten (on explicit forget)
active → archived (on expiration)
any → reverted (on rollback)
```

All transitions are auditable and reversible (where policy allows).
