const {SlashCommandBuilder, EmbedBuilder} = require("discord.js");
const { google } = require('googleapis');
const sheets = google.sheets('v4');
const config = require('./../config.json')

const auth = new google.auth.GoogleAuth({
    keyFile: './gapiKey.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

module.exports = class setCompetenceAdmin extends SlashCommandBuilder {
    constructor() {
        super();
        this.name = 'set-competence-user';
        this.description = "la commande vous ajoute/met à jour des competences";
        this.setDefaultMemberPermissions(0);
        this.addStringOption(option => option.setName('skill').setDescription('The skill').setRequired(true));
        this.addIntegerOption(option => option.setName('value').setDescription('value of the skill').setRequired(true).setMinValue(0).setMaxValue(0).setMaxValue(10));
        this.addUserOption(option => option.setName('user').setDescription("The user target, if not set it's you").setRequired(false))
    }

    async execute(client, interaction) {
        await interaction.deferReply();
        let data = await this.getData();
        let userTarget;
        if (interaction.options.getUser('user') != null){
            userTarget = interaction.options.getUser('user');
        }else{
            userTarget = interaction.user.id;
        }
        let ligne="";
        let column = "";
        for (let cmp = 3; cmp < data.values[0].length; cmp++) {
            if (data.values[0][cmp] ===  interaction.options.getString('skill')) {
                column = String.fromCharCode(65+cmp);
            }
        }
        for (let i = 1; i < data.values.length; i++) {
            let user = data.values[i];
            if (user[1] === userTarget.id){
                ligne += (i+1).toString();
            }
        }
        console.log(column+ligne);
        const authClient = await auth.getClient();
        let updates = [
            {
                range: 'Remplissage skills!C'+ligne,
                values: [
                    [ new Date().toLocaleString("fr-FR")], // Valeur à insérer
                ],
            },
            {
                range: 'Remplissage skills!'+column+ligne,
                values: [
                    [ interaction.options.getInteger('value').toString()], // Valeur à insérer
                ],
            }
        ]
        const request = {
            spreadsheetId: config.SPREADSHEET_ID,
            resource: {
                data: updates,
                valueInputOption: 'RAW'
            },
            auth: authClient,
        }
        try {
            const response = await sheets.spreadsheets.values.batchUpdate(request);
            console.log('Mise à jour réussie :', response.data);
        } catch (err) {
            console.error('Erreur lors de la mise à jour :', err);
        }

        //affiche competences
        data = data = await this.getData();
        let embed = new EmbedBuilder()
            .setTitle('competences')
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