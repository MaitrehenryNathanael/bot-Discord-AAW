import React from 'react';
import { useParams } from 'react-router-dom';

const StudentProfile = ({ students }) => {
    const { discordId } = useParams();
    const student = students.find(student => student.discordId === discordId);

    if (!student) {
        return <div>Étudiant non trouvé</div>;
    }

    return (
        <div>
            <h1>Profil de {student.name}</h1>
            <p><strong>Nom:</strong> {student.name}</p>
            <p><strong>Discord ID:</strong> {student.discordId}</p>
            <p><strong>Dernière mise à jour:</strong> {student.lastUpdate}</p>
        </div>
    );
};

export default StudentProfile;
