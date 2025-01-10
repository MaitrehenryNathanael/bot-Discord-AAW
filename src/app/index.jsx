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
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    return (
        <Router>
            <nav className="navbar">
                <div className="navbar-links">
                    <Link className="navbar-item" to="/">Accueil</Link>
                    <Link className="navbar-item" to="/skills">Tableau des compétences</Link>
                    <Link className="navbar-item" to="/participants">Profil des étudiants</Link>
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
                <Route path="/participants/:discordId" element={<StudentProfile />} />
                {isLoggedIn && <Route path="/add" element={<AddSkill />} />}
            </Routes>
        </Router>
    );
};


// Rendu de l'application
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
