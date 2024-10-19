const canvas = document.getElementById('simulation-canvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

let energy = 20;
const energyCost = 5;
const circles = [];
const enemies = [];
const superUnits = []; // Tableau pour les super unités
let enemyCount = 0;
let round = 1;
let gameRunning = true;

// Classe pour représenter un cercle
class Circle {
    constructor() {
        this.x = Math.random() * (canvas.width - 20) + 10;
        this.y = Math.random() * (canvas.height - 20) + 10;
        this.dx = Math.random() < 0.5 ? -1 : 1;
        this.dy = Math.random() < 0.5 ? -1 : 1;
        this.radius = 10;
    }

    move() {
        this.x += this.dx;
        this.y += this.dy;

        // Vérifier les collisions avec les murs
        if (this.x <= this.radius || this.x >= canvas.width - this.radius) {
            this.dx *= -1;
        }
        if (this.y <= this.radius || this.y >= canvas.height - this.radius) {
            this.dy *= -1;
        }
    }

    draw() {
        ctx.fillStyle = 'blue';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }
}

// Classe pour représenter une unité ennemie
class Enemy {
    constructor() {
        this.x = Math.random() * (canvas.width - 20) + 10;
        this.y = Math.random() * (canvas.height - 20) + 10;
        this.dx = Math.random() < 0.5 ? -1 : 1;
        this.dy = Math.random() < 0.5 ? -1 : 1;
        this.radius = 15; // Un peu plus grand que les unités normales
    }

    move() {
        this.x += this.dx;
        this.y += this.dy;

        // Vérifier les collisions avec les murs
        if (this.x <= this.radius || this.x >= canvas.width - this.radius) {
            this.dx *= -1;
        }
        if (this.y <= this.radius || this.y >= canvas.height - this.radius) {
            this.dy *= -1;
        }
    }

    draw() {
        ctx.fillStyle = 'red'; // Couleur des ennemis
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }
}

// Classe pour représenter une super unité
class SuperUnit {
    constructor() {
        this.x = Math.random() * (canvas.width - 20) + 10;
        this.y = Math.random() * (canvas.height - 20) + 10;
        this.dx = Math.random() < 0.5 ? -1 : 1;
        this.dy = Math.random() < 0.5 ? -1 : 1;
        this.radius = 15; // Plus grande que les unités normales
        this.health = 2; // Points de vie (2 points)
        this.collisionCount = 0; // Compteur de collisions
    }

    move() {
        this.x += this.dx;
        this.y += this.dy;

        // Vérifier les collisions avec les murs
        if (this.x <= this.radius || this.x >= canvas.width - this.radius) {
            this.dx *= -1;
        }
        if (this.y <= this.radius || this.y >= canvas.height - this.radius) {
            this.dy *= -1;
        }
    }

    draw() {
        ctx.fillStyle = 'green'; // Couleur des super unités
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }
}

// Afficher l'énergie et le numéro de manche
function updateDisplays() {
    document.getElementById('energy-display').innerText = `Énergie: ${energy}`;
    document.getElementById('round-display').innerText = `Manche: ${round}`;

    // Afficher le bouton pour créer des super unités dès le niveau 1
    document.getElementById('create-super-unit').style.display = 'inline-block';
}

// Événements pour les boutons
document.getElementById('create-unit').addEventListener('click', () => {
    if (energy >= energyCost && gameRunning) {
        circles.push(new Circle());
        energy -= energyCost;
        updateDisplays();
    }
});

document.getElementById('generate-energy').addEventListener('click', () => {
    energy += 5;
    updateDisplays();
});

document.getElementById('create-super-unit').addEventListener('click', () => {
    if (energy >= energyCost && gameRunning) {
        superUnits.push(new SuperUnit());
        energy -= energyCost;
        updateDisplays();
    }
});

// Ajouter des ennemis toutes les 10 secondes
const enemyInterval = setInterval(() => {
    if (gameRunning) {
        enemyCount++;
        round++; // Incrémenter le numéro de manche
        for (let i = 0; i < enemyCount; i++) {
            enemies.push(new Enemy());
        }
        updateDisplays(); // Mettre à jour l'affichage de la manche
    }
}, 10000);

// Vérifier les collisions entre les cercles, les ennemis et les super unités
function checkCollisions() {
    // Vérification des collisions pour les unités normales
    for (let i = circles.length - 1; i >= 0; i--) {
        for (let j = 0; j < enemies.length; j++) {
            const dx = circles[i].x - enemies[j].x;
            const dy = circles[i].y - enemies[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Vérifier si une collision a eu lieu
            if (distance < circles[i].radius + enemies[j].radius) {
                circles.splice(i, 1); // Supprimer le cercle
                energy += 3; // Ajouter 3 énergies pour chaque élimination
                updateDisplays(); // Mettre à jour l'affichage de l'énergie
                break; // Sortir de la boucle intérieure pour éviter les problèmes d'index
            }
        }
    }

    // Vérification des collisions pour les super unités
    for (let i = superUnits.length - 1; i >= 0; i--) {
        for (let j = 0; j < enemies.length; j++) {
            const dx = superUnits[i].x - enemies[j].x;
            const dy = superUnits[i].y - enemies[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Vérifier si une collision a eu lieu
            if (distance < superUnits[i].radius + enemies[j].radius) {
                // Faire rebondir la super unité
                superUnits[i].dx *= -1; // Inverser la direction horizontale
                superUnits[i].dy *= -1; // Inverser la direction verticale

                superUnits[i].collisionCount++; // Incrémenter le compteur de collisions

                // Supprimer la super unité si le compteur de collisions atteint 2
                if (superUnits[i].collisionCount >= 2) {
                    superUnits.splice(i, 1); // Supprimer la super unité
                }
                break; // Sortir de la boucle intérieure
            }
        }
    }

    // Vérifier si toutes les unités (normales et super) ont été éliminées
    if (circles.length === 0 && superUnits.length === 0 && enemies.length > 0) {
        gameRunning = false;
        clearInterval(enemyInterval);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        ctx.font = '30px Arial';
        ctx.fillText(`Vous avez atteint la manche ${round - 1}!`, canvas.width / 2 - 150, canvas.height / 2);
    }
}

// Boucle de simulation
function animate() {
    if (gameRunning) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Déplacer et dessiner les cercles
        circles.forEach(circle => {
            circle.move();
            circle.draw();
        });
        
        // Déplacer et dessiner les ennemis
        enemies.forEach(enemy => {
            enemy.move();
            enemy.draw();
        });

        // Déplacer et dessiner les super unités
        superUnits.forEach(superUnit => {
            superUnit.move();
            superUnit.draw();
        });

        // Vérifier les collisions
        checkCollisions();
    }

    requestAnimationFrame(animate);
}

// Générer une unité automatiquement au démarrage
circles.push(new Circle());

// Démarrer l'animation
animate();
