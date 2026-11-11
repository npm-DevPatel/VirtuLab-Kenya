import * as THREE from 'three';

export class ExperimentFx {
    constructor(labScene) {
        this.scene = labScene.scene;
        this.flaskGroup = labScene.flaskGroup;
        this.pipetteGroup = labScene.pipetteGroup;
        this.pipetteLiquid = labScene.pipetteLiquid;
        this.dropperGroup = labScene.dropperGroup;
        this.stopcockValve = labScene.stopcockValve;

        this.drops = [];
        this.ripples = [];
        this.swirlTimer = 0;
        this.isSwirling = false;
        this.valveTimer = 0;
        this.activeChoreography = null;

        this.dropGeo = new THREE.SphereGeometry(0.012, 14, 14);
        this.acidDropMat = new THREE.MeshStandardMaterial({
            color: 0x38bdf8,
            emissive: 0x0284c7,
            emissiveIntensity: 0.25,
            transparent: true,
            opacity: 0.95,
        });
        this.alkaliDropMat = new THREE.MeshStandardMaterial({
            color: 0x7dd3fc,
            transparent: true,
            opacity: 0.9,
        });
        this.indicatorDropMat = new THREE.MeshStandardMaterial({
            color: 0xe11d74,
            emissive: 0x9d174d,
            emissiveIntensity: 0.35,
            transparent: true,
            opacity: 0.98,
        });

        // Continuous Fast-Stream Cylinder Beam
        const streamGeo = new THREE.CylinderGeometry(0.0035, 0.0035, 0.38, 12);
        this.streamMesh = new THREE.Mesh(streamGeo, this.acidDropMat);
        this.streamMesh.position.set(0, 0.8, 0);
        this.streamMesh.visible = false;
        this.scene.add(this.streamMesh);
        this.streamTimer = 0;
    }

    playPipetteTransfer(onComplete) {
        if (this.activeChoreography) return;
        this.pipetteLiquid.visible = true;
        this.pipetteLiquid.scale.set(1, 1, 1);

        this.activeChoreography = {
            type: 'pipette',
            frame: 0,
            totalFrames: 115,
            onComplete,
        };
    }

    playIndicatorDropper(onComplete) {
        if (this.activeChoreography) return;

        this.activeChoreography = {
            type: 'dropper',
            frame: 0,
            totalFrames: 105,
            onComplete,
        };
    }

    spawnDrop(type = 'acid', count = 1, startPos = { x: 0, y: 0.99, z: 0 }) {
        const mat =
            type === 'indicator'
                ? this.indicatorDropMat
                : type === 'alkali'
                    ? this.alkaliDropMat
                    : this.acidDropMat;

        for (let i = 0; i < count; i++) {
            const mesh = new THREE.Mesh(this.dropGeo, mat);
            mesh.position.set(startPos.x, startPos.y - i * 0.065, startPos.z);
            mesh.scale.set(0.85, 1.35, 0.85);
            this.scene.add(mesh);
            this.drops.push({
                mesh,
                speed: 0.018 + Math.random() * 0.004,
            });
        }

        if (type === 'acid' && this.stopcockValve) {
            this.valveTimer = 18;
            this.stopcockValve.rotation.x = Math.PI / 2;
        }
    }

    showStream() {
        this.streamMesh.visible = true;
        this.streamTimer = 10;
        if (this.stopcockValve) {
            this.valveTimer = 14;
            this.stopcockValve.rotation.x = Math.PI / 2;
        }
        this.spawnRipple(0x38bdf8);
    }

