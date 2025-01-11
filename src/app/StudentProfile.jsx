import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';



const StudentProfile = () => {
    const { discordId } = useParams();
    const [student, setStudent] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log("Fetching data for Discord ID:", discordId);  // Log de l'ID Discord
        fetch('http://localhost:3000/api/participants/' + discordId)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Participant introuvable");
                }
                return response.json();
            })
            .then(data => {
                console.log("Data received:", data);  // Log des données reçues
                setStudent(data);
            })
            .catch(error => {
                console.log("Error fetching data:", error);
                setError(error.message);
            });
    }, [discordId]);

    if (error) {
        return <p>{error}</p>;
    }

    if (!student) {
        return <p>Chargement des données...</p>;
    }

    return (
        <div className="student-container">
            <h2>Fiche de l'étudiant : {student.name}</h2>
            <p><strong>Discord ID :</strong> {student.discordId}</p>
            <p><strong>Dernière mise à jour :</strong> {student.lastUpdate}</p>
            <h3>Compétences :</h3>
            <table>
                <thead>
                <tr>
                    <th>Compétence</th>
                    <th>Niveau</th>
                </tr>
                </thead>
                <tbody>
                {student.skills.map((skill, index) => (
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

export default StudentProfile;
