const express = require("express");
const router = express.Router();

const user = require("./user");
const file = require("./file");
const titulaire = require("./titulaire");
const travail = require("./travail");

router.use("/user", user);
router.use("/file", file);
router.use("/titulaire", titulaire);
router.use("/travail", travail);

module.exports = router;
