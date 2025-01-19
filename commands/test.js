const {SlashCommandBuilder} = require("discord.js");
module.exports = class Test extends SlashCommandBuilder{
    constructor() {
        super();
        this.name = 'test'
        this.description ="command test";
    }
    async execute(client, interaction) {
        try {
            await interaction.reply(`This command was run by ${interaction.user.username}, who joined on ${interaction.member.joinedAt}.`);
        }catch (e) {
            console.error(e);
        }
    }
}