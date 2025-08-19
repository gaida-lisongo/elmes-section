const { put, list, get } = require("@vercel/blob");
const cloudinary = require('cloudinary').v2;
require("dotenv").config();

class FileManager {
  constructor() {
    this.data = new Map();
    this.token = process.env.BLOB_TOKEN;
    cloudinary.config({
      secure: true
    });
  }

  async convertToBlob(buffer, options) {
    try {
      const blob = new Blob([buffer], options);
      return blob;
    } catch (error) {
      console.error("Error converting to blob:", error);
      throw new Error("Blob conversion failed");
    }
  }

  async uploadImage(file) {
    try {
      const result = await cloudinary.uploader.upload(file, {
        resource_type: "auto",
        public_id: `file_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      });
      return result;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Image upload failed");
    }
  }

  async uploadPdf(file, typeFile) {
    try {
      // Génération d'un identifiant unique basé sur le timestamp et un nombre aléatoire
      const key = `file_${Date.now()}_${Math.floor(Math.random() * 10000)}.${typeFile}`;

      // Utilisation de l'API Vercel Blob pour stocker le fichier
      const response = await put(key, file, {
        token: this.token,
        access: "public", // Pour permettre un accès public au fichier
      });
      
      return {
        url: response.url,
        pathname: response.pathname,
        contentType: response.contentType,
        size: response.size,
      };
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error("File upload failed");
    }
  }

  async download(key) {
    try {
      // Vérifie d'abord si nous avons les données en mémoire
      let fileData = this.data.get(key);

      // Si les données ne sont pas en mémoire, essayons de les récupérer directement de Vercel Blob
      if (!fileData) {
        // Utilisation de list pour rechercher le fichier par sa clé
        const { blobs } = await list({
          token: this.token,
          prefix: key,
        });

        if (blobs && blobs.length > 0) {
          const blob = blobs[0];
          fileData = {
            url: blob.url,
            pathname: blob.pathname,
            contentType: blob.contentType,
            size: blob.size,
          };

          // Mettre en cache pour les futurs accès
          this.data.set(key, fileData);
        } else {
          throw new Error("File not found");
        }
      }

      return fileData;
    } catch (error) {
      console.error("Error downloading file:", error);
      throw new Error("File download failed");
    }
  }
}

module.exports = new FileManager();
