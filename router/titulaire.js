const express = require("express");
const router = express.Router();
const TitulaireController = require("../controllers/Titulaire");
const titulaireController = new TitulaireController();
const Secure = require("../middlewares/Secure");
const Document = require("../service/Document");

router.get("/", Secure.verifyToken, async (req, res) => {
  try {
    console.log("Fetching data for titulaire with user ID:", req.user);
    const charges = await titulaireController.fetchCharges(req.user.id);
    const jurys = await titulaireController.fetchJurys(req.user.id);
    res.status(200).json({
      success: true,
      message: "Data fetched successfully",
      data: {
        charges,
        jurys,
      },
    });
  } catch (error) {
    console.error("Error fetching data titulaire:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching data titulaire",
      error: "Internal Server Error",
    });
  }
});

router.put("/descriptif/:id", Secure.verifyToken, async (req, res) => {
  try {
    const result = await titulaireController.updateCharge({
      id: req.params.id,
      col: req.body.col,
      value: req.body.value,
    });

    res.status(200).json({
      success: true,
      message: "Charge updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error updating charge:", error);
    res.status(500).json({
      success: false,
      message: "Error updating charge",
      error: "Internal Server Error",
    });
  }
});

router.get("/charge/:id", Secure.verifyToken, async (req, res) => {
  try {
    const charges = await titulaireController.fetchCommandesByReference({
      type: "charge",
      reference: "id_charge",
      value: req.params.id,
    });

    console.log("Fetched charges for ID:", req.params.id);

    res.status(200).json({
      success: true,
      message: "Charges fetched successfully",
      data: charges,
    });
  } catch (error) {
    console.error("Error fetching charges:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching charges",
      error: "Internal Server Error",
    });
  }
});

router.put("/charge/:id", Secure.verifyToken, async (req, res) => {
  try {
    const result = await titulaireController.changeCommandeByReference({
      type: "charge",
      id: req.params.id,
      col: req.body.col,
      value: req.body.value,
    });

    res.status(200).json({
      success: true,
      message: "Charge updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error updating charge:", error);
    res.status(500).json({
      success: false,
      message: "Error updating charge",
      error: "Internal Server Error",
    });
  }
});

router.delete("/charge/:id", Secure.verifyToken, async (req, res) => {
  try {
    const result = await titulaireController.deleteCommandeByReference({
      type: "charge",
      id: req.params.id,
    });

    res.status(200).json({
      success: true,
      message: "Charge deleted successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error deleting charge:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting charge",
      error: "Internal Server Error",
    });
  }
});

router.get("/seances/:id_charge", Secure.verifyToken, async (req, res) => {
  try {
    const seances = await titulaireController.fetchSeancesByChargeId(
      req.params.id_charge
    );
    res.status(200).json({
      success: true,
      message: "Séances récupérées avec succès",
      data: seances,
    });
  } catch (error) {
    console.error("Error fetching seances:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching seances",
      error: "Internal Server Error",
    });
  }
});

router.post("/seance", Secure.verifyToken, async (req, res) => {
  try {
    const result = await titulaireController.addSeance(req.body);
    res.status(201).json({
      success: true,
      message: "Séance créée avec succès",
      data: result,
    });
  } catch (error) {
    console.error("Error creating seance:", error);
    res.status(500).json({
      success: false,
      message: "Error creating seance",
      error: "Internal Server Error",
    });
  }
});

router.put("/seance/:id", Secure.verifyToken, async (req, res) => {
  try {
    const payload = {
      id: req.params.id,
      ...req.body,
    };
    const result = await titulaireController.updateSeance(payload);
    res.status(200).json({
      success: true,
      message: "Séance mise à jour avec succès",
      data: result,
    });
  } catch (error) {
    console.error("Error updating seance:", error);
    res.status(500).json({
      success: false,
      message: "Error updating seance",
      error: "Internal Server Error",
    });
  }
});

