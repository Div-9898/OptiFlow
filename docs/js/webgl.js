/**
 * Logistics AI Platform - WebGL Visualizations
 * Dynamic 3D and 2D visualizations using Three.js
 */

// Wait for Three.js to load
document.addEventListener('DOMContentLoaded', () => {
    if (typeof THREE === 'undefined') {
        console.warn('Three.js not loaded');
        return;
    }

    initHeroVisualization();
    initFeatureVisualizations();
});

/**
 * Hero Section - Particle Network Visualization
 */
function initHeroVisualization() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particle System
    const particleCount = 200;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];
    const colors = new Float32Array(particleCount * 3);

    const colorPalette = [
        new THREE.Color(0x6366f1), // Primary
        new THREE.Color(0x8b5cf6), // Violet
        new THREE.Color(0x06b6d4), // Cyan
        new THREE.Color(0x10b981), // Emerald
    ];

    for (let i = 0; i < particleCount; i++) {
        // Positions
        positions[i * 3] = (Math.random() - 0.5) * 50;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

        // Velocities
        velocities.push({
            x: (Math.random() - 0.5) * 0.02,
            y: (Math.random() - 0.5) * 0.02,
            z: (Math.random() - 0.5) * 0.01
        });

        // Colors
        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle Material
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.15,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    // Connection Lines
    const lineGeometry = new THREE.BufferGeometry();
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x6366f1,
        transparent: true,
        opacity: 0.15
    });
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    camera.position.z = 25;

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // Animation
    function animate() {
        requestAnimationFrame(animate);

        const positionArray = particles.attributes.position.array;
        const linePositions = [];

        // Update particles
        for (let i = 0; i < particleCount; i++) {
            // Apply velocity
            positionArray[i * 3] += velocities[i].x;
            positionArray[i * 3 + 1] += velocities[i].y;
            positionArray[i * 3 + 2] += velocities[i].z;

            // Boundary check
            if (Math.abs(positionArray[i * 3]) > 25) velocities[i].x *= -1;
            if (Math.abs(positionArray[i * 3 + 1]) > 15) velocities[i].y *= -1;
            if (Math.abs(positionArray[i * 3 + 2]) > 10) velocities[i].z *= -1;

            // Connect nearby particles
            for (let j = i + 1; j < particleCount; j++) {
                const dx = positionArray[i * 3] - positionArray[j * 3];
                const dy = positionArray[i * 3 + 1] - positionArray[j * 3 + 1];
                const dz = positionArray[i * 3 + 2] - positionArray[j * 3 + 2];
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < 5) {
                    linePositions.push(
                        positionArray[i * 3], positionArray[i * 3 + 1], positionArray[i * 3 + 2],
                        positionArray[j * 3], positionArray[j * 3 + 1], positionArray[j * 3 + 2]
                    );
                }
            }
        }

        particles.attributes.position.needsUpdate = true;

        // Update lines
        lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));

        // Camera movement based on mouse
        camera.position.x += (mouseX * 3 - camera.position.x) * 0.02;
        camera.position.y += (mouseY * 2 - camera.position.y) * 0.02;
        camera.lookAt(scene.position);

        // Rotate particle system slightly
        particleSystem.rotation.y += 0.001;

        renderer.render(scene, camera);
    }

    animate();

    // Handle resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

/**
 * Feature Card Visualizations
 */
function initFeatureVisualizations() {
    const featureCanvases = document.querySelectorAll('.feature-canvas');

    featureCanvases.forEach(canvas => {
        const feature = canvas.getAttribute('data-feature');

        switch (feature) {
            case 'fleet':
                initFleetVisualization(canvas);
                break;
            case 'route':
                initRouteVisualization(canvas);
                break;
            case 'risk':
                initRiskVisualization(canvas);
                break;
            case 'network':
                initNetworkVisualization(canvas);
                break;
            case 'sentiment':
                initSentimentVisualization(canvas);
                break;
            default:
                initGenericVisualization(canvas);
        }
    });
}

/**
 * Fleet Visualization - Moving dots on paths
 */
