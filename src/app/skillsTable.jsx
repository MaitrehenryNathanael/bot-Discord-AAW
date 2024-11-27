import React, { useEffect, useState } from "react";
import '../styles/styles.scss'; // Assurez-vous d'importer les styles nécessaires

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
                setHeaders(rows[0]);  // En-têtes
                const studentsData = rows.slice(1).map(row => {
                    const student = {
                        name: row[0],
                        discordId: row[1],
                        lastUpdate: row[2],
                        skills: []
                    };

                    for (let i = 3; i < row.length; i++) {
                        student.skills.push({
                            skill: headers[i],
                            level: row[i],
                        });
                    }
                    return student;
                });
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
            <h2>Tableau des Compétences</h2>
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
                    {headers.map((skill, index) => (
                        <th key={index}>{skill}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {filteredStudents.map((student, index) => (
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

export default SkillsTable;
