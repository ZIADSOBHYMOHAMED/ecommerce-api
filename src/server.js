const app = require("./app");
const pool = require("./config/db.config");
const env=require("./config/env.js")
const startServer = async () => {
  try {
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
