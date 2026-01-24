const path = require('path');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 0),
  user: process.env.DB_USER || 'wini',
  password: process.env.DB_PASSWORD || 'wini',
  name: process.env.DB_NAME || 'wini',
  file: process.env.DB_FILE || './data/wini.db',
};

const dbPath = path.isAbsolute(config.file)
  ? config.file
  : path.join(__dirname, '../../', config.file);

function openDb() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, error => {
      if (error) {
        reject(error);
        return;
      }
      resolve(db);
    });
  });
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (error) {
      if (error) {
        reject(error);
        return;
      }
      resolve(this);
    });
  });
}

function all(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(rows);
    });
  });
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(row);
    });
  });
}

module.exports = { openDb, run, all, get, config };
