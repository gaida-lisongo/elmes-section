const e = require("express");
const Titulaire = require("../models/Titulaire");
const AgentController = require("./Agent");

class TitulaireController extends AgentController {
  constructor() {
    super();
    this.titulaireModel = new Titulaire();
  }

  async fetchCharges(id) {
    try {
      const charges = await this.titulaireModel.getChargesByAgent(id);
      return charges;
    } catch (error) {
      console.error("Error fetching charges:", error);
      throw new Error("Internal Server Error");
    }
  }

  async updateCharge(params) {
    try {
      const result = await this.titulaireModel.updateCharge(params);
      return result;
    } catch (error) {
      console.error("Error updating charge:", error);
      throw new Error("Internal Server Error");
    }
  }

  async fetchJurys(id) {
    try {
      const jurys = await this.titulaireModel.getJurysByAgent(id);
      return jurys;
    } catch (error) {
      console.error("Error fetching jurys:", error);
      throw new Error("Internal Server Error");
    }
  }

  async fetchCommandesByReference(params) {
    try {
      const commandes = await this.titulaireModel.getCommandesByReference(
        params
      );
      return commandes;
    } catch (error) {
      console.error("Error fetching commandes:", error);
      throw new Error("Internal Server Error");
    }
  }

  async changeCommandeByReference(params) {
    try {
      const result = await this.titulaireModel.updateCommande(params);
      return result;
    } catch (error) {
      console.error("Error changing commande:", error);
      throw new Error("Internal Server Error");
    }
  }

  async deleteCommandeByReference(params) {
    try {
      const result = await this.titulaireModel.deleteCommande(params);
      return result;
    } catch (error) {
      console.error("Error deleting commande:", error);
      throw new Error("Internal Server Error");
    }
  }

  // Nouvelles méthodes pour gérer les travaux

  /**
   * Crée un nouveau travail
   * @param {Object} travailData - Données du travail à créer
   * @returns {Object} Résultat de la création
   */
  async createTravail(travailData) {
    try {
      // Ajouter la date de création si non spécifiée
      if (!travailData.date_created) {
        travailData.date_created = new Date();
      }

      const result = await this.titulaireModel.createTravail(travailData);
      return result;
    } catch (error) {
      console.error("Error creating travail:", error);
      throw new Error("Failed to create travail");
    }
  }

  /**
   * Récupère un travail par son ID
   * @param {number} id - ID du travail
   * @returns {Object} Travail trouvé
   */
  async getTravailById(id) {
    try {
      const travail = await this.titulaireModel.getTravailById(id);
      if (!travail) {
        throw new Error("Travail not found");
      }
      return travail;
    } catch (error) {
      console.error("Error fetching travail:", error);
      throw error;
    }
  }

  /**
   * Récupère tous les travaux pour une charge horaire
   * @param {number} chargeId - ID de la charge horaire
   * @returns {Array} Liste des travaux
   */
  async getTravailsByCharge(chargeId) {
    try {
      const travaux = await this.titulaireModel.getTravailsByCharge(chargeId);
      return travaux;
    } catch (error) {
      console.error("Error fetching travaux by charge:", error);
      throw new Error("Failed to fetch travaux");
    }
  }

  /**
   * Récupère tous les travaux avec leurs détails
   * @returns {Array} Liste des travaux avec détails
   */
  async getAllTravaux() {
    try {
      const travaux = await this.titulaireModel.getAllTravailsWithDetails();
      return travaux;
    } catch (error) {
      console.error("Error fetching all travaux:", error);
      throw new Error("Failed to fetch travaux");
    }
  }

  /**
   * Met à jour un travail existant
   * @param {number} id - ID du travail
   * @param {Object} travailData - Données à mettre à jour
   * @returns {Object} Résultat de la mise à jour
   */
  async updateTravail(id, travailData) {
    try {
      // Vérifier si le travail existe
      const existingTravail = await this.titulaireModel.getTravailById(id);
      if (!existingTravail) {
        throw new Error("Travail not found");
      }

      const result = await this.titulaireModel.updateTravail(id, travailData);
      return result;
    } catch (error) {
      console.error("Error updating travail:", error);
      throw error;
    }
  }

  /**
   * Met à jour le statut d'un travail
   * @param {number} id - ID du travail
   * @param {string} statut - Nouveau statut
   * @returns {Object} Résultat de la mise à jour
   */
  async updateTravailStatus(id, statut) {
    try {
      // Vérifier si le travail existe
      const existingTravail = await this.titulaireModel.getTravailById(id);
      if (!existingTravail) {
        throw new Error("Travail not found");
      }

      const result = await this.titulaireModel.updateTravailStatus(id, statut);
      return result;
    } catch (error) {
      console.error("Error updating travail status:", error);
      throw error;
    }
  }

  /**
   * Supprime un travail
   * @param {number} id - ID du travail à supprimer
   * @returns {Object} Résultat de la suppression
   */
  async deleteTravail(id) {
    try {
      // Vérifier si le travail existe
      const existingTravail = await this.titulaireModel.getTravailById(id);
      if (!existingTravail) {
        throw new Error("Travail not found");
      }

      const result = await this.titulaireModel.deleteTravail(id);
      return result;
    } catch (error) {
      console.error("Error deleting travail:", error);
      throw error;
    }
  }

