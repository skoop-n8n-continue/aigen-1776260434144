/**
 * Skoop Cricket 3D - Live Simulation
 * Optimized for Digital Signage
 */

let scene, camera, renderer;
let pitch, ball, bowler, batsman;
let isBallInMotion = false;
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const spotlight = new THREE.SpotLight(0x00b7af, 1);
    spotlight.position.set(0, 50, 0);
    spotlight.angle = Math.PI / 4;
    scene.add(spotlight);

    // Background Image (Environment Map or Plane)
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
    const pitchGeo = new THREE.BoxGeometry(4, 0.1, 20);
    const pitchMat = new THREE.MeshStandardMaterial({ color: 0x228B22 }); // Grass green
    pitch = new THREE.Mesh(pitchGeo, pitchMat);
    scene.add(pitch);

    // Create Ball
    const ballGeo = new THREE.SphereGeometry(0.15, 32, 32);
    const ballMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    ball = new THREE.Mesh(ballGeo, ballMat);
    resetBall();
    scene.add(ball);

    // Create Players (Simple Primitives)
    const playerGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.8, 16);
    const playerMat = new THREE.MeshStandardMaterial({ color: 0x00b7af });

    bowler = new THREE.Mesh(playerGeo, playerMat);
    bowler.position.set(0, 0.9, 10);
    scene.add(bowler);

    batsman = new THREE.Mesh(playerGeo, playerMat);
    batsman.position.set(0, 0.9, -9);
    scene.add(batsman);

    // Start Simulation Loop
    animate();
    setInterval(bowlBall, 6000); // Bowl every 6 seconds
}

function resetBall() {
    ball.position.set(0, 2, 10);
    isBallInMotion = false;
}

function bowlBall() {
    if (isBallInMotion) return;

    isBallInMotion = true;
    const startTime = Date.now();
    const duration = 1500; // 1.5 seconds delivery

    function moveBall() {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;

        if (progress < 1) {
            // Parabolic path (bounce)
            ball.position.z = 10 - (progress * 19);
            ball.position.y = 1 + Math.sin(progress * Math.PI) * 1.5;
            requestAnimationFrame(moveBall);
        } else {
            hitBall();
        }
    }
    moveBall();
}

function hitBall() {
    const runs = [0, 1, 2, 4, 6][Math.floor(Math.random() * 5)];
    const lastBallText = runs === 0 ? "DOT BALL" : `${runs} RUNS!`;
    document.getElementById('last-ball').textContent = `LAST BALL: ${lastBallText}`;

    // Animate ball flying away
    const startTime = Date.now();
    const duration = 2000;
    const direction = (Math.random() - 0.5) * 10;

    function flyBall() {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;

        if (progress < 1) {
            ball.position.z = -9 - (progress * 50);
            ball.position.x += direction * 0.1;
            ball.position.y = 0.5 + Math.sin(progress * Math.PI) * 10;
            requestAnimationFrame(flyBall);
        } else {
            updateScore(runs);
            resetBall();
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

    // Subtle Camera Movement
    const time = Date.now() * 0.0005;
    camera.position.x = Math.sin(time) * 2;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
}

// Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

init();
