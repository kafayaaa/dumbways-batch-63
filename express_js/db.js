import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "user123",
  port: 5432,
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error("Connection failed:", err.stack);
  }
  console.log("Connected to the database");
  release();
});

export default pool;
