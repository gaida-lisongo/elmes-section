const Model = require("./Model");

class Agent extends Model {
  constructor() {
    super();
  }

  async getAll() {
    const sql = `SELECT * FROM agent`;
    const results = await this.request(sql);
    return results;
  }

  async findById(id) {
    const sql = `SELECT * FROM agent WHERE id = ?`;
    const results = await this.request(sql, [id]);
    return results[0];
  }

  async findByAuth({ secure, matricule }) {
    const sql = `SELECT * FROM agent WHERE secure = ? AND matricule = ?`;
    const results = await this.request(sql, [secure, matricule]);
    return results;
  }

  async searchByName(name) {
    return this.search(name, "agent");
  }

  async create({
    nom,
    post_nom,
    prenom,
    sexe,
    date_naissance,
    nationalite,
    e_mail,
    secure,
    matricule,
    photo,
    telephone,
  }) {
    const sql = `INSERT INTO agent (nom, post_nom, prenom, sexe, date_naissance, nationalite, e_mail, secure, matricule, photo, telephone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [
      nom,
      post_nom,
      prenom,
      sexe,
      date_naissance,
      nationalite,
      e_mail,
      secure,
      matricule,
      photo,
      telephone,
    ];

    console.log("Creating agent with SQL:", sql, " and params:", params);
    await this.request(sql, params);
    return this.lastInsertId();
  }

  async update(id, { column, value }) {
    const sql = `UPDATE agent SET ${column} = ? WHERE id = ?`;
    await this.request(sql, [value, id]);
  }
}

module.exports = Agent;
