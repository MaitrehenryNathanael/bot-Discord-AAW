const express = require('express');
const app = express();
const cookieParser = require("cookie-parser");
const path = require('path');
const sqlite3 = require('sqlite3').verbose(); // SQLite
const { v4: uuidv4 } = require('uuid'); // Pour générer des UUID
const cors = require('cors');

const port = 3000;
const config = require('./config.json');
const tokens = require('./tokens.json');
const Discord = require('discord.js');
const fs = require('fs')

const {Collection, REST, Routes} = require('discord.js')
const client = new Discord.Client({ intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent,
        Discord.GatewayIntentBits.GuildMembers
    ]})


app.use(cors());
app.use(express.json());


client.commands = new Collection( )
const commandFiles = fs
    .readdirSync('./commands')
    .filter((file) => file.endsWith('.js'))
const commands = [];
for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
    commands.push(new command)
}


client.on('ready', async () => {
    console.log(`Je suis prêt !`); // On affiche un message de log dans la console, lorsque le bot est démarré
    const rest = new REST({version: '10'}).setToken(config.BOT_TOKEN);
    try {
        console.log('Enregistrement des commandes slash...');
        await rest.put(
            Routes.applicationCommands(client.user.id),
            {body: commands}
        );
        console.log('Les commandes slash ont été enregistrées.');
    } catch (error) {
        console.error(error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    const command = commands.filter(c => c.name === interaction.commandName)[0];
    try {
        await command.execute(client, interaction);
    } catch (e) {
        console.error(e);
    }
})


// Charger la base de données SQLite
const dbPath = path.resolve(__dirname, 'bdd.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erreur de connexion à SQLite:', err.message);
    } else {
        console.log('Connexion réussie à SQLite.');
    }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser()); // Middleware pour traiter les cookies


let participants = []; // Remplissez avec les données actuelles de Sheety ou une autre source
let skills = []; // Remplissez avec les données actuelles de Sheety ou une autre source

require('dotenv').config();

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI
const VALIDITY_TIME_SEC = process.env.VALIDITY_TIME_SEC
const VALIDITY_TIME_MIN = process.env.VALIDITY_TIME_MIN





const { google } = require('googleapis');
const readline = require('readline');

// Charger les credentials depuis le fichier

const credentials = require('./credentials.json');
const installed = credentials.installed;
console.log(installed);

const client_id = installed.client_id;
console.log(client_id);

const client_secret = installed.client_secret;
console.log(client_secret);
const redirect_uris = installed.redirect_uris
// Créer l'instance OAuth2
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

function getAccessToken(oAuth2Client) {
    return new Promise((resolve, reject) => {
        // Génération de l'URL d'autorisation avec l'ID client et les scopes
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });

        console.log('Autorisez cette application en visitant cette URL:', authUrl);
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        rl.question('Entrez le code de la page ici: ', async (code) => {
            rl.close();
            try {
                const { tokens } = await oAuth2Client.getToken(code);
                oAuth2Client.setCredentials(tokens);
                resolve(tokens);
            } catch (err) {
                reject('Erreur lors de la récupération du jeton d\'accès : ' + err);
            }
        });
    });
}



// Cette fonction permet d'obtenir le jeton d'accès OAuth2
async function authenticateOAuth2() {
    console.log(client_id);
    console.log(client_secret);
    console.log(redirect_uris[0]);
    const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0]
    );

    // Si vous avez un jeton d'accès (par exemple, stocké localement ou précédemment récupéré)
    const token = {
        access_token: tokens.access_token,  // Remplacez ceci par votre jeton d'accès valide
        refresh_token: tokens.refresh_token, // Optionnel, si vous avez un jeton de rafraîchissement
        scope: tokens.scope,
        token_type: 'Bearer',
        expiry_date: true  // Date d'expiration (optionnelle)
    };

    // Vérifiez que le token est un objet et non une chaîne
    if (token && typeof token === 'object') {
        oAuth2Client.setCredentials(token); // Définir le jeton d'accès sur le client OAuth2
    } else {
        console.log('Jeton non valide ou inexistant, commencez l\'authentification OAuth2');
        // Appelez getAccessToken() si le jeton est invalide ou inexistant
        const tokens = await getAccessToken(oAuth2Client);
        oAuth2Client.setCredentials(tokens);
    }

    return oAuth2Client;
}

