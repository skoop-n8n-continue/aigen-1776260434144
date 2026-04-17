/**
 * Skoop Cricket 3D - Live Simulation
 * Optimized for Digital Signage
 */

let scene, camera, renderer;
let pitch, ball, bowler, batsman, bat;
let isBallInMotion = false;
let isSwinging = false;
let score = 142;
let wickets = 3;
let balls = 112; // 18.4 overs

const STADIUM_BG = 'https://skoop-dev-code-agent.s3.us-east-1.amazonaws.com/skoop-n8n-continue%2Faigen-1776260434144%2Fassets%2Fcricket_stadium_3d_background-1776411902249.png';

function init() {
    // Scene Setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x10181f);

    // Camera Setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 20);
    camera.lookAt(0, 0, 0);

    // Renderer Setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('app').prepend(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const spotlight = new THREE.SpotLight(0x00b7af, 1.5);
    spotlight.position.set(0, 50, 0);
    spotlight.angle = Math.PI / 4;
    scene.add(spotlight);

    // Background Image
    const loader = new THREE.TextureLoader();
    loader.load(STADIUM_BG, (texture) => {
        const bgGeometry = new THREE.SphereGeometry(500, 60, 40);
        const bgMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide
        });
        const bgSphere = new THREE.Mesh(bgGeometry, bgMaterial);
        scene.add(bgSphere);
    });

    // Create Pitch
    const pitchGeo = new THREE.BoxGeometry(6, 0.1, 30);
    const pitchMat = new THREE.MeshStandardMaterial({ color: 0x3d5a3d });
    pitch = new THREE.Mesh(pitchGeo, pitchMat);
    pitch.position.y = -0.05;
    scene.add(pitch);

    // Create Ball
    const ballGeo = new THREE.SphereGeometry(0.15, 32, 32);
    const ballMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    ball = new THREE.Mesh(ballGeo, ballMat);
    resetBall();
    scene.add(ball);

    // Create Players
    const playerGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.8, 16);
    const playerMat = new THREE.MeshStandardMaterial({ color: 0x00b7af });

    bowler = new THREE.Mesh(playerGeo, playerMat);
    bowler.position.set(0, 0.9, 12);
    scene.add(bowler);

    // Group for Batsman and Bat
    batsman = new THREE.Group();
    const body = new THREE.Mesh(playerGeo, playerMat);
    batsman.add(body);

    // Add Bat
    const batGeo = new THREE.BoxGeometry(0.1, 1.2, 0.2);
    const batMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    bat = new THREE.Mesh(batGeo, batMat);
    bat.position.set(0.4, 0, 0.2);
    bat.rotation.x = Math.PI / 8;
    batsman.add(bat);

    batsman.position.set(0, 0.9, -10);
    scene.add(batsman);

    // Event Listeners
    document.getElementById('swing-btn').addEventListener('click', swing);
    window.addEventListener('keydown', (e) => { if (e.code === 'Space') swing(); });

    // Start Simulation Loop
    animate();
    startBowlingCycle();
}

function startBowlingCycle() {
    setTimeout(() => {
        bowlBall();
    }, 3000);
}

function swing() {
    if (isSwinging) return;
    isSwinging = true;

    // Swing animation
    const startTime = Date.now();
    const duration = 300;

    function animateSwing() {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;

        if (progress < 1) {
            // Swing arc
            bat.rotation.y = -Math.PI / 2 + Math.sin(progress * Math.PI) * Math.PI;
            bat.rotation.z = Math.sin(progress * Math.PI) * 0.5;
            requestAnimationFrame(animateSwing);
        } else {
            bat.rotation.y = 0;
            bat.rotation.z = 0;
            isSwinging = false;
        }
    }
    animateSwing();
}

function resetBall() {
    ball.position.set(0, 2, 12);
    ball.visible = true;
    isBallInMotion = false;
}

function bowlBall() {
    if (isBallInMotion) return;

    isBallInMotion = true;
    document.getElementById('last-ball').textContent = "BOWLING...";
    const startTime = Date.now();
    const duration = 1200; // Faster delivery for challenge

    function moveBall() {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;

        if (progress < 1) {
            // Path towards batsman
            ball.position.z = 12 - (progress * 22);
            // Bounce
            ball.position.y = 1 + Math.abs(Math.sin(progress * Math.PI * 1.5)) * 1.5;

            // Check for hit
            if (isSwinging && ball.position.z < -8 && ball.position.z > -11) {
                hitBall();
                return;
            }

            requestAnimationFrame(moveBall);
        } else {
            // Missed!
            document.getElementById('last-ball').textContent = "MISSED! DOT BALL";
            updateScore(0);
            setTimeout(resetBall, 1000);
            startBowlingCycle();
        }
    }
    moveBall();
}

function hitBall() {
    // Quality of hit depends on timing? For now random but successful
    const runs = [1, 2, 4, 6][Math.floor(Math.random() * 4)];
    document.getElementById('last-ball').textContent = `CRACK! ${runs} RUNS!`;

    // Animate ball flying away
    const startTime = Date.now();
    const duration = 2000;
    const dirX = (Math.random() - 0.5) * 20;
    const dirY = 5 + Math.random() * 10;
    const startPos = ball.position.clone();

    function flyBall() {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;

        if (progress < 1) {
            ball.position.z = startPos.z - (progress * 60);
            ball.position.x = startPos.x + (progress * dirX);
            ball.position.y = startPos.y + Math.sin(progress * Math.PI) * dirY;
            requestAnimationFrame(flyBall);
        } else {
            updateScore(runs);
            ball.visible = false;
            setTimeout(() => {
                resetBall();
                startBowlingCycle();
            }, 1000);
        }
    }
    flyBall();
}

function updateScore(runs) {
    score += runs;
    balls++;
    const overs = Math.floor(balls / 6);
    const overBalls = balls % 6;

    document.getElementById('score').textContent = `${score}/${wickets}`;
    document.getElementById('overs').textContent = `${overs}.${overBalls} OVERS`;
}

function animate() {
    requestAnimationFrame(animate);

    // Dynamic Camera
    const time = Date.now() * 0.0005;
    camera.position.x = Math.sin(time * 0.5) * 3;
    camera.lookAt(0, 2, -5);

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

init();
