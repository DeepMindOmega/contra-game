// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Player properties
let player = {
    x: 100,
    y: canvas.height - 100,
    width: 40,
    height: 60,
    speed: 5,
    color: '#00FF00',
    isMovingLeft: false,
    isMovingRight: false,
    isMovingUp: false,
    isMovingDown: false,
    facingRight: true // Direction the player is facing
};

// Game state
let score = 0;
let lives = 3;
let gameRunning = true;

// Bullets array
let bullets = [];
const bulletSpeed = 7;
const bulletCooldown = 15; // Frames between shots
let bulletTimer = 0;

// Enemies array
let enemies = [];
let enemySpawnRate = 60; // Frames between enemy spawns
let enemySpawnTimer = 0;

// Key states
const keys = {};

// Draw player character (simple representation)
function drawPlayer() {
    ctx.fillStyle = player.color;
    
    // Body
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Head
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(player.x + 10, player.y - 15, 20, 15);
    ctx.fillStyle = player.color;
}

// Draw a bullet
function drawBullet(bullet) {
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2);
    ctx.fill();
}

// Draw an enemy
function drawEnemy(enemy) {
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    
    // Enemy head
    ctx.fillStyle = '#8B0000';
    ctx.fillRect(enemy.x + 5, enemy.y - 10, 15, 10);
}

// Update player position based on input
function updatePlayer() {
    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed;
        player.isMovingLeft = true;
        player.facingRight = false;
    } else {
        player.isMovingLeft = false;
    }
    
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) {
        player.x += player.speed;
        player.isMovingRight = true;
        player.facingRight = true;
    } else {
        player.isMovingRight = false;
    }
    
    if (keys['ArrowUp'] && player.y > 0) {
        player.y -= player.speed;
        player.isMovingUp = true;
    } else {
        player.isMovingUp = false;
    }
    
    if (keys['ArrowDown'] && player.y < canvas.height - player.height) {
        player.y += player.speed;
        player.isMovingDown = true;
    } else {
        player.isMovingDown = false;
    }
}

// Update bullets
function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        
        // Move bullet based on player facing direction
        if (player.facingRight) {
            bullet.x += bulletSpeed;
        } else {
            bullet.x -= bulletSpeed;
        }
        
        // Remove bullets that go off-screen
        if (bullet.x < 0 || bullet.x > canvas.width) {
            bullets.splice(i, 1);
            continue;
        }
        
        // Check for collision with enemies
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (
                bullet.x > enemy.x &&
                bullet.x < enemy.x + enemy.width &&
                bullet.y > enemy.y &&
                bullet.y < enemy.y + enemy.height
            ) {
                // Collision detected
                enemies.splice(j, 1);
                bullets.splice(i, 1);
                score += 100;
                updateScore();
                break;
            }
        }
    }
}

// Update enemies
function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        // Move enemy towards player
        if (enemy.x > player.x) {
            enemy.x -= enemy.speed;
        } else {
            enemy.x += enemy.speed;
        }
        
        // Move vertically too
        enemy.y += enemy.vy;
        
        // Reverse vertical direction if hitting top/bottom
        if (enemy.y <= 0 || enemy.y >= canvas.height - enemy.height) {
            enemy.vy *= -1;
        }
        
        // Check collision with player
        if (
            player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y
        ) {
            // Collision with player
            enemies.splice(i, 1);
            lives--;
            updateLives();
            
            if (lives <= 0) {
                gameOver();
            }
        }
        
        // Remove enemies that go off-screen
        if (enemy.x < -50 || enemy.x > canvas.width + 50) {
            enemies.splice(i, 1);
        }
    }
}

// Spawn a new enemy
function spawnEnemy() {
    const side = Math.random() > 0.5 ? 'left' : 'right';
    let x, y;
    
    if (side === 'left') {
        x = -30;
    } else {
        x = canvas.width;
    }
    
    // Random Y position
    y = Math.random() * (canvas.height - 100) + 50;
    
    enemies.push({
        x: x,
        y: y,
        width: 30,
        height: 30,
        speed: 1 + Math.random() * 2,
        vy: (Math.random() - 0.5) * 2 // Vertical movement
    });
}

// Shoot a bullet
function shoot() {
    if (bulletTimer <= 0) {
        bullets.push({
            x: player.facingRight ? player.x + player.width : player.x,
            y: player.y + player.height / 2
        });
        bulletTimer = bulletCooldown;
    }
}

// Update score display
function updateScore() {
    document.getElementById('scoreValue').textContent = score;
}

// Update lives display
function updateLives() {
    document.getElementById('livesValue').textContent = lives;
}

// Game over
function gameOver() {
    gameRunning = false;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = '48px Arial';
    ctx.fillStyle = 'red';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
    
    ctx.font = '24px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 50);
}

// Reset game
function resetGame() {
    player.x = 100;
    player.y = canvas.height - 100;
    bullets = [];
    enemies = [];
    score = 0;
    lives = 3;
    gameRunning = true;
    updateScore();
    updateLives();
}

// Handle keyboard input
document.addEventListener('keydown', function(e) {
    keys[e.key] = true;
    
    if (e.key === ' ' && gameRunning) {
        shoot();
        e.preventDefault(); // Prevent spacebar from scrolling
    }
});

document.addEventListener('keyup', function(e) {
    keys[e.key] = false;
});

// Main game loop
function gameLoop() {
    if (!gameRunning) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update game objects
    updatePlayer();
    updateBullets();
    updateEnemies();
    
    // Handle shooting cooldown
    if (bulletTimer > 0) {
        bulletTimer--;
    }
    
    // Handle enemy spawning
    if (enemySpawnTimer <= 0 && enemies.length < 10) { // Limit number of enemies
        spawnEnemy();
        enemySpawnTimer = enemySpawnRate;
    } else {
        enemySpawnTimer--;
    }
    
    // Draw game objects
    drawPlayer();
    
    bullets.forEach(drawBullet);
    enemies.forEach(drawEnemy);
    
    // Continue the game loop
    requestAnimationFrame(gameLoop);
}

// Initialize the game
updateScore();
updateLives();
gameLoop();