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

// Fonction pour vider toutes les tables
db.serialize(() => {
    const tables = ['session', 'admin'];

    tables.forEach((table) => {
        db.run(`DELETE FROM ${table}`, (err) => {
            if (err) {
                console.error(`Erreur lors de la suppression des données de la table "${table}":`, err.message);
            } else {
                console.log(`Toutes les données de la table "${table}" ont été supprimées.`);
            }
        });

        // Réinitialiser les index auto-incrémentés, si présents
        db.run(`DELETE FROM sqlite_sequence WHERE name = '${table}'`, (err) => {
            if (err) {
                console.warn(`Aucun index à réinitialiser pour la table "${table}", ou erreur:`, err.message);
            } else {
                console.log(`Index auto-incrémenté réinitialisé pour la table "${table}".`);
            }
        });

        db.run(`DROP TABLE IF EXISTS ${table}`, (err) => {
            if (err) {
                console.error(`Erreur lors de la suppression de la table "${table}":`, err.message);
            } else {
                console.log(`La table "${table}" a été supprimée.`);
            }
        });
    });
});

// Fermeture de la connexion
db.close((err) => {
    if (err) {
        console.error('Erreur lors de la fermeture de la connexion SQLite:', err.message);
    } else {
        console.log('Connexion SQLite fermée.');
    }
});