const path = require('path');
const fs = require('fs');
const { openDb, run } = require('./index');

async function init() {
  const db = await openDb();
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  const statements = schema
    .split(/;\s*\n/)
    .map(s => s.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await run(db, statement);
  }

  db.close();
  console.log('Database initialized');
}

init().catch(error => {
  console.error('Database init failed', error);
  process.exit(1);
});
