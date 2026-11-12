import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { buildLabRoomAndBench } from '../shared/labEnvironment.js';

function createBottleLabelTexture(title, subtitle, accentColor = '#0f5257') {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Warm paper label background
    ctx.fillStyle = '#faf8f2';
    ctx.fillRect(0, 0, 256, 128);

    // Top & bottom hazard stripe
    ctx.fillStyle = accentColor;
    ctx.fillRect(0, 0, 256, 18);
    ctx.fillRect(0, 118, 256, 10);

    // Border
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 3;
    ctx.strokeRect(4, 4, 248, 120);

    // Title text
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 28px "IBM Plex Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, 128, 60);

    // Subtitle
    ctx.fillStyle = '#475569';
    ctx.font = '600 18px "IBM Plex Mono", monospace';
    ctx.fillText(subtitle, 128, 94);

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 4;
    return tex;
}

function createTubeNeckTagTexture(letter, accentHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = accentHex;
    ctx.fillRect(0, 0, 128, 64);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter, 64, 33);

    return new THREE.CanvasTexture(canvas);
}

export function createLabScene(container) {
    // 1. Scene, Renderer & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe8eef3);

    const width = container.clientWidth || 960;
    const height = container.clientHeight || 640;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.05, 50);
    camera.position.set(0.0, 1.35, 2.05);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.target.set(0.0, 0.72, 0.02);
    controls.minDistance = 0.55;
    controls.maxDistance = 4.2;
    controls.maxPolarAngle = Math.PI * 0.485;

    // 2. Lighting & Shared 4-Walled Kenyan Lab Room
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfffdf8, 1.15);
    dirLight.position.set(2.2, 3.4, 2.4);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(2048, 2048);
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 12;
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0xdbeafe, 0.5);
    rimLight.position.set(-2.5, 2.2, -1.8);
    scene.add(rimLight);

    buildLabRoomAndBench(scene);

    // Shared Materials
    const borosilicateGlassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.92,
        opacity: 1,
        transparent: true,
        roughness: 0.06,
        ior: 1.47,
        reflectivity: 0.6,
        side: THREE.DoubleSide,
        depthWrite: false,
    });

    const amberGlassMat = new THREE.MeshPhysicalMaterial({
        color: 0x92400e,
        transmission: 0.65,
        opacity: 0.92,
        transparent: true,
        roughness: 0.14,
        ior: 1.5,
    });

    const woodRackMat = new THREE.MeshStandardMaterial({
        color: 0x8b5a2b,
        roughness: 0.55,
        metalness: 0.05,
    });

    const brassMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        roughness: 0.28,
        metalness: 0.85,
    });

    const chromeMat = new THREE.MeshStandardMaterial({
        color: 0xd1d5db,
        roughness: 0.22,
        metalness: 0.9,
    });

    const darkIronMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.45,
        metalness: 0.75,
    });

    // ============================================================================
    // 3. LEFT STATION: BUNSEN BURNER & METALLIC SPATULA ON HEAT-PROOF MAT (X = -0.46)
    // ============================================================================
    const burnerX = -0.46;
    const burnerZ = 0.04;

    // White Ceramic / Asbestos Heatproof Mat
    const heatMat = new THREE.Mesh(
        new THREE.BoxGeometry(0.34, 0.012, 0.32),
        new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.75 })
    );
    heatMat.position.set(burnerX, 0.506, burnerZ);
    heatMat.receiveShadow = true;
    scene.add(heatMat);

    const burnerGroup = new THREE.Group();
    burnerGroup.position.set(burnerX, 0.512, burnerZ);
    scene.add(burnerGroup);

    // Heavy circular cast-iron base
    const burnerBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.065, 0.082, 0.022, 32),
        darkIronMat
    );
    burnerBase.position.y = 0.011;
    burnerBase.castShadow = true;
    burnerGroup.add(burnerBase);

    // Brass gas inlet pipe + rubber tubing
    const gasInlet = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 0.07, 16),
        brassMat
    );
    gasInlet.rotation.z = Math.PI / 2;
    gasInlet.position.set(-0.06, 0.024, 0);
    burnerGroup.add(gasInlet);

    // Adjustable brass air-hole collar
    const airCollar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.022, 0.022, 0.036, 24),
        brassMat
    );
    airCollar.position.y = 0.038;
    burnerGroup.add(airCollar);

    // Chimney barrel
    const chimney = new THREE.Mesh(
        new THREE.CylinderGeometry(0.016, 0.018, 0.19, 24),
        chromeMat
    );
    chimney.position.y = 0.145;
    chimney.castShadow = true;
    burnerGroup.add(chimney);

    // Top flame nozzle rim
    const nozzleRim = new THREE.Mesh(
        new THREE.TorusGeometry(0.016, 0.0025, 12, 24),
        brassMat
    );
    nozzleRim.rotation.x = Math.PI / 2;
    nozzleRim.position.y = 0.24;
    burnerGroup.add(nozzleRim);

    // Multi-Layered 3D Bunsen Flame Group (at Y = 0.24 local, 0.302 world)
    const flameGroup = new THREE.Group();
    flameGroup.position.set(0, 0.24, 0);
    flameGroup.visible = false;
    burnerGroup.add(flameGroup);

    // Inner blue non-luminous cone
    const innerFlameMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.88,
        depthWrite: false,
    });
    const innerFlameMesh = new THREE.Mesh(
        new THREE.ConeGeometry(0.015, 0.075, 20),
        innerFlameMat
    );
    innerFlameMesh.position.y = 0.038;
    flameGroup.add(innerFlameMesh);

    // Outer flame envelope (shifts between pale blue Bunsen and bright yellow/orange luminous sooty flame)
    const outerFlameMat = new THREE.MeshBasicMaterial({
        color: 0x60a5fa,
        transparent: true,
        opacity: 0.52,
        depthWrite: false,
    });
    const outerFlameMesh = new THREE.Mesh(
        new THREE.ConeGeometry(0.028, 0.145, 24),
        outerFlameMat
    );
    outerFlameMesh.position.y = 0.072;
    flameGroup.add(outerFlameMesh);

    // Dynamic PointLight inside the flame
    const flameLight = new THREE.PointLight(0xffedd5, 0, 0.9);
    flameLight.position.set(0, 0.08, 0);
    flameGroup.add(flameLight);

    // Metallic Spatula Rest + Movable Metallic Spatula
    const spatulaRest = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.018, 0.05),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4 })
    );
    spatulaRest.position.set(burnerX + 0.11, 0.52, burnerZ + 0.08);
    scene.add(spatulaRest);

    const spatulaGroup = new THREE.Group();
    const spatulaHomePos = new THREE.Vector3(burnerX + 0.11, 0.536, burnerZ + 0.08);
    spatulaGroup.position.copy(spatulaHomePos);
    scene.add(spatulaGroup);

    // Wooden handle of metallic spatula
    const spatulaHandle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.009, 0.11, 16),
        new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.5 })
    );
    spatulaHandle.rotation.z = Math.PI / 2;
    spatulaHandle.position.set(0.06, 0, 0);
    spatulaGroup.add(spatulaHandle);

    // Stainless steel blade
    const spatulaBlade = new THREE.Mesh(
        new THREE.BoxGeometry(0.13, 0.0025, 0.014),
        chromeMat
    );
    spatulaBlade.position.set(-0.05, 0, 0);
    spatulaGroup.add(spatulaBlade);

    // Spoon/scoop tip at x = -0.115
    const spatulaScoop = new THREE.Mesh(
        new THREE.CylinderGeometry(0.013, 0.011, 0.003, 20),
        chromeMat
    );
    spatulaScoop.position.set(-0.115, 0.001, 0);
    spatulaGroup.add(spatulaScoop);

    // Liquid Z organic droplet on spatula tip
    const spatulaLiquidDrop = new THREE.Mesh(
        new THREE.SphereGeometry(0.0085, 16, 12),
        new THREE.MeshPhysicalMaterial({
            color: 0xe0f2fe,
            transmission: 0.85,
            transparent: true,
            opacity: 0.85,
            roughness: 0.08,
        })
    );
    spatulaLiquidDrop.scale.set(1.1, 0.45, 1.1);
    spatulaLiquidDrop.position.set(-0.115, 0.004, 0);
    spatulaLiquidDrop.visible = false;
    spatulaGroup.add(spatulaLiquidDrop);

    // Black carbon soot deposit layer on spatula tip (appears after burning in Step 2)
    const spatulaSootMat = new THREE.MeshStandardMaterial({
        color: 0x09090b,
        roughness: 0.95,
        transparent: true,
        opacity: 0.0,
    });
    const spatulaSootMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0135, 0.012, 0.0038, 20),
        spatulaSootMat
    );
    spatulaSootMesh.position.set(-0.115, 0.0016, 0);
    spatulaGroup.add(spatulaSootMesh);

    // ============================================================================
    // 4. CENTER STATION: WOODEN 3-SLOT TEST-TUBE RACK (TUBES A, B, C) (X = 0.04)
    // ============================================================================
    const rackX = 0.04;
    const rackZ = 0.0;
    const rackGroup = new THREE.Group();
    rackGroup.position.set(rackX, 0.50, rackZ);
    scene.add(rackGroup);

    // Base board
    const rackBase = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.022, 0.12), woodRackMat);
    rackBase.position.y = 0.011;
    rackBase.castShadow = true;
    rackBase.receiveShadow = true;
    rackGroup.add(rackBase);

    // Side pillars
    [-0.185, 0.185].forEach((px) => {
        const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.19, 0.095), woodRackMat);
        pillar.position.set(px, 0.105, 0);
        pillar.castShadow = true;
        rackGroup.add(pillar);
    });

    // Upper support deck
    const upperDeck = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.018, 0.095), woodRackMat);
    upperDeck.position.y = 0.19;
    upperDeck.castShadow = true;
    rackGroup.add(upperDeck);

    // Construct Test Tubes A, B, and C
    const tubeConfigs = [
        { key: 'A', localX: -0.11, tagColor: '#d97706', label: 'Portion A (Br₂ Test)' },
        { key: 'B', localX: 0.0, tagColor: '#7e22ce', label: 'Portion B (KMnO₄ Test)' },
        { key: 'C', localX: 0.11, tagColor: '#0f5257', label: 'Portion C (Litmus & NaHCO₃)' },
    ];

    const tubesMap = {};

    tubeConfigs.forEach(({ key, localX, tagColor }) => {
        // Dark circular socket ring on upper deck
        const holeRing = new THREE.Mesh(
            new THREE.TorusGeometry(0.023, 0.003, 12, 24),
            new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.8 })
        );
        holeRing.rotation.x = Math.PI / 2;
        holeRing.position.set(localX, 0.2, 0);
        rackGroup.add(holeRing);

        // Individual Test Tube Group (allows swirling animation per tube!)
        const tubeGroup = new THREE.Group();
        const homePos = new THREE.Vector3(rackX + localX, 0.525, rackZ);
        tubeGroup.position.copy(homePos);
        scene.add(tubeGroup);

        // Glass cylinder body (height 0.24, radius 0.021)
        const glassBody = new THREE.Mesh(
            new THREE.CylinderGeometry(0.021, 0.021, 0.23, 28, 1, true),
            borosilicateGlassMat
        );
        glassBody.position.y = 0.125;
        glassBody.renderOrder = 3;
        tubeGroup.add(glassBody);

        // Rounded glass bottom hemisphere
        const glassBottom = new THREE.Mesh(
            new THREE.SphereGeometry(0.021, 24, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
            borosilicateGlassMat
        );
        glassBottom.position.y = 0.01;
        glassBottom.renderOrder = 3;
        tubeGroup.add(glassBottom);

        // Flared top glass lip
        const glassLip = new THREE.Mesh(
            new THREE.TorusGeometry(0.022, 0.0024, 12, 28),
            borosilicateGlassMat
        );
        glassLip.rotation.x = Math.PI / 2;
        glassLip.position.y = 0.24;
        tubeGroup.add(glassLip);

        // Collar Tag Band ("A", "B", "C")
        const tagBand = new THREE.Mesh(
            new THREE.CylinderGeometry(0.0222, 0.0222, 0.024, 24, 1, true),
            new THREE.MeshBasicMaterial({
                map: createTubeNeckTagTexture(key, tagColor),
                side: THREE.DoubleSide,
            })
        );
        tagBand.position.y = 0.21;
        tubeGroup.add(tagBand);

        // Internal Liquid Column + Bottom Hemisphere
        const liquidMat = new THREE.MeshPhysicalMaterial({
            color: 0xf0f7ff,
            transparent: true,
            opacity: 0.36,
            roughness: 0.12,
            metalness: 0.02,
            depthWrite: true,
        });

        const liquidGroup = new THREE.Group();
        liquidGroup.visible = false;
        tubeGroup.add(liquidGroup);

        const maxLiqHeight = 0.14;
        const liqCyl = new THREE.Mesh(
            new THREE.CylinderGeometry(0.0188, 0.0188, maxLiqHeight, 24),
            liquidMat
        );
        liqCyl.position.y = 0.01 + maxLiqHeight / 2;
        liqCyl.renderOrder = 1;
        liquidGroup.add(liqCyl);

        const liqBottom = new THREE.Mesh(
            new THREE.SphereGeometry(0.0188, 20, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
            liquidMat
        );
        liqBottom.position.y = 0.01;
        liqBottom.renderOrder = 1;
        liquidGroup.add(liqBottom);

        // Meniscus ring at top of liquid
        const meniscusRing = new THREE.Mesh(
            new THREE.TorusGeometry(0.018, 0.0015, 10, 24),
            new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.65 })
        );
        meniscusRing.rotation.x = Math.PI / 2;
        meniscusRing.position.y = 0.01 + maxLiqHeight;
        liquidGroup.add(meniscusRing);

        // Effervescence Foam Collar (for Tube C NaHCO3 reaction)
        const foamMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.9,
            transparent: true,
            opacity: 0.0,
        });
        const foamMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.0186, 0.0186, 0.022, 24),
            foamMat
        );
        foamMesh.position.y = 0.09;
        tubeGroup.add(foamMesh);

        tubesMap[key] = {
            group: tubeGroup,
            homePos,
            liquidGroup,
            liquidMat,
            liqCyl,
            meniscusRing,
            maxLiqHeight,
            foamMesh,
            foamMat,
        };
    });

    // ============================================================================
    // 5. FRONT TILE: MOIST BLUE & RED LITMUS PAPER STRIPS (X = 0.04, Z = 0.21)
    // ============================================================================
    const litmusTile = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.012, 0.11),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 })
    );
    litmusTile.position.set(rackX, 0.506, 0.21);
    litmusTile.receiveShadow = true;
    scene.add(litmusTile);

    function createLitmusStrip(initialHex, offsetX) {
        const stripGroup = new THREE.Group();
        const homePos = new THREE.Vector3(rackX + offsetX, 0.515, 0.21);
        stripGroup.position.copy(homePos);
        scene.add(stripGroup);

        // Upper dry half of paper
        const topHalf = new THREE.Mesh(
            new THREE.BoxGeometry(0.018, 0.002, 0.036),
            new THREE.MeshStandardMaterial({ color: initialHex, roughness: 0.85 })
        );
        topHalf.position.z = 0.018;
        stripGroup.add(topHalf);

        // Lower reactive tip half (changes color when dipped in Tube C)
        const tipMat = new THREE.MeshStandardMaterial({ color: initialHex, roughness: 0.7 });
        const tipHalf = new THREE.Mesh(
            new THREE.BoxGeometry(0.018, 0.0022, 0.036),
            tipMat
        );
        tipHalf.position.z = -0.018;
        stripGroup.add(tipHalf);

        return { group: stripGroup, homePos, tipMat, initialHex };
    }

    const blueLitmus = createLitmusStrip(0x3b82f6, -0.045);
    const redLitmus = createLitmusStrip(0xef4444, 0.045);

    // ============================================================================
    // 6. RIGHT & BACK REAGENT STATION: SAMPLE Z + 3 REAGENTS (Br2, KMnO4, NaHCO3)
    // ============================================================================
    function createReagentBottle({
        x,
        z,
        title,
        subtitle,
        accentHex,
        liquidHex,
        hasDropper = true,
        isAmber = true,
    }) {
        const bottleGroup = new THREE.Group();
        const homePos = new THREE.Vector3(x, 0.50, z);
        bottleGroup.position.copy(homePos);
        scene.add(bottleGroup);

        // Glass body
        const bodyMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.042, 0.042, 0.125, 28),
            isAmber ? amberGlassMat : borosilicateGlassMat
        );
        bodyMesh.position.y = 0.0625;
        bodyMesh.castShadow = true;
        bottleGroup.add(bodyMesh);

        // Shoulder + Neck
        const shoulder = new THREE.Mesh(
            new THREE.CylinderGeometry(0.018, 0.042, 0.028, 28),
            isAmber ? amberGlassMat : borosilicateGlassMat
        );
        shoulder.position.y = 0.139;
        bottleGroup.add(shoulder);

        const neck = new THREE.Mesh(
            new THREE.CylinderGeometry(0.018, 0.018, 0.026, 24),
            isAmber ? amberGlassMat : borosilicateGlassMat
        );
        neck.position.y = 0.165;
        bottleGroup.add(neck);

        // Internal reagent liquid
        const reagentLiq = new THREE.Mesh(
            new THREE.CylinderGeometry(0.038, 0.038, 0.088, 24),
            new THREE.MeshStandardMaterial({
                color: liquidHex,
                transparent: true,
                opacity: 0.85,
                roughness: 0.2,
            })
        );
        reagentLiq.position.y = 0.048;
        bottleGroup.add(reagentLiq);

        // Wrap-around printed chemical label
        const labelTex = createBottleLabelTexture(title, subtitle, accentHex);
        const labelMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.0432, 0.0432, 0.065, 28, 1, true, -Math.PI * 0.42, Math.PI * 0.84),
            new THREE.MeshBasicMaterial({ map: labelTex, side: THREE.DoubleSide })
        );
        labelMesh.position.y = 0.065;
        bottleGroup.add(labelMesh);

        // Movable Dropper Pipette assembly
        let dropperGroup = null;
        let dropperHomePos = null;

        if (hasDropper) {
            dropperGroup = new THREE.Group();
            dropperHomePos = new THREE.Vector3(x, 0.67, z);
            dropperGroup.position.copy(dropperHomePos);
            scene.add(dropperGroup);

            // Black ribbed cap
            const cap = new THREE.Mesh(
                new THREE.CylinderGeometry(0.022, 0.022, 0.024, 20),
                new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 })
            );
            dropperGroup.add(cap);

            // Rubber teat bulb
            const bulb = new THREE.Mesh(
                new THREE.CapsuleGeometry(0.013, 0.022, 12, 16),
                new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.45 })
            );
            bulb.position.y = 0.026;
            dropperGroup.add(bulb);

            // Glass pipette stem + internal liquid column
            const stem = new THREE.Mesh(
                new THREE.CylinderGeometry(0.0045, 0.002, 0.13, 16),
                borosilicateGlassMat
            );
            stem.position.y = -0.068;
            dropperGroup.add(stem);

            const stemLiq = new THREE.Mesh(
                new THREE.CylinderGeometry(0.0032, 0.0015, 0.085, 12),
                new THREE.MeshBasicMaterial({ color: liquidHex, transparent: true, opacity: 0.9 })
            );
            stemLiq.position.y = -0.082;
            dropperGroup.add(stemLiq);
        }

        return { bottleGroup, homePos, dropperGroup, dropperHomePos };
    }

    // 1. Sample Z Bottle (Clear organic reagent bottle on left-center back)
    const sampleZBottle = createReagentBottle({
        x: -0.22,
        z: -0.21,
        title: 'LIQUID Z',
        subtitle: 'Unknown Organic',
        accentHex: '#0f5257',
        liquidHex: 0xe0f2fe,
        hasDropper: false,
        isAmber: false,
    });

    // 2. Bromine Water Bottle (Br2(aq))
    const bromineBottle = createReagentBottle({
        x: 0.36,
        z: -0.18,
        title: 'Br₂(aq)',
        subtitle: 'Bromine Water',
        accentHex: '#d97706',
        liquidHex: 0xea580c,
        hasDropper: true,
        isAmber: true,
    });

    // 3. Acidified KMnO4 Bottle (H+/KMnO4)
    const kmno4Bottle = createReagentBottle({
        x: 0.50,
        z: -0.18,
        title: 'H⁺/KMnO₄',
        subtitle: 'Acidified 0.02M',
        accentHex: '#7e22ce',
        liquidHex: 0x6b21a8,
        hasDropper: true,
        isAmber: true,
    });

    // 4. Solid NaHCO3 Wide-Mouth Jar + Micro-Spatula (X = 0.43, Z = 0.08)
    const nahco3JarGroup = new THREE.Group();
    nahco3JarGroup.position.set(0.43, 0.50, 0.08);
    scene.add(nahco3JarGroup);

    const jarGlass = new THREE.Mesh(
        new THREE.CylinderGeometry(0.046, 0.046, 0.105, 28),
        borosilicateGlassMat
    );
    jarGlass.position.y = 0.0525;
    nahco3JarGroup.add(jarGlass);

    // White NaHCO3 crystalline powder mound inside jar
    const powderMound = new THREE.Mesh(
        new THREE.CylinderGeometry(0.042, 0.042, 0.058, 24),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.92 })
    );
    powderMound.position.y = 0.032;
    nahco3JarGroup.add(powderMound);

    const jarLabel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.047, 0.047, 0.055, 28, 1, true, -Math.PI * 0.42, Math.PI * 0.84),
        new THREE.MeshBasicMaterial({
            map: createBottleLabelTexture('NaHCO₃(s)', 'Sodium Bicarb', '#0284c7'),
            side: THREE.DoubleSide,
        })
    );
    jarLabel.position.y = 0.055;
    nahco3JarGroup.add(jarLabel);

    // Dedicated Powder Transfer Spatula resting in/on the NaHCO3 jar
    const powderSpatulaGroup = new THREE.Group();
    const powderSpatulaHomePos = new THREE.Vector3(0.43, 0.59, 0.08);
    powderSpatulaGroup.position.copy(powderSpatulaHomePos);
    powderSpatulaGroup.rotation.z = -0.35;
    scene.add(powderSpatulaGroup);

    const pSpatulaBar = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.0022, 0.011),
        chromeMat
    );
    powderSpatulaGroup.add(pSpatulaBar);

    const powderPileOnTip = new THREE.Mesh(
        new THREE.SphereGeometry(0.008, 14, 10),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95 })
    );
    powderPileOnTip.scale.set(1.2, 0.6, 1.0);
    powderPileOnTip.position.set(-0.052, 0.004, 0);
    powderSpatulaGroup.add(powderPileOnTip);

    // ============================================================================
    // 7. 3D FLOATING APPARATUS LABELS
    // ============================================================================
  const labelAnchors = [
    {
      title: 'Bunsen Burner & Spatula',
      sub: 'Ignition / Sootiness Test',
      pos: new THREE.Vector3(burnerX, 0.85, burnerZ),
    },
    {
      title: 'Liquid Z (Unknown)',
      sub: 'Organic Sample',
      pos: new THREE.Vector3(-0.22, 0.74, -0.21),
    },
    {
      title: 'Portion A',
      sub: '+ Bromine Water',
      pos: new THREE.Vector3(rackX - 0.11, 0.83, rackZ),
    },
    {
      title: 'Portion B',
      sub: '+ Acidified KMnO₄',
      pos: new THREE.Vector3(rackX, 0.83, rackZ),
    },
    {
      title: 'Portion C',
      sub: '+ Litmus & NaHCO₃',
      pos: new THREE.Vector3(rackX + 0.11, 0.83, rackZ),
    },
    {
      title: 'Moist Litmus Papers',
      sub: 'Blue & Red Indicator',
      pos: new THREE.Vector3(rackX, 0.58, 0.21),
    },
    {
      title: 'Br₂(aq) & H⁺/KMnO₄',
      sub: 'Unsaturation Reagents',
      pos: new THREE.Vector3(0.43, 0.78, -0.18),
    },
    {
      title: 'Solid NaHCO₃(s)',
      sub: 'Carboxylic Acid Test',
      pos: new THREE.Vector3(0.43, 0.69, 0.08),
    },
  ];

  const cameraPresets = {
    bench: {
      pos: new THREE.Vector3(0.0, 1.35, 2.05),
      target: new THREE.Vector3(0.0, 0.72, 0.0),
    },
    burner: {
      pos: new THREE.Vector3(-0.42, 1.15, 0.82),
      target: new THREE.Vector3(-0.44, 0.68, 0.04),
    },
    rack: {
      pos: new THREE.Vector3(0.04, 1.12, 0.88),
      target: new THREE.Vector3(0.04, 0.66, 0.02),
    },
    tubeA: {
      pos: new THREE.Vector3(-0.08, 1.02, 0.62),
      target: new THREE.Vector3(rackX - 0.11, 0.65, 0.0),
    },
    tubeB: {
      pos: new THREE.Vector3(0.04, 1.02, 0.62),
      target: new THREE.Vector3(rackX, 0.65, 0.0),
    },
    tubeC: {
      pos: new THREE.Vector3(0.16, 1.04, 0.66),
      target: new THREE.Vector3(rackX + 0.11, 0.64, 0.06),
    },
  };

    let targetCamPos = null;
    let targetLookAt = null;

    function setCameraPreset(presetName) {
        const preset = cameraPresets[presetName] || cameraPresets.bench;
        targetCamPos = preset.pos.clone();
        targetLookAt = preset.target.clone();
    }

    function updateCamera() {
        if (targetCamPos && targetLookAt) {
            camera.position.lerp(targetCamPos, 0.08);
            controls.target.lerp(targetLookAt, 0.08);
            if (camera.position.distanceTo(targetCamPos) < 0.015) {
                targetCamPos = null;
                targetLookAt = null;
            }
        }
        controls.update();
    }

    function syncWithState(snapshot) {
        if (!snapshot) return;

        // 1. Burner Flame Appearance
        flameGroup.visible = !!snapshot.burnerLit;
        if (snapshot.burnerLit) {
            if (snapshot.flameType === 'sooty') {
                outerFlameMat.color.setHex(0xf59e0b); // Luminous bright yellow-orange sooty flame
                outerFlameMat.opacity = 0.88;
                innerFlameMat.color.setHex(0xfde047);
                flameLight.color.setHex(0xfbbf24);
                flameLight.intensity = 2.2;
            } else {
                outerFlameMat.color.setHex(0x60a5fa); // Clean non-luminous blue Bunsen flame
                outerFlameMat.opacity = 0.48;
                innerFlameMat.color.setHex(0x38bdf8);
                flameLight.color.setHex(0x93c5fd);
                flameLight.intensity = 1.1;
            }
        } else {
            flameLight.intensity = 0;
        }

        // 2. Spatula Sample & Soot Deposit
        spatulaLiquidDrop.visible = !!snapshot.spatulaHasSample && snapshot.spatulaSootLevel < 0.5;
        spatulaSootMat.opacity = (snapshot.spatulaSootLevel || 0) * 0.92;

        // 3. Litmus Paper Strip Colors
        if (snapshot.blueLitmusState === 'acidic') {
            blueLitmus.tipMat.color.setHex(0xef4444); // Blue litmus turns Red!
        } else {
            blueLitmus.tipMat.color.setHex(blueLitmus.initialHex);
        }

        if (snapshot.redLitmusState === 'acidic') {
            redLitmus.tipMat.color.setHex(0xdc2626); // Red stays wet Red
        } else {
            redLitmus.tipMat.color.setHex(redLitmus.initialHex);
        }

        // 4. Test Tubes A, B, C Liquid Levels, Colors & Foam
        ['A', 'B', 'C'].forEach((key) => {
            const tState = snapshot.tubes?.[key];
            const tMesh = tubesMap[key];
            if (!tState || !tMesh) return;

            if (tState.volume <= 0.01) {
                tMesh.liquidGroup.visible = false;
                tMesh.foamMat.opacity = 0;
            } else {
                tMesh.liquidGroup.visible = true;
                const fillRatio = Math.min(1.0, Math.max(0.15, tState.volume / 5.0));
                const h = tMesh.maxLiqHeight * fillRatio;

                tMesh.liqCyl.scale.set(1, fillRatio, 1);
                tMesh.liqCyl.position.y = 0.01 + h / 2;
                tMesh.meniscusRing.position.y = 0.01 + h;

                tMesh.liquidMat.color.setHex(tState.color);
                tMesh.liquidMat.opacity = tState.opacity;

                if (key === 'C' && tState.foamLevel > 0) {
                    tMesh.foamMat.opacity = Math.min(0.88, tState.foamLevel * 0.85);
                    tMesh.foamMesh.position.y = 0.01 + h + 0.008;
                } else {
                    tMesh.foamMat.opacity = 0;
                }
            }
        });
    }

    const handleResize = () => {
        if (!container) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    };
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
        labelAnchors,
        tubesMap,
        burnerGroup,
        flameGroup,
        innerFlameMesh,
        outerFlameMesh,
        spatulaGroup,
        spatulaHomePos,
        sampleZBottle,
        bromineBottle,
        kmno4Bottle,
        powderSpatulaGroup,
        powderSpatulaHomePos,
        blueLitmus,
        redLitmus,
        setCameraPreset,
        updateCamera,
        syncWithState,
        cleanup,
    };
}