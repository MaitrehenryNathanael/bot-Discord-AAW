const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
const port = 3000;

// Créer un nouveau client Discord avec les intents nécessaires
const bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
       // GatewayIntentBits.MessageContent
    ]
});

app.use(express.json());
app.use(express.static("public"));

// Écouter l'événement `ready` pour savoir que le bot est en ligne
bot.on('ready', () => {
    console.log('Le bot est prêt !');
});

// Connecter le bot avec votre token (remplacez avec votre propre token)
bot.login('MTI5NjA5Mjg0NDU4MjM3NTQ3NQ.G8cp9g.YcGVnxkiz2F_VdBn50Ubd3rVtkem9Y1zIhr1kI');

// Lancer le serveur Express
app.listen(port, () => {
    console.log(`Serveur démarré sur le port : ${port}`);
});

//test camille

