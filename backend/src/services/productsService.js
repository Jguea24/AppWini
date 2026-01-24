const { openDb, all, get } = require('../db');

async function getAllProducts({ type, cacaoMin, cacaoMax }) {
  const db = await openDb();
  const filters = [];
  const params = [];

  if (type) {
    filters.push('type = ?');
    params.push(type);
  }
  if (Number.isFinite(cacaoMin)) {
    filters.push('cacao_percent >= ?');
    params.push(cacaoMin);
  }
  if (Number.isFinite(cacaoMax)) {
    filters.push('cacao_percent <= ?');
    params.push(cacaoMax);
  }

  const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const rows = await all(db, `SELECT * FROM products ${whereClause}`, params);
  db.close();
  return rows;
}

async function getProductById(id) {
  const db = await openDb();
  const row = await get(db, 'SELECT * FROM products WHERE id = ?', [id]);
  db.close();
  return row;
}

module.exports = { getAllProducts, getProductById };
