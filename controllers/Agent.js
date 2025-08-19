const Agent = require('../models/Agent');
const Retrait = require('../models/Retrait');
const Autorisation = require('../models/Autorisation');
const Secure = require('../middlewares/Secure');

class AgentController {
    // Controller methods go here
    constructor() {
        this.agentModel = new Agent();
        this.retraitModel = new Retrait();
        this.autorisationModel = new Autorisation();
    }

    async agents(){
        try {
        const agents = await this.agentModel.getAll();
        return agents;
        } catch (error) {
        console.error("Error fetching agents:", error);
        throw error;
        }
    }

    async authAgent({
        secure,
        matricule
    }){
        try {
            const request = await this.agentModel.findByAuth({ secure, matricule });
            if (!request) {
                throw new Error("Agent not found or invalid credentials");
            }
            return request;
        } catch (error) {
            console.error("Error authenticating agent:", error);
            throw error;
        }
    }

    async registerAgent(agentData) {
        try {
        const matricule = Secure.generateIdentifiant();
        const secure = Secure.generatePasswordHash(agentData.secure);

        const newAgent = await this.agentModel.create({
            ...agentData,
            matricule,
            secure,
        });

        return {
            id: newAgent,
            matricule,
            ...agentData
        };
        } catch (error) {
        console.error("Error registering agent:", error);
        throw error;
        }
    }

    async updateAgent(id, updateData) {
        try {
        await this.agentModel.update(id, updateData);
        return { success: true };
        } catch (error) {
        console.error("Error updating agent:", error);
        throw error;
        }
    }

    async getRetraitByAgent(agentId) {
        try {
            const retraits = await this.retraitModel.findByAgentId(agentId);
            return retraits;
        } catch (error) {
            console.error("Error fetching retraits by agent:", error);
            throw error;
        }
    }

    async createRetrait(retraitData) {
        try {
            const newRetrait = await this.retraitModel.create(retraitData);
            return newRetrait;
        } catch (error) {
            console.error("Error creating retrait:", error);
            throw error;
        }
    }

    async getAutorisationByPrivilege(privilege) {
        try {
            const autorisations = await this.autorisationModel.searchByPrivilege(privilege);
            return autorisations;
        } catch (error) {
            console.error("Error fetching autorisations by privilege:", error);
            throw error;
        }
    }

    async getPrivilegesByAgent(agentId) {
        try {
            const privileges = await this.autorisationModel.findByAgentId(agentId);
            return privileges;
        } catch (error) {
            console.error("Error fetching privileges by agent:", error);
            throw error;
        }
    }
}

module.exports = AgentController;