function initFleetVisualization(container) {
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const vehicles = [];
    const routes = [];

    // Create routes
    for (let i = 0; i < 5; i++) {
        const points = [];
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;

        for (let j = 0; j < 6; j++) {
            points.push({ x, y });
            x += (Math.random() - 0.5) * 100;
            y += (Math.random() - 0.5) * 80;
        }

        routes.push(points);
    }

    // Create vehicles
    for (let i = 0; i < 8; i++) {
        const routeIndex = Math.floor(Math.random() * routes.length);
        vehicles.push({
            route: routes[routeIndex],
            progress: Math.random(),
            speed: 0.002 + Math.random() * 0.002,
            color: ['#6366f1', '#10b981', '#f59e0b', '#06b6d4'][Math.floor(Math.random() * 4)]
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw routes
        routes.forEach(route => {
            ctx.beginPath();
            ctx.moveTo(route[0].x, route[0].y);

            for (let i = 1; i < route.length; i++) {
                ctx.lineTo(route[i].x, route[i].y);
            }

            ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)';
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        // Draw and update vehicles
        vehicles.forEach(vehicle => {
            const route = vehicle.route;
            const totalSegments = route.length - 1;
            const currentSegment = Math.floor(vehicle.progress * totalSegments);
            const segmentProgress = (vehicle.progress * totalSegments) % 1;

            if (currentSegment < totalSegments) {
                const start = route[currentSegment];
                const end = route[currentSegment + 1];

                const x = start.x + (end.x - start.x) * segmentProgress;
                const y = start.y + (end.y - start.y) * segmentProgress;

                // Draw glow
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, 15);
                gradient.addColorStop(0, vehicle.color);
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.fillRect(x - 15, y - 15, 30, 30);

                // Draw vehicle
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, Math.PI * 2);
                ctx.fillStyle = vehicle.color;
                ctx.fill();
            }

            vehicle.progress += vehicle.speed;
            if (vehicle.progress >= 1) vehicle.progress = 0;
        });

        requestAnimationFrame(animate);
    }

    animate();
}

/**
 * Route Optimization Visualization
 */
function initRouteVisualization(container) {
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const nodes = [];
    const nodeCount = 12;

    // Create nodes in a scattered pattern
    for (let i = 0; i < nodeCount; i++) {
        nodes.push({
            x: 50 + Math.random() * (canvas.width - 100),
            y: 50 + Math.random() * (canvas.height - 100),
            radius: 6 + Math.random() * 4,
            visited: false
        });
    }

    // Depot
    const depot = { x: canvas.width / 2, y: canvas.height / 2, radius: 10 };

    let currentPath = [];
    let animationProgress = 0;

    function calculatePath() {
        // Simple nearest neighbor heuristic
        const visited = new Set();
        const path = [depot];
        let current = depot;

        while (visited.size < nodes.length) {
            let nearest = null;
            let nearestDist = Infinity;

            nodes.forEach((node, i) => {
                if (!visited.has(i)) {
                    const dist = Math.hypot(node.x - current.x, node.y - current.y);
                    if (dist < nearestDist) {
                        nearestDist = dist;
                        nearest = { node, index: i };
                    }
                }
            });

            if (nearest) {
                visited.add(nearest.index);
                path.push(nearest.node);
                current = nearest.node;
            }
        }

        path.push(depot); // Return to depot
        return path;
    }

    currentPath = calculatePath();

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw grid background
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i < canvas.width; i += 30) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
        }
        for (let i = 0; i < canvas.height; i += 30) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvas.width, i);
            ctx.stroke();
        }

        // Draw optimized path
        const pathProgress = Math.floor(animationProgress * currentPath.length);

        ctx.beginPath();
        ctx.moveTo(currentPath[0].x, currentPath[0].y);

        for (let i = 1; i <= pathProgress && i < currentPath.length; i++) {
            ctx.lineTo(currentPath[i].x, currentPath[i].y);
        }

        ctx.strokeStyle = 'rgba(99, 102, 241, 0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw nodes
        nodes.forEach((node, i) => {
            const isVisited = i < pathProgress - 1;

            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            ctx.fillStyle = isVisited ? '#10b981' : 'rgba(99, 102, 241, 0.3)';
            ctx.fill();
            ctx.strokeStyle = isVisited ? '#10b981' : '#6366f1';
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        // Draw depot
        ctx.beginPath();
        ctx.arc(depot.x, depot.y, depot.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#6366f1';
        ctx.fill();

        // Draw moving vehicle
        if (pathProgress > 0 && pathProgress < currentPath.length) {
            const segmentProgress = (animationProgress * currentPath.length) % 1;
            const start = currentPath[pathProgress - 1];
            const end = currentPath[pathProgress];

            const vx = start.x + (end.x - start.x) * segmentProgress;
            const vy = start.y + (end.y - start.y) * segmentProgress;

            ctx.beginPath();
            ctx.arc(vx, vy, 8, 0, Math.PI * 2);
            ctx.fillStyle = '#f59e0b';
            ctx.fill();
        }

        animationProgress += 0.003;
        if (animationProgress >= 1) {
            animationProgress = 0;
            currentPath = calculatePath(); // Recalculate for variety
        }

        requestAnimationFrame(animate);
    }

    animate();
}

/**
 * Risk Visualization - Pulsing gauges
 */
function initRiskVisualization(container) {
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const riskFactors = [
        { name: 'Weather', value: 0.3, target: 0.3, color: '#10b981' },
        { name: 'Traffic', value: 0.6, target: 0.6, color: '#f59e0b' },
        { name: 'Fatigue', value: 0.4, target: 0.4, color: '#06b6d4' },
        { name: 'Vehicle', value: 0.2, target: 0.2, color: '#6366f1' }
    ];

    let time = 0;

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        time += 0.02;

        // Update targets periodically
        riskFactors.forEach((factor, i) => {
            if (Math.random() < 0.01) {
                factor.target = 0.2 + Math.random() * 0.6;
            }
            factor.value += (factor.target - factor.value) * 0.02;
        });

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const maxRadius = Math.min(canvas.width, canvas.height) * 0.4;

        // Draw concentric risk rings
        riskFactors.forEach((factor, i) => {
            const radius = maxRadius * (0.4 + i * 0.2);
            const angle = factor.value * Math.PI * 1.5;

            // Background ring
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, -Math.PI * 0.75, Math.PI * 0.75);
            ctx.strokeStyle = 'rgba(99, 102, 241, 0.1)';
            ctx.lineWidth = 8;
            ctx.stroke();

            // Value ring
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, -Math.PI * 0.75, -Math.PI * 0.75 + angle);
            ctx.strokeStyle = factor.color;
            ctx.lineWidth = 8;
            ctx.lineCap = 'round';
            ctx.stroke();

            // Pulse effect
            const pulseRadius = radius + Math.sin(time + i) * 3;
            ctx.beginPath();
            ctx.arc(centerX, centerY, pulseRadius, -Math.PI * 0.75, -Math.PI * 0.75 + angle);
            ctx.strokeStyle = factor.color + '40';
            ctx.lineWidth = 12;
            ctx.stroke();
        });

        // Center indicator
        const overallRisk = riskFactors.reduce((sum, f) => sum + f.value, 0) / riskFactors.length;
        const indicatorColor = overallRisk < 0.4 ? '#10b981' : overallRisk < 0.7 ? '#f59e0b' : '#f43f5e';

        ctx.beginPath();
        ctx.arc(centerX, centerY, 20 + Math.sin(time * 2) * 2, 0, Math.PI * 2);
        ctx.fillStyle = indicatorColor;
        ctx.fill();

        ctx.font = 'bold 14px Inter';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(Math.round(overallRisk * 100), centerX, centerY);

        requestAnimationFrame(animate);
    }

    animate();
}

