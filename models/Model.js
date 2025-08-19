const db = require("../service/Database");

class Model {
  constructor() {
    this.db = db;
  }

  async lastInsertId() {
    try {
      const result = await this.db.query("SELECT LAST_INSERT_ID() AS lastId");

      // Vérifier la structure du résultat et extraire l'ID
      if (Array.isArray(result) && result[0]) {
        return result[0].lastId || (result[0][0] && result[0][0].lastId);
      } else if (result && result.lastId) {
        return result.lastId;
      }

      // Si la structure est différente, chercher dans d'autres formats possibles
      return result && typeof result === "object"
        ? result.insertId || result.lastId || 0
        : 0;
    } catch (error) {
      console.error("Error from last insert ID : ", error);
      return error.message;
    }
  }

  async request(sql, params) {
    try {
      const result = await this.db.query(sql, params);
      
      // Gestion des différentes structures de résultat possibles
      if (Array.isArray(result)) {
        // Si le résultat est déjà un tableau (certains drivers MySQL)
        return result;
      } else if (result && Array.isArray(result[0])) {
        // Structure [rows, fields] (format mysql2)
        return result[0];
      } else if (result && result.rows) {
        // Structure { rows, fields } (certains drivers)
        return result.rows;
      } else {
        // Autre format ou résultat simple
        return result;
      }
    } catch (error) {
      console.error(`Error from request : ${error}`);
      return error.message;
    }
  }

  async search(keyword, table) {
    try {
      const sql = `SELECT * FROM ${table} WHERE name LIKE ?`;
      return await this.request(sql, [`%${keyword}%`]);
    } catch (error) {
      console.error(`Error from search : ${error}`);
      return error.message;
    }
  }
}

module.exports = Model;