    spawnRipple(hexColor = 0xffffff) {
        const ringGeo = new THREE.RingGeometry(0.01, 0.018, 24);
        const ringMat = new THREE.MeshBasicMaterial({
            color: hexColor,
            transparent: true,
            opacity: 0.85,
            side: THREE.DoubleSide,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(0, 0.61, 0);
        this.scene.add(ring);
        this.ripples.push({ mesh: ring, mat: ringMat, scale: 1 });
    }

    triggerSwirl() {
        this.isSwirling = true;
        this.swirlTimer = 46;
    }

    update() {
        if (this.activeChoreography) {
            const c = this.activeChoreography;
            c.frame++;
            const t = c.frame / c.totalFrames;

            if (c.type === 'pipette') {
                if (t < 0.25) {
                    const p = t / 0.25;
                    this.pipetteGroup.position.set(-0.62, 0.82 + p * 0.42, 0.22);
                } else if (t < 0.5) {
                    const p = (t - 0.25) / 0.25;
                    this.pipetteGroup.position.set(
                        -0.62 + p * 0.62,
                        1.24 - p * 0.14,
                        0.22 - p * 0.22
                    );
                } else if (t < 0.82) {
                    const p = (t - 0.5) / 0.32;
                    this.pipetteLiquid.scale.y = Math.max(0.01, 1 - p);
                    if (c.frame % 5 === 0) {
                        this.spawnDrop('alkali', 1, { x: 0, y: 0.92, z: 0 });
                    }
                } else {
                    const p = (t - 0.82) / 0.18;
                    this.pipetteLiquid.visible = false;
                    this.pipetteGroup.position.set(
                        0 - p * 0.62,
                        1.1 - p * 0.28,
                        0 + p * 0.22
                    );
                }
            } else if (c.type === 'dropper') {
                if (t < 0.25) {
                    const p = t / 0.25;
                    this.dropperGroup.position.set(0.52, 0.72 + p * 0.36, 0.16);
                } else if (t < 0.5) {
                    const p = (t - 0.25) / 0.25;
                    this.dropperGroup.position.set(
                        0.52 - p * 0.52,
                        1.08 - p * 0.1,
                        0.16 - p * 0.16
                    );
                } else if (t < 0.8) {
                    if (c.frame === 55 || c.frame === 66 || c.frame === 77) {
                        this.spawnDrop('indicator', 1, { x: 0, y: 0.92, z: 0 });
                    }
                } else {
                    const p = (t - 0.8) / 0.2;
                    this.dropperGroup.position.set(
                        0 + p * 0.52,
                        0.98 - p * 0.26,
                        0 + p * 0.16
                    );
                }
            }

            if (c.frame >= c.totalFrames) {
                const cb = c.onComplete;
                this.activeChoreography = null;
                if (cb) cb();
            }
        }

        for (let i = this.drops.length - 1; i >= 0; i--) {
            const d = this.drops[i];
            d.mesh.position.y -= d.speed;
            if (d.mesh.position.y <= 0.61) {
                this.spawnRipple(d.mesh.material.color.getHex());
                this.scene.remove(d.mesh);
                this.drops.splice(i, 1);
            }
        }

        for (let i = this.ripples.length - 1; i >= 0; i--) {
            const r = this.ripples[i];
            r.scale += 0.35;
            r.mesh.scale.set(r.scale, r.scale, 1);
            r.mat.opacity -= 0.04;
            if (r.mat.opacity <= 0) {
                this.scene.remove(r.mesh);
                r.mesh.geometry.dispose();
                r.mat.dispose();
                this.ripples.splice(i, 1);
            }
        }

        if (this.streamTimer > 0) {
            this.streamTimer--;
            if (this.streamTimer === 0) {
                this.streamMesh.visible = false;
            }
        }

        if (this.valveTimer > 0) {
            this.valveTimer--;
            if (this.valveTimer === 0 && this.stopcockValve) {
                this.stopcockValve.rotation.x = 0;
            }
        }

        if (this.isSwirling && this.flaskGroup) {
            this.swirlTimer--;
            const angle = (46 - this.swirlTimer) * 0.42;
            const radius = 0.024;
            this.flaskGroup.position.x = Math.cos(angle) * radius;
            this.flaskGroup.position.z = Math.sin(angle) * radius;
            this.flaskGroup.rotation.z = Math.sin(angle) * 0.08;
            this.flaskGroup.rotation.x = Math.cos(angle) * 0.06;

            if (this.swirlTimer <= 0) {
                this.isSwirling = false;
                this.flaskGroup.position.set(0, 0.524, 0);
                this.flaskGroup.rotation.set(0, 0, 0);
            }
        }
    }
}

/** Backward-compatible alias */
export const DropletFx = ExperimentFx;
