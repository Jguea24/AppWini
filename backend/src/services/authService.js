const { openDb, run, get } = require('../db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

async function findUserByEmail(email) {
  const db = await openDb();
  const user = await get(db, 'SELECT * FROM users WHERE email = ?', [email]);
  db.close();
  return user;
}

async function createUser({ name, email, password, role }) {
  const db = await openDb();
  const passwordHash = await bcrypt.hash(password, 10);
  await run(db, 'INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)', [
    name,
    email,
    passwordHash,
    role,
  ]);
  const user = await get(db, 'SELECT id, name, email, role FROM users WHERE email = ?', [email]);
  db.close();
  return user;
}

async function validateCredentials(email, password) {
  const db = await openDb();
  const user = await get(db, 'SELECT * FROM users WHERE email = ?', [email]);
  db.close();
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return null;
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

function issueToken() {
  return crypto.randomUUID();
}

module.exports = { findUserByEmail, createUser, validateCredentials, issueToken };
