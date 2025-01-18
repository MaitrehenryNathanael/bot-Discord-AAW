const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid'); // Utilisé pour générer des UUID
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

// Création des tables
db.serialize(() => {
    // Table session
    db.run(`
        CREATE TABLE IF NOT EXISTS session (
                                               id_session TEXT PRIMARY KEY,        -- UUID
                                               id_discord TEXT NOT NULL,         -- Identifiant Discord
                                               fin_session DATE                    -- Date de fin de session
        )
    `, (err) => {
        if (err) {
            console.error('Erreur lors de la création de la table session:', err.message);
        } else {
            console.log('Table "session" créée ou déjà existante.');
        }
    });

    // Table admin
    db.run(`
    CREATE TABLE IF NOT EXISTS admin (
      id_discord TEXT PRIMARY KEY       -- Identifiant Discord
    )
  `, (err) => {
        if (err) {
            console.error('Erreur lors de la création de la table admin:', err.message);
        } else {
            console.log('Table "admin" créée ou déjà existante.');
        }
    });

    const adminId = '664134848029655040'; // L'ID Discord de l'administrateur à ajouter
    db.run(`
        INSERT OR IGNORE INTO admin (id_discord)
        VALUES (?)`, [adminId], (err) => {
        if (err) {
            console.error('Erreur lors de l\'ajout de l\'admin:', err.message);
        } else {
            console.log('Administrateur ajouté avec succès.');
        }
    });
});