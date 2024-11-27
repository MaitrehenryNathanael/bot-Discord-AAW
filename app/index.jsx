import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import '../styles/styles.scss';
import '../../dist/index.css';
const config = require('../../config.json');

// Composant d'accueil
const Home = () => {
    return (
        <div className="home-container">
            <h1>Bienvenue sur notre site AAW !</h1>
            <p>Ce site est dédié à la gestion des compétences et des membres d'équipe via un BOT Discord.</p>
        </div>
    );
};

// Composant Connexion (démonstratif)
const Login = () => {
    return (
        <div className="login-container">
            <h2>Connexion</h2>
            <p>Page de connexion (fonctionnalité à ajouter).</p>
        </div>
    );
};

// Composant des Compétences (Skills)
const SkillsTable = () => {
    const [students, setStudents] = useState([]);
    const [headers, setHeaders] = useState([]);

    useEffect(() => {
        // Vider et mettre à jour les participants
        fetch('/api/update-participants', { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                console.log(data); // Vérifiez que les participants ont été mis à jour
                setStudents(data);
            })
            .catch(error => console.error('Erreur lors de la mise à jour des participants :', error));
    }, []);

    console.log("headers", headers);

    return (
        <div className="skills-container">
            <h2>Tableau des Compétences</h2>
            <table>
                <thead>
                <tr>
                    {headers.map((skill, index) => (
                        <th key={index}>{skill}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {students.map((student, index) => (
                    <tr key={index}>
                        <td>
                            <Link to={`/participants/${student.discordId}`}>
                                {student.name}
                            </Link>
                        </td>
                        <td>{student.discordId}</td>
                        <td>{student.lastUpdate}</td>
                        {student.skills.map((skill, skillIndex) => (
                            <td key={skillIndex}>{skill.level}</td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

// Composant pour visualiser les détails d'un étudiant
const StudentProfile = () => {
    const { discordId } = useParams();
    const [studentSkills, setStudentSkills] = useState([]);
    const [lastUpdated, setLastUpdated] = useState('');
    const [studentName, setStudentName] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`/api/participants/${discordId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erreur réseau ou participant introuvable : ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Réponse de l\'API :', data); // Ajout d'un log pour vérifier la réponse
                if (data.skills) {
                    setStudentSkills(data.skills);
                    setLastUpdated(data.lastUpdate);
                    setStudentName(data.name); // Assurez-vous que le nom de l'étudiant est dans la réponse
                } else {
                    setError('Participant introuvable ou erreur lors de la récupération des données.');
                }
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des détails de l\'étudiant :', error);
                setError('Erreur lors de la récupération des données.');
            });
    }, [discordId]);

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className="student-container">
            <h2>Fiche de l'étudiant : {studentName}</h2>
            <p>Date de dernière mise à jour : {lastUpdated}</p>
            <table>
                <thead>
                <tr>
                    <th>Compétence</th>
                    <th>Niveau</th>
                </tr>
                </thead>
                <tbody>
                {studentSkills.map((skill, index) => (
                    <tr key={index}>
                        <td>{skill.skill}</td>
                        <td>{skill.level}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

// Composant principal
const App = () => {
    return (
        <Router>
            <nav className="navbar">
                <div className="navbar-links">
                    <Link className="navbar-item" to="/">Accueil</Link>
                    <Link className="navbar-item" to="/login">Connexion</Link>
                    <Link className="navbar-item" to="/skills">Tableau des compétences</Link>
                    <Link className="navbar-item" to="/participants">Profil des étudiants</Link>
                </div>
            </nav>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/skills" element={<SkillsTable />} />
                <Route path="/participants/:discordId" element={<StudentProfile />} />
            </Routes>
        </Router>
    );
};

// Rendu de l'application
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