async function updateGoogleSheet(oAuth2Client, discordId, skillName, level, date) {
    const sheets = google.sheets({ version: 'v4', auth: oAuth2Client });

    const spreadsheetId = '12IlZ5US1jQOlQBFj8L1ivkTPtNpEl2uJPygO7L_Y3dI'; // Remplace par ton ID réel
    const range = 'Remplissage skills!A1:Z100';  // Plage de cellules à lire et à modifier

    try {
        // Assurez-vous que level est un nombre et que date est une chaîne au format ISO
        level = Number(level); // Convertit le niveau en nombre

        // Récupère les valeurs actuelles de la feuille
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: range,
        });

        const rows = response.data.values;
        let rowIndex = -1;

        // Cherche la ligne contenant le discordId (dans la 2ème colonne, donc index 1)
        if (rows) {
            rowIndex = rows.findIndex(row => row[1] === discordId);  // discordId est dans la 2ème colonne
        }

        if (rowIndex === -1) {
            // Si le discordId n'est pas trouvé, crée une nouvelle ligne
            rowIndex = rows.length;
            rows.push([discordId, '', '', '', '']);  // Ajoute une ligne vide avec discordId
        }

        // Cherche la colonne correspondant au skillName dans la première ligne
        let skillColumnIndex = rows[0].indexOf(skillName);

        // Mise à jour du niveau pour ce skill dans la ligne correspondante (rowIndex)
        rows[rowIndex][skillColumnIndex] = level;

        // Mise à jour de la date dans la colonne "Last Update" (indice 2)
        rows[rowIndex][2] = date;  // La 3ème colonne (Last Update)

        // Mettre à jour la feuille avec les nouvelles données
        const updateRequest = {
            spreadsheetId: spreadsheetId,
            range: range,
            valueInputOption: 'USER_ENTERED',
            resource: { values: rows },
        };

        // Effectuer la mise à jour
        const updateResponse = await sheets.spreadsheets.values.update(updateRequest);
        console.log('Sheet updated successfully:', updateResponse.data);

        // Vérifier si 'updatedRowCount' existe et afficher une confirmation
        if (updateResponse.data && updateResponse.data.updatedRowCount) {
            console.log(`Mise à jour de ${updateResponse.data.updatedRowCount} ligne(s)`);
        } else {
            console.log('Aucune ligne mise à jour.');
        }

    } catch (error) {
        console.error('Erreur lors de la mise à jour de la feuille:', error);
    }
}


async function addSkill(oAuth2Client, discordId, skillName, skillValue, date) {
    const sheets = google.sheets({ version: 'v4', auth: oAuth2Client });

    const spreadsheetId = '12IlZ5US1jQOlQBFj8L1ivkTPtNpEl2uJPygO7L_Y3dI'; // Remplace par ton ID réel
    const range = 'Remplissage skills!A1:Z100'; // Plage des données

    try {
        // Récupère les valeurs actuelles de la feuille
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: range,
        });

        const rows = response.data.values || [];
        let skillColumnIndex = -1;


        // Vérifie si le skillName existe dans la première ligne (en-tête)
        if (rows[0].includes(skillName)) {
            skillColumnIndex = rows[0].indexOf(skillName);
        } else {
            // Ajoute la nouvelle compétence dans l'en-tête
            skillColumnIndex = rows[0].length;
            rows[0].push(skillName);
            console.log("skill Column Index : ", skillColumnIndex);
            // Initialise la colonne entière à 0 pour tous les utilisateurs existants
            for (let i = 1; i < rows.length; i++) {
                while (rows[i].length <= skillColumnIndex) {
                    rows[i].push(''); // Remplit les colonnes manquantes
                }
                rows[i][skillColumnIndex] = 0; // Initialise la compétence à 0
            }
        }


        // Trouve la ligne contenant l'idDiscord
        let rowIndex = rows.findIndex(row => row[1] === discordId);
        console.log("Row index:", rowIndex);

        // Met à jour la valeur de la compétence pour l'idDiscord spécifié
        rows[rowIndex][skillColumnIndex] = skillValue;
        rows[rowIndex][2] = date;
        // Mettre à jour la feuille avec les nouvelles données
        const updateRequest = {
            spreadsheetId: spreadsheetId,
            range: range,
            valueInputOption: 'USER_ENTERED', // Interprétation utilisateur
            resource: { values: rows },
        };

        // Effectue la mise à jour
        const updateResponse = await sheets.spreadsheets.values.update(updateRequest);
        console.log('Sheet updated successfully:', updateResponse.data);

        if (updateResponse.data && updateResponse.data.updatedRows) {
            console.log(`Mise à jour de ${updateResponse.data.updatedRows} ligne(s).`);
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la feuille:', error);
    }
}



