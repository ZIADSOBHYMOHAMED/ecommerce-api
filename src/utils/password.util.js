const bcrypt = require("bcrypt");

const hashPassword = async (plainPassword) => {
  const saltrounds = Number(process.env.SALT_ROUNDS);
  const hashedPassword = await bcrypt.hash(plainPassword, saltrounds);
  return hashedPassword;
};

const comparePassword = async (plainPassword, hashedPassword) => {
  const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
  return isMatch;
};

module.exports = {
  hashPassword,
  comparePassword,
};
