# Local Memory Projection Policy (V1)

## 1. Core Principles

### 1.1 One-Way Projection (Authoritative Truth)
- **Runtime Truth**: The SQLite database under `.local-memory/` is the sole authoritative source of truth for all memory layers.
- **One-Way Flow**: Data flows exclusively from the Database to Markdown files. 
- **No Back-Sync**: Changes made manually to Markdown files in `.memory/` will **NOT** be synced back to the database in V1.

### 1.2 Deterministic Rebuild
- **Regeneration**: The projection engine can completely delete and regenerate the `.memory/core/` and `.memory/semantic/` directories at any time.
- **Consistency**: Given the same database state, the projection output must be byte-for-byte identical (deterministic).
- **Trigger**: Rebuilds occur on promotion events, manual trigger, or system startup.

### 1.3 Manual-Edit Policy
- **Non-Authoritative**: Users may edit Markdown files for temporary notes or readability, but these edits are **volatile** and will be overwritten during the next rebuild.
- **Human-in-the-loop**: In future versions, a "pull-back" mechanism may be introduced, but for V1, Markdown is "Read-Only" from the system's perspective.

## 2. Target Mapping & Grouping

### 2.1 Core Layer (`.memory/core/`)
Projects stable, high-confidence identity and behavioral patterns.
- **identity.md**: User identity, roles, and core personality traits.
- **preferences.md**: Tooling preferences, communication styles, and environment settings.
- **habits.md**: Recurring behavioral patterns and interaction habits.
- **workflows.md**: Standard operating procedures and core task flows.

### 2.2 Semantic Layer (`.memory/semantic/`)
Projects structured knowledge about projects, decisions, and technical patterns.
- **projects/`{project-name}`.md**: Project-specific context, goals, and status.
- **decisions/`{decision-id}-{slug}`.md**: Architectural choices, rationales, and outcomes.
- **patterns/`{pattern-name}`.md**: Reusable technical patterns and best practices.
- **error-solutions/`{error-code-or-slug}`.md**: Repeated error-solution pairs (Knowledge Base).

## 3. File Naming & Formatting

### 3.1 Naming Conventions
- **Slugs**: Use kebab-case for all filenames (e.g., `error-solutions/git-ssh-timeout.md`).
- **IDs**: Decisions should include a short ID or timestamp prefix for chronological sorting.

### 3.2 Markdown Standards
- **Frontmatter**: Every projected file must include YAML frontmatter with `memory_id`, `updated_at`, and `confidence_score`.
- **Obsidian Compatibility**: Use standard Markdown with support for Wikilinks `[[]]` for cross-memory references.
- **No Noise**: Exclude raw event logs, reasoning traces, or transient working state.

## 4. Stability & Promotion
- Only memories with a status of `active` and a confidence score above the `PROMOTION_THRESHOLD` (default: 0.8) are eligible for projection into the Semantic or Core layers.
- `superseded` or `forgotten` memories are removed from the projection during the next rebuild.
