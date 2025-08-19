const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

class Secure {
    constructor() {
        this.secret = process.env.JWT_SECRET || 'default_secret';
        this.counterFilePath = path.join(__dirname, '../data/counter.txt');
        this.ensureCounterFileExists();
    }

    ensureCounterFileExists() {
        // Assure que le dossier data existe
        const dataDir = path.join(__dirname, '../data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        // Vérifie si le fichier counter.txt existe, sinon le crée avec la valeur 0
        if (!fs.existsSync(this.counterFilePath)) {
            fs.writeFileSync(this.counterFilePath, '0', 'utf8');
        }
    }

    getCounter() {
        try {
            const counterValue = fs.readFileSync(this.counterFilePath, 'utf8');
            console.log(`Current counter value: ${counterValue.trim()}`);
            return parseInt(counterValue.trim()) || 0;
        } catch (error) {
            console.error('Error reading counter file:', error);
            return 0;
        }
    }

    saveCounter(value) {
        try {
            fs.writeFileSync(this.counterFilePath, value.toString(), 'utf8');
        } catch (error) {
            console.error('Error saving counter file:', error);
        }
    }

    generateIdentifiant() {
        // Obtenir le timestamp actuel
        const timestamp = Date.now().toString();
        
        // Lire la valeur actuelle du compteur depuis le fichier
        let counter = this.getCounter();
        
        // Incrémenter le compteur (réinitialiser à 0 après 99)
        counter = (counter + 1) % 100;
        
        // Sauvegarder la nouvelle valeur
        this.saveCounter(counter);
        
        // Extraire les 3 derniers chiffres du timestamp pour la première partie
        const firstPart = timestamp.slice(-3);
        
        // Utiliser le compteur comme deuxième partie, formaté sur 2 chiffres
        const secondPart = counter.toString().padStart(2, '0');
        
        // Assembler l'identifiant au format demandé
        const identifier = `AGT.${firstPart}.${secondPart}`;
        
        return identifier;
    }

    generatePasswordHash(password) {
        //Simple Hashing
        return crypto.createHash('sha256').update(password).digest('hex');
    }

    generateToken(payload) {
        
        return jwt.sign(payload, process.env.JWT_SECRET || 'default_secret', { expiresIn: '3h' });
    }

    verifyToken(req, res, next) {
        const token = (req.headers['authorization'] || '').replace('Bearer ', '');

        if (!token) {
            return res.status(403).send("Token is required");
        }

        jwt.verify(token, process.env.JWT_SECRET || 'default_secret', (err, decoded) => {
            if (err) {
                return res.status(401).send("Invalid token");
            }

            req.user = decoded;
            next();
        });
    }
}

module.exports = new Secure();
