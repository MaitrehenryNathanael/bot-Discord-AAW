import React, { useEffect } from "react";

const Home = () => {
    useEffect(() => {
        const starryBackground = document.querySelector(".starry-background");
        const numStars = 100; // Nombre total d'étoiles

        for (let i = 0; i < numStars; i++) {
            const star = document.createElement("div");
            star.classList.add("star");

            // Ajouter une taille aléatoire
            const sizeClass = ["small", "medium", "large"][Math.floor(Math.random() * 3)];
            star.classList.add(sizeClass);

            // Position aléatoire sur l'axe X
            star.style.left = `${Math.random() * 100}vw`;

            // Ajouter un délai de départ aléatoire
            star.style.animationDelay = `${Math.random() * 5}s`;

            starryBackground.appendChild(star);
        }

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
            starryBackground.innerHTML = "";
            document.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    return (
        <div className="starry-background">
            <div className="home-container">
                <div className="content-box">
                    <h1>Bienvenue sur notre site AAW !</h1>
                    <p>Ce site est dédié à la gestion des compétences et des membres d'équipe via un BOT Discord.</p>
                </div>
            </div>
            <div className="clouds">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
                    <path fill="#f7c9ff" fill-opacity="1"
                          d="M0,224L30,202.7C60,181,120,139,180,149.3C240,160,300,224,360,229.3C420,235,480,181,540,149.3C600,117,660,107,720,106.7C780,107,840,117,900,128C960,139,1020,149,1080,133.3C1140,117,1200,75,1260,64C1320,53,1380,75,1410,85.3L1440,96L1440,320L1410,320C1380,320,1320,320,1260,320C1200,320,1140,320,1080,320C1020,320,960,320,900,320C840,320,780,320,720,320C660,320,600,320,540,320C480,320,420,320,360,320C300,320,240,320,180,320C120,320,60,320,30,320L0,320Z"></path>
                </svg>
            </div>
        </div>

    );
};

export default Home;