/**
 * Network Visualization - Force-directed graph
 */
function initNetworkVisualization(container) {
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const nodes = [];
    const edges = [];
    const nodeCount = 15;

    // Create nodes
    for (let i = 0; i < nodeCount; i++) {
        nodes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: 0,
            vy: 0,
            radius: 5 + Math.random() * 8,
            color: ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981'][Math.floor(Math.random() * 4)]
        });
    }

    // Create edges
    for (let i = 0; i < nodeCount; i++) {
        const connectionCount = 1 + Math.floor(Math.random() * 3);
        for (let j = 0; j < connectionCount; j++) {
            const target = Math.floor(Math.random() * nodeCount);
            if (target !== i) {
                edges.push({ source: i, target });
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Apply forces
        nodes.forEach((node, i) => {
            // Repulsion from other nodes
            nodes.forEach((other, j) => {
                if (i !== j) {
                    const dx = node.x - other.x;
                    const dy = node.y - other.y;
                    const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
                    const force = 100 / (dist * dist);
                    node.vx += (dx / dist) * force * 0.1;
                    node.vy += (dy / dist) * force * 0.1;
                }
            });

            // Attraction to center
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            node.vx += (cx - node.x) * 0.0005;
            node.vy += (cy - node.y) * 0.0005;
        });

        // Edge spring forces
        edges.forEach(edge => {
            const source = nodes[edge.source];
            const target = nodes[edge.target];
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const force = (dist - 80) * 0.003;

            source.vx += (dx / dist) * force;
            source.vy += (dy / dist) * force;
            target.vx -= (dx / dist) * force;
            target.vy -= (dy / dist) * force;
        });

        // Update positions
        nodes.forEach(node => {
            node.vx *= 0.9; // Damping
            node.vy *= 0.9;
            node.x += node.vx;
            node.y += node.vy;

            // Boundary constraints
            node.x = Math.max(node.radius, Math.min(canvas.width - node.radius, node.x));
            node.y = Math.max(node.radius, Math.min(canvas.height - node.radius, node.y));
        });

        // Draw edges
        edges.forEach(edge => {
            const source = nodes[edge.source];
            const target = nodes[edge.target];

            ctx.beginPath();
            ctx.moveTo(source.x, source.y);
            ctx.lineTo(target.x, target.y);
            ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)';
            ctx.lineWidth = 1;
            ctx.stroke();
        });

        // Draw nodes
        nodes.forEach(node => {
            // Glow
            const gradient = ctx.createRadialGradient(
                node.x, node.y, 0,
                node.x, node.y, node.radius * 2
            );
            gradient.addColorStop(0, node.color + '40');
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fillRect(
                node.x - node.radius * 2,
                node.y - node.radius * 2,
                node.radius * 4,
                node.radius * 4
            );

            // Node
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            ctx.fillStyle = node.color;
            ctx.fill();
        });

        requestAnimationFrame(animate);
    }

    animate();
}

