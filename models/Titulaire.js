const Agent = require('./Agent');

class Titulaire extends Agent {
    constructor(){
        super();
    }

    async getChargesByAgent(id_agent){
        const sql = `SELECT
                c.*,
                e.designation AS 'ecue',
                e.id_unite,
                e.credit,
                u.evaluation,
                u.code,
                s.designation AS 'filiaire',
                CONCAT(a.debut, ' - ', a.fin) AS 'annee'
            FROM charge_horaire c
            INNER JOIN ue_element e ON e.id = c.id_element
            INNER JOIN unite u ON u.id = e.id_unite
            INNER JOIN section s ON s.id = u.id_section
            INNER JOIN annee a ON a.id = c.id_annee
            WHERE c.id_agent = ?`;

        const rows = await this.request(sql, [id_agent]);
        return rows;
    }

    async getJurysByAgent(id_agent){
        const sql = `SELECT 
                    jury.id,
                    jury.designation
                FROM jury
                WHERE jury.id_president = ? OR jury.id_secretaire = ? OR jury.id_membre = ?`;

        const rows = await this.request(sql, [id_agent, id_agent, id_agent]);
        return rows;
    }

    async getCommandesByReference({
        type,
        reference,
        value
    }){
        const sql = `
            SELECT 
                c.*,
                CONCAT(e.nom, ' ', e.post_nom) AS 'nom',
                e.prenom,
                e.matricule,
                e.grade,
                e.nationalite,
                e.date_naissance,
                e.e_mail,
                e.frais_acad,
                e.frais_connexe,
                e.photo,
                e.sexe
            FROM commande_${type} c
            INNER JOIN etudiant e ON e.id = c.id_etudiant
            WHERE c.${reference} = ?
        `;

        const rows = await this.request(sql, [value]);
        return rows;
    }

    async updateCommande({
        type,
        id,
        col,
        value
    }){
        const sql = `
            UPDATE commande_${type}
            SET ${col} = ?
            WHERE id = ?
        `;

        const result = await this.request(sql, [value, id]);
        return result;
    }

    async updateCharge({
        id,
        col,
        value
    }){
        const sql = `
            UPDATE charge_horaire
            SET ${col} = ?
            WHERE id = ?
        `;

        const result = await this.request(sql, [value, id]);
        return result;
    }

    async deleteCommande({
        type,
        id
    }){
        const sql = `
            DELETE FROM commande_${type}
            WHERE id = ?
        `;

        const result = await this.request(sql, [id]);
        return result;
    }


