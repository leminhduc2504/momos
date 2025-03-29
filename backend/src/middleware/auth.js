const basicAuth = require('basic-auth');

const authMiddleware = (req, res, next) => {
  const user = basicAuth(req);

  const username = process.env.AUTH_USERNAME || 'admin';
  const password = process.env.AUTH_PASSWORD || 'password';

  if (!user || user.name !== username || user.pass !== password) {
    res.set('WWW-Authenticate', 'Basic realm="Authorization Required"');
    return res.status(401).send('Authentication required');
  }

  next();
};

module.exports = { authMiddleware };