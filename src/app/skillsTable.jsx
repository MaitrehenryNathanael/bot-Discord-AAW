import React, { useEffect, useState } from "react";
import '../styles/styles.scss';
import {Link, useNavigate} from "react-router-dom"; // Assurez-vous d'importer les styles nécessaires

const SkillsTable = ({ config }) => {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

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
            .catch(error => console.error('Erreur lors de la récupération des étudiants :', error))
            .finally(() => setLoading(false)); // Fin du chargement
    }, [config]);

    // Gestion de la recherche
    useEffect(() => {
        const lowerCaseQuery = searchQuery.toLowerCase();
        const filtered = students.filter(student =>
            student.name.toLowerCase().includes(lowerCaseQuery)
        );
        setFilteredStudents(filtered);
    }, [searchQuery, students]);

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
        <div className="skills-container">

            {/* Barre de recherche */}
            <div className="search-bar-container">
                <input
                    type="text"
                    placeholder="Rechercher par nom..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-bar"
                />
                {searchQuery && (
                    <button
                        className="clear-button"
                        onClick={() => setSearchQuery('')}
                    >
                        ✖
                    </button>
                )}
            </div>

            {/* Message de chargement */}
            {loading && (
                <p className="loading-message">Chargement des données...</p>
            )}

            {/* Message si aucun étudiant trouvé */}
            {!loading && filteredStudents.length === 0 && (
                <p className="no-results-message">Aucun étudiant ne correspond à votre recherche.</p>
            )}


            {/* Tableau */}
            {!loading && filteredStudents.length > 0 && (
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
            )}
        </div>
    );
};

export default SkillsTable;
