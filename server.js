const express = require('express')
const app = express()
const port = 3000
app.use(express.json());
const fs = require('fs')

const config = require('./config.json');
const Discord = require('discord.js')
const {Collection, REST, Routes} = require('discord.js')
const client = new Discord.Client({ intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages
    ]})

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


app.use(express.static("public"));


app.listen(port, () => { //start the web and bot discord
    console.log(`Server started on port: ${port}`)
    client.login(config.BOT_TOKEN); // start bot discord
})