router.delete("/seance/:id", Secure.verifyToken, async (req, res) => {
  try {
    const result = await titulaireController.deleteSeance(req.params.id);
    res.status(200).json({
      success: true,
      message: "Séance supprimée avec succès",
      data: result,
    });
  } catch (error) {
    console.error("Error deleting seance:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting seance",
      error: "Internal Server Error",
    });
  }
});

router.get("/seance/:id/commandes", Secure.verifyToken, async (req, res) => {
  try {
    const commandes = await titulaireController.fetchCommandesByReference({
      type: "seance",
      reference: "id_seance",
      value: req.params.id,
    });
    res.status(200).json({
      success: true,
      message: "Commandes récupérées avec succès",
      data: commandes,
    });
  } catch (error) {
    console.error("Error fetching commandes:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching commandes",
      error: "Internal Server Error",
    });
  }
});

router.put("/seance/:id/commande", Secure.verifyToken, async (req, res) => {
  try {
    const result = await titulaireController.changeCommandeByReference({
      type: "seance",
      id: req.params.id,
      col: req.body.col,
      value: req.body.value,
    });

    res.status(200).json({
      success: true,
      message: "Commande mise à jour avec succès",
      data: result,
    });
  } catch (error) {
    console.error("Error updating commande:", error);
    res.status(500).json({
      success: false,
      message: "Error updating commande",
      error: "Internal Server Error",
    });
  }
});

router.get("/jury/:id", Secure.verifyToken, async (req, res) => {
  try {
    const jury = await titulaireController.fetchJurysById(req.params.id);
    res.status(200).json({
      success: true,
      message: "Jury récupéré avec succès",
      data: jury,
    });
  } catch (error) {
    console.error("Error fetching jury:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching jury",
      error: "Internal Server Error",
    });
  }
});

router.get(
  "/students/:id_jury/:semestre",
  Secure.verifyToken,
  async (req, res) => {
    try {
      const students = await titulaireController.fetStudentByJury({
        id_jury: req.params.id_jury,
        semestre: req.params.semestre,
      });
      res.status(200).json({
        success: true,
        message: "Étudiants récupérés avec succès",
        data: students,
      });
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching students",
        error: "Internal Server Error",
      });
    }
  }
);

router.get("/note", Secure.verifyToken, async (req, res) => {
  try {
    const { id_etudiant, id_element, id_annee } = req.query;
    const note = await titulaireController.fetchNote({
      id_etudiant,
      id_element,
      id_annee,
    });
    res.status(200).json({
      success: true,
      message: "Note récupérée avec succès",
      data: note,
    });
  } catch (error) {
    console.error("Error fetching note:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching note",
      error: "Internal Server Error",
    });
  }
});

router.get("/check-jury/:id/:code", Secure.verifyToken, async (req, res) => {
  try {
    console.log(
      "Checking jury for ID:",
      req.params.id,
      "and code:",
      req.params.code
    );
    const juryExists = await titulaireController.checkJuryExists({
      id: req.params.id,
      code: req.params.code,
    });

    console.log("Jury exists response:", juryExists);
    res.status(200).json({
      success: true,
      message: "Vérification du jury réussie",
      data: juryExists,
    });
  } catch (error) {
    console.error("Error checking jury:", error);
    res.status(500).json({
      success: false,
      message: "Error checking jury",
      error: "Internal Server Error",
    });
  }
});

router.get("/grille/:id/:type/:semestre", async (req, res) => {
  try {
    const grille = await titulaireController.fetchGrille({
      id: req.params.id,
      type: req.params.type,
      semestre: req.params.semestre,
    });

    const doc = new Document(grille);
    const buffer = await doc.genBlob();

    res.set({
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename=grille_${req.params.id}.xlsx`,
      "Content-Length": buffer.length,
    });

    res.send(buffer);
  } catch (error) {
    console.error("Error fetching grille:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching grille",
      error: "Internal Server Error",
    });
  }
});

module.exports = router;
