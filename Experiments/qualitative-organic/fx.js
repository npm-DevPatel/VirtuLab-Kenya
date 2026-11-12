import * as THREE from 'three';

export class ExperimentFx {
    constructor(labScene) {
        this.labScene = labScene;
        this.scene = labScene.scene;
        this.clock = new THREE.Clock();

        this.droplets = [];
        this.sootParticles = [];
        this.co2Bubbles = [];
        this.activeSwirls = [];
        this.activeTweens = [];
        this.sootEmitActive = false;
        this.co2EmitIntensity = 0;

        // Pouring stream beam for Sample Z division
        this.pourStreamMat = new THREE.MeshBasicMaterial({
            color: 0xe0f2fe,
            transparent: true,
            opacity: 0.78,
        });
        this.pourStreamMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.0028, 0.0022, 0.14, 12),
            this.pourStreamMat
        );
        this.pourStreamMesh.visible = false;
        this.scene.add(this.pourStreamMesh);
    }

    // Smooth Ease-In-Out Cubic helper
    easeInOut(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    tween(durationMs, onUpdate, onDone) {
        this.activeTweens.push({
            startTime: performance.now(),
            duration: durationMs,
            onUpdate,
            onDone,
        });
    }

    spawnDroplet(worldPos, hexColor, targetY = 0.16) {
        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.0055, 12, 10),
            new THREE.MeshPhysicalMaterial({
                color: hexColor,
                roughness: 0.1,
                transmission: 0.4,
                transparent: true,
                opacity: 0.92,
            })
        );
        mesh.scale.set(0.85, 1.35, 0.85);
        mesh.position.copy(worldPos);
        this.scene.add(mesh);

        this.droplets.push({
            mesh,
            vy: -0.0035,
            targetY,
        });
    }

    spawnSootParticle() {
        const burnerPos = this.labScene.burnerGroup.position;
        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.0045 + Math.random() * 0.004, 8, 8),
            new THREE.MeshBasicMaterial({
                color: 0x18181b,
                transparent: true,
                opacity: 0.82,
            })
        );

        mesh.position.set(
            burnerPos.x + (Math.random() - 0.5) * 0.022,
            burnerPos.y + 0.34 + Math.random() * 0.02,
            burnerPos.z + (Math.random() - 0.5) * 0.022
        );
        this.scene.add(mesh);

        this.sootParticles.push({
            mesh,
            vx: (Math.random() - 0.5) * 0.0008,
            vy: 0.0025 + Math.random() * 0.0018,
            vz: (Math.random() - 0.5) * 0.0008,
            life: 1.0,
        });
    }

    spawnCO2Bubble() {
        const tubeC = this.labScene.tubesMap?.C;
        if (!tubeC) return;

        const basePos = tubeC.group.position;
        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.0022 + Math.random() * 0.002, 8, 8),
            new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.85,
            })
        );

        mesh.position.set(
            basePos.x + (Math.random() - 0.5) * 0.022,
            basePos.y + 0.018 + Math.random() * 0.02,
            basePos.z + (Math.random() - 0.5) * 0.022
        );
        this.scene.add(mesh);

        this.co2Bubbles.push({
            mesh,
            vy: 0.0016 + Math.random() * 0.0015,
            maxY: basePos.y + 0.105,
        });
    }

    triggerTubeSwirl(tubeKey, durationMs = 950, onComplete) {
        const tube = this.labScene.tubesMap?.[tubeKey];
        if (!tube) {
            onComplete?.();
            return;
        }

        this.activeSwirls.push({
            tube,
            startTime: performance.now(),
            duration: durationMs,
            onComplete,
        });
    }

    // ============================================================================
    // STEP 1 ANIMATION: POUR LIQUID Z INTO TUBES A, B, C & WET SPATULA TIP
    // ============================================================================
    playDivideSampleAnimation(onPortionFilled, onComplete) {
        const bottle = this.labScene.sampleZBottle.bottleGroup;
        const home = this.labScene.sampleZBottle.homePos;
        const targets = [
            { key: 'A', x: -0.07 - 0.06, y: 0.34, z: 0.0 },
            { key: 'B', x: 0.04 - 0.06, y: 0.34, z: 0.0 },
            { key: 'C', x: 0.15 - 0.06, y: 0.34, z: 0.0 },
        ];

        let idx = 0;
        const pourNextTube = () => {
            if (idx >= targets.length) {
                // Wet the spatula tip and return bottle home
                onPortionFilled?.('spatula');
                const startPos = bottle.position.clone();
                const startRot = bottle.rotation.z;
                this.tween(
                    480,
                    (p) => {
                        const e = this.easeInOut(p);
                        bottle.position.lerpVectors(startPos, home, e);
                        bottle.rotation.z = THREE.MathUtils.lerp(startRot, 0, e);
                    },
                    () => onComplete?.()
                );
                return;
            }

            const tgt = targets[idx];
            const startPos = bottle.position.clone();
            const destPos = new THREE.Vector3(tgt.x, tgt.y, tgt.z);

            // Move to tube and tilt
            this.tween(
                420,
                (p) => {
                    const e = this.easeInOut(p);
                    bottle.position.lerpVectors(startPos, destPos, e);
                    bottle.rotation.z = THREE.MathUtils.lerp(bottle.rotation.z, -1.05, e);
                },
                () => {
                    // Show pour stream briefly
                    const tubeWorldX = this.labScene.tubesMap[tgt.key].homePos.x;
                    this.pourStreamMesh.position.set(tubeWorldX, 0.28, 0.0);
                    this.pourStreamMesh.visible = true;
                    onPortionFilled?.(tgt.key);

                    setTimeout(() => {
                        this.pourStreamMesh.visible = false;
                        idx++;
                        pourNextTube();
                    }, 320);
                }
            );
        };

        pourNextTube();
    }

    // ============================================================================
    // STEP 2 ANIMATION: MOVE METALLIC SPATULA INTO BUNSEN FLAME -> SOOTY IGNITION
    // ============================================================================
    playSpatulaIgnitionAnimation(onEnterFlame, onComplete) {
        const spatula = this.labScene.spatulaGroup;
        const home = this.labScene.spatulaHomePos;
        const burnerPos = this.labScene.burnerGroup.position;

        // Position where spatula scoop tip (-0.115 local X) sits directly in flame
        const flameTarget = new THREE.Vector3(
            burnerPos.x + 0.115,
            burnerPos.y + 0.305,
            burnerPos.z
        );

        // 1. Lift and glide spatula into the Bunsen flame
        this.tween(
            650,
            (p) => {
                const e = this.easeInOut(p);
                spatula.position.lerpVectors(home, flameTarget, e);
            },
            () => {
                // 2. Ignite Liquid Z with luminous yellow smoky flame + rising soot
                onEnterFlame?.();
                this.sootEmitActive = true;

                setTimeout(() => {
                    this.sootEmitActive = false;

                    // 3. Return soot-blackened spatula back to its rest
                    this.tween(
                        620,
                        (p) => {
                            const e = this.easeInOut(p);
                            spatula.position.lerpVectors(flameTarget, home, e);
                        },
                        () => onComplete?.()
                    );
                }, 1650);
            }
        );
    }

    // ============================================================================
    // STEP 3 & 4 HELPER: DROPPER TRANSFER + 3 DROPS + TUBE SWIRL
    // ============================================================================
    playReagentDropperSequence(bottleObj, tubeKey, dropletHex, onDropImpact, onComplete) {
        const dropper = bottleObj.dropperGroup;
        const home = bottleObj.dropperHomePos;
        const tubePos = this.labScene.tubesMap[tubeKey].homePos;
        const overTubePos = new THREE.Vector3(tubePos.x, 0.42, tubePos.z);

        // 1. Lift dropper out of bottle and travel over target test tube
        this.tween(
            580,
            (p) => {
                const e = this.easeInOut(p);
                dropper.position.lerpVectors(home, overTubePos, e);
                dropper.position.y += Math.sin(e * Math.PI) * 0.05;
            },
            () => {
                // 2. Dispense 3 drops sequentially
                let dropsDone = 0;
                const dropTimer = setInterval(() => {
                    dropsDone++;
                    this.spawnDroplet(
                        new THREE.Vector3(tubePos.x, 0.29, tubePos.z),
                        dropletHex,
                        0.14
                    );
                    onDropImpact?.(dropsDone);

                    if (dropsDone >= 3) {
                        clearInterval(dropTimer);

                        // 3. Return dropper to reagent bottle while swirling test tube
                        this.tween(520, (p) => {
                            const e = this.easeInOut(p);
                            dropper.position.lerpVectors(overTubePos, home, e);
                        });

                        setTimeout(() => {
                            this.triggerTubeSwirl(tubeKey, 950, () => {
                                onComplete?.();
                            });
                        }, 260);
                    }
                }, 280);
            }
        );
    }

    playBromineTestAnimation(onDropImpact, onComplete) {
        this.playReagentDropperSequence(
            this.labScene.bromineBottle,
            'A',
            0xea580c,
            onDropImpact,
            onComplete
        );
    }

    playKMnO4TestAnimation(onDropImpact, onComplete) {
        this.playReagentDropperSequence(
            this.labScene.kmno4Bottle,
            'B',
            0x7e22ce,
            onDropImpact,
            onComplete
        );
    }

    // ============================================================================
    // STEP 5 ANIMATION: MOIST LITMUS DIP + NaHCO3 POWDER TRANSFER + EFFERVESCENCE
    // ============================================================================
    playCarboxylicTestAnimation(onLitmusTurned, onPowderAdded, onComplete) {
        const blueStrip = this.labScene.blueLitmus.group;
        const blueHome = this.labScene.blueLitmus.homePos;
        const tubeCPos = this.labScene.tubesMap.C.homePos;
        const dipPos = new THREE.Vector3(tubeCPos.x, 0.26, tubeCPos.z);

        // 1. Lift moist Blue Litmus strip and dip tip into Tube C
        this.tween(
            520,
            (p) => {
                const e = this.easeInOut(p);
                blueStrip.position.lerpVectors(blueHome, dipPos, e);
                blueStrip.rotation.x = THREE.MathUtils.lerp(0, Math.PI * 0.42, e);
            },
            () => {
                // Blue litmus turns bright red!
                onLitmusTurned?.();

                setTimeout(() => {
                    // Return litmus strip to porcelain tile
                    this.tween(
                        480,
                        (p) => {
                            const e = this.easeInOut(p);
                            blueStrip.position.lerpVectors(dipPos, blueHome, e);
                            blueStrip.rotation.x = THREE.MathUtils.lerp(Math.PI * 0.42, 0, e);
                        },
                        () => {
                            // 2. Move NaHCO3 powder micro-spatula over Tube C and tip solid in
                            const pSpatula = this.labScene.powderSpatulaGroup;
                            const pHome = this.labScene.powderSpatulaHomePos;
                            const overTubeC = new THREE.Vector3(tubeCPos.x + 0.05, 0.34, tubeCPos.z);

                            this.tween(
                                540,
                                (p) => {
                                    const e = this.easeInOut(p);
                                    pSpatula.position.lerpVectors(pHome, overTubeC, e);
                                    pSpatula.rotation.z = THREE.MathUtils.lerp(-0.35, 0.45, e);
                                },
                                () => {
                                    // Spawn falling white NaHCO3 grains + start CO2 effervescence
                                    for (let i = 0; i < 4; i++) {
                                        this.spawnDroplet(
                                            new THREE.Vector3(
                                                tubeCPos.x + (Math.random() - 0.5) * 0.01,
                                                0.31 + i * 0.012,
                                                tubeCPos.z
                                            ),
                                            0xffffff,
                                            0.14
                                        );
                                    }

                                    onPowderAdded?.();
                                    this.co2EmitIntensity = 1.0;

                                    // Return powder spatula home
                                    this.tween(500, (p) => {
                                        const e = this.easeInOut(p);
                                        pSpatula.position.lerpVectors(overTubeC, pHome, e);
                                        pSpatula.rotation.z = THREE.MathUtils.lerp(0.45, -0.35, e);
                                    });

                                    setTimeout(() => {
                                        this.co2EmitIntensity = 0.25;
                                        onComplete?.();
                                    }, 1700);
                                }
                            );
                        }
                    );
                }, 380);
            }
        );
    }

    update() {
        const now = performance.now();
        const elapsed = this.clock.getElapsedTime();

        // 1. Update Active Tweens
        for (let i = this.activeTweens.length - 1; i >= 0; i--) {
            const tw = this.activeTweens[i];
            const progress = Math.min(1, (now - tw.startTime) / tw.duration);
            tw.onUpdate?.(progress);
            if (progress >= 1) {
                this.activeTweens.splice(i, 1);
                tw.onDone?.();
            }
        }

        // 2. Live Bunsen Flame Flicker
        if (this.labScene.flameGroup?.visible) {
            const flicker = 1 + Math.sin(elapsed * 28) * 0.06 + Math.cos(elapsed * 43) * 0.04;
            const sway = Math.sin(elapsed * 19) * 0.04;
            this.labScene.outerFlameMesh.scale.set(1 / flicker, flicker, 1 / flicker);
            this.labScene.outerFlameMesh.rotation.z = sway;
            this.labScene.innerFlameMesh.scale.set(1, 0.96 + Math.sin(elapsed * 35) * 0.05, 1);
        }

        // 3. Emit & Update Rising Black Soot Particles during Step 2 Ignition
        if (this.sootEmitActive && Math.random() < 0.65) {
            this.spawnSootParticle();
        }
        for (let i = this.sootParticles.length - 1; i >= 0; i--) {
            const p = this.sootParticles[i];
            p.mesh.position.x += p.vx;
            p.mesh.position.y += p.vy;
            p.mesh.position.z += p.vz;
            p.life -= 0.022;
            p.mesh.material.opacity = Math.max(0, p.life * 0.8);
            p.mesh.scale.multiplyScalar(1.012);

            if (p.life <= 0) {
                this.scene.remove(p.mesh);
                p.mesh.geometry.dispose();
                p.mesh.material.dispose();
                this.sootParticles.splice(i, 1);
            }
        }

        // 4. Emit & Update CO2 Effervescence Bubbles in Tube C
        if (this.co2EmitIntensity > 0 && Math.random() < this.co2EmitIntensity * 0.55) {
            this.spawnCO2Bubble();
        }
        for (let i = this.co2Bubbles.length - 1; i >= 0; i--) {
            const b = this.co2Bubbles[i];
            b.mesh.position.y += b.vy;
            if (b.mesh.position.y >= b.maxY) {
                this.scene.remove(b.mesh);
                b.mesh.geometry.dispose();
                b.mesh.material.dispose();
                this.co2Bubbles.splice(i, 1);
            }
        }

        // 5. Update Falling Reagent Droplets
        for (let i = this.droplets.length - 1; i >= 0; i--) {
            const d = this.droplets[i];
            d.vy -= 0.00045;
            d.mesh.position.y += d.vy;
            if (d.mesh.position.y <= d.targetY) {
                this.scene.remove(d.mesh);
                d.mesh.geometry.dispose();
                d.mesh.material.dispose();
                this.droplets.splice(i, 1);
            }
        }

        // 6. Update Orbital Test-Tube Swirls
        for (let i = this.activeSwirls.length - 1; i >= 0; i--) {
            const sw = this.activeSwirls[i];
            const t = Math.min(1, (now - sw.startTime) / sw.duration);
            const env = Math.sin(t * Math.PI);
            const angle = t * Math.PI * 8;

            sw.tube.group.position.x = sw.tube.homePos.x + Math.cos(angle) * 0.012 * env;
            sw.tube.group.position.y = sw.tube.homePos.y + 0.045 * env;
            sw.tube.group.position.z = sw.tube.homePos.z + Math.sin(angle) * 0.012 * env;
            sw.tube.group.rotation.z = Math.cos(angle) * 0.14 * env;
            sw.tube.group.rotation.x = Math.sin(angle) * 0.12 * env;

            if (t >= 1) {
                sw.tube.group.position.copy(sw.tube.homePos);
                sw.tube.group.rotation.set(0, 0, 0);
                this.activeSwirls.splice(i, 1);
                sw.onComplete?.();
            }
        }
    }
}

export default ExperimentFx;