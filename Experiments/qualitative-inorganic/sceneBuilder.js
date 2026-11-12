import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { buildLabRoomAndBench } from '../shared/labEnvironment.js';

function createBottleLabelTexture(title, formula, accentHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Cream reagent label background
    ctx.fillStyle = '#fefce8';
    ctx.fillRect(0, 0, 256, 128);

    // Colored top hazard/category stripe
    ctx.fillStyle = accentHex;
    ctx.fillRect(0, 0, 256, 26);

    // Border
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, 252, 124);

    // Formula text
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 34px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(formula, 128, 70);

    // Subtitle
    ctx.fillStyle = '#475569';
    ctx.font = '600 20px "IBM Plex Sans", sans-serif';
    ctx.fillText(title, 128, 104);

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 4;
    return tex;
}

function createTubeNumberTexture(numStr) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(8, 8, 112, 48);
    ctx.strokeStyle = '#0f5257';
    ctx.lineWidth = 3;
    ctx.strokeRect(8, 8, 112, 48);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 26px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(numStr, 64, 33);

    return new THREE.CanvasTexture(canvas);
}

export function createLabScene(container) {
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight - 54;

    // 1. Scene & Shared 4-Wall Laboratory Room
    const scene = new THREE.Scene();
    buildLabRoomAndBench(scene);

    // 2. Camera & OrbitControls
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0.05, 1.32, 2.15);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.78, 0.05);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 0.45;
    controls.maxDistance = 3.1;
    controls.maxPolarAngle = Math.PI / 2 + 0.04;
    controls.update();

    let cameraTransition = null;

    // 3. Studio & Natural Classroom Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xd6d3cd, 1.15);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffef8, 1.3);
    keyLight.position.set(2.0, 4.0, 2.8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe0f2fe, 0.55);
    fillLight.position.set(-2.8, 2.0, 1.2);
    scene.add(fillLight);

    // 4. Shared Materials
    const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xdbeafe,
        transparent: true,
        opacity: 0.32,
        roughness: 0.07,
        metalness: 0.05,
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

    const woodRackMat = new THREE.MeshStandardMaterial({
        color: 0x9a5b25,
        roughness: 0.55,
        metalness: 0.05,
    });

    // 5. Centerpiece: 4-Slot Wooden Test Tube Rack (X = -0.06, Y = 0.50, Z = 0.08)
    const rackGroup = new THREE.Group();
    rackGroup.position.set(-0.06, 0.5, 0.08);

    const rackBase = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.028, 0.16), woodRackMat);
    rackBase.position.y = 0.014;
    rackBase.castShadow = true;
    rackBase.receiveShadow = true;
    rackGroup.add(rackBase);

    const leftPillar = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.22, 0.14), woodRackMat);
    leftPillar.position.set(-0.28, 0.124, 0);
    leftPillar.castShadow = true;
    rackGroup.add(leftPillar);

    const rightPillar = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.22, 0.14), woodRackMat);
    rightPillar.position.set(0.28, 0.124, 0);
    rightPillar.castShadow = true;
    rackGroup.add(rightPillar);

    const topRail = new THREE.Mesh(new THREE.BoxGeometry(0.59, 0.022, 0.14), woodRackMat);
    topRail.position.y = 0.22;
    topRail.castShadow = true;
    rackGroup.add(topRail);

    // Dark Contrast Backing Board behind the test tubes (so white precipitates pop visually!)
    const contrastPanel = new THREE.Mesh(
        new THREE.BoxGeometry(0.54, 0.18, 0.012),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 })
    );
    contrastPanel.position.set(0, 0.12, -0.058);
    rackGroup.add(contrastPanel);

    scene.add(rackGroup);

    // 6. Build the 4 Test Tubes inside the Rack
    const tubeXOffsets = [-0.18, -0.06, 0.06, 0.18];
    const tubeObjects = {};

    tubeXOffsets.forEach((xOff, idx) => {
        const tubeNum = idx + 1;
        const worldX = -0.06 + xOff;
        const worldZ = 0.08;

        // Collar hole ring on rack top rail
        const holeRing = new THREE.Mesh(
            new THREE.TorusGeometry(0.026, 0.004, 12, 24),
            new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7 })
        );
        holeRing.rotation.x = Math.PI / 2;
        holeRing.position.set(xOff, 0.232, 0);
        rackGroup.add(holeRing);

        // Number plaque on front of rack base
        const plaque = new THREE.Mesh(
            new THREE.PlaneGeometry(0.09, 0.036),
            new THREE.MeshBasicMaterial({ map: createTubeNumberTexture(`TUBE ${tubeNum}`) })
        );
        plaque.position.set(xOff, 0.22, 0.072);
        rackGroup.add(plaque);

        // Individual Test Tube Group (pivots around its center for swirling)
        const tubeGroup = new THREE.Group();
        tubeGroup.position.set(worldX, 0.535, worldZ);

        // Glass cylindrical body
        const glassWall = new THREE.Mesh(
            new THREE.CylinderGeometry(0.022, 0.022, 0.27, 28, 1, true),
            glassMat
        );
        glassWall.position.y = 0.145;
        glassWall.renderOrder = 3;
        tubeGroup.add(glassWall);

        // Rounded glass bottom cap
        const glassBottom = new THREE.Mesh(
            new THREE.SphereGeometry(0.022, 24, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
            glassMat
        );
        glassBottom.position.y = 0.01;
        glassBottom.renderOrder = 3;
        tubeGroup.add(glassBottom);

        // Flared top glass lip
        const glassLip = new THREE.Mesh(new THREE.TorusGeometry(0.023, 0.0035, 12, 28), glassRimMat);
        glassLip.rotation.x = Math.PI / 2;
        glassLip.position.y = 0.28;
        tubeGroup.add(glassLip);

        // Liquid column inside test tube
        const maxLiquidH = 0.18;
        const liquidMat = new THREE.MeshStandardMaterial({
            color: 0xe0f2fe,
            transparent: true,
            opacity: 0.4,
            roughness: 0.15,
            depthWrite: false,
        });
        const liquidMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.0195, 0.0195, maxLiquidH, 24),
            liquidMat
        );
        liquidMesh.position.y = 0.01 + maxLiquidH / 2;
        liquidMesh.renderOrder = 1;
        liquidMesh.visible = false;
        tubeGroup.add(liquidMesh);

        // Meniscus ring at top of liquid
        const meniscus = new THREE.Mesh(
            new THREE.RingGeometry(0.014, 0.0195, 24),
            new THREE.MeshBasicMaterial({
                color: 0xbae6fd,
                transparent: true,
                opacity: 0.75,
                side: THREE.DoubleSide,
            })
        );
        meniscus.rotation.x = -Math.PI / 2;
        meniscus.position.y = 0.1;
        meniscus.visible = false;
        tubeGroup.add(meniscus);

        // Precipitate settled/suspended layer inside bottom of tube
        const maxPptH = 0.095;
        const pptMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.0,
            roughness: 0.5,
            depthWrite: true,
        });
        const pptMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.0188, 0.018, maxPptH, 24),
            pptMat
        );
        pptMesh.position.y = 0.012 + maxPptH / 2;
        pptMesh.renderOrder = 2;
        pptMesh.visible = false;
        tubeGroup.add(pptMesh);

        // Active Tube Glowing Indicator Ring on the Rack Base
        const activeHalo = new THREE.Mesh(
            new THREE.RingGeometry(0.025, 0.035, 28),
            new THREE.MeshBasicMaterial({
                color: 0x10b981,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.85,
            })
        );
        activeHalo.rotation.x = -Math.PI / 2;
        activeHalo.position.y = 0.002;
        activeHalo.visible = tubeNum === 1;
        tubeGroup.add(activeHalo);

        scene.add(tubeGroup);

        tubeObjects[tubeNum] = {
            group: tubeGroup,
            liquidMesh,
            liquidMat,
            meniscus,
            pptMesh,
            pptMat,
            activeHalo,
            maxLiquidH,
            maxPptH,
            homePos: new THREE.Vector3(worldX, 0.535, worldZ),
        };
    });

    // 7. Left Station: Unknown Solid M on Watch Glass, Spatula & Distilled Water Wash Bottle
    const sampleStation = new THREE.Group();
    sampleStation.position.set(-0.56, 0.5, 0.16);

    // Watch glass dish
    const watchGlass = new THREE.Mesh(
        new THREE.CylinderGeometry(0.085, 0.05, 0.016, 32),
        glassMat
    );
    watchGlass.position.y = 0.008;
    sampleStation.add(watchGlass);

    // White crystalline mound ("Solid M")
    const crystalMound = new THREE.Mesh(
        new THREE.ConeGeometry(0.052, 0.032, 18),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.65 })
    );
    crystalMound.position.y = 0.024;
    sampleStation.add(crystalMound);

    scene.add(sampleStation);

    // Metallic Spatula (animated in Step 1)
    const spatulaGroup = new THREE.Group();
    spatulaGroup.position.set(-0.56, 0.54, 0.24);

    const spatulaBlade = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.004, 0.018),
        new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.85, roughness: 0.2 })
    );
    spatulaGroup.add(spatulaBlade);

    const spatulaPowder = new THREE.Mesh(
        new THREE.SphereGeometry(0.012, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 })
    );
    spatulaPowder.position.set(0.065, 0.006, 0);
    spatulaPowder.scale.set(1.2, 0.5, 1);
    spatulaPowder.visible = false;
    spatulaGroup.add(spatulaPowder);

    scene.add(spatulaGroup);

    // Distilled Water Wash Bottle (animated in Step 1)
    const washBottleGroup = new THREE.Group();
    washBottleGroup.position.set(-0.46, 0.5, -0.14);

    const washBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.055, 0.19, 24),
        new THREE.MeshPhysicalMaterial({
            color: 0xf1f5f9,
            transparent: true,
            opacity: 0.78,
            roughness: 0.25,
        })
    );
    washBody.position.y = 0.095;
    washBottleGroup.add(washBody);

    const washCap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.024, 0.028, 0.028, 20),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 })
    );
    washCap.position.y = 0.204;
    washBottleGroup.add(washCap);

    const washNozzle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.004, 0.004, 0.11, 12),
        new THREE.MeshStandardMaterial({ color: 0x0284c7 })
    );
    washNozzle.position.set(0.028, 0.245, 0);
    washNozzle.rotation.z = -0.55;
    washBottleGroup.add(washNozzle);

    scene.add(washBottleGroup);

    // 8. Right Station: 6 Reagent Dropper Bottles in a 2x3 Lab Tray
    const reagentSpecs = [
        {
            key: 'naoh',
            formula: '2M NaOH',
            title: 'Sodium Hydroxide',
            accent: '#0284c7',
            glassColor: 0xdbeafe,
            bulbColor: 0x0369a1,
            pos: new THREE.Vector3(0.36, 0.5, 0.18),
        },
        {
            key: 'nh3',
            formula: '2M NH₃',
            title: 'Aqueous Ammonia',
            accent: '#0d9488',
            glassColor: 0xdbeafe,
            bulbColor: 0x0f766e,
            pos: new THREE.Vector3(0.52, 0.5, 0.18),
        },
        {
            key: 'hno3',
            formula: 'Dil. HNO₃',
            title: 'Nitric Acid',
            accent: '#d97706',
            glassColor: 0xb45309,
            bulbColor: 0xb45309,
            pos: new THREE.Vector3(0.68, 0.5, 0.18),
        },
        {
            key: 'agno3',
            formula: 'AgNO₃',
            title: 'Silver Nitrate',
            accent: '#7c3aed',
            glassColor: 0x78350f,
            bulbColor: 0x6d28d9,
            pos: new THREE.Vector3(0.36, 0.5, -0.04),
        },
        {
            key: 'hcl',
            formula: 'Dil. HCl',
            title: 'Hydrochloric Acid',
            accent: '#dc2626',
            glassColor: 0xdbeafe,
            bulbColor: 0xb91c1c,
            pos: new THREE.Vector3(0.52, 0.5, -0.04),
        },
        {
            key: 'bacl2',
            formula: 'BaCl₂',
            title: 'Barium Chloride',
            accent: '#2563eb',
            glassColor: 0xdbeafe,
            bulbColor: 0x1d4ed8,
            pos: new THREE.Vector3(0.68, 0.5, -0.04),
        },
    ];

    // White PVC Reagent Tray under the 6 bottles
    const reagentTray = new THREE.Mesh(
        new THREE.BoxGeometry(0.48, 0.018, 0.38),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25 })
    );
    reagentTray.position.set(0.52, 0.509, 0.07);
    reagentTray.receiveShadow = true;
    scene.add(reagentTray);

    const reagentDropperGroups = {};

    reagentSpecs.forEach((spec) => {
        const bGroup = new THREE.Group();
        bGroup.position.copy(spec.pos);

        const bottleGlass = new THREE.MeshPhysicalMaterial({
            color: spec.glassColor,
            transparent: true,
            opacity: 0.72,
            roughness: 0.15,
        });

        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.044, 0.125, 24), bottleGlass);
        body.position.y = 0.065;
        body.castShadow = true;
        bGroup.add(body);

        const shoulder = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.044, 0.028, 24),
            bottleGlass
        );
        shoulder.position.y = 0.14;
        bGroup.add(shoulder);

        // Curved front label
        const labelGeo = new THREE.CylinderGeometry(
            0.045,
            0.045,
            0.068,
            24,
            1,
            true,
            -Math.PI / 2.6,
            Math.PI / 1.3
        );
        const labelMat = new THREE.MeshBasicMaterial({
            map: createBottleLabelTexture(spec.title, spec.formula, spec.accent),
            side: THREE.DoubleSide,
        });
        const labelMesh = new THREE.Mesh(labelGeo, labelMat);
        labelMesh.position.y = 0.065;
        bGroup.add(labelMesh);

        scene.add(bGroup);

        // Individual Animated Dropper Pipette for this bottle
        const dGroup = new THREE.Group();
        const homeDropperPos = new THREE.Vector3(spec.pos.x, spec.pos.y + 0.175, spec.pos.z);
        dGroup.position.copy(homeDropperPos);

        const cap = new THREE.Mesh(
            new THREE.CylinderGeometry(0.022, 0.022, 0.022, 18),
            new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 })
        );
        dGroup.add(cap);

        const bulb = new THREE.Mesh(
            new THREE.CapsuleGeometry(0.014, 0.026, 10, 14),
            new THREE.MeshStandardMaterial({ color: spec.bulbColor, roughness: 0.35 })
        );
        bulb.position.y = 0.024;
        dGroup.add(bulb);

        const glassStem = new THREE.Mesh(
            new THREE.CylinderGeometry(0.0045, 0.0022, 0.095, 12),
            glassMat
        );
        glassStem.position.y = -0.052;
        dGroup.add(glassStem);

        scene.add(dGroup);

        reagentDropperGroups[spec.key] = {
            group: dGroup,
            bulb,
            homePos: homeDropperPos,
        };
    });

    // 9. Back-Left Station: Bunsen Burner with Gentle Blue Flame
    const burnerGroup = new THREE.Group();
    burnerGroup.position.set(-0.22, 0.5, -0.22);

    const burnerBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.058, 0.018, 24),
        new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 })
    );
    burnerBase.position.y = 0.009;
    burnerGroup.add(burnerBase);

    const burnerChimney = new THREE.Mesh(
        new THREE.CylinderGeometry(0.011, 0.011, 0.13, 20),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.2 })
    );
    burnerChimney.position.y = 0.08;
    burnerGroup.add(burnerChimney);

    const outerFlame = new THREE.Mesh(
        new THREE.ConeGeometry(0.016, 0.068, 16),
        new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.52,
        })
    );
    outerFlame.position.y = 0.175;
    burnerGroup.add(outerFlame);

    const innerFlame = new THREE.Mesh(
        new THREE.ConeGeometry(0.008, 0.036, 14),
        new THREE.MeshBasicMaterial({
            color: 0x6ee7b7,
            transparent: true,
            opacity: 0.85,
        })
    );
    innerFlame.position.y = 0.16;
    burnerGroup.add(innerFlame);

    scene.add(burnerGroup);

    // 10. 3D Floating Apparatus Labels
    const labelAnchors = [
        {
            id: 'rack',
            title: 'Test Tube Rack (Portions 1–4)',
            sub: 'Tube 1: NaOH | 2: NH₃ | 3: AgNO₃ | 4: BaCl₂',
            pos: new THREE.Vector3(-0.06, 0.88, 0.08),
        },
        {
            id: 'solidM',
            title: 'Unknown Sample "Solid M"',
            sub: 'Crystalline Inorganic Salt',
            pos: new THREE.Vector3(-0.56, 0.62, 0.16),
        },
        {
            id: 'washbottle',
            title: 'Distilled Water Wash Bottle',
            sub: 'For Dissolving Solid M',
            pos: new THREE.Vector3(-0.46, 0.82, -0.14),
        },
        {
            id: 'alkalis',
            title: 'Cation Test Reagents',
            sub: '2M NaOH & 2M Aqueous Ammonia',
            pos: new THREE.Vector3(0.44, 0.78, 0.18),
        },
        {
            id: 'anions',
            title: 'Anion Test Reagents',
            sub: 'HNO₃, AgNO₃, Dil. HCl & BaCl₂',
            pos: new THREE.Vector3(0.56, 0.78, -0.04),
        },
    ];

    // 11. State Synchronization
    function syncWithState(snapshot) {
        if (!snapshot || !snapshot.tubes) return;

        for (let i = 1; i <= 4; i++) {
            const tState = snapshot.tubes[i];
            const tObj = tubeObjects[i];
            if (!tState || !tObj) continue;

            tObj.activeHalo.visible = snapshot.activeTube === i;

            // Liquid visibility & level
            if (tState.volume <= 0.01) {
                tObj.liquidMesh.visible = false;
                tObj.meniscus.visible = false;
            } else {
                tObj.liquidMesh.visible = true;
                tObj.meniscus.visible = true;
                tObj.liquidMat.color.setHex(tState.liquidColor);
                tObj.liquidMat.opacity = tState.liquidOpacity;

                const scaleY = Math.max(0.08, tState.volume);
                tObj.liquidMesh.scale.set(1, scaleY, 1);
                const h = tObj.maxLiquidH * scaleY;
                tObj.liquidMesh.position.y = 0.01 + h / 2;
                tObj.meniscus.position.y = 0.01 + h;
            }

            // Precipitate layer visibility & height
            if (tState.pptOpacity <= 0.02 || tState.pptHeight <= 0.02) {
                tObj.pptMesh.visible = false;
            } else {
                tObj.pptMesh.visible = true;
                tObj.pptMat.color.setHex(tState.pptColor);
                tObj.pptMat.opacity = tState.pptOpacity;

                const pScale = Math.max(0.1, tState.pptHeight);
                tObj.pptMesh.scale.set(1, pScale, 1);
                const pH = tObj.maxPptH * pScale;
                tObj.pptMesh.position.y = 0.01 + pH / 2;
            }
        }
    }

    // 12. Smooth Camera Transitions
    function setCameraPreset(preset) {
        let targetPos = null;
        let targetLook = null;

        if (preset === 'bench') {
            targetPos = new THREE.Vector3(0.05, 1.32, 2.15);
            targetLook = new THREE.Vector3(0, 0.78, 0.05);
        } else if (preset === 'rack') {
            targetPos = new THREE.Vector3(-0.06, 0.92, 0.92);
            targetLook = new THREE.Vector3(-0.06, 0.66, 0.08);
        } else if (preset === 'reagents') {
            targetPos = new THREE.Vector3(0.52, 0.98, 0.78);
            targetLook = new THREE.Vector3(0.52, 0.62, 0.06);
        } else if (preset && preset.startsWith('tube')) {
            const idx = parseInt(preset.replace('tube', ''), 10) || 1;
            const tObj = tubeObjects[idx];
            if (tObj) {
                targetPos = new THREE.Vector3(tObj.homePos.x, 0.84, 0.68);
                targetLook = new THREE.Vector3(tObj.homePos.x, 0.65, tObj.homePos.z);
            }
        }

        if (targetPos && targetLook) {
            cameraTransition = { targetPos, targetLook, framesLeft: 36 };
        }
    }

    function updateCamera() {
        // Subtle Bunsen flame flicker
        const t = performance.now() * 0.008;
        outerFlame.scale.set(1 + Math.sin(t) * 0.05, 1 + Math.cos(t * 1.3) * 0.08, 1);
        innerFlame.scale.set(1, 1 + Math.sin(t * 1.7) * 0.06, 1);

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

    function cleanup() {
        window.removeEventListener('resize', handleResize);
        controls.dispose();
        renderer.dispose();
    }

    return {
        scene,
        camera,
        renderer,
        controls,
        tubeObjects,
        spatulaGroup,
        spatulaPowder,
        washBottleGroup,
        reagentDropperGroups,
        labelAnchors,
        syncWithState,
        setCameraPreset,
        updateCamera,
        cleanup,
    };
}