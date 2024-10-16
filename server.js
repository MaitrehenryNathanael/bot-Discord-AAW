const express = require('express')
const Discord = require('discord.js')

const app = express()
const port = 3000
const bot = new Discord.Client()
app.use(express.json());

app.use(express.static("public"));

client.on('ready', () => {
    console.log(`Je suis prêt !`); // On affiche un message de log dans la console (ligne de commande), lorsque le bot est démarré
});
client.login('MTI5NjA5Mjg0NDU4MjM3NTQ3NQ.G8cp9g.YcGVnxkiz2F_VdBn50Ubd3rVtkem9Y1zIhr1kI');
app.listen(port, () => {
    console.log(`Server started on port: ${port}`)
})



