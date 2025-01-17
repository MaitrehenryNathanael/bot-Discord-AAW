const express = require('express');
const app = express();
const cookieParser = require("cookie-parser");
const path = require('path');
const sqlite3 = require('sqlite3').verbose(); // SQLite
const { v4: uuidv4 } = require('uuid'); // Pour générer des UUID
const cors = require('cors');

const port = 3000;
const config = require('./config.json');
const Discord = require('discord.js');
const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages
    ]
});

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
            req.idDiscord = session.id_discord;
            console.log(`Utilisateur connecté avec id_discord : ${req.idDiscord}`);
            next();
        }
    );
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
        const tokenResponse = await axios.post(
            'https://discord.com/api/oauth2/token',
            new URLSearchParams({
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: process.env.REDIRECT_URI,
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

        // Génération d'un nouvel ID de session
        const idSession = uuidv4();
        const idDiscord = userData.id;

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