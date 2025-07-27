document.addEventListener('DOMContentLoaded', () => {
    // For all nav links that use a hash, scroll smoothly to the corresponding section
    document.querySelectorAll('nav a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElem = document.querySelector(targetId);
            if (targetElem) {
                targetElem.scrollIntoView({ behavior: 'smooth' });
                // Update active state (optional)
                document.querySelectorAll('nav a').forEach(el => el.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });
});

class DNAAnimation {
    constructor() {
        this.canvas = document.getElementById('dnaCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.helixes = [];
        this.baseSpeed = 1;
        this.speedMultiplier = 1;

        // Constants for segments
        this.MIN_SEGMENTS = 2;  // Minimum number of segments
        this.MAX_SEGMENTS = 5; // Maximum number of segments
        this.SEGMENT_LENGTH = 150; // Fixed length per segment

        // Add scale range constants
        this.MIN_SCALE = 1;  // Minimum scale factor
        this.MAX_SCALE = 3;  // Maximum scale factor

        // Update existing constants to be base values
        this.BASE_RADIUS = 30;
        this.BASE_SEGMENT_LENGTH = 150;
        this.BASE_POINT_SIZE = 4;

        // Update point per segment to be a base value
        this.BASE_POINTS_PER_SEGMENT = 40; // Base number of points per segment

        // Add minimum spacing constant
        this.MIN_HELIX_SPACING = 20; // Minimum horizontal spacing between helixes

        this.resize();
        this.init();

        window.addEventListener('resize', () => this.resize());
        window.addEventListener('scroll', () => this.handleScroll());

        this.animate();

        // Update color definitions to use proper RGB format
        this.backgroundColor = '256, 256, 256';  // Remove rgba wrapper
        this.helixColor = '255, 249, 242';      // Remove rgba wrapper
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createNewHelix() {
        const segments = Math.floor(Math.random() * (this.MAX_SEGMENTS - this.MIN_SEGMENTS)) + this.MIN_SEGMENTS;
        const scale = this.MIN_SCALE + Math.random() * (this.MAX_SCALE - this.MIN_SCALE);
        const radius = this.BASE_RADIUS * scale;

        // Try to find a valid position
        const margin = radius + 50;
        const centerX = margin + Math.random() * (this.canvas.width - 2 * margin);

        // If no space is available, return null
        if (!this.isSpaceAvailable(centerX, radius, scale)) {
            return null;
        }

        return {
            centerX,
            y: -(segments * this.BASE_SEGMENT_LENGTH * scale),
            radius,
            angle: Math.random() * Math.PI * 2,
            segments,
            scale
        };
    }

    init() {
        // Create initial helixes with proper spacing
        const numInitialHelixes = 3;
        const spacing = this.canvas.width / (numInitialHelixes + 1);
        
        for (let i = 0; i < numInitialHelixes; i++) {
            const scale = this.MIN_SCALE + Math.random() * (this.MAX_SCALE - this.MIN_SCALE);
            const segments = Math.floor(Math.random() * (this.MAX_SEGMENTS - this.MIN_SEGMENTS)) + this.MIN_SEGMENTS;
            const radius = this.BASE_RADIUS * scale;
            
            const helix = {
                centerX: spacing * (i + 1),
                y: -Math.random() * this.canvas.height,
                radius: radius,
                angle: Math.random() * Math.PI * 2,
                segments: segments,
                scale: scale
            };
            
            this.helixes.push(helix);
        }
    }

    handleScroll() {
        this.speedMultiplier = 2;
        setTimeout(() => {
            this.speedMultiplier = 1;
        }, 1000);
    }

    drawHelix(helix) {
        const points = [];
        
        // Calculate scaled points per segment to maintain point density
        const pointsPerSegment = Math.round(this.BASE_POINTS_PER_SEGMENT * helix.scale);

        // Calculate points for both strands
        for (let i = 0; i < helix.segments; i++) {
            for (let j = 0; j < pointsPerSegment; j++) {
                const scaledSegmentLength = this.BASE_SEGMENT_LENGTH * helix.scale;
                const t = (i * scaledSegmentLength) + j * scaledSegmentLength / pointsPerSegment;
                const wave_number = 2 * Math.PI/scaledSegmentLength;
                const y = helix.y + t;

                const x1 = helix.centerX + Math.cos(wave_number * y + helix.angle) * helix.radius;
                const z1 = Math.sin(wave_number * y + helix.angle) * helix.radius;

                const x2 = helix.centerX + Math.cos(wave_number * y + helix.angle + Math.PI) * helix.radius;
                const z2 = Math.sin(wave_number * y + helix.angle + Math.PI) * helix.radius;

                points.push({ x: x1, y, z: z1, strand: 1 });
                points.push({ x: x2, y, z: z2, strand: 2 });
            }
        }

        // Sort points by Z for proper depth rendering
        points.sort((a, b) => b.z - a.z);

        // Draw the strands
        points.forEach((point, i) => {
            const scale = (point.z + helix.radius) / (helix.radius * 2);
            // Scale the point size based on both Z-position and helix scale
            const size = (this.BASE_POINT_SIZE + scale * 4) * helix.scale;
            const opacity = 0.3 + scale * 0.7;

            this.ctx.fillStyle = `rgba(${this.helixColor}, ${opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    animate() {
        this.ctx.fillStyle = `rgba(${this.backgroundColor}, 1)`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.helixes.forEach(helix => {
            this.drawHelix(helix);
            helix.y += this.baseSpeed * this.speedMultiplier;

            // Reset when helix is completely below viewport
            if (helix.y > this.canvas.height) {
                // Try to create a new helix
                const newHelix = this.createNewHelix();
                if (newHelix) {
                    Object.assign(helix, newHelix);
                } else {
                    // If no space available, just move the helix back up
                    helix.y = -(helix.segments * this.BASE_SEGMENT_LENGTH * helix.scale);
                }
            }
        });

        requestAnimationFrame(() => this.animate());
    }

    isSpaceAvailable(x, radius, scale) {
        return this.helixes.every(helix => {
            const minSpacing = (helix.radius + radius + this.MIN_HELIX_SPACING) * Math.max(scale, helix.scale);
            return Math.abs(helix.centerX - x) > minSpacing;
        });
    }
}

// Initialize the animation when the page loads
window.addEventListener('load', () => {
    new DNAAnimation();
});