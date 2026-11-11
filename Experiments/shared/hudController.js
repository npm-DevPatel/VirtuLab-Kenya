import * as THREE from 'three';

export class HudController {
    constructor(labScene, callbacks) {
        this.labScene = labScene;
        this.callbacks = callbacks;
        this.streamInterval = null;

        // Layout & Sidebar Elements
        this.workspaceEl = document.getElementById('workspace');
        this.sidebarEl = document.getElementById('lab-sidebar');
        this.btnCollapseSidebar = document.getElementById('btn-collapse-sidebar');
        this.btnSwapSide = document.getElementById('btn-swap-side');

        // Tab Navigation Elements
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.tabPanes = document.querySelectorAll('.tab-pane');

        // Readout & Loupe Elements
        this.buretteValEl = document.getElementById('burette-val');
        this.flaskVolValEl = document.getElementById('flask-vol-val');
        this.endpointBadgeEl = document.getElementById('endpoint-badge');
        this.tickTopEl = document.getElementById('tick-top');
        this.tickMidEl = document.getElementById('tick-mid');
        this.tickBotEl = document.getElementById('tick-bot');

        // Step Elements
        this.stepCounterEl = document.getElementById('step-counter');
        this.stepTitleEl = document.getElementById('step-title');
        this.stepInstructionEl = document.getElementById('step-instruction');
        this.checklistItems = document.querySelectorAll('#step-checklist li');

        // Action Buttons
        this.btnStep1 = document.getElementById('btn-step1');
        this.btnStep2 = document.getElementById('btn-step2');
        this.btnStep3 = document.getElementById('btn-step3');
        this.titrationControls = document.getElementById('titration-controls');

        this.btnStream = document.getElementById('btn-stream');
        this.btnDrop = document.getElementById('btn-drop');
        this.btnSwirl = document.getElementById('btn-swirl');
        this.btnRecord = document.getElementById('btn-record');
        this.btnReset = document.getElementById('btn-reset');

        // Camera & Label Toggles
        this.btnToggleLabels = document.getElementById('btn-toggle-labels');
        this.labelsLayer = document.getElementById('labels-layer');
        this.camBench = document.getElementById('cam-bench');
        this.camMeniscus = document.getElementById('cam-meniscus');
        this.camFlask = document.getElementById('cam-flask');

        this.labelElements = [];
        this.init3DLabels();
        this.bindEvents();
    }

    init3DLabels() {
        this.labelsLayer.innerHTML = '';
        this.labelElements = this.labScene.labelAnchors.map((anchor) => {
            const el = document.createElement('div');
            el.className = 'lab-label';
            el.innerHTML = `${anchor.title}<small>${anchor.sub}</small>`;
            this.labelsLayer.appendChild(el);
            return { el, pos: anchor.pos };
        });
    }

    update3DLabels() {
        if (this.labelsLayer.classList.contains('hidden')) return;

        const canvas = this.labScene.renderer.domElement;
        const widthHalf = canvas.clientWidth / 2;
        const heightHalf = canvas.clientHeight / 2;
        const tempVec = new THREE.Vector3();

        this.labelElements.forEach(({ el, pos }) => {
            tempVec.copy(pos);
            tempVec.project(this.labScene.camera);

            if (tempVec.z > 1) {
                el.style.opacity = '0';
                return;
            }

            const x = tempVec.x * widthHalf + widthHalf;
            const y = -(tempVec.y * heightHalf) + heightHalf;
            el.style.left = `${x}px`;
            el.style.top = `${y}px`;
            el.style.opacity = '1';
        });
    }

    bindEvents() {
        // 1. Sidebar Collapse / Expand & Left/Right Dock Toggle
        this.btnCollapseSidebar.addEventListener('click', () => {
            const isCollapsed = this.sidebarEl.classList.toggle('collapsed');
            this.btnCollapseSidebar.textContent = isCollapsed ? '☰ Open Panel' : '✕ Hide Panel';
            setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
        });

        this.btnSwapSide.addEventListener('click', () => {
            this.workspaceEl.classList.toggle('dock-left');
            this.workspaceEl.classList.toggle('dock-right');
            setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
        });

        // 2. Bottom-Half Sidebar Icon Tabs
        this.tabBtns.forEach((btn) => {
            btn.addEventListener('click', () => {
                const targetId = btn.dataset.tab;
                this.tabBtns.forEach((b) => b.classList.remove('active'));
                this.tabPanes.forEach((p) => p.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(targetId)?.classList.add('active');
            });
        });

        // 3. Step Action Buttons
        this.btnStep1.addEventListener('click', () => {
            this.btnStep1.disabled = true;
            this.callbacks.onConfirmStep1(() => {
                this.btnStep1.disabled = false;
            });
        });

        this.btnStep2.addEventListener('click', () => {
            this.btnStep2.disabled = true;
            this.callbacks.onAddIndicator(() => {
                this.btnStep2.disabled = false;
            });
        });

        this.btnStep3.addEventListener('click', () => this.callbacks.onConfirmMeniscus());

        // Continuous Press-and-Hold Fast Stream
        const startStream = () => {
            this.callbacks.onStreamAcid();
            if (this.streamInterval) clearInterval(this.streamInterval);
            this.streamInterval = setInterval(() => {
                this.callbacks.onStreamAcid();
            }, 110);
        };

        const stopStream = () => {
            if (this.streamInterval) {
                clearInterval(this.streamInterval);
                this.streamInterval = null;
            }
        };
        this.stopStream = stopStream;

        this.btnStream.addEventListener('mousedown', startStream);
        window.addEventListener('mouseup', stopStream);
        this.btnStream.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startStream();
        });
        window.addEventListener('touchend', stopStream);

