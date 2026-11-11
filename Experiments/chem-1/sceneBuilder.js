import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { buildLabRoomAndBench } from '../shared/labEnvironment.js';

function createBuretteScaleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Schellbach white/blue reading stripe on back of burette
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.fillRect(108, 20, 40, 984);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(124, 20, 8, 984);

    // Crisp black graduation ticks & numbers
    ctx.strokeStyle = '#0f172a';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 21px "IBM Plex Mono", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    const topPx = 42;
    const bottomPx = 982;
    const spanPx = bottomPx - topPx;

    for (let ml = 0; ml <= 50; ml++) {
        const y = topPx + (ml / 50) * spanPx;
        const isMajor = ml % 5 === 0;

        ctx.lineWidth = isMajor ? 3.5 : 2;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(isMajor ? 48 : 26, y);
        ctx.stroke();

        if (isMajor) {
            ctx.fillText(ml.toString(), 54, y);
        }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 4;
    return texture;
}

export function createLabScene(container) {
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight - 54;

    // 1. Scene + Shared Bright Laboratory Room & Workbench Table
    const scene = new THREE.Scene();
    buildLabRoomAndBench(scene);

    // 2. Camera & Free-Roam 3D OrbitControls
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0.15, 1.38, 2.55);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.02, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.minDistance = 0.45;
    controls.maxDistance = 3.1;
    controls.maxPolarAngle = Math.PI / 2 + 0.05;
    controls.update();

    let cameraTransition = null;

    // 3. Bright Natural Classroom Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xd6d3cd, 1.15);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffef8, 1.25);
    keyLight.position.set(2.2, 4.2, 3.2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const windowFillLight = new THREE.DirectionalLight(0xe0f2fe, 0.55);
    windowFillLight.position.set(-3.2, 2.2, 1.0);
    scene.add(windowFillLight);

    // 4. Apparatus Materials (Tuned for Bright Room Visibility)
    const tileMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.15,
        metalness: 0.02,
    });

    const standIronMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.38,
        metalness: 0.8,
    });

    const chromeMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        roughness: 0.22,
        metalness: 0.88,
    });

    // High-contrast laboratory borosilicate glass with crisp dark-slate rim tint
    const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xcbd5e1,
        transparent: true,
        opacity: 0.34,
        roughness: 0.08,
        metalness: 0.08,
        reflectivity: 0.9,
        depthWrite: false,
        side: THREE.DoubleSide,
    });

    const glassRimMat = new THREE.MeshStandardMaterial({
        color: 0x64748b,
        transparent: true,
        opacity: 0.65,
        roughness: 0.2,
    });

    // 5. White Ceramic Tile on Workbench (Centered at X=0, Z=0, Y=0.512)
    const whiteTile = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.024, 0.46), tileMat);
    whiteTile.position.set(0, 0.512, 0);
    whiteTile.receiveShadow = true;
    whiteTile.castShadow = true;
    scene.add(whiteTile);

    // 6. Retort Stand & Clamp
    const standGroup = new THREE.Group();

    const standBase = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.032, 0.42), standIronMat);
    standBase.position.set(-0.45, 0.516, -0.18);
    standBase.castShadow = true;
    standBase.receiveShadow = true;
    standGroup.add(standBase);

    const standRod = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 1.85, 20), chromeMat);
    standRod.position.set(-0.45, 1.44, -0.32);
    standRod.castShadow = true;
    standGroup.add(standRod);

    const bosshead = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.07, 0.055), standIronMat);
    bosshead.position.set(-0.45, 1.65, -0.32);
    standGroup.add(bosshead);

    const armLength = Math.hypot(0.45, 0.32);
    const clampArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.009, 0.009, armLength, 16),
        chromeMat
    );
    clampArm.position.set(-0.225, 1.65, -0.16);
    clampArm.rotation.x = Math.PI / 2;
    clampArm.rotation.z = -Math.atan2(0.45, 0.32);
    standGroup.add(clampArm);

    const clampRing = new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.007, 12, 28), standIronMat);
    clampRing.rotation.x = Math.PI / 2;
    clampRing.position.set(0, 1.65, 0);
    standGroup.add(clampRing);

    scene.add(standGroup);

    // 7. Conical Flask (250 cm³) Resting on White Tile
    const flaskGroup = new THREE.Group();
    flaskGroup.position.set(0, 0.524, 0);

    const flaskCone = new THREE.Mesh(
        new THREE.CylinderGeometry(0.046, 0.165, 0.25, 36, 1, true),
        glassMat
    );
    flaskCone.position.y = 0.125;
    flaskCone.renderOrder = 2;
    flaskGroup.add(flaskCone);

    const flaskBottom = new THREE.Mesh(new THREE.CircleGeometry(0.165, 36), glassMat);
    flaskBottom.rotation.x = -Math.PI / 2;
    flaskBottom.position.y = 0.002;
    flaskGroup.add(flaskBottom);

    const flaskNeck = new THREE.Mesh(
        new THREE.CylinderGeometry(0.046, 0.046, 0.11, 36, 1, true),
        glassMat
    );
    flaskNeck.position.y = 0.305;
    flaskNeck.renderOrder = 2;
    flaskGroup.add(flaskNeck);

    const flaskRim = new THREE.Mesh(new THREE.TorusGeometry(0.048, 0.006, 14, 36), glassRimMat);
    flaskRim.rotation.x = Math.PI / 2;
    flaskRim.position.y = 0.36;
    flaskGroup.add(flaskRim);

    const flaskLiquidMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.88,
        roughness: 0.12,
        depthWrite: true,
    });
    const flaskLiquid = new THREE.Mesh(
        new THREE.CylinderGeometry(0.115, 0.158, 0.095, 36),
        flaskLiquidMat
    );
    flaskLiquid.position.y = 0.048;
    flaskLiquid.renderOrder = 1;
    flaskGroup.add(flaskLiquid);

    const flaskSurfaceRing = new THREE.Mesh(
        new THREE.RingGeometry(0.105, 0.116, 36),
        new THREE.MeshBasicMaterial({
            color: 0x0284c7,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide,
        })
    );
    flaskSurfaceRing.rotation.x = -Math.PI / 2;
    flaskSurfaceRing.position.y = 0.095;
    flaskGroup.add(flaskSurfaceRing);

    scene.add(flaskGroup);

    // 8. Burette (50.0 cm³)
    const buretteGroup = new THREE.Group();

    const scaleTexture = createBuretteScaleTexture();
    const buretteGlassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        map: scaleTexture,
        transparent: true,
        opacity: 0.88,
        roughness: 0.1,
        depthWrite: false,
        side: THREE.DoubleSide,
    });

    const buretteTube = new THREE.Mesh(
        new THREE.CylinderGeometry(0.028, 0.028, 0.96, 32, 1, true),
        buretteGlassMat
    );
    buretteTube.position.set(0, 1.58, 0);
    buretteTube.rotation.y = -Math.PI / 2;
    buretteTube.renderOrder = 2;
    buretteGroup.add(buretteTube);

    const buretteTopRim = new THREE.Mesh(new THREE.TorusGeometry(0.029, 0.004, 12, 28), glassRimMat);
    buretteTopRim.rotation.x = Math.PI / 2;
    buretteTopRim.position.set(0, 2.06, 0);
    buretteGroup.add(buretteTopRim);

    const buretteLiquidHeight = 0.88;
    const buretteLiquidMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        transparent: true,
        opacity: 0.82,
        roughness: 0.1,
        depthWrite: true,
    });
    const buretteLiquid = new THREE.Mesh(
        new THREE.CylinderGeometry(0.024, 0.024, buretteLiquidHeight, 28),
        buretteLiquidMat
    );
    buretteLiquid.position.set(0, 1.58, 0);
    buretteLiquid.renderOrder = 1;
    buretteGroup.add(buretteLiquid);

    const meniscusRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.0235, 0.003, 12, 28),
        new THREE.MeshBasicMaterial({ color: 0x0f172a })
    );
    meniscusRing.rotation.x = Math.PI / 2;
    meniscusRing.position.set(0, 2.02, 0);
    buretteGroup.add(meniscusRing);

    const stopcockBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.016, 0.016, 0.07, 16),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
    );
    stopcockBody.rotation.z = Math.PI / 2;
    stopcockBody.position.set(0, 1.07, 0);
    buretteGroup.add(stopcockBody);

    const stopcockValve = new THREE.Mesh(
        new THREE.BoxGeometry(0.022, 0.055, 0.014),
        new THREE.MeshStandardMaterial({ color: 0x0d9488, roughness: 0.25 })
    );
    stopcockValve.position.set(0.04, 1.07, 0);
    buretteGroup.add(stopcockValve);

    const buretteTip = new THREE.Mesh(
        new THREE.CylinderGeometry(0.026, 0.005, 0.11, 24),
        glassMat
    );
    buretteTip.position.set(0, 1.045, 0);
    buretteGroup.add(buretteTip);

    scene.add(buretteGroup);

    // 9. Left Station: 250 cm³ NaOH Beaker + Animated Pipette
    const beakerGroup = new THREE.Group();
    beakerGroup.position.set(-0.62, 0.5, 0.22);

    const beakerWall = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.11, 0.24, 32, 1, true),
        glassMat
    );
    beakerWall.position.y = 0.12;
    beakerWall.renderOrder = 2;
    beakerGroup.add(beakerWall);

    const beakerRim = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.004, 12, 32), glassRimMat);
    beakerRim.rotation.x = Math.PI / 2;
    beakerRim.position.y = 0.24;
    beakerGroup.add(beakerRim);

    const beakerLiquid = new THREE.Mesh(
        new THREE.CylinderGeometry(0.104, 0.104, 0.15, 32),
        new THREE.MeshStandardMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.82,
            roughness: 0.15,
        })
    );
    beakerLiquid.position.y = 0.076;
    beakerLiquid.renderOrder = 1;
    beakerGroup.add(beakerLiquid);

    scene.add(beakerGroup);

    const pipetteGroup = new THREE.Group();
    pipetteGroup.position.set(-0.62, 0.82, 0.22);

    const pipetteBulb = new THREE.Mesh(
        new THREE.CylinderGeometry(0.022, 0.022, 0.12, 20),
        glassMat
    );
    pipetteGroup.add(pipetteBulb);

    const pipetteUpperStem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.006, 0.006, 0.18, 16),
        glassMat
    );
    pipetteUpperStem.position.y = 0.15;
    pipetteGroup.add(pipetteUpperStem);

    const pipetteLowerStem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.006, 0.003, 0.18, 16),
        glassMat
    );
    pipetteLowerStem.position.y = -0.15;
    pipetteGroup.add(pipetteLowerStem);

    const pipetteLiquid = new THREE.Mesh(
        new THREE.CylinderGeometry(0.019, 0.019, 0.11, 16),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, transparent: true, opacity: 0.88 })
    );
    pipetteLiquid.visible = false;
    pipetteGroup.add(pipetteLiquid);

    scene.add(pipetteGroup);

    // 10. Right Station: Amber Phenolphthalein Bottle & Animated Dropper
    const bottleGroup = new THREE.Group();
    bottleGroup.position.set(0.52, 0.5, 0.16);

    const amberGlassMat = new THREE.MeshPhysicalMaterial({
        color: 0xb45309,
        transparent: true,
        opacity: 0.78,
        roughness: 0.15,
        depthWrite: false,
    });

    const bottleBody = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.16, 28), amberGlassMat);
    bottleBody.position.y = 0.08;
    bottleBody.renderOrder = 2;
    bottleGroup.add(bottleBody);

    const bottleShoulder = new THREE.Mesh(
        new THREE.CylinderGeometry(0.028, 0.07, 0.04, 28),
        amberGlassMat
    );
    bottleShoulder.position.y = 0.18;
    bottleGroup.add(bottleShoulder);

    const bottleLiquid = new THREE.Mesh(
        new THREE.CylinderGeometry(0.063, 0.063, 0.095, 24),
        new THREE.MeshStandardMaterial({ color: 0xe11d74, transparent: true, opacity: 0.92 })
    );
    bottleLiquid.position.y = 0.048;
    bottleLiquid.renderOrder = 1;
    bottleGroup.add(bottleLiquid);

    scene.add(bottleGroup);

    const dropperGroup = new THREE.Group();
    dropperGroup.position.set(0.52, 0.72, 0.16);

    const rubberBulb = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.02, 0.035, 12, 16),
        new THREE.MeshStandardMaterial({ color: 0xbe185d, roughness: 0.4 })
    );
    rubberBulb.position.y = 0.03;
    dropperGroup.add(rubberBulb);

    const dropperCap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.025, 20),
        new THREE.MeshStandardMaterial({ color: 0x1e293b })
    );
    dropperGroup.add(dropperCap);

    const dropperGlassTube = new THREE.Mesh(
        new THREE.CylinderGeometry(0.006, 0.003, 0.11, 14),
        glassMat
    );
    dropperGlassTube.position.y = -0.06;
    dropperGroup.add(dropperGlassTube);

    scene.add(dropperGroup);

    // 11. 3D Label Anchors
    const labelAnchors = [
        {
            id: 'burette',
            title: '50.0 cm³ Burette',
            sub: 'Titrant: 0.1M HCl (Acid)',
            pos: new THREE.Vector3(0.08, 1.72, 0),
        },
        {
            id: 'stopcock',
            title: 'Burette Stopcock',
            sub: 'Controls Acid Flow',
            pos: new THREE.Vector3(0.09, 1.08, 0),
        },
        {
            id: 'flask',
            title: '250 cm³ Conical Flask',
            sub: 'Analyte: 25.0 cm³ 0.1M NaOH',
            pos: new THREE.Vector3(0.16, 0.72, 0),
        },
        {
            id: 'tile',
            title: 'White Ceramic Tile',
            sub: 'Enhances Color Contrast',
            pos: new THREE.Vector3(0, 0.52, 0.25),
        },
        {
            id: 'beaker',
            title: 'NaOH Storage Beaker & Pipette',
            sub: 'Solution B (0.1M Alkali)',
            pos: new THREE.Vector3(-0.62, 0.85, 0.22),
        },
        {
            id: 'indicator',
            title: 'Phenolphthalein Indicator',
            sub: 'Pink in Alkali / Clear in Acid',
            pos: new THREE.Vector3(0.52, 0.84, 0.16),
        },
    ];

    function syncWithState(snapshot) {
        if (snapshot.flaskVolume <= 0.1) {
            flaskLiquid.visible = false;
            flaskSurfaceRing.visible = false;
        } else {
            flaskLiquid.visible = true;
            flaskSurfaceRing.visible = true;
            flaskLiquidMat.color.setHex(snapshot.liquidColorHex);

            const scaleY = 0.65 + (snapshot.flaskVolume / 75.0) * 0.85;
            flaskLiquid.scale.set(1, scaleY, 1);
            flaskLiquid.position.y = 0.048 * scaleY;
            flaskSurfaceRing.position.y = 0.095 * scaleY;
        }

        const remainingRatio = Math.max(0.01, 1 - snapshot.buretteVolume / 50.0);
        buretteLiquid.scale.set(1, remainingRatio, 1);
        const bottomY = 1.14;
        const currentHeight = buretteLiquidHeight * remainingRatio;
        buretteLiquid.position.y = bottomY + currentHeight / 2;
        meniscusRing.position.y = bottomY + currentHeight;
    }

    function setCameraPreset(presetName) {
        let targetPos, targetLook;

        if (presetName === 'bench') {
            targetPos = new THREE.Vector3(0.15, 1.38, 2.55);
            targetLook = new THREE.Vector3(0, 1.02, 0);
        } else if (presetName === 'meniscus') {
            const meniscusY = meniscusRing.position.y;
            targetPos = new THREE.Vector3(0, meniscusY, 0.58);
            targetLook = new THREE.Vector3(0, meniscusY, 0);
        } else if (presetName === 'flask') {
            targetPos = new THREE.Vector3(0, 0.86, 0.92);
            targetLook = new THREE.Vector3(0, 0.66, 0);
        }

        if (targetPos && targetLook) {
            cameraTransition = {
                targetPos,
                targetLook,
                framesLeft: 38,
            };
        }
    }

    function updateCamera() {
        if (cameraTransition) {
            camera.position.lerp(cameraTransition.targetPos, 0.12);
            controls.target.lerp(cameraTransition.targetLook, 0.12);
            cameraTransition.framesLeft--;
            if (cameraTransition.framesLeft <= 0) {
                cameraTransition = null;
            }
        }
        controls.update();
    }

    function handleResize() {
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight - 54;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    }
    window.addEventListener('resize', handleResize);

    function dispose() {
        window.removeEventListener('resize', handleResize);
        if (controls && controls.dispose) {
            controls.dispose();
        }
        if (renderer) {
            renderer.dispose();
            if (renderer.domElement && renderer.domElement.parentNode) {
                renderer.domElement.parentNode.removeChild(renderer.domElement);
            }
        }
    }

    return {
        scene,
        camera,
        renderer,
        controls,
        flaskGroup,
        flaskLiquid,
        pipetteGroup,
        pipetteLiquid,
        dropperGroup,
        stopcockValve,
        labelAnchors,
        syncWithState,
        setCameraPreset,
        updateCamera,
        dispose,
        cleanup: dispose,
    };
}