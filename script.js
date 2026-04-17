/**
 * Skoop Cricket 3D - Live Simulation
 * Optimized for Digital Signage
 */

let scene, camera, renderer;
let pitch, ball, bowler, batsman, bat, stumps;
let isBallInMotion = false;
let isSwinging = false;
let score = 142;
let wickets = 3;
let balls = 112; // 18.4 overs

const STADIUM_BG = 'https://skoop-dev-code-agent.s3.us-east-1.amazonaws.com/skoop-n8n-continue%2Faigen-1776260434144%2Fassets%2Fcricket_stadium_3d_background-1776411902249.png';

function init() {
    // ... scene setup remains same ...
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x10181f);

    // Camera Setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 3, 10);
    camera.lookAt(0, 1, -10);

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

    // Create Stumps
    stumps = new THREE.Group();
    const stumpGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.2, 8);
    const stumpMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
    for (let i = -1; i <= 1; i++) {
        const stump = new THREE.Mesh(stumpGeo, stumpMat);
        stump.position.x = i * 0.2;
        stump.position.y = 0.6;
        stumps.add(stump);
    }
    // Bails
    const bailGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.45, 8);
    const bail1 = new THREE.Mesh(bailGeo, stumpMat);
    bail1.position.set(-0.1, 1.22, 0);
    bail1.rotation.z = Math.PI / 2;
    stumps.add(bail1);
    const bail2 = new THREE.Mesh(bailGeo, stumpMat);
    bail2.position.set(0.1, 1.22, 0);
    bail2.rotation.z = Math.PI / 2;
    stumps.add(bail2);

    stumps.position.z = -12;
    scene.add(stumps);

    // Create Ball
    const ballGeo = new THREE.SphereGeometry(0.15, 32, 32);
    const ballMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    ball = new THREE.Mesh(ballGeo, ballMat);
    resetBall();
    scene.add(ball);

    // Create Players
    const playerMat = new THREE.MeshStandardMaterial({ color: 0x00b7af });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdbac });
    const batMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });

    // Bowler
    bowler = new THREE.Group();
    const bowlerBody = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.8, 16), playerMat);
    const bowlerHead = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), skinMat);
    bowlerHead.position.y = 1.1;
    bowler.add(bowlerBody);
    bowler.add(bowlerHead);
    bowler.position.set(0, 0.9, 12);
    scene.add(bowler);

    // Group for Batsman and Bat
    batsman = new THREE.Group();

    // Batsman Body
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.6, 16), playerMat);
    body.position.y = 0.8;
    batsman.add(body);

    // Batsman Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), skinMat);
    head.position.y = 1.8;
    batsman.add(head);

    // Batsman Arms (simple)
    const armGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 8);
    const leftArm = new THREE.Mesh(armGeo, playerMat);
    leftArm.position.set(-0.4, 1.2, 0);
    leftArm.rotation.z = Math.PI / 4;
    batsman.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, playerMat);
    rightArm.position.set(0.4, 1.2, 0.2);
    rightArm.rotation.x = -Math.PI / 4;
    batsman.add(rightArm);

    // Add Bat
    const batGroup = new THREE.Group();

    // Bat Blade
    const bladeGeo = new THREE.BoxGeometry(0.25, 1.0, 0.1);
    const blade = new THREE.Mesh(bladeGeo, batMat);
    blade.position.y = -0.5;
    batGroup.add(blade);

    // Bat Handle
    const handleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.5, 8);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.y = 0.25;
    batGroup.add(handle);

    bat = batGroup;
    bat.position.set(0.6, 0.8, 0.3);
    bat.rotation.x = Math.PI / 6;
    batsman.add(bat);

    batsman.position.set(-0.6, 0, -10);
    scene.add(batsman);

    // Additional light for batsman
    const batLight = new THREE.PointLight(0xffffff, 1.5, 15);
    batLight.position.set(0, 5, -8);
    scene.add(batLight);

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
    const speed = 800 + Math.random() * 800; // Variable speed between 800ms and 1600ms
    document.getElementById('last-ball').textContent = "BOWLING...";
    const startTime = Date.now();
    const duration = speed;

    function moveBall() {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;

        if (progress < 1) {
            // Path towards batsman
            ball.position.z = 12 - (progress * 25);
            // Bounce
            ball.position.y = 1 + Math.abs(Math.sin(progress * Math.PI * 1.5)) * 1.5;

            // Camera follows ball slightly
            camera.lookAt(ball.position.x, ball.position.y, ball.position.z);

            // Check for hit (strike zone -8 to -11)
            if (isSwinging && ball.position.z < -8 && ball.position.z > -11) {
                hitBall();
                return;
            }

            // Check for bowled (hits stumps at -12)
            if (ball.position.z <= -11.8 && ball.position.z >= -12.2 && Math.abs(ball.position.x) < 0.4 && ball.position.y < 1.3) {
                bowledOut();
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

function bowledOut() {
    wickets++;
    document.getElementById('last-ball').textContent = "BOWLED! WICKET!!";

    // Animate stumps falling
    const startTime = Date.now();
    const duration = 1000;
    const startRot = stumps.rotation.x;

    function animateWicket() {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;
        if (progress < 1) {
            stumps.rotation.x = startRot + (progress * Math.PI / 4);
            stumps.position.y = -progress * 0.2;
            requestAnimationFrame(animateWicket);
        } else {
            updateScore(0);
            setTimeout(() => {
                stumps.rotation.x = 0;
                stumps.position.y = 0;
                resetBall();
                startBowlingCycle();
            }, 1000);
        }
    }
    animateWicket();
}

function hitBall() {
    // Quality of hit depends on timing? For now random but successful
    const runs = [1, 2, 4, 6][Math.floor(Math.random() * 4)];
    document.getElementById('last-ball').textContent = `CRACK! ${runs} RUNS!`;

    // Camera Shake
    applyCameraShake();

    // Animate ball flying away
    const startTime = Date.now();
    const duration = 2000;
    const dirX = (Math.random() - 0.5) * 30;
    const dirY = 5 + Math.random() * 15;
    const startPos = ball.position.clone();

    function flyBall() {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;

        if (progress < 1) {
            ball.position.z = startPos.z - (progress * 80);
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

function applyCameraShake() {
    const originalPos = camera.position.clone();
    const startTime = Date.now();
    const duration = 200;

    function shake() {
        const elapsed = Date.now() - startTime;
        if (elapsed < duration) {
            camera.position.x = originalPos.x + (Math.random() - 0.5) * 0.5;
            camera.position.y = originalPos.y + (Math.random() - 0.5) * 0.5;
            requestAnimationFrame(shake);
        } else {
            camera.position.copy(originalPos);
        }
    }
    shake();
}

function updateScore(runs) {
    score += runs;
    balls++;
    const overs = Math.floor(balls / 6);
    const overBalls = balls % 6;

    document.getElementById('score').textContent = `${score}/${wickets}`;
    document.getElementById('overs').textContent = `${overs}.${overBalls} OVERS`;

    // Update ticker message randomly
    const messages = [
        `STRIKERS NEED ${165 - score} RUNS FROM ${120 - balls} BALLS!`,
        `WHAT A SHOT! THE CROWD IS ELECTRIC!`,
        `CRICKET FEVER AT SKOOP ARENA!`,
        `CAN THEY REACH THE TARGET OF 165?`,
        `BOWLER IS UNDER PRESSURE NOW!`
    ];
    if (runs > 0) {
        document.querySelector('.ticker-content').textContent = messages[Math.floor(Math.random() * messages.length)] + " • " + document.querySelector('.ticker-content').textContent;
    }
}

function animate() {
    requestAnimationFrame(animate);

    // Dynamic Camera - slightly moving to keep it interesting
    const time = Date.now() * 0.0005;
    if (!isBallInMotion) {
        camera.position.x = Math.sin(time * 0.3) * 2;
        camera.position.y = 3 + Math.cos(time * 0.2) * 0.5;
        camera.lookAt(0, 1.5, -10);
    }

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

init();
