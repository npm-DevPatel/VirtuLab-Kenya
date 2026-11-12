import * as THREE from 'three';

export class ExperimentFx {
    constructor(labScene) {
        this.labScene = labScene;
        this.scene = labScene.scene;
        this.drops = [];
        this.particles = [];
        this.swirlStates = {};
        this.activeAnimations = [];
    }

    // Spawn falling liquid droplet or solid powder grain
    spawnDrop(x, y, z, colorHex = 0xe0f2fe, targetY = 0.62) {
        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.0065, 10, 10),
            new THREE.MeshBasicMaterial({ color: colorHex })
        );
        mesh.position.set(x, y, z);
        mesh.scale.set(0.85, 1.35, 0.85);
        this.scene.add(mesh);

        this.drops.push({
            mesh,
            vy: -0.008,
            targetY,
        });
    }

    // Spawn tiny rising/swirling micro-precipitate cloud particles inside a test tube
    spawnPrecipitateBurst(tubeNum, colorHex = 0xffffff, count = 22) {
        const tObj = this.labScene.tubeObjects?.[tubeNum];
        if (!tObj) return;

        const basePos = tObj.homePos;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * 0.014;
            const mesh = new THREE.Mesh(
                new THREE.SphereGeometry(0.0032, 8, 8),
                new THREE.MeshBasicMaterial({
                    color: colorHex,
                    transparent: true,
                    opacity: 0.9,
                })
            );
            mesh.position.set(
                basePos.x + Math.cos(angle) * r,
                basePos.y + 0.05 + Math.random() * 0.06,
                basePos.z + Math.sin(angle) * r
            );
            this.scene.add(mesh);

            this.particles.push({
                mesh,
                vx: (Math.random() - 0.5) * 0.0006,
                vy: -0.0005 - Math.random() * 0.0006,
                vz: (Math.random() - 0.5) * 0.0006,
                life: 48 + Math.floor(Math.random() * 20),
            });
        }
    }

    // Trigger a physical wrist-swirl animation on a specific test tube
    swirlTube(tubeNum) {
        this.swirlStates[tubeNum] = { age: 0, maxAge: 42 };
    }

    // STEP 1 CHOREOGRAPHY: Spatula transfers Solid M & Wash bottle fills all 4 tubes
    playPreparePortions(onComplete) {
        const spatula = this.labScene.spatulaGroup;
        const powder = this.labScene.spatulaPowder;
        const washBottle = this.labScene.washBottleGroup;
        const tubes = this.labScene.tubeObjects;

        if (!spatula || !washBottle || !tubes) {
            if (onComplete) onComplete();
            return;
        }

        const spatulaStart = spatula.position.clone();
        const washStart = washBottle.position.clone();
        let frame = 0;
        const totalFrames = 125;

        const anim = {
            update: () => {
                frame++;
                const p = frame / totalFrames;

                // Phase 1 (0.0 -> 0.45): Spatula scoops Solid M & drops crystals across tubes
                if (p <= 0.45) {
                    const sp = p / 0.45;
                    powder.visible = sp < 0.85;
                    const targetX = -0.24 + sp * 0.36;
                    spatula.position.set(targetX, 0.88 + Math.sin(sp * Math.PI) * 0.06, 0.08);
                    spatula.rotation.z = -0.25 * Math.sin(sp * Math.PI);

                    if (frame % 7 === 0) {
                        this.spawnDrop(targetX, 0.84, 0.08, 0xffffff, 0.58);
                    }
                } else {
                    // Return spatula home
                    powder.visible = false;
                    spatula.position.lerp(spatulaStart, 0.18);
                    spatula.rotation.z *= 0.8;

                    // Phase 2 (0.45 -> 0.95): Wash bottle flies over Tubes 1..4 & dispenses water
                    const wp = (p - 0.45) / 0.5;
                    const tubeIdx = Math.min(4, Math.max(1, Math.ceil(wp * 4)));
                    const tPos = tubes[tubeIdx].homePos;

                    washBottle.position.lerp(
                        new THREE.Vector3(tPos.x - 0.05, 0.82, tPos.z),
                        0.22
                    );
                    washBottle.rotation.z = -0.35;

                    if (frame % 3 === 0) {
                        this.spawnDrop(tPos.x, 0.83, tPos.z, 0xbae6fd, 0.58);
                    }

                    // Progressive filling preview
                    const tObj = tubes[tubeIdx];
                    tObj.liquidMesh.visible = true;
                    tObj.meniscus.visible = true;
                    const fillScale = Math.min(0.42, ((wp * 4) % 1) * 0.42 + 0.1);
                    tObj.liquidMesh.scale.set(1, fillScale, 1);
                    const h = tObj.maxLiquidH * fillScale;
                    tObj.liquidMesh.position.y = 0.01 + h / 2;
                    tObj.meniscus.position.y = 0.01 + h;
                }

                if (frame >= totalFrames) {
                    spatula.position.copy(spatulaStart);
                    spatula.rotation.set(0, 0, 0);
                    washBottle.position.copy(washStart);
                    washBottle.rotation.set(0, 0, 0);
                    for (let i = 1; i <= 4; i++) this.swirlTube(i);
                    if (onComplete) onComplete();
                    return true;
                }
                return false;
            },
        };

        this.activeAnimations.push(anim);
    }

    // STEPS 2-5 CHOREOGRAPHY: Lift specific reagent dropper -> move over target tube -> squeeze drops -> swirl
    playReagentDropper(reagentKey, tubeNum, dropCount = 3, onComplete) {
        const dropperEntry = this.labScene.reagentDropperGroups?.[reagentKey];
        const targetTube = this.labScene.tubeObjects?.[tubeNum];

        if (!dropperEntry || !targetTube) {
            if (onComplete) onComplete();
            return;
        }

        const dGroup = dropperEntry.group;
        const bulb = dropperEntry.bulb;
        const homePos = dropperEntry.homePos.clone();
        const tubePos = targetTube.homePos;

        let frame = 0;
        const totalFrames = 86;
        let dropsSpawned = 0;

        const anim = {
            update: () => {
                frame++;
                const p = frame / totalFrames;

                if (p < 0.3) {
                    // Lift up & fly to active test tube
                    const t = p / 0.3;
                    const arcY = Math.sin(t * Math.PI) * 0.14;
                    dGroup.position.x = THREE.MathUtils.lerp(homePos.x, tubePos.x, t);
                    dGroup.position.y = THREE.MathUtils.lerp(homePos.y, 0.89, t) + arcY;
                    dGroup.position.z = THREE.MathUtils.lerp(homePos.z, tubePos.z, t);
                } else if (p < 0.75) {
                    // Hover over tube mouth, squeeze rubber bulb & release droplets
                    dGroup.position.set(tubePos.x, 0.89, tubePos.z);
                    const squeezePulse = Math.sin(((p - 0.3) / 0.45) * Math.PI * dropCount);
                    bulb.scale.set(1 - squeezePulse * 0.18, 1, 1 - squeezePulse * 0.18);

                    const expectedDrops = Math.floor(((p - 0.3) / 0.45) * dropCount) + 1;
                    if (dropsSpawned < expectedDrops && dropsSpawned < dropCount) {
                        dropsSpawned++;
                        this.spawnDrop(tubePos.x, 0.82, tubePos.z, 0xe0f2fe, 0.61);
                        this.spawnPrecipitateBurst(tubeNum, 0xffffff, 12);
                    }
                } else {
                    // Return dropper smoothly to its bottle
                    const t = (p - 0.75) / 0.25;
                    bulb.scale.set(1, 1, 1);
                    const arcY = Math.sin(t * Math.PI) * 0.1;
                    dGroup.position.x = THREE.MathUtils.lerp(tubePos.x, homePos.x, t);
                    dGroup.position.y = THREE.MathUtils.lerp(0.89, homePos.y, t) + arcY;
                    dGroup.position.z = THREE.MathUtils.lerp(tubePos.z, homePos.z, t);
                }

                if (frame === Math.floor(totalFrames * 0.65)) {
                    this.swirlTube(tubeNum);
                }

                if (frame >= totalFrames) {
                    dGroup.position.copy(homePos);
                    bulb.scale.set(1, 1, 1);
                    if (onComplete) onComplete();
                    return true;
                }
                return false;
            },
        };

        this.activeAnimations.push(anim);
    }

    playCompletionSparkle() {
        for (let i = 1; i <= 4; i++) {
            this.swirlTube(i);
            this.spawnPrecipitateBurst(i, 0x34d399, 14);
        }
    }

    update() {
        // 1. Update choreographed animations
        for (let i = this.activeAnimations.length - 1; i >= 0; i--) {
            const done = this.activeAnimations[i].update();
            if (done) this.activeAnimations.splice(i, 1);
        }

        // 2. Update falling droplets
        for (let i = this.drops.length - 1; i >= 0; i--) {
            const d = this.drops[i];
            d.vy -= 0.0012;
            d.mesh.position.y += d.vy;
            if (d.mesh.position.y <= d.targetY) {
                this.scene.remove(d.mesh);
                d.mesh.geometry.dispose();
                d.mesh.material.dispose();
                this.drops.splice(i, 1);
            }
        }

        // 3. Update micro-precipitate cloud particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const pt = this.particles[i];
            pt.mesh.position.x += pt.vx;
            pt.mesh.position.y += pt.vy;
            pt.mesh.position.z += pt.vz;
            pt.life--;
            pt.mesh.material.opacity = Math.max(0, pt.life / 60);
            if (pt.life <= 0) {
                this.scene.remove(pt.mesh);
                pt.mesh.geometry.dispose();
                pt.mesh.material.dispose();
                this.particles.splice(i, 1);
            }
        }

        // 4. Update Test Tube Agitation / Swirling
        const tubes = this.labScene.tubeObjects;
        if (tubes) {
            Object.keys(this.swirlStates).forEach((key) => {
                const st = this.swirlStates[key];
                const tObj = tubes[key];
                if (!st || !tObj) return;

                st.age++;
                const progress = st.age / st.maxAge;
                const decay = 1 - progress;
                const angle = st.age * 0.55;

                tObj.group.rotation.z = Math.sin(angle) * 0.095 * decay;
                tObj.group.rotation.x = Math.cos(angle) * 0.065 * decay;
                tObj.group.position.y = tObj.homePos.y + Math.sin(progress * Math.PI) * 0.025;

                if (st.age >= st.maxAge) {
                    tObj.group.rotation.set(0, 0, 0);
                    tObj.group.position.copy(tObj.homePos);
                    delete this.swirlStates[key];
                }
            });
        }
    }
}

export default ExperimentFx;