    /**
     * Crée un nouveau travail
     * @param {Object} travail - Objet contenant les informations du travail
     * @returns {Object} Résultat de l'insertion
     */
    async createTravail(travail) {
        
        const sql = `
            INSERT INTO travail (
                titre, 
                description, 
                type, 
                date_created, 
                date_fin, 
                montant, 
                statut, 
                id_charge, 
                ponderation,
                url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

    
        const params = [
            travail.titre,
            travail.description,
            travail.type,
            travail.date_created || new Date(),
            travail.date_fin,
            travail.montant,
            travail.statut || 'PENDING',
            travail.id_charge,
            travail.ponderation,
            travail.url
        ];


        console.log("Creating travail with SQL:", sql, " and params:", params);

        const result = await this.request(sql, params);
        
        if (result && (result.affectedRows > 0 || result.insertId)) {
            const insertId = result.insertId || await this.lastInsertId();
            return {
                success: true,
                id: insertId,
                message: 'Travail créé avec succès'
            };
        }
        
        return {
            success: false,
            message: 'Échec de création du travail'
        };
    }

    /**
     * Récupère un travail par son ID
     * @param {number} id - ID du travail
     * @returns {Object} Travail trouvé
     */
    async getTravailById(id) {
        const sql = `
            SELECT * 
            FROM travail
            WHERE id = ?
        `;

        const rows = await this.request(sql, [id]);
        return rows && rows.length > 0 ? rows[0] : null;
    }

    /**
     * Récupère tous les travaux pour une charge horaire spécifique
     * @param {number} id_charge - ID de la charge horaire
     * @returns {Array} Liste des travaux
     */
    async getTravailsByCharge(id_charge) {
        const sql = `
            SELECT * 
            FROM travail
            WHERE id_charge = ?
            ORDER BY date_created DESC
        `;

        const rows = await this.request(sql, [id_charge]);
        return rows || [];
    }

    /**
     * Récupère tous les travaux avec les détails de la charge associée
     * @returns {Array} Liste des travaux avec détails
     */
    async getAllTravailsWithDetails() {
        const sql = `
            SELECT 
                t.*,
                c.id_agent,
                c.id_element,
                c.id_annee,
                e.designation AS 'ecue',
                CONCAT(a.nom, ' ', a.post_nom, ' ', a.prenom) AS 'agent_nom',
                an.debut,
                an.fin
            FROM travail t
            INNER JOIN charge_horaire c ON c.id = t.id_charge
            INNER JOIN ue_element e ON e.id = c.id_element
            INNER JOIN agent a ON a.id = c.id_agent
            INNER JOIN annee an ON an.id = c.id_annee
            ORDER BY t.date_created DESC
        `;

        const rows = await this.request(sql, []);
        return rows || [];
    }

    /**
     * Met à jour un travail existant
     * @param {number} id - ID du travail à mettre à jour
     * @param {Object} travailData - Données à mettre à jour
     * @returns {Object} Résultat de la mise à jour
     */
    async updateTravail(id, travailData) {
        // Construire dynamiquement la requête SQL en fonction des champs fournis
        const allowedFields = [
            'titre', 'description', 'type', 'date_fin', 
            'montant', 'statut', 'id_charge', 'ponderation'
        ];
        
        const updates = [];
        const values = [];
        
        Object.keys(travailData).forEach(key => {
            if (allowedFields.includes(key)) {
                updates.push(`${key} = ?`);
                values.push(travailData[key]);
            }
        });
        
        if (updates.length === 0) {
            return {
                success: false,
                message: 'Aucun champ valide à mettre à jour'
            };
        }
        
        const sql = `
            UPDATE travail
            SET ${updates.join(', ')}
            WHERE id = ?
        `;
        
        values.push(id);
        
        const result = await this.request(sql, values);
        
        return {
            success: result && (result.affectedRows > 0 || result.changedRows > 0),
            message: result && (result.affectedRows > 0 || result.changedRows > 0) 
                ? 'Travail mis à jour avec succès' 
                : 'Aucune modification effectuée'
        };
    }

    /**
     * Supprime un travail
     * @param {number} id - ID du travail à supprimer
     * @returns {Object} Résultat de la suppression
     */
    async deleteTravail(id) {
        const sql = `
            DELETE FROM travail
            WHERE id = ?
        `;

        const result = await this.request(sql, [id]);
        
        return {
            success: result && result.affectedRows > 0,
            message: result && result.affectedRows > 0 
                ? 'Travail supprimé avec succès' 
                : 'Aucun travail trouvé avec cet ID'
        };
    }

    /**
     * Met à jour le statut d'un travail
     * @param {number} id - ID du travail
     * @param {string} statut - Nouveau statut
     * @returns {Object} Résultat de la mise à jour
     */
    async updateTravailStatus(id, statut) {
        const sql = `
            UPDATE travail
            SET statut = ?
            WHERE id = ?
        `;

        const result = await this.request(sql, [statut, id]);
        
        return {
            success: result && (result.affectedRows > 0 || result.changedRows > 0),
            message: result && (result.affectedRows > 0 || result.changedRows > 0) 
                ? `Statut du travail mis à jour vers "${statut}"` 
                : 'Aucune modification effectuée'
        };
    }

    /**
     * Recherche des travaux par mot-clé
     * @param {string} keyword - Mot-clé à rechercher
     * @returns {Array} Travaux correspondants
     */
    async searchTravaux(keyword) {
        const sql = `
            SELECT 
                t.*,
                c.id_agent,
                e.designation AS 'ecue',
                CONCAT(a.nom, ' ', a.post_nom, ' ', a.prenom) AS 'agent_nom'
            FROM travail t
            INNER JOIN charge_horaire c ON c.id = t.id_charge
            INNER JOIN ue_element e ON e.id = c.id_element
            INNER JOIN agent a ON a.id = c.id_agent
            WHERE 
                t.titre LIKE ? OR 
                t.description LIKE ? OR
                t.type LIKE ? OR
                e.designation LIKE ? OR
                CONCAT(a.nom, ' ', a.post_nom, ' ', a.prenom) LIKE ?
            ORDER BY t.date_created DESC
        `;

        const searchParam = `%${keyword}%`;
        const rows = await this.request(sql, [
            searchParam, searchParam, searchParam, searchParam, searchParam
        ]);
        
        return rows || [];
    }
    /**
     * Crée une nouvelle séance
     * @param {Object} seance - Objet contenant les informations de la séance
     * @returns {Object} Résultat de l'insertion
     */
    async createSeance(seance) {
        const sql = `
            INSERT INTO seance (
                contenu, 
                objectif, 
                lieu, 
                duree, 
                url, 
                materiel,
                id_charge
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            seance.contenu,
            seance.objectif,
            seance.lieu,
            seance.duree,
            seance.url,
            seance.materiel,
            seance.id_charge
        ];

        const result = await this.request(sql, params);
        
        if (result && (result.affectedRows > 0 || result.insertId)) {
            const insertId = result.insertId || await this.lastInsertId();
            return {
                success: true,
                id: insertId,
                message: 'Séance créée avec succès'
            };
        }
        
        return {
            success: false,
            message: 'Échec de création de la séance'
        };
    }

