const { put } = require('@vercel/blob');
require('dotenv').config();

class Blob {
    constructor() {
        this.data = new Map();
        this.token = process.env.BLOB_TOKEN;
    }

    async upload(file) {
        try {
            const key = `file_${Date.now()}`;
            const response = await put(key, file, {
                token: this.token
            });
    
            this.data.set(key, { url: response.url });
            return key;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw new Error('File upload failed');
        }
    }

    async download(key) {
        return this.data.get(key);
    }
}

module.exports = new Blob();
