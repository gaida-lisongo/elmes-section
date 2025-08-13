const db = require("../service/Database");

class Model {
  constructor() {
    this.db = db;
  }

  async lastInsertId() {
    try{
        const [row] = await this.db.query("SELECT LAST_INSERT_ID() AS lastId");
        return row.lastId;
    } catch (error) {
        console.error('Error from last insert ID : ', error);
        return error.message;
    }
  }

  async request(sql, params) {
    try{
        const [rows] = await this.db.query(sql, params);
        return rows;
    } catch (error){
        console.error(`Error from request : ${error}`);
        return error.message;
    }
  }

  async search(keyword, table) {
    try{
        const sql = `SELECT * FROM ${table} WHERE name LIKE ?`;
        return this.request(sql, [`%${keyword}%`]);
    } catch (error) {
        console.error(`Error from search : ${error}`);
        return error.message;
    }
  }
}

module.exports = Model;
