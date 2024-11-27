import React, { useState, useEffect } from "react";

const SkillsManager = ({ userId }) => {
    const [skills, setSkills] = useState([]);
    const [newSkill, setNewSkill] = useState({skillName: "", level: ""});

    useEffect(() => {
        // Fetch the user's skills when the component loads
        fetch(`/api/users/${userId}/skills`)
            .then((response) => response.json())
            .then((data) => setSkills(data))
            .catch((error) => console.error("Error fetching skills:", error));
    }, [userId]);

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

        fetch(`/api/skills/${skill.id}`, {
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
                setSkills((prevSkills) =>
                    prevSkills.map((s) => (s.id === skill.id ? {...s, ...skill} : s))
                );
            })
            .catch((error) => console.error("Error modifying skill:", error));
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
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                userId,
                skillName: newSkill.skillName,
                level: newSkill.level,
                date: formattedDate,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                alert("Nouvelle compétence ajoutée avec succès !");
                setSkills((prevSkills) => [...prevSkills, data]);
                setNewSkill({skillName: "", level: ""});
            })
            .catch((error) => console.error("Error adding skill:", error));
    };

    return (
        <div className="skills-manager">
            <h2>Gestion de vos Compétences</h2>

            {/* Modification des compétences */}
            <div className="modify-skills">
                <h3>Modifier vos compétences</h3>
                {skills.length > 0 ? (
                    <table className="skills-table">
                        <thead>
                        <tr>
                            <th>Compétence</th>
                            <th>Niveau</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {skills.map((skill) => (
                            <tr key={skill.id}>
                                <td>{skill.skillName}</td>
                                <td>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={skill.level}
                                        onChange={(e) =>
                                            setSkills((prev) =>
                                                prev.map((s) =>
                                                    s.id === skill.id
                                                        ? {...s, level: e.target.value}
                                                        : s
                                                )
                                            )
                                        }
                                    />
                                </td>
                                <td>{skill.date || "Non défini"}</td>
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
