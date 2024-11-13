const {SlashCommandBuilder} = require("discord.js");
module.exports = class AddCompetance extends SlashCommandBuilder{
    constructor() {
        super();
        this.name = 'addcompetance';
        this.description ="la commande vous ajoute des competances";
    }
    async execute(interaction) {
        await interaction.reply(`This command was run by ${interaction.user.username}, who joined on ${interaction.member.joinedAt}.`);
    }
}