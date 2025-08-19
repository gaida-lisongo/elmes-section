const express = require('express');
const router = express.Router();
const TitulaireController = require('../controllers/Titulaire');
const Secure = require('../middlewares/Secure');

const titulaireController = new TitulaireController();

// Middleware pour gérer les erreurs communes
const errorHandler = (handler) => async (req, res, next) => {
    try {
        await handler(req, res, next);
    } catch (error) {
        console.error("Route error:", error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

// Route pour créer un nouveau travail
router.post('/', Secure.verifyToken, errorHandler(async (req, res) => {
    const travailData = req.body;
    const result = await titulaireController.createTravail(travailData);
    res.status(201).json(result);
}));

// Route pour récupérer tous les travaux
router.get('/', Secure.verifyToken, errorHandler(async (req, res) => {
    const travaux = await titulaireController.getAllTravaux();
    res.status(200).json({
        success: true,
        data: travaux
    });
}));

// Route pour récupérer un travail par ID
router.get('/:id', Secure.verifyToken, errorHandler(async (req, res) => {
    const { id } = req.params;
    const travail = await titulaireController.getTravailById(parseInt(id));
    res.status(200).json({
        success: true,
        data: travail
    });
}));

// Route pour récupérer les travaux par charge
router.get('/charge/:chargeId', Secure.verifyToken, errorHandler(async (req, res) => {
    const { chargeId } = req.params;
    const travaux = await titulaireController.getTravailsByCharge(parseInt(chargeId));
    res.status(200).json({
        success: true,
        data: travaux
    });
}));

// Route pour mettre à jour un travail
router.put('/:id', Secure.verifyToken, errorHandler(async (req, res) => {
    const { id } = req.params;
    const travailData = req.body;
    const result = await titulaireController.updateTravail(parseInt(id), travailData);
    res.status(200).json(result);
}));

// Route pour mettre à jour le statut d'un travail
router.patch('/:id/status', Secure.verifyToken, errorHandler(async (req, res) => {
    const { id } = req.params;
    const { statut } = req.body;
    
    if (!statut) {
        return res.status(400).json({
            success: false,
            message: "Le statut est requis"
        });
    }
    
    const result = await titulaireController.updateTravailStatus(parseInt(id), statut);
    res.status(200).json(result);
}));

// Route pour supprimer un travail
router.delete('/:id', Secure.verifyToken, errorHandler(async (req, res) => {
    const { id } = req.params;
    const result = await titulaireController.deleteTravail(parseInt(id));
    res.status(200).json(result);
}));

// Route pour rechercher des travaux
router.get('/search/:keyword', Secure.verifyToken, errorHandler(async (req, res) => {
    const { keyword } = req.params;
    const travaux = await titulaireController.searchTravaux(keyword);
    res.status(200).json({
        success: true,
        data: travaux
    });
}));

router.get('/commandes/:id', Secure.verifyToken, errorHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const commandes = await titulaireController.fetchCommandesByReference({
            type: 'travail',
            reference: 'id_travail',
            value: id
        });
        res.status(200).json({
            success: true,
            data: commandes
        });
    } catch (error) {
        console.error("Error fetching commandes:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des commandes"
        });
    }
}));

router.put('/commande/:id', Secure.verifyToken, errorHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const commandeData = req.body;
        const result = await titulaireController.changeCommandeByReference({
            type: 'travail',
            id: parseInt(id),
            col: commandeData.col,
            value: commandeData.value
        });
        res.status(200).json({
            success: true,
            message: "Commande travail updated",
            data: result
        });
    } catch (error) {
        console.error("Error updating commande:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la mise à jour de la commande"
        });
    }
}));

router.delete('/commande/:id', Secure.verifyToken, errorHandler(async (req, res) => {
    const { id } = req.params;
    const result = await titulaireController.deleteCommande({
        type: 'travail',
        id: parseInt(id)
    });
    res.status(200).json({
        success: true,
        message: "Commande travail deleted",
        data: result
    });    
}));

module.exports = router;