import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate} from 'react-router-dom';
import '../styles/styles.scss';


// Importer le composant Home (accueil)
import Home from "./Home";
import AddSkill from "./addSkill";
import SkillsTable from "./skillsTable";
import StudentProfile from './StudentProfile';
const config = require('../../config.json');


const Login = ({ setIsLoggedIn }) => {
    const navigate = useNavigate();

    const handleLogin = () => {
        // Simulez une connexion utilisateur
        setIsLoggedIn(true);
        navigate("/"); // Redirige l'utilisateur vers la page d'accueil
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h2>Connexion</h2>
                <p>Veuillez vous connecter pour accéder à votre compte</p>
                <button onClick={handleLogin} className="submit-button">
                    Se connecter via Discord
                </button>
            </div>
        </div>
    );
};


// Composant principal
const App = () => {
    const [students, setStudents] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    useEffect(() => {

        //const url = `https://sheets.googleapis.com/v4/spreadsheets/${config.SPREADSHEET_ID}/values/${config.SPREADSHEET_SHEETNAME}!${config.SPREADSHEET_DATA}?key=${config.SPREADSHEET_KEY}`;
        //console.log("URL utilisée :", url);

        fetch(`https://sheets.googleapis.com/v4/spreadsheets/${config.SPREADSHEET_ID}/values/${config.SPREADSHEET_SHEETNAME}!${config.SPREADSHEET_DATA}?key=${config.SPREADSHEET_KEY}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erreur HTTP : ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (!data.values || data.values.length === 0) {
                    console.error("Aucune donnée disponible dans la feuille.");
                    return;
                }

                //console.log("Données récupérées :", data.values);
                // Traitez les données ici, par exemple :
                const rows = data.values || [];
                rows.forEach(row => {
                    //console.log(row); // Chaque `row` est une ligne du tableau
                });


                const studentsData = rows.slice(1).map(row => ({
                    name: row[0],
                    discordId: row[1],
                    lastUpdate: row[2],
                }));
                setStudents(studentsData); // Mettez à jour l'état avec les données des étudiants
            })
            .catch(error => {
                console.error("Erreur lors de la récupération des données :", error);
            });
    }, []); // Dépendances vides pour exécuter la requête au montage du composant

    return (
        <Router>
            <nav className="navbar">
                <div className="navbar-links">
                    <Link className="navbar-item" to="/">Accueil</Link>
                    <Link className="navbar-item" to="/skills">Tableau des compétences</Link>
                    {!isLoggedIn ? (
                        <Link className="navbar-item" to="/login">
                            Connexion
                        </Link>
                    ) : (
                        <>
                            <Link className="navbar-item" to="/add">
                                Ajouter
                            </Link>
                            <Link
                                className="navbar-item"
                                to="/"
                                onClick={() => setIsLoggedIn(false)}
                            >
                                Déconnexion
                            </Link>
                        </>
                    )}
                </div>
            </nav>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
                <Route path="/skills" element={<SkillsTable config={config}/>} />
                <Route path="/student-profile/:discordId" element={<StudentProfile students={students} />} />
                {isLoggedIn && <Route path="/add" element={<AddSkill />} />}
            </Routes>
        </Router>
    );
};


// Rendu de l'application
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