let idCourant;




app.put('/api/skills/:discordId/:skillName', async (req, res) => {
    const { discordId, skillName } = req.params;
    const { level, date } = req.body;

    console.log("Mise à jour de la compétence pour l'utilisateur avec ID:", discordId);
    console.log("Compétence:", skillName);
    console.log("Nouveau niveau:", level);
    console.log("Nouvelle date de mise à jour:", date);

    try {
        // Authentification OAuth2
        const oAuth2Client = await authenticateOAuth2(); // Authentifie l'utilisateur et récupère le jeton d'accès

        // Appel à la fonction updateGoogleSheet
        const result = await  updateGoogleSheet(oAuth2Client, discordId, skillName, level, date);

        return res.json({
            message: "Compétence mise à jour avec succès.",
        });
    } catch (error) {
        console.error("Erreur lors de l'opération :", error);
        return res.status(500).json({
            message: "Erreur lors de la mise à jour de la feuille.",
            error: error.message || error
        });
    }
});


// Route PUT pour gérer la mise à jour des compétences
app.put('/api/skills', async (req, res) => {
    const { discordId, skillName, level, date } = req.body;

    if (!discordId || !skillName || level === undefined) {
        return res.status(400).send({ error: 'Paramètres manquants dans la requête.' });
    }

    try {
        const oAuth2Client = await authenticateOAuth2();
        await addSkill(oAuth2Client, discordId, skillName, level, date);
        res.status(200).send({ message: 'Compétence mise à jour avec succès.' });
    } catch (error) {
        console.error('Erreur dans /api/skills:', error);
        res.status(500).send({ error: 'Erreur lors de la mise à jour des compétences.' });
    }
});



// Middleware pour vérifier les sessions
app.use("/*", (req, res, next) => {
    const sessionCookie = req.cookies.sessionId; // Récupère le cookie de session
    if (!sessionCookie) {
        console.log("Aucun cookie de session trouvé.");
        return next(); // Poursuit sans utilisateur connecté
    }

    db.get(
        'SELECT id_discord, fin_session FROM session WHERE id_session = ?',
        [sessionCookie],
        (err, session) => {
            if (err) {
                console.error("Erreur lors de la vérification de la session :", err);
                return next(); // Continuer sans utilisateur
            }

            if (!session) {
                console.log("Session invalide ou expirée.");
                res.clearCookie('sessionId'); // Supprime le cookie expiré
                return next(); // Aucune session valide trouvée
            }

            const expirationTime = new Date(session.fin_session);
            if (new Date() > expirationTime) {
                console.log("Session expirée.");
                db.run(
                    "DELETE FROM session WHERE id_session = ?",
                    [sessionCookie],
                    (deleteErr) => {
                        if (deleteErr) {
                            console.error("Erreur lors de la suppression de la session :", deleteErr);
                        }
                    }
                );
                res.clearCookie('sessionId'); // Supprimer le cookie
                return next(); // Session expirée
            }

            // Session valide, ajoute l'id_discord à la requête
            req.idDiscord = String(session.id_discord); // Forcer à chaîne
            console.log(`Utilisateur connecté avec id_discord : ${req.idDiscord}`);
            idCourant = req.idDiscord;
            next();
        }
    );
});
app.get('/api/current-id', (req, res) => {
    res.json({ idCourant });
});



