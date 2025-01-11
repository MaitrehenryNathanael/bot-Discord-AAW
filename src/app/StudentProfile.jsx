import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import config from '../../config.json'; // Assurez-vous d'avoir vos clés configurées ici

const StudentProfile = () => {
    const { discordId } = useParams(); // Récupérer l'ID Discord depuis l'URL
    const navigate = useNavigate(); // Pour le bouton retour

    const [headers, setHeaders] = useState([]); // Les en-têtes des colonnes
    const [student, setStudent] = useState(null); // L'étudiant correspondant
    const [loading, setLoading] = useState(true); // État de chargement

    useEffect(() => {
        // Fetch des données depuis Google Sheets
        fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${config.SPREADSHEET_ID}/values/${config.SPREADSHEET_SHEETNAME}!${config.SPREADSHEET_DATA}?key=${config.SPREADSHEET_KEY}`
        )
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Erreur HTTP : ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                const rows = data.values || [];

                if (rows.length === 0) {
                    throw new Error("Aucune donnée trouvée dans Google Sheets.");
                }

                // Récupérer les en-têtes dynamiquement
                const newHeaders = rows[0];
                setHeaders(newHeaders);

                // Rechercher l'étudiant par son ID Discord
                const foundStudent = rows.slice(1).find(
                    (row) => row[1] === discordId // On compare avec la deuxième colonne (Discord ID)
                );

                if (foundStudent) {
                    // Associer les en-têtes aux données de l'étudiant
                    const studentData = {};
                    newHeaders.forEach((header, index) => {
                        studentData[header] = foundStudent[index] || 0; // Ajouter une valeur par défaut si aucune donnée
                    });
                    setStudent(studentData);
                } else {
                    console.error("Étudiant non trouvé !");
                }
            })
            .catch((error) => console.error("Erreur lors de la récupération des données :", error))
            .finally(() => setLoading(false)); // Fin du chargement
    }, [discordId, config]);

    if (loading) {
        return <div>Chargement...</div>;
    }

    if (!student) {
        return <div>Étudiant non trouvé</div>;
    }

    return (
        <div className="student-profile-container">
            <h2>Profil de {student.Name}</h2>
            <table>
                <thead>
                <tr>
                    {headers.map((header, index) => (
                        <th key={index}>{header}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                <tr>
                    {headers.map((header, index) => (
                        <td key={index}>{student[header]}</td>
                    ))}
                </tr>
                </tbody>
            </table>
            <button onClick={() => navigate('/skills')} className="back-button">
                Retour au tableau des étudiants
            </button>
        </div>
    );
};

export default StudentProfile;
