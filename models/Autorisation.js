const Model = require('./Model');

class Autorisation extends Model {
  constructor() {
    super();
  }

  async getAll() {
    const sql = `SELECT * FROM autorisation`;
    const results = await this.request(sql);

    return results;
  }

  async findById(id) {
    const sql = `SELECT * FROM autorisation WHERE id = ?`;
    const results = await this.request(sql, [id]);

    return results[0];
  }

  async findByAgentId(agentId) {
    const sql = `SELECT * FROM autorisation WHERE id_agent = ?`;
    const results = await this.request(sql, [agentId]);

    return results;
  }

  async searchByPrivilege(privilege) {
    return this.search(privilege, "autorisation");
  }

  async create({ id_agent, privilege }) {
    const sql = `INSERT INTO autorisation(id_agent, privilege) VALUES (?, ?)`;
    await this.request(sql, [id_agent, privilege]);
    return this.lastInsertId();
  }

  async update(id, { column, value }) {
    const sql = `UPDATE autorisation SET ${column} = ? WHERE id = ?`;
    await this.request(sql, [value, id]);
  }

  async delete(id) {
    const sql = `DELETE FROM autorisation WHERE id = ?`;
    await this.request(sql, [id]);
  }
}

module.exports = Autorisation;