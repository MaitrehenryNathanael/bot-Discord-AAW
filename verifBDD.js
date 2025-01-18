const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Chemin vers le fichier SQLite
const dbPath = path.resolve(__dirname, 'bdd.sqlite');

// Connexion à la base de données
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erreur de connexion à SQLite:', err.message);
    } else {
        console.log('Connexion réussie à SQLite.');
    }
});

// Afficher toutes les sessions
db.all('SELECT * FROM session', (err, rows) => {
    if (err) {
        console.error('Erreur lors de la récupération des sessions:', err.message);
    } else {
        console.log('Données des sessions:', rows);
    }
});

// Afficher tous les administrateurs
db.all('SELECT * FROM admin', (err, rows) => {
    if (err) {
        console.error('Erreur lors de la récupération des administrateurs:', err.message);
    } else {
        console.log('Données des administrateurs:', rows);
    }
});