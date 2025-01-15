const express = require('express')
const app = express()
const cookieParser = require("cookie-parser");
const port = 3000
const path = require('path');

const config = require('./config.json');
const Discord = require('discord.js')
const client = new Discord.Client({ intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages
    ]})

const cors = require('cors');
app.use(cors());


app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser()); // Middleware pour traiter les cookies


let participants = []; // Remplissez avec les données actuelles de Sheety ou une autre source
let skills = []; // Remplissez avec les données actuelles de Sheety ou une autre source

//import des librairies
const pg = require('pg');
const dotenv = require("dotenv");
dotenv.config();

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI
const VALIDITY_TIME_SEC = process.env.VALIDITY_TIME_SEC
const VALIDITY_TIME_MIN = process.env.VALIDITY_TIME_MIN

//Initialisation de dotenv permettant la lecture en local dans le fichier .env
console.log("connecting to", process.env.POSTGRESQL_ADDON_URI);

//Initialisation de la config de la base de données
const pgClient = new pg.Client(process.env.POSTGRESQL_ADDON_URI);
//Connection à la base de données
pgClient.connect();

// Middleware pour vérifier les sessions
app.use("/*", async (req, res, next) => {


     sessionCookie = req.cookies.sessionId; // Récupère le cookie de session
    if (!sessionCookie) {
        console.log("Aucun cookie de session trouvé.");
        return next(); // Poursuit sans utilisateur connecté
    }

    try {
        // Requête pour vérifier la session dans la base de données
        const result = await pgClient.query({
            name: "validate-session",
            text: 'SELECT "idDiscord", "finSession" FROM session WHERE "idSession" = $1',
            values: [sessionCookie]  // sessionCookie est l'UUID à rechercher
        });

        if (result.rows.length === 0) {
            console.log("Session invalide ou expirée.");
            res.clearCookie('sessionId'); // Supprime le cookie expiré
            return next(); // Aucune session valide trouvée
        }

        const session = result.rows[0];

        let expirationTime = new Date(session.finSession);
        if (new Date() > expirationTime) {
            console.log("Session expirée.");
            // Supprimer la session expirée de la base de données
            await pgClient.query({
                name: "delete-expired-session",
                text: "DELETE FROM session WHERE idSession = $1",
                values: [sessionCookie],
            });
            res.clearCookie('sessionId'); // Supprimer le cookie
            return next(); // Session expirée
        }

        // Session valide, vous pouvez maintenant ajouter l'idDiscord à la requête
        req.idDiscord = session.idDiscord;  // Ajout de l'idDiscord dans la requête
        console.log(`Utilisateur connecté avec idDiscord : ${req.idDiscord}`);

        console.log("Session actuelle:", sessionCookie);
        console.log("Expiration de la session:", expirationTime);
        console.log("Comparaison avec l'heure actuelle:", new Date());

        next();
    } catch (error) {
        console.error("Erreur lors de la vérification de la session :", error);
        next(); // Continuer sans utilisateur
    }



});


//ancien code
/*
app.use("/*", (req,res, next)=>{
    //recupere le cookie
    //verifier la validite avec le timer
    //recupere user discord via idDiscord
    //req.user = userRecupere
    next();
})*/

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



const addSession = async ({idSession, idDiscord, dateInFrenchTimezone}) => {
    try{
        const res = await pgClient.query({
            name: "insert-session",
            text: 'INSERT INTO session VALUES($1, $2, $3)',
            values: [idSession, idDiscord, dateInFrenchTimezone]
        });
        return res.rows;
    } catch(err) {
        console.error(err)
    }
}

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

app.get('/auth/check-session', (req, res) => {
    console.log("Cookies reçus:", req.cookies); // Ajoutez ce log pour inspecter les cookies
    const sessionId = req.cookies.sessionId;
    console.log(sessionId);
    if (!sessionId) {
        return res.json({ loggedIn: false });
    }

    pgClient.query(
        'SELECT * FROM session WHERE "idSession" = $1 AND "finSession" > NOW()',
        [sessionId],
        (err, result) => {
            if (err) {
                console.error("Erreur lors de la requête PostgreSQL:", err);
                return res.json({ loggedIn: false });
            }
            if (result.rowCount === 0) {
                console.log("Aucune session valide trouvée.");
                return res.json({ loggedIn: false });
            }
            console.log("Session trouvée:", result.rowCount);
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
        let urlSearchParams = new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI,
        });
        console.log('Code reçu :', code);  // Vérifiez que le code est bien récupéré.
        console.log('token envoyé :', urlSearchParams);  // Vérifiez que le code est bien récupéré.
        const tokenResponse = await axios.post(
            'https://discord.com/api/oauth2/token',

            urlSearchParams,
            {
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }
        );

        // Vérifiez si la réponse est correcte

        const tokenData = await tokenResponse.data;
        console.log('Réponse de Discord pour le token:', tokenData);  // Vérifiez toute la réponse du token

        // Récupérer les informations utilisateur
        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });

        console.log('Réponse de Discord pour les informations utilisateur :', userResponse);
        const userData = await userResponse.data;
        console.log('Utilisateur reçu :', userData);


        //genere un id aleatoire
        const idSession = crypto.randomUUID();
        //insert new sessionUser
        let timestampUTC = new Date();
        console.log(timestampUTC);
        timestampUTC.setMinutes(timestampUTC.getMinutes() + VALIDITY_TIME_MIN);
        timestampUTC.setSeconds(timestampUTC.getSeconds() + VALIDITY_TIME_SEC);
        console.log(timestampUTC);
        let dateInFrenchTimezone = timestampUTC.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
        const idDiscord = userData.id;

        await addSession({idSession,idDiscord,dateInFrenchTimezone});
        //setCookie id Aleatoire genere

        // Option 1 : Utiliser un cookie pour conserver la session
        res.cookie('sessionId', idSession, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: VALIDITY_TIME_MIN * 60 * 1000 + VALIDITY_TIME_SEC * 1000,
        });


       res.redirect("/");
    } catch (error) {
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