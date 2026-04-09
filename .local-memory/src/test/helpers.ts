import { Database } from 'bun:sqlite';
import { resolve } from 'node:path';

export async function createTestDatabase(): Promise<Database> {
  const database = new Database(':memory:');
  const schemaPath = resolve(import.meta.dir, '..', '..', 'schema', 'v1-database.sql');
  const schema = await Bun.file(schemaPath).text();

  database.exec(schema);

  return database;
}
