const Model = require("./Model");

class Retrait extends Model {
  constructor() {
    super();
  }

  async getAll() {
    const sql = `SELECT * FROM retrait`;
    const results = await this.request(sql);
    return results;
  }

  async findById(id) {
    const sql = `SELECT * FROM retrait WHERE id = ?`;
    const results = await this.request(sql, [id]);
    return results[0];
  }

  async findByAgentId(agentId) {
    const sql = `SELECT * FROM retrait WHERE id_agent = ?`;
    const results = await this.request(sql, [agentId]);
    return results;
  }

  async searchByReference(reference){
    return this.search(reference, 'retrait');
  }

  async create({
    id_agent,
    montant
  }){
    const sql = `INSERT INTO retrait (id_agent, montant) VALUES (?, ?)`;
    await this.request(sql, [id_agent, montant]);
    return this.lastInsertId();
  }

  async update(id, {column, value}){
    const sql = `UPDATE retrait SET ${column} = ? WHERE id = ?`;
    await this.request(sql, [value, id])
  }
}

module.exports = Retrait;