  /**
   * Recherche des travaux par mot-clé
   * @param {string} keyword - Mot-clé à rechercher
   * @returns {Array} Travaux correspondants
   */
  async searchTravaux(keyword) {
    try {
      const travaux = await this.titulaireModel.searchTravaux(keyword);
      return travaux;
    } catch (error) {
      console.error("Error searching travaux:", error);
      throw new Error("Failed to search travaux");
    }
  }

  async fetchSeancesByChargeId(chargeId) {
    try {
      const seances = await this.titulaireModel.getSeancesByChargeId(chargeId);
      return seances;
    } catch (error) {
      console.error("Error fetching seances by charge ID:", error);
      throw new Error("Failed to fetch seances");
    }
  }

  async addSeance(seanceData) {
    try {
      const result = await this.titulaireModel.createSeance(seanceData);
      return result;
    } catch (error) {
      console.error("Error adding seance:", error);
      throw new Error("Failed to add seance");
    }
  }

  async updateSeance({ id, col, value }) {
    try {
      const result = await this.titulaireModel.updateSeance({ id, col, value });
      return result;
    } catch (error) {
      console.error("Error updating seance:", error);
      throw new Error("Failed to update seance");
    }
  }

  async deleteSeance(id) {
    try {
      const result = await this.titulaireModel.deleteSeance(id);
      return result;
    } catch (error) {
      console.error("Error deleting seance:", error);
      throw new Error("Failed to delete seance");
    }
  }

  async fetchJurysById(id) {
    try {
      const jurys = await this.titulaireModel.getByJuryId(id);
      if (!jurys || jurys.length === 0) {
        throw new Error("Jurys not found");
      }

      let promotions = [
        {
          promotion: "Préparatoire",
          semestres: [
            {
              semestre: "S01",
              unites: [],
              etudiants: [],
            },
            {
              semestre: "S02",
              unites: [],
              etudiants: [],
            },
          ],
        },
        {
          promotion: "Licence 1",
          semestres: [
            {
              semestre: "S1",
              unites: [],
              etudiants: [],
            },
            {
              semestre: "S2",
              unites: [],
              etudiants: [],
            },
          ],
        },
        {
          promotion: "Licence 2",
          semestres: [
            {
              semestre: "S3",
              unites: [],
              etudiants: [],
            },
            {
              semestre: "S4",
              unites: [],
              etudiants: [],
            },
          ],
        },
        {
          promotion: "Licence 3",
          semestres: [
            {
              semestre: "S5",
              unites: [],
              etudiants: [],
            },
            {
              semestre: "S6",
              unites: [],
              etudiants: [],
            },
          ],
        },
        {
          promotion: "Master 1",
          semestres: [
            {
              semestre: "S7",
              unites: [],
              etudiants: [],
            },
            {
              semestre: "S8",
              unites: [],
              etudiants: [],
            },
          ],
        },
        {
          promotion: "Master 2",
          semestres: [
            {
              semestre: "S9",
              unites: [],
              etudiants: [],
            },
            {
              semestre: "S10",
              unites: [],
              etudiants: [],
            },
          ],
        },
      ];

      // Hydratation des jurys dans promotions
      jurys.forEach((jury) => {
        for (let promotion of promotions) {
          for (let semestre of promotion.semestres) {
            if (semestre.semestre === jury.semestre) {
              semestre.unites.push({ ...jury, elements: [] });
            }
          }
        }
      });

      // Filtrer les promotions qui ont au moins une unité
      const promotionsAvecUnites = promotions.filter((promotion) =>
        promotion.semestres.some((semestre) => semestre.unites.length > 0)
      );

      // Préparer toutes les promesses d'étudiants et d'éléments à plat
      const etudiantsPromises = [];
      const elementsPromises = [];

      promotionsAvecUnites.forEach((promotion) => {
        promotion.semestres.forEach((semestre) => {
          // Étudiants
          etudiantsPromises.push(
            this.titulaireModel
              .getStudentByJury({ id_jury: id, semestre: semestre.semestre })
              .then((etudiants) => {
                semestre.etudiants = etudiants;
              })
          );
          // Éléments pour chaque unité
          semestre.unites.forEach((unite) => {
            elementsPromises.push(
              this.titulaireModel.getElementsByUe(unite.id).then((elements) => {
                unite.elements = elements;
              })
            );
          });
        });
      });

      // Exécuter toutes les requêtes en parallèle
      await Promise.all([...etudiantsPromises, ...elementsPromises]);

      return promotionsAvecUnites;
    } catch (error) {
      console.error("Error fetching jurys by ID:", error);
      throw new Error("Failed to fetch jurys");
    }
  }

  async fetStudentByJury(params) {
    try {
      const request = await this.titulaireModel.getStudentByJury(params);
      return request;
    } catch (error) {
      console.error("Error fetching students by jury:", error);
      throw new Error("Failed to fetch students");
    }
  }

