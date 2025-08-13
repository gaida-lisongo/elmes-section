const mysql = require("mysql2/promise");
require("dotenv").config();

class Database {
  constructor() {
    this.pool = null;
    this.connect();
  }

  async connect() {
    const host = process.env.MYSQL_HOST;
    const port = process.env.MYSQL_PORT;
    const user = process.env.MYSQL_USERNAME;
    const password = process.env.MYSQL_PASSWORD;
    const database = process.env.MYSQL_DATABASE;

    console.log(
      `Attempting to connect to MySQL database: ${database} on ${host}:${port} as user: ${user}`
    );

    try {
      // Créer un pool de connexions
      this.pool = mysql.createPool({
        host,
        port: Number(port),
        user,
        password,
        database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });

      // Tester la connexion
      const connection = await this.pool.getConnection();
      connection.release();

      console.log(`Database connected successfully to ${database}`);
    } catch (error) {
      console.error("Database connection error:", error.message);
      console.error(
        "Please check your MySQL connection credentials and server availability"
      );
    }
  }

  async query(sql, params) {
    try {
      const [rows, fields] = await this.pool.execute(sql, params);
      return rows;
    } catch (error) {
      console.error("Error executing query:", error);
      throw error;
    }
  }

  getPool() {
    return this.pool;
  }
}

module.exports = new Database();
