import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import '../styles/styles.scss';

// Importer le composant Home (accueil)
import Home from "./Home";
import AddSkill from "./addSkill";
import SkillsTable from "./skillsTable";
import StudentProfile from './StudentProfile';
const config = require('../../config.json');

const Login = ({ setIsLoggedIn }) => {
    const navigate = useNavigate();
    const discordAuthUrl = "https://discord.com/api/oauth2/authorize?client_id=1296092844582375475&redirect_uri=http://localhost:3000/auth/discord/callback&response_type=code&scope=identify";

    const fetchDataFromDiscord = async (code) => {
        try {
            const response = await fetch(`/auth/discord/callback?code=${code}`, {
                method: "GET",
                credentials: "include",
            });

            const data = await response.json();

            if (data && data.success) {
                setIsLoggedIn(true); // Met à jour l'état global
                //navigate("/"); // Redirige après la connexion
            }
        } catch (error) {
            console.error("Erreur lors de l'authentification Discord:", error);
        }
    };

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const code = queryParams.get("code");

        if (code) {
            fetchDataFromDiscord(code);
        }
    }, [setIsLoggedIn]);

    const handleDiscordLogin = () => {
        window.location.href = discordAuthUrl;
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h2>Connexion</h2>
                <p>Veuillez vous connecter pour accéder à votre compte</p>
                <button className="submit-button" onClick={handleDiscordLogin}>
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
        console.log("NTM LE REACT");
        const checkSession = async () => {
            console.log("TEST DE MALADE");
            const response = await fetch('/auth/check-session', {
                credentials: 'include' // Assurez-vous que les cookies sont envoyés avec la requête
            });

            const data = await response.json();
            console.log(data);
            setIsLoggedIn(data.loggedIn); // Mettez à jour l'état en fonction de la réponse
        };
        checkSession(); // Appel de la fonction dès que le composant est monté
    }, []);


    useEffect(() => {
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

                const studentsData = data.values.slice(1).map(row => ({
                    name: row[0],
                    discordId: row[1],
                    lastUpdate: row[2],
                }));
                setStudents(studentsData);
            })
            .catch(error => {
                console.error("Erreur lors de la récupération des données :", error);
            });
    }, []);

    return (
        <Router> {/* Assurez que <Router> englobe tout */}
            <nav className="navbar">
                <div className="navbar-links">
                    <Link className="navbar-item" to="/">Accueil</Link>
                    <Link className="navbar-item" to="/skills">Tableau des étudiants</Link>
                    {!isLoggedIn ? (
                        <Link className="navbar-item" to="/login">Connexion</Link>
                    ) : (
                        <>
                            <Link className="navbar-item" to="/add">Ajouter</Link>
                            <Link className="navbar-item" to="/" onClick={() => setIsLoggedIn(false)}>Déconnexion</Link>
                        </>
                    )}
                </div>
            </nav>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
                <Route path="/skills" element={<SkillsTable config={config} />} />
                <Route path="/student-profile/:discordId" element={<StudentProfile students={students} />} />
                {isLoggedIn && <Route path="/add" element={<AddSkill />} />}
            </Routes>
        </Router>
    );
};


// Rendu de l'application
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
