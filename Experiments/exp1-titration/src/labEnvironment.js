import * as THREE from 'three';

function createPeriodicChartTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 512, 320);
    ctx.strokeStyle = '#0f766e';
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, 504, 312);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 20px "IBM Plex Sans", sans-serif';
    ctx.fillText('KCSE CHEMISTRY — PERIODIC TABLE OF ELEMENTS', 28, 38);

    const cols = 18;
    const rows = 7;
    const cellW = 24;
    const cellH = 26;
    const startX = 36;
    const startY = 62;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (r === 0 && c > 0 && c < 17) continue;
            if ((r === 1 || r === 2) && c > 1 && c < 12) continue;

            if (c < 2) ctx.fillStyle = '#bae6fd';
            else if (c < 12) ctx.fillStyle = '#fef08a';
            else if (c === 17) ctx.fillStyle = '#ddd6fe';
            else ctx.fillStyle = '#bbf7d0';

            const x = startX + c * (cellW + 2);
            const y = startY + r * (cellH + 2);
            ctx.fillRect(x, y, cellW, cellH);
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, cellW, cellH);
        }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 4;
    return tex;
}

function createChalkboardTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1e3a2f';
    ctx.fillRect(0, 0, 512, 256);
    ctx.strokeStyle = '#b48456';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, 502, 246);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 20px "IBM Plex Mono", monospace';
    ctx.fillText('EXP 1: VOLUMETRIC ANALYSIS (TITRATION)', 28, 46);

    ctx.font = '17px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#bae6fd';
    ctx.fillText('Equation: NaOH(aq) + HCl(aq) → NaCl(aq) + H₂O(l)', 28, 92);

    ctx.fillStyle = '#fef08a';
    ctx.fillText('Mole Ratio = 1 : 1   |   Pipette = 25.0 cm³', 28, 136);

    ctx.fillStyle = '#f9a8d4';
    ctx.fillText('Indicator: Phenolphthalein (Pink → Colorless)', 28, 180);

    return new THREE.CanvasTexture(canvas);
}

function createFloorTileTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#e5e2dc';
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#dad6ce';
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillRect(128, 128, 128, 128);

    ctx.strokeStyle = '#c8c3b8';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, 256, 256);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(10, 10);
    return tex;
}