function setHeaders(headers) {
    // Ici, vous pouvez manipuler ou utiliser les en-têtes comme bon vous semble
    // Par exemple, vous pouvez simplement les enregistrer ou les utiliser dans votre traitement.
    console.log('En-têtes:', headers);
    // Par exemple, vous pouvez retourner les en-têtes dans un tableau global si vous avez besoin de les réutiliser
    return headers;
}

// Simulez l'appel API pour obtenir les compétences
app.get('/api/skills', (req, res) => {
    console.log("TU VIENS ICI MON CON");
    const user = req.user;
    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${config.SPREADSHEET_ID}/values/${config.SPREADSHEET_SHEETNAME}!${config.SPREADSHEET_DATA}?key=${config.SPREADSHEET_KEY}`)
        .then(response => response.json()) // Récupérer les données sous forme de JSON
        .then(data => {
            // console.log(data);  // Afficher toute la réponse pour vérifier la structure des données

            const rows = data.values || [];  // Récupérer les lignes de données
            // console.log(`Nombre de lignes récupérées : ${rows.length}`, rows);  // Vérifier le nombre de lignes

            if (rows.length === 0) {
                // Si aucune donnée n'est récupérée, renvoyer une réponse vide ou une erreur
                return res.status(404).json({ message: 'Aucune donnée trouvée' });
            }

            // On suppose que la première ligne contient les en-têtes des colonnes
            const headers = rows[0];  // Les en-têtes sont dans la première ligne
            console.log('En-têtes récupérés:', headers);  // Afficher les en-têtes pour vérifier

            // Traiter les données
            const studentsData = rows.slice(1).map(row => {
                const student = {
                    name: row[0],
                    discordId: row[1],
                    lastUpdate: row[2],
                    skills: []
                };

                // Vérifier les données de chaque compétence
                for (let i = 3; i < row.length; i++) {
                    student.skills.push({
                        skill: headers[i - 3],  // Les compétences commencent à partir de la 3e colonne
                        level: parseInt(row[i])  // On convertit les notes en nombres (1 à 10)
                    });
                }

                return student;
            });

            // Renvoi des données traitées au frontend
            res.json(studentsData);  // Renvoi les données traitées dans la réponse API
        })
        .catch(error => {
            // Gestion des erreurs
            console.error('Erreur lors de la récupération des données :', error);
            res.status(500).json({ message: 'Erreur interne du serveur', error: error.message });
        });
});


app.get('/api/users/:discordId/skills', (req, res) => {
    const { discordId } = req.params;  // Récupère l'userId depuis l'URL

    console.log("Recherche des compétences pour l'utilisateur avec ID:", discordId);

    // On effectue la requête pour récupérer les données de la feuille de calcul
    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${config.SPREADSHEET_ID}/values/${config.SPREADSHEET_SHEETNAME}!${config.SPREADSHEET_DATA}?key=${config.SPREADSHEET_KEY}`)
        .then(response => response.json()) // Récupérer les données sous forme de JSON
        .then(data => {
            const rows = data.values || [];  // Récupérer les lignes de données

            if (rows.length === 0) {
                return res.status(404).json({ message: 'Aucune donnée trouvée' });
            }

            // On suppose que la première ligne contient les en-têtes des colonnes
            const headers = rows[0];

            // Recherche de l'utilisateur dans les lignes de données
            const userSkills = rows.slice(1).find(row => row[1] === discordId);  // On suppose que l'ID Discord est en 2e position

            if (!userSkills) {
                return res.status(404).json({ message: `Aucune compétence trouvée pour l'utilisateur avec ID ${discordId}` });
            }

            // Les en-têtes des compétences commencent à la colonne D, donc on commence à l'index 3 (indexé à partir de 0)
            const skillHeaders = headers.slice(3); // Récupérer les en-têtes des compétences (D, E, F, etc.)

            // Récupérer les valeurs des compétences associées à l'utilisateur
            const userSkillsData = userSkills.slice(3); // Récupérer les valeurs des compétences (D, E, F, etc.)

            // Créer un tableau des compétences avec les en-têtes et les valeurs
            const skills = skillHeaders.map((header, index) => ({
                skill: header,  // Nom de la compétence
                level: parseInt(userSkillsData[index], 10) || 0,  // Niveau de la compétence (assurez-vous que la valeur soit un nombre)
            }));

            // Retourner les compétences formatées pour l'utilisateur
            res.json({
                name: userSkills[0],  // Nom de l'utilisateur (1ère colonne)
                discordId: userSkills[1],  // ID Discord de l'utilisateur (2e colonne)
                lastUpdate: userSkills[2],  // Date de la dernière mise à jour (3e colonne)
                skills: skills  // Liste des compétences formatées
            });
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des données :', error);
            res.status(500).json({ message: 'Erreur interne du serveur', error: error.message });
        });
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

app.listen(port, () => { //start the web and bot discord
    console.log(`Server started on port: ${port}`)
    client.login(config.BOT_TOKEN); // start bot discord
})


const axios = require('axios'); // Assurez-vous que le package axios est installé



// Fonction pour ajouter une session
const addSession = ({ idSession, idDiscord, finSession }) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO session (id_session, id_discord, fin_session) VALUES (?, ?, ?)`,
            [idSession, idDiscord, finSession],
            (err) => {
                if (err) {
                    console.error("Erreur lors de l'ajout de la session :", err);
                    reject(err);
                } else {
                    resolve();
                }
            }
        );
    });
};

const sessions = async () => {
    try{
        const res = await pgClient.query({
            name: "read-sessions",
            text: 'select idSession, idDiscord, finSession from session;',
        });
        return res.rows;
    } catch(err) {
        console.error(err)
    }
}

// Route pour vérifier la session
app.get('/auth/check-session', (req, res) => {
    const sessionId = req.cookies.sessionId;
    if (!sessionId) {
        return res.json({ loggedIn: false });
    }

    db.get(
        'SELECT * FROM session WHERE id_session = ? AND fin_session > datetime("now")',
        [sessionId],
        (err, session) => {
            if (err) {
                console.error("Erreur lors de la requête SQLite :", err);
                return res.json({ loggedIn: false });
            }
            if (!session) {
                console.log("Aucune session valide trouvée.");
                return res.json({ loggedIn: false });
            }
            console.log("Session trouvée :", session);
            res.json({ loggedIn: true });
        }
    );
});


// Route de callback pour Discord
app.get('/auth/discord/callback', async (req, res) => {
    const code = req.query.code;

    if (!code) {
        console.error('Aucun code reçu dans la requête.');
        return res.status(400).send('Code manquant.');
    }

    try {
        // Échange du code contre un jeton d'accès
        console.log(process.env.CLIENT_ID);
        console.log(process.env.CLIENT_ID);
        const tokenResponse = await axios.post(
            'https://discord.com/api/oauth2/token',
            new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: REDIRECT_URI,
            }),
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }
        );

        const tokenData = tokenResponse.data;
        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });

        const userData = userResponse.data;
        console.log(userData);
        // Génération d'un nouvel ID de session
        const idSession = uuidv4();
        const idDiscord = userData.id.toString();

        // Définir une date d'expiration
        const expirationDate = new Date();
        expirationDate.setMinutes(expirationDate.getMinutes() + parseInt(process.env.VALIDITY_TIME_MIN || "30"));
        expirationDate.setSeconds(expirationDate.getSeconds() + parseInt(process.env.VALIDITY_TIME_SEC || "0"));

        // Ajouter la session à la base de données
        await addSession({
            idSession,
            idDiscord,
            finSession: expirationDate.toISOString()
        });

        // Définir le cookie
        res.cookie('sessionId', idSession, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: expirationDate - new Date(),
        });

        res.redirect("/");
    } catch (error) {
        if (error.response) {
            console.error('Détails de l\'erreur Discord :', error.response.data);
        }
        console.error('Erreur lors de la connexion Discord :', error.message);
        res.status(500).send('Erreur lors de la connexion à Discord.');
    }
});

// Endpoint pour une route spécifique
app.get('/student-profile/:discordId', (req, res) => {
    //const studentData = {}; // Remplacez par les vraies données.
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});


// Routes API pour servir l'application React
app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});



app.post('/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Erreur lors de la déconnexion");
        }
        // Supprimer le cookie de session
        res.clearCookie('sessionId');
        res.send("Déconnexion réussie");
    });
});