    async getSeancesByChargeId(chargeId) {
        const sql = `
            SELECT *
            FROM seance
            WHERE id_charge = ?
        `;

        const rows = await this.request(sql, [chargeId]);
        return rows || [];
    }

    async updateSeance({
        id,
        col,
        value
    }){
        const sql = `
            UPDATE seance
            SET ${col} = ?
            WHERE id = ?
        `;

        const result = await this.request(sql, [value, id]);
        
        return {
            success: result && (result.affectedRows > 0 || result.changedRows > 0),
            message: result && (result.affectedRows > 0 || result.changedRows > 0) 
                ? 'Séance mise à jour avec succès' 
                : 'Aucune modification effectuée'
        };
    }

    async deleteSeance(id) {
        const sql = `
            DELETE FROM seance
            WHERE id = ?
        `;

        const result = await this.request(sql, [id]);

        return {
            success: result && (result.affectedRows > 0 || result.changedRows > 0),
            message: result && (result.affectedRows > 0 || result.changedRows > 0) 
                ? 'Séance supprimée avec succès' 
                : 'Aucune modification effectuée'
        };
    }

    async getByJuryId(id){
        const sql = `
            SELECT
                u.*,
                s.designation AS 'semestre',
                jp.id_annee
            FROM jury_promotion jp
            INNER JOIN unite u ON u.id_semestre = jp.id_semestre
            INNER JOIN semestre s ON s.id = jp.id_semestre
            WHERE jp.id_jury = ?
        `;

        const rows = await this.request(sql, [id]);
        return rows || [];
    }

    async getStudentByJury({
        semestre,
        id_jury
    }){
        const sql = `
            SELECT
                c.*,
                CONCAT(e.nom, " ",  e.post_nom) AS 'nom',
                e.matricule,
                e.sexe,
                e.grade,
                e.nationalite,
                e.date_naissance,
                e.telephone,
                e.photo,
                e.adresse
            FROM commande_semestre c
            INNER JOIN etudiant e ON e.id = c.id_etudiant
            INNER JOIN jury_promotion j ON j.id_semestre = c.id_semestre
            INNER JOIN semestre s ON s.id = j.id_semestre
            WHERE j.id_annee = c.id_annee AND j.id_jury = ? AND s.designation = ?`;

        const rows = await this.request(sql, [id_jury, semestre]);
        return rows || [];
    }

    async getElementsByUe(id){
        const sql = `
            SELECT *
            FROM ue_element
            WHERE id_unite = ?
        `;

        const rows = await this.request(sql, [id]);
        return rows || [];
    }

    async getNoteOfStudent({
        id_etudiant,
        id_element,
        id_annee
    }){
        const sql = `
            SELECT
                c.*,
                ch.id_annee,
                ch.id_element
            FROM commande_charge c
            INNER JOIN charge_horaire ch ON ch.id = c.id_charge
            WHERE c.id_etudiant = ? AND ch.id_annee = ? AND ch.id_element = ?
        `;

        const rows = await this.request(sql, [id_etudiant, id_annee, id_element]);
        return rows || [];
    }
}

module.exports = Titulaire;