/**
 * Sentiment Visualization - Animated waves
 */
function initSentimentVisualization(container) {
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    let time = 0;

    const sentiments = [
        { color: '#10b981', offset: 0, amplitude: 20, label: 'Positive' },
        { color: '#f59e0b', offset: 2, amplitude: 15, label: 'Neutral' },
        { color: '#f43f5e', offset: 4, amplitude: 10, label: 'Negative' }
    ];

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        time += 0.03;

        // Draw background grid
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.05)';
        ctx.lineWidth = 1;
        for (let y = 0; y < canvas.height; y += 20) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        // Draw sentiment waves
        sentiments.forEach((sentiment, i) => {
            const baseY = canvas.height * (0.3 + i * 0.2);

            ctx.beginPath();
            ctx.moveTo(0, baseY);

            for (let x = 0; x < canvas.width; x++) {
                const y = baseY +
                    Math.sin((x * 0.02) + time + sentiment.offset) * sentiment.amplitude +
                    Math.sin((x * 0.01) + time * 0.5) * sentiment.amplitude * 0.5;
                ctx.lineTo(x, y);
            }

            // Fill area under wave
            ctx.lineTo(canvas.width, canvas.height);
            ctx.lineTo(0, canvas.height);
            ctx.closePath();

            const gradient = ctx.createLinearGradient(0, baseY - sentiment.amplitude, 0, canvas.height);
            gradient.addColorStop(0, sentiment.color + '30');
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fill();

            // Draw wave line
            ctx.beginPath();
            ctx.moveTo(0, baseY);

            for (let x = 0; x < canvas.width; x++) {
                const y = baseY +
                    Math.sin((x * 0.02) + time + sentiment.offset) * sentiment.amplitude +
                    Math.sin((x * 0.01) + time * 0.5) * sentiment.amplitude * 0.5;
                ctx.lineTo(x, y);
            }

            ctx.strokeStyle = sentiment.color;
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        // Draw floating sentiment bubbles
        const bubbleCount = 5;
        for (let i = 0; i < bubbleCount; i++) {
            const x = (canvas.width / bubbleCount) * i + (canvas.width / bubbleCount / 2);
            const y = canvas.height * 0.5 + Math.sin(time + i * 2) * 30;
            const size = 20 + Math.sin(time + i) * 5;

            const sentiment = sentiments[i % sentiments.length];

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = sentiment.color + '40';
            ctx.fill();
            ctx.strokeStyle = sentiment.color;
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        requestAnimationFrame(animate);
    }

    animate();
}

/**
 * Generic Visualization - Animated gradient background
 */
function initGenericVisualization(container) {
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    let time = 0;

    function animate() {
        time += 0.01;

        // Animated gradient
        const gradient = ctx.createLinearGradient(
            canvas.width * Math.sin(time) * 0.5 + canvas.width * 0.5,
            0,
            canvas.width * Math.cos(time) * 0.5 + canvas.width * 0.5,
            canvas.height
        );

        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.1)');
        gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.05)');
        gradient.addColorStop(1, 'rgba(6, 182, 212, 0.1)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Floating particles
        for (let i = 0; i < 20; i++) {
            const x = (Math.sin(time + i * 0.5) * 0.5 + 0.5) * canvas.width;
            const y = (Math.cos(time * 0.5 + i * 0.3) * 0.5 + 0.5) * canvas.height;
            const size = 2 + Math.sin(time + i) * 1;

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(99, 102, 241, 0.3)';
            ctx.fill();
        }

        requestAnimationFrame(animate);
    }

    animate();
}

