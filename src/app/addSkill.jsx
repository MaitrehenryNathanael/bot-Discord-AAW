import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {log} from "util";

const SkillsManager = () => {
    const { discordId } = useParams();
    console.log("Discord Id:",discordId);
    const [skills, setSkills] = useState({skills: {}});
    const [newSkill, setNewSkill] = useState({skillName: "", level: ""});

    useEffect(() => {
        // Fetch the user's skills when the component loads
        fetch(`/api/users/${discordId}/skills`)
            .then((response) => response.json())
            .then((data) => setSkills(data))
            .catch((error) => console.error("Error fetching skills:", error));
        ;
    }, [discordId]);

    const handleModifySkill = (skill) => {
        const now = new Date();
        const formattedDate = now.toLocaleString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
        console.log(`/api/skills/${discordId}/${skill.skill}`);
        fetch(`/api/skills/${discordId}/${skill.skill}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                ...skill,
                date: formattedDate,
            }),
        })
            .then((response) => response.json())
            .then(() => {
                alert("Compétence modifiée avec succès !");
                fetch(`/api/users/${discordId}/skills`)
                    .then((response) => response.json())
                    .then((data) => setSkills(data))
                    .catch((error) => console.error("Error fetching skills:", error));
            })
            .catch((error) => console.error("Error modifying skill:", error));
    };
    const handleSkillChange = (e, index) => {
        const updatedSkills = [...skills.skills]; // Créer une copie des compétences
        updatedSkills[index].level = parseInt(e.target.value, 10); // Modifier le niveau de la compétence
        setSkills(prevState => ({
            ...prevState,
            skills: updatedSkills // Mettre à jour la liste des compétences
        }));
    };

    const handleAddSkill = (e) => {
        e.preventDefault();
        if (!newSkill.skillName || !newSkill.level) {
            alert("Veuillez remplir tous les champs.");
            return;
        }

        const now = new Date();
        const formattedDate = now.toLocaleString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });

        fetch("/api/skills", {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                discordId,
                skillName: newSkill.skillName,
                level: newSkill.level,
                date: formattedDate,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                alert("Nouvelle compétence ajoutée avec succès !");
                fetch(`/api/users/${discordId}/skills`)
                    .then((response) => response.json())
                    .then((data) => setSkills(data))
                    .catch((error) => console.error("Error fetching skills:", error));
                setNewSkill({skillName: "", level: ""});
            })
            .catch((error) => console.error("Error adding skill:", error));
    };
    console.log(skills);
    return (

        <div className="skills-manager">
            <h2>Gestion de vos Compétences</h2>

            {/* Modification des compétences */}
            <div className="modify-skills">
                <h3>Modifier vos compétences</h3>
                {skills.skills.length > 0 ? (
                    <table className="skills-table">
                        <thead>
                        <tr>
                            <th>Compétence</th>
                            <th>Niveau</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {skills.skills.map((skill, index) => (
                            <tr key={index}>
                                <td>{skill.skill}</td>
                                <td>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={skill.level}
                                        onChange={(e) => handleSkillChange(e, index)} // Mise à jour du niveau
                                    />
                                </td>
                                <td>
                                    <button className="modify-button" onClick={() => handleModifySkill(skill)}>
                                        Modifier
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="no-skills-message">Vous n'avez pas encore de compétences.</p>
                )}
            </div>

            {/* Ajout de compétences */}
            <div className="add-skill">
                <h3>Ajouter une nouvelle compétence</h3>
                <form onSubmit={handleAddSkill}>
                    <div className="form-group">
                        <label>
                            Compétence :
                            <input
                                type="text"
                                value={newSkill.skillName}
                                onChange={(e) =>
                                    setNewSkill((prev) => ({...prev, skillName: e.target.value}))
                                }
                            />
                        </label>
                    </div>
                    <div className="form-group">
                        <label>
                            Niveau (1-10) :
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={newSkill.level}
                                onChange={(e) =>
                                    setNewSkill((prev) => ({...prev, level: e.target.value}))
                                }
                            />
                        </label>
                    </div>
                    <button className="add-button" type="submit">Ajouter Compétence</button>
                </form>
            </div>
        </div>
    );
};

export default SkillsManager;
