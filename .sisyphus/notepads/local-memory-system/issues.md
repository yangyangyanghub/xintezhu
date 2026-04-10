# Local Memory System Issues

## 2026-04-10
- `lsp_diagnostics` could not run for modified TypeScript files because the environment is missing `typescript-language-server`; verification relied on Bun test execution instead.
- Full `bun test` still has a pre-existing unrelated failure in `src/test/event-contract.test.ts` because `.local-memory/contracts/v1-event-schema.json` is missing (`ENOENT`). The new projection/cleanup contract tests pass independently.
