const jwt = require("jsonwebtoken");
const env = require("../config/env");

const generateToken = (payload) => {
  return jwt.sign(payload, env.jwt.jwtSecret, {
    expiresIn: env.jwt.jwtExpiresIn,
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, env.jwt.jwtSecret);
};

module.exports = {
  generateToken,
  verifyToken,
};
