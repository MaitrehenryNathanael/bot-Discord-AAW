const {SlashCommandBuilder} = require("discord.js");
module.exports = class Test extends SlashCommandBuilder{
    constructor() {
        super();
        this.setName("test");
        this.setDescription("command test");
    }
    async execute(interaction) {
        await interaction.reply(`This command was run by ${interaction.user.username}, who joined on ${interaction.member.joinedAt}.`);
    }
}