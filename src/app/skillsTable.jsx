import React, { useEffect, useState } from "react";
import '../styles/styles.scss';
import {Link, useNavigate} from "react-router-dom"; // Assurez-vous d'importer les styles nécessaires

const SkillsTable = ({ config }) => {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // Fetch des données depuis Sheety
        fetch(`https://sheets.googleapis.com/v4/spreadsheets/${config.SPREADSHEET_ID}/values/${config.SPREADSHEET_SHEETNAME}!${config.SPREADSHEET_DATA}?key=${config.SPREADSHEET_KEY}`)
            .then(response => response.json())
            .then(data => {
                const rows = data.values || [];

                // Garder seulement les 3 premières colonnes : Name, Discord ID, Last Update
                const newHeaders = rows[0].slice(0, 3); // Limiter les en-têtes aux 3 premières colonnes
                //console.log("newheader",newHeaders);

                setHeaders(newHeaders);  // Définir les nouveaux en-têtes

                const studentsData = rows.slice(1).map(row => {
                    // Ne prendre que les 3 premières données pour chaque étudiant
                    const student = {
                        name: row[0],
                        discordId: row[1],
                        lastUpdate: row[2],
                    };
                    //console.log("student",student);
                    //console.log("student name",student.name);
                    //console.log("student discord",student.discordId);
                    return student;
                });
                //console.log("setstudentdata",setStudents(studentsData));
                //console.log("setfiltereddata",setFilteredStudents(studentsData));
                setStudents(studentsData);
                setFilteredStudents(studentsData); // Initialisation de la liste filtrée
            })
            .catch(error => console.error('Erreur lors de la récupération des étudiants :', error));
    }, [config]);

    // Gestion de la recherche
    useEffect(() => {
        const lowerCaseQuery = searchQuery.toLowerCase();
        const filtered = students.filter(student =>
            student.name.toLowerCase().includes(lowerCaseQuery)
        );
        setFilteredStudents(filtered);
    }, [searchQuery, students]);

    return (
        <div className="skills-container">
            <h2>Tableau des Étudiants</h2>
            {/* Barre de recherche */}
            <input
                type="text"
                placeholder="Rechercher par nom..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-bar"
            />
            <table>
                <thead>
                <tr>
                    {headers.map((header, index) => (
                        <th key={index}>{header}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {filteredStudents.map((student, index) => (
                    <tr key={index}>
                        <td>
                            <Link to={`/student-profile/${student.discordId}`}>{student.name}</Link>
                        </td>
                        <td>{student.discordId}</td>
                        <td>{student.lastUpdate}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default SkillsTable;
