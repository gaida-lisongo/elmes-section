const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bodyParser = require("body-parser");
const routes = require("./router");
const db = require("./service/Database");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Ton secret défini dans GitHub webhook
const SECRET = "inbtp-vps-2025";

// Vérification de la signature envoyée par GitHub
function verifySignature(req) {
  const signature = req.headers["x-hub-signature-256"];
  const hmac = crypto.createHmac("sha256", SECRET);
  const digest = "sha256=" + hmac.update(JSON.stringify(req.body)).digest("hex");
  return signature === digest;
}

app.post("/webhook", (req, res) => {
  if (!verifySignature(req)) {
    return res.status(401).send("Invalid signature");
  }

  const event = req.headers["x-github-event"];
  if (event === "push") {
    console.log("✅ Nouveau push détecté");

    // Lancer le script de déploiement
    exec("sh /var/www/mon-projet/deploy.sh", (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Erreur: ${error.message}`);
        return;
      }
      if (stderr) console.error(`⚠️ ${stderr}`);
      console.log(`📜 ${stdout}`);
    });
  }

  res.status(200).send("Webhook reçu");
});

// Routes
app.use("/api", routes);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