export function buildLabRoomAndBench(scene) {
    const envGroup = new THREE.Group();

    // Room dimensions: Width (X) = 7.6m (-3.8 to +3.8), Depth (Z) = 6.8m (-2.2 to +4.6), Height (Y) = -0.35 to 3.65 (4.0m tall)
    const roomW = 7.6;
    const roomD = 6.8;
    const roomH = 4.0;
    const floorY = -0.35;
    const ceilY = 3.65;
    const centerZ = 1.2;

    scene.background = new THREE.Color(0xeef2f6);

    // 1. Terrazzo Lab Floor (Y = -0.35)
    const floorMat = new THREE.MeshStandardMaterial({
        map: createFloorTileTexture(),
        roughness: 0.6,
        metalness: 0.05,
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomD), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, floorY, centerZ);
    floor.receiveShadow = true;
    envGroup.add(floor);

    // 2. Full Ceiling with 4 Recessed Fluorescent Light Fixtures (Y = 3.65)
    const ceilingMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.9,
    });
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomD), ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, ceilY, centerZ);
    envGroup.add(ceiling);

    const lightPanelGeo = new THREE.BoxGeometry(1.3, 0.04, 0.45);
    const lightFrameMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4 });
    const lightGlowMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const panelCoords = [
        [-1.4, -0.3],
        [1.4, -0.3],
        [-1.4, 2.2],
        [1.4, 2.2],
    ];
    panelCoords.forEach(([px, pz]) => {
        const frame = new THREE.Mesh(lightPanelGeo, lightFrameMat);
        frame.position.set(px, ceilY - 0.02, pz);
        envGroup.add(frame);

        const diffuser = new THREE.Mesh(new THREE.PlaneGeometry(1.22, 0.38), lightGlowMat);
        diffuser.rotation.x = Math.PI / 2;
        diffuser.position.set(px, ceilY - 0.042, pz);
        envGroup.add(diffuser);
    });

    // 3. All 4 Laboratory Walls with Sage-Green Wainscoting & Dark Trim
    const upperWallMat = new THREE.MeshStandardMaterial({
        color: 0xf5f4ef,
        roughness: 0.85,
    });
    const lowerDadoMat = new THREE.MeshStandardMaterial({
        color: 0xcbd5c0,
        roughness: 0.65,
    });
    const trimMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.5,
    });

    function buildWallSegment(width, pos, rotY) {
        const wallGroup = new THREE.Group();
        wallGroup.position.copy(pos);
        wallGroup.rotation.y = rotY;

        const upper = new THREE.Mesh(new THREE.PlaneGeometry(width, roomH), upperWallMat);
        upper.position.set(0, floorY + roomH / 2, 0);
        upper.receiveShadow = true;
        wallGroup.add(upper);

        const lower = new THREE.Mesh(new THREE.PlaneGeometry(width, 1.35), lowerDadoMat);
        lower.position.set(0, floorY + 0.675, 0.01);
        lower.receiveShadow = true;
        wallGroup.add(lower);

        const rail = new THREE.Mesh(new THREE.BoxGeometry(width, 0.045, 0.03), trimMat);
        rail.position.set(0, floorY + 1.35, 0.015);
        wallGroup.add(rail);

        envGroup.add(wallGroup);
    }

    // Wall 1: Back Wall (Z = -2.2)
    buildWallSegment(roomW, new THREE.Vector3(0, 0, -2.2), 0);

    // Wall 2: Front Wall behind Camera (Z = +4.6)
    buildWallSegment(roomW, new THREE.Vector3(0, 0, 4.6), Math.PI);

    // Wall 3: Left Wall (X = -3.8)
    buildWallSegment(roomD, new THREE.Vector3(-3.8, 0, centerZ), Math.PI / 2);

    // Wall 4: Right Wall (X = +3.8)
    buildWallSegment(roomD, new THREE.Vector3(3.8, 0, centerZ), -Math.PI / 2);

    // 4. Wall Details: Back Wall (Periodic Table + Reagent Shelf)
    const poster = new THREE.Mesh(
        new THREE.PlaneGeometry(1.55, 0.96),
        new THREE.MeshStandardMaterial({ map: createPeriodicChartTexture(), roughness: 0.4 })
    );
    poster.position.set(1.45, 1.9, -2.17);
    envGroup.add(poster);

    const wallShelf = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.04, 0.24),
        new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.6 })
    );
    wallShelf.position.set(-1.4, 1.6, -2.06);
    wallShelf.castShadow = true;
    envGroup.add(wallShelf);

    const bottleColors = [0x0284c7, 0xd97706, 0x059669, 0x7c3aed];
    bottleColors.forEach((col, idx) => {
        const propBottle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.055, 0.055, 0.16, 16),
            new THREE.MeshStandardMaterial({ color: col, roughness: 0.25, transparent: true, opacity: 0.85 })
        );
        propBottle.position.set(-1.85 + idx * 0.28, 1.7, -2.06);
        envGroup.add(propBottle);
    });

    // 5. Left Wall Details: Two Framed Daylight Lab Windows
    [-0.2, 2.0].forEach((wz) => {
        const winFrame = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.4, 1.5), trimMat);
        winFrame.position.set(-3.78, 1.95, wz);
        envGroup.add(winFrame);

        const winGlass = new THREE.Mesh(
            new THREE.PlaneGeometry(1.38, 1.28),
            new THREE.MeshBasicMaterial({ color: 0xe0f2fe })
        );
        winGlass.rotation.y = Math.PI / 2;
        winGlass.position.set(-3.75, 1.95, wz);
        envGroup.add(winGlass);
    });

    // 6. Right Wall Details: Chemistry Chalkboard with Reaction Equation
    const chalkboard = new THREE.Mesh(
        new THREE.PlaneGeometry(2.4, 1.2),
        new THREE.MeshStandardMaterial({ map: createChalkboardTexture(), roughness: 0.5 })
    );
    chalkboard.rotation.y = -Math.PI / 2;
    chalkboard.position.set(3.77, 1.85, 0.6);
    envGroup.add(chalkboard);

    // 7. Front Wall Details: Wooden Lab Entrance Door (seen when orbiting 180°)
    const door = new THREE.Mesh(
        new THREE.BoxGeometry(1.05, 2.15, 0.04),
        new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.6 })
    );
    door.position.set(-2.1, floorY + 1.075, 4.57);
    envGroup.add(door);

    // 8. SOLID 3D LABORATORY WORKBENCH TABLE (Top Surface at exact Y = 0.50)
    const tableGroup = new THREE.Group();

    const topSlabMat = new THREE.MeshStandardMaterial({
        color: 0xd6d3cd,
        roughness: 0.35,
        metalness: 0.05,
    });
    const topSlab = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.06, 1.35), topSlabMat);
    topSlab.position.set(0, 0.47, 0);
    topSlab.receiveShadow = true;
    topSlab.castShadow = true;
    tableGroup.add(topSlab);

    const edgeTrim = new THREE.Mesh(
        new THREE.BoxGeometry(2.71, 0.062, 1.36),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 })
    );
    edgeTrim.position.set(0, 0.468, 0);
    tableGroup.add(edgeTrim);

    const oakWoodMat = new THREE.MeshStandardMaterial({
        color: 0xb48456,
        roughness: 0.55,
    });
    const cabinetBody = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.48, 1.12), oakWoodMat);
    cabinetBody.position.set(0, 0.2, 0);
    cabinetBody.castShadow = true;
    cabinetBody.receiveShadow = true;
    tableGroup.add(cabinetBody);

    const legMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.4,
        metalness: 0.7,
    });
    const legPositions = [
        [-1.22, -0.09, 0.55],
        [1.22, -0.09, 0.55],
        [-1.22, -0.09, -0.55],
        [1.22, -0.09, -0.55],
    ];
    legPositions.forEach(([lx, ly, lz]) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.52, 0.065), legMat);
        leg.position.set(lx, ly, lz);
        leg.castShadow = true;
        tableGroup.add(leg);
    });

    // Built-in Lab Sink Basin & Chrome Tap
    const sinkBasin = new THREE.Mesh(
        new THREE.BoxGeometry(0.38, 0.02, 0.45),
        new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.3, metalness: 0.6 })
    );
    sinkBasin.position.set(1.05, 0.495, -0.15);
    tableGroup.add(sinkBasin);

    const tapStand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.015, 0.22, 16),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.15 })
    );
    tapStand.position.set(1.05, 0.61, -0.38);
    tableGroup.add(tapStand);

    const tapSpout = new THREE.Mesh(
        new THREE.TorusGeometry(0.06, 0.01, 12, 24, Math.PI),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.15 })
    );
    tapSpout.rotation.y = -Math.PI / 2;
    tapSpout.position.set(1.05, 0.72, -0.32);
    tableGroup.add(tapSpout);

    envGroup.add(tableGroup);
    scene.add(envGroup);

    return envGroup;
}