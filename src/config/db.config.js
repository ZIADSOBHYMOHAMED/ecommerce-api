const { Pool } = require("pg");
const env=require("./env.js")
const pool = new Pool({
 connectionString:env.databaseUrl
});

module.exports = pool;
