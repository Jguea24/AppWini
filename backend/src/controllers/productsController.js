const { getAllProducts, getProductById } = require('../services/productsService');

async function listProducts(req, res) {
  const { type, cacaoMin, cacaoMax } = req.query;
  const products = await getAllProducts({
    type,
    cacaoMin: cacaoMin ? Number(cacaoMin) : undefined,
    cacaoMax: cacaoMax ? Number(cacaoMax) : undefined,
  });
  res.json(products);
}

async function showProduct(req, res) {
  const id = Number(req.params.id);
  const product = await getProductById(id);
  if (!product) {
    res.status(404).json({ message: 'Producto no encontrado' });
    return;
  }
  res.json(product);
}

module.exports = { listProducts, showProduct };
