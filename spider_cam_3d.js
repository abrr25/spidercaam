/**
 * Spider Cam 3D — Simulasi Kontrol Real-Time
 * 
 * File JavaScript terpisah untuk logika simulasi 3D Spider Cam.
 * Menggunakan Three.js r128 dengan post-processing bloom.
 * 
 * Kontrol:
 *   W/S — Maju/Mundur (Z)
 *   A/D — Kiri/Kanan (X)
 *   Q/E — Naik/Turun (Y)
 *   Mouse Drag — Rotasi kamera
 *   Scroll — Zoom
 */

(function () {
    'use strict';

    // ─── Config ───
    const CONFIG = {
        poleHeight: 100,
        poleOffset: 100,
        speed: 1.5,
        cableColors: [0xff6b8a, 0xffd66b, 0x6bff8a, 0x6b8aff],
        camColor: 0x00ffcc,
        bloomStrength: 0.6,
        bloomRadius: 0.4,
        bloomThreshold: 0.85
    };

    // ─── Scene Setup ───
    const scene = new THREE.Scene();

    // Fog for depth
    scene.fog = new THREE.FogExp2(0x0a0a1a, 0.003);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 150, 300);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    document.body.appendChild(renderer.domElement);

    // ─── Post-processing (Bloom) — with fallback ───
    let composer = null;
    try {
        if (THREE.EffectComposer && THREE.RenderPass && THREE.UnrealBloomPass) {
            composer = new THREE.EffectComposer(renderer);
            const renderPass = new THREE.RenderPass(scene, camera);
            composer.addPass(renderPass);

            const bloomPass = new THREE.UnrealBloomPass(
                new THREE.Vector2(window.innerWidth, window.innerHeight),
                CONFIG.bloomStrength,
                CONFIG.bloomRadius,
                CONFIG.bloomThreshold
            );
            composer.addPass(bloomPass);
        }
    } catch (e) {
        console.warn('Bloom post-processing not available, using standard renderer.', e);
        composer = null;
    }

    // ─── OrbitControls ───
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 50, 0);
    controls.minDistance = 80;
    controls.maxDistance = 500;
    controls.maxPolarAngle = Math.PI * 0.85;

    // ─── Lighting ───
    const ambientLight = new THREE.AmbientLight(0x334466, 0.6);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffeedd, 0.8);
    mainLight.position.set(60, 200, 80);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.set(1024, 1024);
    mainLight.shadow.camera.near = 10;
    mainLight.shadow.camera.far = 500;
    mainLight.shadow.camera.left = -150;
    mainLight.shadow.camera.right = 150;
    mainLight.shadow.camera.top = 150;
    mainLight.shadow.camera.bottom = -150;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x4488ff, 0.25);
    fillLight.position.set(-80, 100, -60);
    scene.add(fillLight);

    const pointLight = new THREE.PointLight(0x00ffcc, 0.6, 300);
    pointLight.position.set(0, 120, 0);
    scene.add(pointLight);

    // Small rim lights at each corner
    CONFIG.cableColors.forEach((col, i) => {
        const p = new THREE.PointLight(col, 0.3, 80);
        const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
        p.position.set(Math.cos(angle) * CONFIG.poleOffset, CONFIG.poleHeight + 5, Math.sin(angle) * CONFIG.poleOffset);
        scene.add(p);
    });

    // ─── Environment: Grid Floor ───
    // Main ground plane (dark, receives shadow)
    const groundPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(400, 400),
        new THREE.MeshStandardMaterial({
            color: 0x0a0e1a,
            roughness: 0.85,
            metalness: 0.1
        })
    );
    groundPlane.rotation.x = -Math.PI / 2;
    groundPlane.position.y = -0.5;
    groundPlane.receiveShadow = true;
    scene.add(groundPlane);

    // Grid helper
    const gridHelper = new THREE.GridHelper(200, 20, 0x1a3040, 0x101828);
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.5;
    scene.add(gridHelper);

    // Outer boundary subtle ring
    const boundaryGeo = new THREE.RingGeometry(140, 142, 64);
    const boundaryMat = new THREE.MeshBasicMaterial({ color: 0x1a3040, side: THREE.DoubleSide, transparent: true, opacity: 0.3 });
    const boundary = new THREE.Mesh(boundaryGeo, boundaryMat);
    boundary.rotation.x = -Math.PI / 2;
    boundary.position.y = 0.1;
    scene.add(boundary);

    // ─── 4 Poles ───
    const polePositions = [
        new THREE.Vector3(-CONFIG.poleOffset, CONFIG.poleHeight, -CONFIG.poleOffset),
        new THREE.Vector3( CONFIG.poleOffset, CONFIG.poleHeight, -CONFIG.poleOffset),
        new THREE.Vector3( CONFIG.poleOffset, CONFIG.poleHeight,  CONFIG.poleOffset),
        new THREE.Vector3(-CONFIG.poleOffset, CONFIG.poleHeight,  CONFIG.poleOffset)
    ];

    const poleGeo = new THREE.CylinderGeometry(1.5, 2.5, CONFIG.poleHeight, 12);

    polePositions.forEach((pos, i) => {
        // Colored pole material matching cable color
        const poleColor = new THREE.Color(CONFIG.cableColors[i]);
        const poleMat = new THREE.MeshStandardMaterial({
            color: poleColor.clone().multiplyScalar(0.5),
            emissive: poleColor.clone().multiplyScalar(0.15),
            roughness: 0.4,
            metalness: 0.7
        });
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.set(pos.x, pos.y / 2, pos.z);
        pole.castShadow = true;
        pole.receiveShadow = true;
        scene.add(pole);

        // Glowing top cap (bright, matching color)
        const capGeo = new THREE.SphereGeometry(4, 16, 16);
        const capMat = new THREE.MeshBasicMaterial({ color: CONFIG.cableColors[i] });
        const cap = new THREE.Mesh(capGeo, capMat);
        cap.position.copy(pos);
        scene.add(cap);

        // Colored base platform
        const baseGeo = new THREE.CylinderGeometry(5, 6, 2, 12);
        const baseMat = new THREE.MeshStandardMaterial({
            color: poleColor.clone().multiplyScalar(0.35),
            emissive: poleColor.clone().multiplyScalar(0.08),
            roughness: 0.5,
            metalness: 0.6
        });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.set(pos.x, 1, pos.z);
        base.castShadow = true;
        scene.add(base);
    });

    // Structural wires between pole tops (horizontal frame)
    const frameMat = new THREE.LineBasicMaterial({ color: 0x223344, transparent: true, opacity: 0.4 });
    for (let i = 0; i < 4; i++) {
        const j = (i + 1) % 4;
        const frameGeo = new THREE.BufferGeometry().setFromPoints([polePositions[i], polePositions[j]]);
        scene.add(new THREE.Line(frameGeo, frameMat));
    }

    // ─── Spider Cam (Payload) ───
    const camGroup = new THREE.Group();

    // Main body — bright cyan with emissive glow
    const camBody = new THREE.Mesh(
        new THREE.BoxGeometry(10, 6, 10, 2, 2, 2),
        new THREE.MeshStandardMaterial({
            color: 0x00ffcc,
            emissive: 0x00aa88,
            emissiveIntensity: 0.4,
            roughness: 0.2,
            metalness: 0.6
        })
    );
    camBody.castShadow = true;
    camGroup.add(camBody);

    // Camera lens
    const lensGeo = new THREE.CylinderGeometry(2.5, 3, 4, 16);
    const lensMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.1, metalness: 0.9 });
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.rotation.x = Math.PI / 2;
    lens.position.set(0, -2, 5);
    camGroup.add(lens);

    // Lens glass — bright glowing
    const lensGlass = new THREE.Mesh(
        new THREE.CircleGeometry(2.4, 16),
        new THREE.MeshBasicMaterial({ color: 0x55ffdd, transparent: true, opacity: 0.9 })
    );
    lensGlass.position.set(0, -2, 7.01);
    camGroup.add(lensGlass);

    // Glowing accent ring — brighter and thicker
    const ringGeo = new THREE.TorusGeometry(7, 0.6, 8, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.85 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0;
    camGroup.add(ring);

    // Position cam group
    camGroup.position.set(0, 50, 0);
    scene.add(camGroup);

    // Dynamic point light attached to cam — stronger
    const camLight = new THREE.PointLight(0x00ffcc, 1.5, 100);
    camLight.position.set(0, -3, 0);
    camGroup.add(camLight);

    // ─── Cable Label Helper ───
    function createCableLabel(colorHex) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;

        const spriteMat = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false
        });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(24, 6, 1);
        scene.add(sprite);

        return { sprite, canvas, ctx, texture, colorHex };
    }

    function updateLabelText(label, text) {
        const ctx = label.ctx;
        const w = label.canvas.width;
        const h = label.canvas.height;
        ctx.clearRect(0, 0, w, h);

        // Background pill
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        const rx = 12, rw = w - 24, rh = h - 16, ry = 8;
        ctx.beginPath();
        ctx.roundRect(rx, ry, rw, rh, 14);
        ctx.fill();

        // Border
        const hexStr = '#' + label.colorHex.toString(16).padStart(6, '0');
        ctx.strokeStyle = hexStr;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(rx, ry, rw, rh, 14);
        ctx.stroke();

        // Text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, w / 2, h / 2);

        label.texture.needsUpdate = true;
    }

    // ─── Cables ───
    const cables = [];
    polePositions.forEach((pos, i) => {
        const points = [pos, camGroup.position.clone()];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const lineMat = new THREE.LineBasicMaterial({
            color: CONFIG.cableColors[i],
            transparent: true,
            opacity: 0.7,
            linewidth: 2
        });
        const line = new THREE.Line(lineGeo, lineMat);
        scene.add(line);

        // Create label sprite for this cable
        const label = createCableLabel(CONFIG.cableColors[i]);

        cables.push({ obj: line, anchor: pos, label });
    });

    // ─── Floating Particles ───
    const particleCount = 200;
    const particlesGeo = new THREE.BufferGeometry();
    const particlesPos = new Float32Array(particleCount * 3);
    const particlesSpeeds = [];

    for (let i = 0; i < particleCount; i++) {
        particlesPos[i * 3] = (Math.random() - 0.5) * 300;
        particlesPos[i * 3 + 1] = Math.random() * 150;
        particlesPos[i * 3 + 2] = (Math.random() - 0.5) * 300;
        particlesSpeeds.push(0.05 + Math.random() * 0.15);
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlesPos, 3));
    const particlesMat = new THREE.PointsMaterial({
        color: 0x00ffcc,
        size: 1.2,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    // ─── Keyboard Input ───
    const keys = {};
    const keyElements = {};
    ['w', 'a', 's', 'd', 'q', 'e'].forEach(k => {
        keyElements[k] = document.getElementById('key-' + k);
    });

    window.addEventListener('keydown', e => {
        const key = e.key.toLowerCase();
        keys[key] = true;
        if (keyElements[key]) keyElements[key].classList.add('active');
    });
    window.addEventListener('keyup', e => {
        const key = e.key.toLowerCase();
        keys[key] = false;
        if (keyElements[key]) keyElements[key].classList.remove('active');
    });

    // ─── UI Elements ───
    const valX = document.getElementById('val-x');
    const valY = document.getElementById('val-y');
    const valZ = document.getElementById('val-z');
    const coordX = document.getElementById('coord-x');
    const coordY = document.getElementById('coord-y');
    const coordZ = document.getElementById('coord-z');
    const cableValues = [
        document.getElementById('cable-1'),
        document.getElementById('cable-2'),
        document.getElementById('cable-3'),
        document.getElementById('cable-4')
    ];
    const fpsDisplay = document.getElementById('fps-display');

    // Mini-map
    const minimapCanvas = document.getElementById('minimap-canvas');
    const minimapCtx = minimapCanvas.getContext('2d');

    // ─── FPS Counter ───
    let frameCount = 0;
    let lastFPSTime = performance.now();
    let currentFPS = 60;

    // ─── Previous positions for active detection ───
    let prevX = 0, prevY = 50, prevZ = 0;

    // ─── Update Physics & UI ───
    function updatePhysics() {
        const pos = camGroup.position;

        // Movement (same logic as original)
        if (keys['w'] && pos.z > -CONFIG.poleOffset) pos.z -= CONFIG.speed;
        if (keys['s'] && pos.z <  CONFIG.poleOffset) pos.z += CONFIG.speed;
        if (keys['a'] && pos.x > -CONFIG.poleOffset) pos.x -= CONFIG.speed;
        if (keys['d'] && pos.x <  CONFIG.poleOffset) pos.x += CONFIG.speed;
        if (keys['q'] && pos.y <  CONFIG.poleHeight)  pos.y += CONFIG.speed;
        if (keys['e'] && pos.y >  0)                  pos.y -= CONFIG.speed;

        // Detect axis activity
        const xActive = Math.abs(pos.x - prevX) > 0.01;
        const yActive = Math.abs(pos.y - prevY) > 0.01;
        const zActive = Math.abs(pos.z - prevZ) > 0.01;

        coordX.classList.toggle('active', xActive);
        coordY.classList.toggle('active', yActive);
        coordZ.classList.toggle('active', zActive);

        prevX = pos.x; prevY = pos.y; prevZ = pos.z;

        // Update coordinate display
        valX.textContent = pos.x.toFixed(1);
        valY.textContent = pos.y.toFixed(1);
        valZ.textContent = pos.z.toFixed(1);

        // Update cables + 3D labels
        cables.forEach((cable, index) => {
            const positions = cable.obj.geometry.attributes.position.array;
            positions[0] = cable.anchor.x;
            positions[1] = cable.anchor.y;
            positions[2] = cable.anchor.z;
            positions[3] = pos.x;
            positions[4] = pos.y;
            positions[5] = pos.z;
            cable.obj.geometry.attributes.position.needsUpdate = true;

            const dist = cable.anchor.distanceTo(pos);
            cableValues[index].textContent = dist.toFixed(2);

            // Position label at cable midpoint
            cable.label.sprite.position.set(
                (cable.anchor.x + pos.x) / 2,
                (cable.anchor.y + pos.y) / 2 + 4,
                (cable.anchor.z + pos.z) / 2
            );
            updateLabelText(cable.label, dist.toFixed(1) + ' cm');
        });

        // Subtle cam rotation animation
        ring.rotation.z += 0.01;
    }

    // ─── Animate Particles ───
    function updateParticles() {
        const positions = particles.geometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3 + 1] += particlesSpeeds[i];
            if (positions[i * 3 + 1] > 160) {
                positions[i * 3 + 1] = 0;
                positions[i * 3] = (Math.random() - 0.5) * 300;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 300;
            }
        }
        particles.geometry.attributes.position.needsUpdate = true;
    }

    // ─── Draw Mini-map ───
    function drawMinimap() {
        const ctx = minimapCtx;
        const w = minimapCanvas.width;
        const h = minimapCanvas.height;
        const scale = w / (CONFIG.poleOffset * 2 + 40);

        ctx.clearRect(0, 0, w, h);

        // Background
        ctx.fillStyle = 'rgba(10, 14, 28, 0.8)';
        ctx.fillRect(0, 0, w, h);

        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= 4; i++) {
            const p = (i / 4) * w;
            ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, h); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(w, p); ctx.stroke();
        }

        // Boundary box
        const bx = (CONFIG.poleOffset + 20) * scale;
        const by = (CONFIG.poleOffset + 20) * scale;
        const bw = CONFIG.poleOffset * 2 * scale;
        ctx.strokeStyle = 'rgba(0, 255, 204, 0.15)';
        ctx.lineWidth = 1;
        ctx.strokeRect(w / 2 - bw / 2, h / 2 - bw / 2, bw, bw);

        // Poles
        polePositions.forEach((pos, i) => {
            const px = w / 2 + pos.x * scale;
            const py = h / 2 + pos.z * scale;
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#' + CONFIG.cableColors[i].toString(16).padStart(6, '0');
            ctx.fill();
        });

        // Cables
        const camPos = camGroup.position;
        const cx = w / 2 + camPos.x * scale;
        const cy = h / 2 + camPos.z * scale;

        polePositions.forEach((pos, i) => {
            const px = w / 2 + pos.x * scale;
            const py = h / 2 + pos.z * scale;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(cx, cy);
            ctx.strokeStyle = '#' + CONFIG.cableColors[i].toString(16).padStart(6, '0');
            ctx.globalAlpha = 0.35;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.globalAlpha = 1;
        });

        // Spider cam dot
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#00ffcc';
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(cx, cy, 7, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 255, 204, 0.15)';
        ctx.fill();
    }

    // ─── FPS ───
    function updateFPS() {
        frameCount++;
        const now = performance.now();
        if (now - lastFPSTime >= 1000) {
            currentFPS = frameCount;
            frameCount = 0;
            lastFPSTime = now;
            fpsDisplay.textContent = `FPS: ${currentFPS}`;
        }
    }

    // ─── Resize ───
    window.addEventListener('resize', () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        renderer.setSize(w, h);
        if (composer) composer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    });

    // ─── Main Animation Loop ───
    function animate() {
        requestAnimationFrame(animate);
        updatePhysics();
        updateParticles();
        updateFPS();
        drawMinimap();
        controls.update();
        if (composer) {
            composer.render();
        } else {
            renderer.render(scene, camera);
        }
    }

    // ─── Start ───
    // Always dismiss loading screen
    setTimeout(() => {
        const ls = document.getElementById('loading-screen');
        if (ls) ls.classList.add('hidden');
    }, 1200);

    animate();

})();
