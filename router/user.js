const express = require("express");
const router = express.Router();
const AgentController = require("../controllers/Agent");
const agentController = new AgentController();
const Secure = require("../middlewares/Secure");

router.get("/", async (req, res) => {
  try {
    const agents = await agentController.agents();
    res.status(200).json(agents);
  } catch (error) {
    console.error("Error fetching agents:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const agentData = req.body;
    console.log("Registering agent with data:", agentData);
    const newAgent = await agentController.registerAgent(agentData);
    res.status(201).json({
      success: true,
      data: newAgent,
      message: "Agent registered successfully",
    });
  } catch (error) {
    console.error("Error registering agent:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

router.post("/auth", async (req, res) => {
  try {
    const { matricule, secure } = req.body;
    if (!matricule || !secure) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const [userData] = await agentController.authAgent({
      matricule,
      secure: Secure.generatePasswordHash(secure),
    });
    const token = Secure.generateToken(userData);
    if (!userData) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    //supprimer secure dans userData
    const { secure: userSecure, ...userWithoutSecure } = userData;
    res.status(200).json({
      success: true,
      data: {
        token,
        user: userWithoutSecure,
      },
      message: "Agent authenticated successfully",
    });
  } catch (error) {
    console.error("Error authenticating agent:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

router.get("/privileges/:id", Secure.verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const privileges = await agentController.getPrivilegesByAgent(id);

    res.status(200).json(privileges);
  } catch (error) {
    console.error("Error fetching privileges:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;