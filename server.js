const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const config = require('./config.json');
const Discord = require('discord.js');
const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages
    ]
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let participants = []; // Liste des participants (sera remplie par les données récupérées depuis Google Sheets)
let skills = []; // Liste des compétences (si tu en as besoin)
let headers = []; // En-têtes des compétences (par exemple AAW, COO, Cuisine, etc.)

// Simulez l'appel API pour obtenir les compétences
app.get('/api/skills', (req, res) => {
    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${config.SPREADSHEET_ID}/values/${config.SPREADSHEET_SHEETNAME}!${config.SPREADSHEET_DATA}?key=${config.SPREADSHEET_KEY}`)
        .then(response => response.json())
        .then(data => {
            const rows = data.values || [];
            setHeaders(rows[0]);  // En-têtes (les compétences)
            const studentsData = rows.slice(1).map(row => {
                const student = {
                    name: row[0],
                    discordId: row[1],
                    lastUpdate: row[2],
                    skills: []
                };

                // Assigner les compétences à chaque participant avec leurs notes respectives
                for (let i = 3; i < row.length; i++) {
                    student.skills.push({
                        skill: headers[i - 3],  // Les compétences commencent à partir de la 3e colonne
                        level: parseInt(row[i])  // On convertit les notes en nombres (1 à 10)
                    });
                }
                return student;
            });
            participants = studentsData;
            res.json(skills);
        });
});

/*
// Route pour obtenir tous les participants
app.get('/api/participants', (req, res) => {
    res.json(participants);
});

// Route pour récupérer un participant par discordId
app.get('/api/participants/:discordId', (req, res) => {
    console.log("Participants disponibles:", participants);  // Log des participants actuels
    const participant = participants.find(p => p.discordId === req.params.discordId);
    if (!participant) {
        console.log("Participant introuvable.");
        return res.status(404).json({ error: "Participant introuvable." });
    }
    console.log("Participant trouvé :", participant);  // Log du participant trouvé
    res.json(participant);
});

// Route pour vider et mettre à jour les participants depuis Google Sheets
app.post('/api/update-participants', (req, res) => {
    participants = []; // Vider les participants avant de les mettre à jour
    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${config.SPREADSHEET_ID}/values/${config.SPREADSHEET_SHEETNAME}!${config.SPREADSHEET_DATA}?key=${config.SPREADSHEET_KEY}`)
        .then(response => response.json())
        .then(data => {
            const rows = data.values || [];
            if (rows.length === 0) {
                console.error("Aucune donnée trouvée dans la feuille Google Sheets.");
                return res.status(500).json({ error: "Aucune donnée trouvée dans la feuille Google Sheets." });
            }
            setHeaders(rows[0]); // Définir les en-têtes des compétences
            const studentsData = rows.slice(1).map((row, index) => ({
                id: index + 1,
                name: row[0],
                discordId: row[1],
                lastUpdate: row[2],
                skills: headers.slice(3).map((header, i) => ({
                    skill: header,
                    level: parseInt(row[i + 3]) // On prend la note (de 1 à 10) pour chaque compétence
                }))
            }));
            participants = studentsData; // Mettre à jour les participants
            res.json(participants); // Retourner la liste mise à jour
        })
        .catch(error => {
            console.error("Erreur lors de la récupération des données :", error);
            res.status(500).json({ error: "Erreur lors de la récupération des données" });
        });
});

// Route pour ajouter un nouveau participant
app.post('/api/participants', (req, res) => {
    const participant = req.body;
    participant.id = generateNewParticipantId();
    participants.push(participant);
    res.json(participants); // Retourne la liste mise à jour des participants
});

// Fonction pour générer un nouvel ID de participant
function generateNewParticipantId() {
    return participants.length ? Math.max(participants.map(p => p.id)) + 1 : 1;
}

*/
// Endpoint pour une route spécifique
app.get('/student-profile/:discordId', (req, res) => {
    //const studentData = {}; // Remplacez par les vraies données.
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});



// Routes API pour servir l'application React
app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
    console.log(`Server started on port: ${port}`);
    client.login(config.BOT_TOKEN); // Start Discord bot
});
