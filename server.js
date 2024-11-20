const express = require('express')
const app = express()
const port = 3000
const path = require('path');

const config = require('./config.json');
const Discord = require('discord.js')
const client = new Discord.Client({ intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages
    ]})

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let participants = []; // Remplissez avec les données actuelles de Sheety ou une autre source
let skills = []; // Remplissez avec les données actuelles de Sheety ou une autre source


// Simulez l'appel API pour obtenir les compétences
app.get('/api/skills', (req, res) => {
    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${config.SPREADSHEET_ID}/values/${config.SPREADSHEET_SHEETNAME}!${config.SPREADSHEET_DATA}?key=${config.SPREADSHEET_KEY}`)
        .then(response => response.json())
        .then(data => {
            //res.send des datas
            ///front prend juste les données pour les afficher depuis le back
        })
            console.log(data);  // Affichez toute la réponse pour vérifier la structure et les résultats
            const rows = data.values || [];
            console.log(`Nombre de lignes récupérées : ${rows.length}`,rows); // Vérifiez le nombre de lignes récupérées
            setHeaders(rows[0]);  // En-têtes
            const studentsData = rows.slice(1).map(row => {
                const student = {
                    name: row[0],
                    discordId: row[1],
                    lastUpdate: row[2],
                    skills: []
                };
                console.log(student);
                for (let i = 3; i < row.length; i++) {
                    student.skills.push({
                        skill: headers[i],
                        level: row[i] === 'true' ? 'Oui' : 'Non'
                    });
                }
                return student;
            });
    res.json(skills);
});

// Simulez l'appel API pour obtenir tous les participants
app.get('/api/participants', (req, res) => {
    res.json(participants);
});

// Ajoute un nouveau participant
app.post('/api/participants', (req, res) => {
    const participant = req.body;
    participant.id = generateNewParticipantId(); // Fonction à définir pour générer un nouvel ID
    participants.push(participant);
    res.json(participants); // Retourne la liste mise à jour des participants
});

/*
// Génération d'un nouvel ID pour les compétences
function generateNewSkillId() {
    return skills.length + 1;
}*/

// Génération d'un nouvel ID pour les participants
function generateNewParticipantId() {
    return participants.length ? Math.max(participants.map(p => p.id)) + 1 : 1;
}

// Routes API

// Route pour obtenir toutes les compétences
app.get('/api/skills', (req, res) => {
    res.json(skills);
});

// Route pour ajouter une nouvelle compétence
app.post('/api/skills', (req, res) => {
    const skill = req.body;
    skill.id = generateNewSkillId();
    skills.push(skill);
    res.json(skills); // Retourne la liste mise à jour des compétences
});

// Route pour obtenir tous les participants
app.get('/api/participants', (req, res) => {
    res.json(participants);
});

// Route pour ajouter un nouveau participant
app.post('/api/participants', (req, res) => {
    const participant = req.body;
    participant.id = generateNewParticipantId();
    participants.push(participant);
    res.json(participants); // Retourne la liste mise à jour des participants
});

// Route pour servir l'application React (index.html)
app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});


app.listen(port, () => { //start the web and bot discord
    console.log(`Server started on port: ${port}`)
    client.login(config.BOT_TOKEN); // start bot discord
})