/**
 * Page-specific hero visualizations
 */
function initPageHeroVisualization(canvas, type) {
    if (!canvas || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

    renderer.setSize(canvas.width, canvas.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create visualization based on type
    let mesh;

    switch (type) {
        case 'fleet':
            // Globe with dots
            const globeGeometry = new THREE.SphereGeometry(5, 32, 32);
            const globeMaterial = new THREE.MeshBasicMaterial({
                color: 0x6366f1,
                wireframe: true,
                transparent: true,
                opacity: 0.3
            });
            mesh = new THREE.Mesh(globeGeometry, globeMaterial);
            break;

        case 'route':
            // Torus knot
            const knotGeometry = new THREE.TorusKnotGeometry(4, 1, 100, 16);
            const knotMaterial = new THREE.MeshBasicMaterial({
                color: 0x6366f1,
                wireframe: true,
                transparent: true,
                opacity: 0.4
            });
            mesh = new THREE.Mesh(knotGeometry, knotMaterial);
            break;

        default:
            // Default icosahedron
            const icoGeometry = new THREE.IcosahedronGeometry(5, 1);
            const icoMaterial = new THREE.MeshBasicMaterial({
                color: 0x6366f1,
                wireframe: true,
                transparent: true,
                opacity: 0.3
            });
            mesh = new THREE.Mesh(icoGeometry, icoMaterial);
    }

    scene.add(mesh);
    camera.position.z = 15;

    function animate() {
        requestAnimationFrame(animate);
        mesh.rotation.x += 0.003;
        mesh.rotation.y += 0.005;
        renderer.render(scene, camera);
    }

    animate();
}

// Export for use in other scripts
window.WebGLVisualizations = {
    initHeroVisualization,
    initFeatureVisualizations,
    initPageHeroVisualization,
    initFleetVisualization,
    initRouteVisualization,
    initRiskVisualization,
    initNetworkVisualization,
    initSentimentVisualization
};
