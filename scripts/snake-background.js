class SnakeGame {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.zIndex = '-1';
        document.body.appendChild(this.canvas);

        // Game state
        this.gridSize = 20;
        this.snake = [{x: 5, y: 5}];
        this.food = this.generateFood();
        this.direction = 'right';
        this.isAIPlaying = true;
        this.isPlayerPlaying = false;

        // Create exit button (hidden by default)
        this.exitButton = document.createElement('div');
        this.exitButton.innerHTML = '×';
        this.exitButton.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            font-size: 24px;
            cursor: pointer;
            background: rgba(255, 255, 255, 0.8);
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        document.body.appendChild(this.exitButton);

        this.setupEventListeners();
        this.resize();
        this.startGame();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.cols = Math.floor(this.canvas.width / this.gridSize);
        this.rows = Math.floor(this.canvas.height / this.gridSize);
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resize());
        
        this.canvas.addEventListener('dblclick', (e) => {
            const clickedCell = {
                x: Math.floor(e.clientX / this.gridSize),
                y: Math.floor(e.clientY / this.gridSize)
            };
            
            if (this.isSnakeCell(clickedCell)) {
                this.startPlayerMode();
            }
        });

        this.exitButton.addEventListener('click', () => this.exitPlayerMode());

        document.addEventListener('keydown', (e) => {
            if (!this.isPlayerPlaying) return;
            
            const keyDirections = {
                'ArrowUp': 'up',
                'ArrowDown': 'down',
                'ArrowLeft': 'left',
                'ArrowRight': 'right'
            };

            if (keyDirections[e.key]) {
                const newDirection = keyDirections[e.key];
                const opposites = {
                    'up': 'down',
                    'down': 'up',
                    'left': 'right',
                    'right': 'left'
                };
                
                if (opposites[newDirection] !== this.direction) {
                    this.direction = newDirection;
                }
            }
        });
    }

    startPlayerMode() {
        this.isAIPlaying = false;
        this.isPlayerPlaying = true;
        this.exitButton.style.display = 'flex';
        
        // Hide main content
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.style.display = 'none';
        }
        
        this.canvas.style.zIndex = '1';
    }

    exitPlayerMode() {
        this.isAIPlaying = true;
        this.isPlayerPlaying = false;
        this.exitButton.style.display = 'none';
        
        // Show main content
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.style.display = 'block';
        }
        
        this.canvas.style.zIndex = '-1';
    }

    generateFood() {
        return {
            x: Math.floor(Math.random() * this.cols),
            y: Math.floor(Math.random() * this.rows)
        };
    }

    isSnakeCell(cell) {
        return this.snake.some(segment => 
            segment.x === cell.x && segment.y === cell.y
        );
    }

    aiThink() {
        const head = this.snake[0];
        const food = this.food;

        // Simple AI: Try to align with food first horizontally, then vertically
        if (head.x < food.x && this.direction !== 'left') {
            return 'right';
        } else if (head.x > food.x && this.direction !== 'right') {
            return 'left';
        } else if (head.y < food.y && this.direction !== 'up') {
            return 'down';
        } else if (head.y > food.y && this.direction !== 'down') {
            return 'up';
        }

        return this.direction;
    }

    update() {
        if (this.isAIPlaying) {
            this.direction = this.aiThink();
        }

        const head = {...this.snake[0]};
        
        switch(this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        // Wrap around screen
        head.x = (head.x + this.cols) % this.cols;
        head.y = (head.y + this.rows) % this.rows;

        // Check collision with food
        if (head.x === this.food.x && head.y === this.food.y) {
            this.food = this.generateFood();
        } else {
            this.snake.pop();
        }

        // Check self-collision only in player mode
        if (this.isPlayerPlaying) {
            const selfCollision = this.snake.some(segment => 
                segment.x === head.x && segment.y === head.y
            );
            if (selfCollision) {
                this.snake = [{x: 5, y: 5}];
                this.direction = 'right';
                return;
            }
        }

        this.snake.unshift(head);
    }

    draw() {
        // Clear canvas with semi-transparent background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw snake
        this.ctx.fillStyle = this.isPlayerPlaying ? '#4CAF50' : '#2196F3';
        this.snake.forEach(segment => {
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 1,
                this.gridSize - 1
            );
        });

        // Draw food
        this.ctx.fillStyle = '#FF5722';
        this.ctx.fillRect(
            this.food.x * this.gridSize,
            this.food.y * this.gridSize,
            this.gridSize - 1,
            this.gridSize - 1
        );
    }

    startGame() {
        const gameLoop = () => {
            this.update();
            this.draw();
            setTimeout(() => requestAnimationFrame(gameLoop), 100);
        };
        gameLoop();
    }
}

// Initialize the snake game when the page loads
window.addEventListener('load', () => {
    new SnakeGame();
}); 