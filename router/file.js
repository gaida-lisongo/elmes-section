const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const FileManager = require('../service/FileManager');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Configuration de multer pour stocker temporairement les fichiers sur disque
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const tempDir = path.join(__dirname, '../temp');
        // Création du répertoire temp s'il n'existe pas
        if (!fs.existsSync(tempDir)){
            fs.mkdirSync(tempDir, { recursive: true });
        }
        cb(null, tempDir);
    },
    filename: function (req, file, cb) {
        // Générer un nom de fichier unique
        const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueFilename);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // Limite de 10MB
});

// Route pour uploader un fichier
router.post('/upload', upload.single('file'), async (req, res) => {
    let tempFilePath = null;
    
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        // Récupérer le chemin du fichier temporaire créé par multer
        tempFilePath = req.file.path;
        
        // Options pour l'upload Cloudinary
        const options = {
            folder: 'uploads',
            resource_type: 'auto', // Permet à Cloudinary de détecter le type de ressource
            public_id: path.parse(req.file.originalname).name, // Utilise le nom original sans extension
        };
        
        // Upload vers Cloudinary avec le chemin du fichier temporaire
        const result = await FileManager.uploadImage(tempFilePath, options);
        
        // Renvoyer la clé ou l'ID du fichier retourné par Cloudinary
        res.status(200).json({ 
            success: true, 
            data: result,
            message: 'File uploaded successfully' 
        });
    } catch (error) {
        console.error('Error in upload route:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to upload file' 
        });
    } finally {
        // Nettoyage : supprimer le fichier temporaire
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
    }
});

router.post('/upload-pdf', upload.single('file'), async (req, res) => {
    let tempFilePath = null;

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        console.log("File uploaded:", req.file.mimetype);

        let type = "pdf";

        switch (req.file.mimetype.split('/')[1]) {
            case 'vnd.openxmlformats-officedocument.wordprocessingml.document':
                type = "docx";
                break;
            case 'pdf':
                type = "pdf";
                break;
            case 'vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                type = "xlsx";
                break;
            case 'vnd.openxmlformats-officedocument.presentationml.presentation':
                type = "pptx";
                break;
            default:
                type = "txt";
        }


        // Récupérer le chemin du fichier temporaire créé par multer
        tempFilePath = req.file.path;

        //Convert to Buffer
        const fileBuffer = fs.readFileSync(tempFilePath);

        console.log("Temporary file path:", fileBuffer);
        // Upload vers Cloudinary avec le chemin du fichier temporaire
        const result = await FileManager.uploadPdf(fileBuffer, type);

        // Renvoyer la clé ou l'ID du fichier retourné par Cloudinary
        res.status(200).json({
            success: true,
            data: result,
            message: 'PDF uploaded successfully'
        });
    } catch (error) {
        console.error('Error in upload route:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to upload PDF'
        });
    } finally {
        // Nettoyage : supprimer le fichier temporaire
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
    }
});

module.exports = router;

