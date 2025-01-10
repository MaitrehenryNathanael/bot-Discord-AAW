import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const StudentProfile = () => {
    const { discordId } = useParams();
    const [studentSkills, setStudentSkills] = useState([]);
    const [lastUpdated, setLastUpdated] = useState('');
    const [studentName, setStudentName] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`/api/participants/${discordId}`)
            .then(response => response.json())
            .then(data => {
                if (data.skills) {
                    setStudentSkills(data.skills);
                    setLastUpdated(data.lastUpdate);
                    setStudentName(data.name);
                } else {
                    setError('Erreur de récupération des données');
                }
            })
            .catch(() => setError('Erreur lors de la récupération des données'));
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

export default StudentProfile;
