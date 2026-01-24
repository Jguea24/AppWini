const { findUserByEmail, createUser, validateCredentials, issueToken } = require('../services/authService');

async function register(req, res) {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    res.status(400).json({ message: 'Datos incompletos' });
    return;
  }
  const existing = await findUserByEmail(email);
  if (existing) {
    res.status(409).json({ message: 'Ya existe un usuario con ese correo' });
    return;
  }
  const user = await createUser({ name, email, password, role });
  const token = issueToken();
  res.json({ token, user });
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: 'Credenciales incompletas' });
    return;
  }
  const user = await validateCredentials(email, password);
  if (!user) {
    res.status(401).json({ message: 'Credenciales invalidas' });
    return;
  }
  const token = issueToken();
  res.json({ token, user });
}

module.exports = { register, login };
