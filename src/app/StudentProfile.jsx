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
            <div className="clouds">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
                    <path fill="#f7c9ff" fill-opacity="1"
                          d="M0,224L30,202.7C60,181,120,139,180,149.3C240,160,300,224,360,229.3C420,235,480,181,540,149.3C600,117,660,107,720,106.7C780,107,840,117,900,128C960,139,1020,149,1080,133.3C1140,117,1200,75,1260,64C1320,53,1380,75,1410,85.3L1440,96L1440,320L1410,320C1380,320,1320,320,1260,320C1200,320,1140,320,1080,320C1020,320,960,320,900,320C840,320,780,320,720,320C660,320,600,320,540,320C480,320,420,320,360,320C300,320,240,320,180,320C120,320,60,320,30,320L0,320Z"></path>
                </svg>
            </div>
        </div>
    );
};

export default StudentProfile;