  async fetchElementsByUe(id) {
    try {
      const elements = await this.titulaireModel.getElementsByUe(id);
      return elements;
    } catch (error) {
      console.error("Error fetching elements by UE:", error);
      throw new Error("Failed to fetch elements");
    }
  }

  async fetchNote({ id_etudiant, id_element, id_annee }) {
    try {
      const note = await this.titulaireModel.getNoteOfStudent({
        id_etudiant,
        id_element,
        id_annee,
      });
      return note;
    } catch (error) {
      console.error("Error fetching note:", error);
      throw new Error("Failed to fetch note");
    }
  }

  async checkJuryExists({ id, code }) {
    try {
      const jury = await this.titulaireModel.checkJuryAutorization({
        id,
        code,
      });
      return jury;
    } catch (error) {
      console.error("Error checking jury existence:", error);
      throw new Error("Failed to check jury existence");
    }
  }

  async fetchGrille({ id, semestre, type }) {
    try {
      const jury = await this.titulaireModel.getByJuryId(id);

      if (!jury || jury.length === 0) {
        throw new Error("Jury not found");
      }

      let totalSemestre = 0;
      let creditsSemestre = 0;

      // Get all units with their elements
      const unites = await Promise.all(
        jury.map(async (unite) => {
          if (unite.semestre == semestre) return null;
          const elements = await this.titulaireModel.getElementsByUe(unite.id);
          creditsSemestre += elements.reduce(
            (sum, element) => sum + element.credit,
            0
          );
          return {
            ...unite,
            elements,
            total: elements.length,
            credits: elements.reduce((sum, element) => sum + element.credit, 0),
            moy: 0,
            validate: false,
          };
        })
      );

      totalSemestre += 20 * creditsSemestre;

      // Get all student with their notes
      const students = await this.titulaireModel.getStudentByJury({
        semestre,
        id_jury: id,
      });

      // Map students to their notes
      const studentNotes = await Promise.all(
        students.map(async (student) => {
          let totalObtenu = 0;
          let ncv = 0.0;
          let ncnv = 0.0;
          let pourcentage = 0;
          let appreciation = null;

          let data = [];

          unites.forEach((unite) => {
            const { elements } = unite;

            let moyUnite = 0;
            let decisionUnite = null;

            elements.forEach(async (element) => {
              const note = await this.titulaireModel.getNoteOfStudent({
                id_etudiant: student.id,
                id_element: element.id,
                id_annee: unite.id_annee,
              });
              if (!note.length) {
                data.push("X");
                return;
              }
              const totalAnnuel = note
                ? parseFloat(note.cmi) + parseFloat(note.examen)
                : 0;
              const totalAnnuelP = totalAnnuel * element.credit;
              const totalRattrapage = note ? parseFloat(note.rattrapage) : 0;
              const totalRattrapageP = totalRattrapage * element.credit;

              // Calcul de la moyenne de l'unité d'enseignement
              switch (type) {
                case "Principal":
                  moyUnite += unite.credits ? totalAnnuelP / unite.credits : 0;
                  data.push(totalAnnuel);
                  break;
                case "Rattrapage":
                  moyUnite += unite.credits
                    ? totalRattrapageP / unite.credits
                    : 0;
                  data.push(totalRattrapage);
                  break;

                default:
                  const totalP =
                    totalAnnuelP > totalRattrapageP
                      ? totalAnnuelP
                      : totalRattrapageP;
                  moyUnite += unite.credits ? totalP / unite.credits : 0;
                  const totalG =
                    totalAnnuel > totalRattrapage
                      ? totalAnnuel
                      : totalRattrapage;
                  data.push(totalG);
                  break;
              }
            });

            decisionUnite = moyUnite >= 10 ? "V" : "NV";
            totalObtenu += moyUnite;

            if (decisionUnite === "V") {
              ncv += unite.credits;
            } else {
              ncnv += unite.credits;
            }

            data.push(moyUnite);
            data.push(decisionUnite);
          });

          pourcentage = totalSemestre
            ? (totalObtenu / totalSemestre) * 100
            : 0.0;

          if (pourcentage >= 90) {
            appreciation = "A";
          } else if (pourcentage >= 80) {
            appreciation = "B";
          } else if (pourcentage >= 70) {
            appreciation = "C";
          } else if (pourcentage >= 60) {
            appreciation = "D";
          } else if (pourcentage >= 50) {
            appreciation = "E";
          } else {
            appreciation = "F";
          }

          data.push(totalObtenu);
          data.push(pourcentage.toFixed(2));
          data.push(appreciation);
          data.push(ncv);
          data.push(ncnv);
          const decisionJury = ncv >= 22.5 ? "Passe" : "Double";
          data.push(decisionJury);

          return {
            ...student,
            data,
          };
        })
      );

      return {
        unites,
        students: studentNotes,
      };
    } catch (error) {
      console.error("Error fetching grille:", error);
      throw new Error("Failed to fetch grille");
    }
  }
}

module.exports = TitulaireController;
