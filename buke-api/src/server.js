import { app } from "./app.js";
import { config } from "./config.js";
import { pool } from "./db.js";

const start = async () => {
  await pool.query("SELECT 1");

  app.listen(config.port, () => {
    console.log(`Bukë API listening on port ${config.port}`);
  });
};

start().catch((error) => {
  console.error("Failed to start Bukë API", error);
  process.exit(1);
});
