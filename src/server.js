const app = require("./app");
const pool = require("./config/db.config");
const env=require("./config/env.js")
const startServer = async () => {
  try {
    // Added: Fail at startup when required connection/auth settings are missing instead of failing on live requests.
    if (!env.databaseUrl || !env.jwt.jwtSecret || !env.jwt.jwtExpiresIn) {
      throw new Error("DATABASE_URL, JWT_SECRET, and JWT_EXPIRES_IN must be configured");
    }

    await pool.query("select 1");

    console.log("postegresql connecting successfuly");

    app.listen(env.port, () => {
      console.log(`server is running on server ${env.port}`);
    });
  } catch (error) {
    console.error("database connection failed ");
    console.error(error.message);

    process.exit(1);
  }
};

startServer();
