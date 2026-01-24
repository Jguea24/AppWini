CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  cacao_percent INTEGER NOT NULL,
  description TEXT NOT NULL,
  ingredients TEXT NOT NULL,
  price REAL NOT NULL
);

INSERT INTO products (name, type, cacao_percent, description, ingredients, price)
SELECT 'Wini 70%', 'oscuro', 70, 'Chocolate intenso con notas de cacao premium.', 'Cacao, manteca de cacao, azucar de cana', 6.50
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Wini 70%');

INSERT INTO products (name, type, cacao_percent, description, ingredients, price)
SELECT 'Wini 45%', 'leche', 45, 'Suave y cremoso, ideal para compartir.', 'Cacao, leche, manteca de cacao, azucar', 5.25
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Wini 45%');

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL
);
