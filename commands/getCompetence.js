const {SlashCommandBuilder, EmbedBuilder} = require("discord.js");
const config = require('./../config.json');

module.exports = class getCompetence extends SlashCommandBuilder{
    constructor() {
        super();
        this.name = 'get-competence';
        this.description ="la commande vous ajoute des competences";
        this.addSubcommand(user =>
            user
                .setName('user')
                .setDescription('Info about a user')
                .addUserOption(option => option.setName('target').setDescription('The user').setRequired(true))
        )
        this.addSubcommand(allusers =>
            allusers
                .setName('users')
                .setDescription('Info about all users')
        )
    }

    async execute(client, interaction) {
        await interaction.deferReply();
        let data = await this.getData();
        if(interaction.options.getSubcommand(false) === 'user') {
            let userTarget = interaction.options.getUser('target')

            let embed = new EmbedBuilder()
                .setTitle('competences de '+ userTarget.username)
                .setDescription('Voici toute les competences')
                .setColor('#3498db'); // Couleur hexadécimale
            let fields = []
            for (let i = 1; i < data.values.length; i++) {
                let user = data.values[i];
                if (user[1] === userTarget.id){
                    for (let cmp = 3; cmp < data.values[0].length; cmp++) {
                        fields.push({name: data.values[0][cmp], value: 'niveau : '+user[cmp], inline: false});
                    }
                    embed.addFields(fields);
                }
            }
            await interaction.editReply({ embeds: [embed] });

        }else{
            let embeds = []
            for (let i = 1; i < data.values.length; i++) {
                let fields = []
                let user = data.values[i];
                let embed = new EmbedBuilder()
                    .setTitle('competences '+ data.values[i][0])
                    .setDescription('Voici tous les niveaux')
                    .setColor('#3498db'); // Couleur hexadécimale
                for (let cmp = 3; cmp < data.values[0].length; cmp++) {
                    fields.push({name: data.values[0][cmp], value: 'niveau : ' +user[cmp], inline: true});
                }
                embed.addFields(fields);
                embeds.push(embed);
            }
            for (let i = 0; i < embeds.length; i+=10) {
                if (i===0){
                    await interaction.editReply({ embeds: embeds.slice(0,10) })
                }else{
                    await interaction.followUp({ embeds: embeds.slice(i,i+10) })
                }
            }

        }
    }


    async getData(){
        let spreadesheet = "https://sheets.googleapis.com/v4/spreadsheets/"+config.SPREADSHEET_ID+"/values/"+config.SPREADSHEET_SHEETNAME+"!"+config.SPREADSHEET_DATA+"?key="+config.SPREADSHEET_KEY
        try{
            let res = await fetch(spreadesheet);
            let data = await res.json();
            if (data.values){
                return data;
            }else{
                console.error("Error occurred while fetching data.");
                return null
            }
        }catch (e) {
            console.error(e);
            return null
        }
    }
}