        this.btnDrop.addEventListener('click', () => this.callbacks.onDropAcid());
        this.btnSwirl.addEventListener('click', () => this.callbacks.onSwirlFlask());
        this.btnRecord.addEventListener('click', () => this.callbacks.onFinishTitration());
        this.btnReset.addEventListener('click', () => this.callbacks.onReset());

        // 4. Toggle 3D Equipment Labels
        this.btnToggleLabels.addEventListener('click', () => {
            const isHidden = this.labelsLayer.classList.toggle('hidden');
            this.btnToggleLabels.classList.toggle('active', !isHidden);
            this.btnToggleLabels.innerHTML = `<span class="dot-indicator"></span> 3D Labels: ${isHidden ? 'OFF' : 'ON'
                }`;
        });

        // 5. Camera Presets
        const setCamActive = (activeBtn, preset) => {
            [this.camBench, this.camMeniscus, this.camFlask].forEach((b) =>
                b.classList.remove('active')
            );
            activeBtn.classList.add('active');
            this.callbacks.onSelectCamera(preset);
        };

        this.camBench.addEventListener('click', () => setCamActive(this.camBench, 'bench'));
        this.camMeniscus.addEventListener('click', () =>
            setCamActive(this.camMeniscus, 'meniscus')
        );
        this.camFlask.addEventListener('click', () => setCamActive(this.camFlask, 'flask'));
    }

    setCameraButtonUI(preset) {
        [this.camBench, this.camMeniscus, this.camFlask].forEach((b) =>
            b.classList.remove('active')
        );
        if (preset === 'bench') this.camBench.classList.add('active');
        if (preset === 'meniscus') this.camMeniscus.classList.add('active');
        if (preset === 'flask') this.camFlask.classList.add('active');
    }

    render(snapshot) {
        // 1. Update Digital Readouts
        this.buretteValEl.textContent = snapshot.buretteVolume.toFixed(2);
        this.flaskVolValEl.textContent = snapshot.flaskVolume.toFixed(1);

        // 2. Update 2D Meniscus Zoom Loupe Numbers
        const baseTick = Math.floor(snapshot.buretteVolume * 2) / 2;
        this.tickTopEl.textContent = Math.max(0, baseTick - 0.5).toFixed(1);
        this.tickMidEl.textContent = snapshot.buretteVolume.toFixed(2);
        this.tickBotEl.textContent = (baseTick + 0.5).toFixed(1);

        // 3. Update Status Pill
        this.endpointBadgeEl.className = 'status-pill';
        if (snapshot.flaskVolume === 0) {
            this.endpointBadgeEl.classList.add('status-neutral');
            this.endpointBadgeEl.textContent = 'Flask Empty';
        } else if (snapshot.status === 'NEUTRAL') {
            this.endpointBadgeEl.classList.add('status-neutral');
            this.endpointBadgeEl.textContent = '25.0 cm³ NaOH';
        } else if (snapshot.status === 'ALKALINE') {
            this.endpointBadgeEl.classList.add('status-alkaline');
            this.endpointBadgeEl.textContent = 'Alkaline (Pink)';
        } else if (snapshot.status === 'NEAR_ENDPOINT') {
            this.endpointBadgeEl.classList.add('status-alkaline');
            this.endpointBadgeEl.textContent = 'Pale Pink — Dropwise!';
        } else if (snapshot.status === 'ENDPOINT') {
            this.endpointBadgeEl.classList.add('status-endpoint');
            this.endpointBadgeEl.textContent = '✓ End-Point';
        } else if (snapshot.status === 'OVERSHOT') {
            this.endpointBadgeEl.classList.add('status-overshot');
            this.endpointBadgeEl.textContent = 'Overshot Acid';
        }

        // 4. Update Procedure Checklist
        this.checklistItems.forEach((li) => {
            const stepNum = parseInt(li.dataset.step, 10);
            li.classList.remove('active', 'done');
            if (stepNum < snapshot.currentStep) {
                li.classList.add('done');
            } else if (stepNum === snapshot.currentStep) {
                li.classList.add('active');
            }
        });

        // 5. Update Step Text & Buttons
        this.stepCounterEl.textContent = snapshot.stepMeta.tag;
        this.stepTitleEl.textContent = snapshot.stepMeta.title;
        this.stepInstructionEl.textContent = snapshot.stepMeta.instruction;

        this.btnStep1.classList.toggle('hidden', snapshot.currentStep !== 1);
        this.btnStep2.classList.toggle('hidden', snapshot.currentStep !== 2);
        this.btnStep3.classList.toggle('hidden', snapshot.currentStep !== 3);
        this.titrationControls.classList.toggle('hidden', snapshot.currentStep !== 4);
    }

    dispose() {
        if (this.streamInterval) {
            clearInterval(this.streamInterval);
            this.streamInterval = null;
        }
        if (this.stopStream) {
            window.removeEventListener('mouseup', this.stopStream);
            window.removeEventListener('touchend', this.stopStream);
        }
    }
}