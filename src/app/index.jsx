import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter as Router, Routes, Route, Link, useParams} from 'react-router-dom';
import '../styles/styles.scss';
import '../../dist/index.css';
const config = require('../../config.json');

// Composant d'accueil
let Home = () => {
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
        // Fetch des données depuis Sheety
        fetch(`https://sheets.googleapis.com/v4/spreadsheets/${config.SPREADSHEET_ID}/values/${config.SPREADSHEET_SHEETNAME}!${config.SPREADSHEET_DATA}?key=${config.SPREADSHEET_KEY}`)
            .then(response => response.json())
            .then(data => {
                console.log(data);  // Affichez toute la réponse pour vérifier la structure et les résultats
                const rows = data.values || [];
                console.log(`Nombre de lignes récupérées : ${rows.length}`,rows); // Vérifiez le nombre de lignes récupérées
                setHeaders(rows[0]);  // En-têtes
                const studentsData = rows.slice(1).map(row => {
                    const student = {
                        name: row[0],
                        discordId: row[1],
                        lastUpdate: row[2],
                        skills: []
                    };
                    console.log(student);
                    for (let i = 3; i < row.length; i++) {
                        student.skills.push({
                            skill: headers[i],
                            level: row[i],
                        });
                    }
                    return student;
                });
                setStudents(studentsData);
            })
            .catch(error => console.error('Erreur lors de la récupération des étudiants :', error));
    }, []);

    console.log("headers",headers);

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
                        <td>{student.name}</td>
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
    const { studentId } = useParams();
    const [studentSkills, setStudentSkills] = useState([]);
    const [lastUpdated, setLastUpdated] = useState('');

    useEffect(() => {
        fetch(`/api/participants/${studentId}`)
            .then(response => response.json())
            .then(data => {
                setStudentSkills(data.skills);
                setLastUpdated(data.lastUpdated);
            })
            .catch(error => console.error('Erreur lors de la récupération des détails de l\'étudiant :', error));
    }, [studentId]);

    return (
        <div className="student-container">
            <h2>Fiche de l'étudiant</h2>
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
                    <Link className="navbar-item" to="/api/participants/${studentId}">Profil des étudiants</Link>
                </div>
            </nav>
            <Routes>
            <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/skills" element={<SkillsTable />} />
                <Route path="/api/participants/${studentId}" element={<StudentProfile />} />
            </Routes>
        </Router>
    );
};


 // Rendu de l'application
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
