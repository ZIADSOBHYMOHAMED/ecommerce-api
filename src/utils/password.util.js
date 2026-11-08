const bcrypt = require("bcrypt");

const hashPassword = async (plainPassword) => {
  // Updated: Use a safe bcrypt work factor when SALT_ROUNDS is not configured.
  const saltrounds = Number(process.env.SALT_ROUNDS || 12);
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
