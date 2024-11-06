const express = require('express')
const app = express()
const port = 3000
app.use(express.json());

const config = require('./config.json');
const Discord = require('discord.js')
const client = new Discord.Client({ intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages
    ]})

client.commands = new Collection();

client.on('ready', () => {
    console.log(`Je suis prêt !`); // On affiche un message de log dans la console,   lorsque le bot est démarré
});


app.use(express.static("public"));


app.listen(port, () => { //start the web and bot discord
    console.log(`Server started on port: ${port}`)
    client.login(config.BOT_TOKEN); // start bot discord
})


