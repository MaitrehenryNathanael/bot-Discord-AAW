import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import '../styles/styles.scss';

// Importer le composant Home (accueil)
import Home from "./Home";
import AddSkill from "./addSkill";
import SkillsTable from "./skillsTable";
import StudentProfile from './StudentProfile';
import SkillsManager from "./addSkill";
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
            <div className="clouds">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 160">
                    <path fill="#f7c9ff" fill-opacity="1"
                          d="M0,128L30,112C60,96,120,64,180,64C240,64,300,112,360,112C420,112,480,64,540,64C600,64,660,96,720,96C780,96,840,64,900,64C960,64,1020,96,1080,96C1140,96,1200,64,1260,64C1320,64,1380,96,1410,112L1440,128L1440,160L1410,160C1380,160,1320,160,1260,160C1200,160,1140,160,1080,160C1020,160,960,160,900,160C840,160,780,160,720,160C660,160,600,160,540,160C480,160,420,160,360,160C300,160,240,160,180,160C120,160,60,160,30,160L0,160Z"></path>
                </svg>
            </div>

        </div>
    );
};


// Composant principal
const App = () => {
    const [students, setStudents] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [idCourant, setIdCourant] = useState(null);

    useEffect(() => {
        // Appel à l'API pour récupérer idCourant
        fetch('/api/current-id')
            .then(response => response.json())
            .then(data => {
                setIdCourant(data.idCourant); // Met à jour le state avec la valeur reçue
            })
            .catch(error => {
                console.error("Erreur lors de la récupération de idCourant :", error);
            });
    }, []);

    useEffect(() => {

        const checkSession = async () => {
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

    useEffect(() => {
        // Effet de trace de souris
        const handleMouseMove = (e) => {
            const dust = document.createElement("div");
            dust.classList.add("dust");
            dust.style.left = `${e.pageX}px`;
            dust.style.top = `${e.pageY}px`;
            document.body.appendChild(dust);

            // Supprimer la poussière après une courte durée
            setTimeout(() => {
                dust.remove();
            }, 300); // La poussière disparaît après 0.3 secondes
        };

        document.addEventListener("mousemove", handleMouseMove);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
        };
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
                            <Link className="navbar-item" to={`/add/${idCourant}`}>Ajouter</Link>
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
                {isLoggedIn && <Route path="/add/:discordId" element={<SkillsManager />} />}
            </Routes>
        </Router>
    );
};


// Rendu de l'application
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
