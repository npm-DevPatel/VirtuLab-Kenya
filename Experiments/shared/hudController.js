import * as THREE from 'three';

export class HudController {
    constructor(labScene, callbacks) {
        this.labScene = labScene;
        this.callbacks = callbacks;
        this.experiment = callbacks.experiment || null;
        this.isTitration =
            !this.experiment ||
            this.experiment.id === 'titration' ||
            this.experiment.id === 'chem-1';
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

        // Dynamic Containers for Experiments 2–12
        this.dynamicActionsEl = document.getElementById('dynamic-step-actions');
        this.dynamicInstrumentEl = document.getElementById('dynamic-instrument-widget');
        this.instrumentTitleEl = document.getElementById('instrument-pane-title');
        this.tabInstrumentLabelEl = document.getElementById('tab-instrument-label');
        this.camPresetGridEl = document.getElementById('cam-preset-grid');

        // Step Elements
        this.stepCounterEl = document.getElementById('step-counter');
        this.stepTitleEl = document.getElementById('step-title');
        this.stepInstructionEl = document.getElementById('step-instruction');
        this.checklistEl = document.getElementById('step-checklist');

        // Titration Action Buttons
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
        if (!this.labelsLayer) return;
        this.labelsLayer.innerHTML = '';
        const anchors = this.labScene?.labelAnchors || [];
        this.labelElements = anchors.map((anchor) => {
            const el = document.createElement('div');
            el.className = 'lab-label';
            el.innerHTML = `${anchor.title}<small>${anchor.sub || ''}</small>`;
            this.labelsLayer.appendChild(el);
            return { el, pos: anchor.pos };
        });
    }

    update3DLabels() {
        if (!this.labelsLayer || this.labelsLayer.classList.contains('hidden')) return;
        if (!this.labScene?.renderer) return;

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
        this.btnCollapseSidebar?.addEventListener('click', () => {
            const isCollapsed = this.sidebarEl.classList.toggle('collapsed');
            this.btnCollapseSidebar.textContent = isCollapsed ? '☰ Open Panel' : '✕ Hide Panel';
            setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
        });

        this.btnSwapSide?.addEventListener('click', () => {
            this.workspaceEl.classList.toggle('dock-left');
            this.workspaceEl.classList.toggle('dock-right');
            setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
        });

        this.tabBtns.forEach((btn) => {
            btn.addEventListener('click', () => {
                const targetId = btn.dataset.tab;
                this.tabBtns.forEach((b) => b.classList.remove('active'));
                this.tabPanes.forEach((p) => p.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(targetId)?.classList.add('active');
            });
        });

        if (this.isTitration) {
            this.btnStep1?.addEventListener('click', () => {
                this.btnStep1.disabled = true;
                this.callbacks.onConfirmStep1?.(() => {
                    this.btnStep1.disabled = false;
                });
            });

            this.btnStep2?.addEventListener('click', () => {
                this.btnStep2.disabled = true;
                this.callbacks.onAddIndicator?.(() => {
                    this.btnStep2.disabled = false;
                });
            });

            this.btnStep3?.addEventListener('click', () => this.callbacks.onConfirmMeniscus?.());

            const startStream = () => {
                this.callbacks.onStreamAcid?.();
                if (this.streamInterval) clearInterval(this.streamInterval);
                this.streamInterval = setInterval(() => {
                    this.callbacks.onStreamAcid?.();
                }, 110);
            };

            const stopStream = () => {
                if (this.streamInterval) {
                    clearInterval(this.streamInterval);
                    this.streamInterval = null;
                }
            };

            this.btnStream?.addEventListener('mousedown', startStream);
            window.addEventListener('mouseup', stopStream);
            this.btnStream?.addEventListener('touchstart', (e) => {
                e.preventDefault();
                startStream();
            });
            window.addEventListener('touchend', stopStream);

            this.btnDrop?.addEventListener('click', () => this.callbacks.onDropAcid?.());
            this.btnSwirl?.addEventListener('click', () => this.callbacks.onSwirlFlask?.());
            this.btnRecord?.addEventListener('click', () => this.callbacks.onFinishTitration?.());
        }

        this.btnReset?.addEventListener('click', () => this.callbacks.onReset?.());

        this.btnToggleLabels?.addEventListener('click', () => {
            const isHidden = this.labelsLayer.classList.toggle('hidden');
            this.btnToggleLabels.classList.toggle('active', !isHidden);
            this.btnToggleLabels.innerHTML = `<span class="dot-indicator"></span> 3D Labels: ${isHidden ? 'OFF' : 'ON'
                }`;
        });

        const setCamActive = (activeBtn, preset) => {
            if (!activeBtn) return;
            this.camPresetGridEl
                ?.querySelectorAll('.btn-cam')
                .forEach((b) => b.classList.remove('active'));
            activeBtn.classList.add('active');
            this.callbacks.onSelectCamera?.(preset);
        };

        this.camBench?.addEventListener('click', () => setCamActive(this.camBench, 'bench'));
        this.camMeniscus?.addEventListener('click', () =>
            setCamActive(this.camMeniscus, 'meniscus')
        );
        this.camFlask?.addEventListener('click', () => setCamActive(this.camFlask, 'flask'));
    }

    setCameraButtonUI(preset) {
        this.camPresetGridEl
            ?.querySelectorAll('.btn-cam')
            .forEach((b) => b.classList.remove('active'));
        if (preset === 'bench') this.camBench?.classList.add('active');
        if (preset === 'meniscus') this.camMeniscus?.classList.add('active');
        if (preset === 'flask') this.camFlask?.classList.add('active');
    }

    renderChecklist(snapshot) {
        if (!this.checklistEl) return;

        const stepsList =
            snapshot.allSteps ||
            (this.experiment?.procedure
                ? this.experiment.procedure.map((text, idx) => ({
                    index: idx + 1,
                    title: text.length > 52 ? text.slice(0, 52) + '...' : text,
                }))
                : [
                    { index: 1, title: 'Pipette 25.0 cm³ NaOH' },
                    { index: 2, title: 'Add Phenolphthalein' },
                    { index: 3, title: 'Zero Burette Meniscus' },
                    { index: 4, title: 'Titrate to End-Point' },
                    { index: 5, title: 'Record Final Titre' },
                ]);

        this.checklistEl.innerHTML = '';
        stepsList.forEach((step, idx) => {
            const stepNum = step.index || idx + 1;
            const li = document.createElement('li');
            li.dataset.step = stepNum;
            const labelText = step.shortTitle || step.title || String(step);
            li.textContent = `${stepNum}. ${labelText}`;
            if (stepNum < snapshot.currentStep) li.classList.add('done');
            else if (stepNum === snapshot.currentStep) li.classList.add('active');
            this.checklistEl.appendChild(li);
        });
    }

    renderDynamicExperimentUI(snapshot) {
        // 1. Status Badge
        this.endpointBadgeEl.className = 'status-pill status-neutral';
        this.endpointBadgeEl.textContent = snapshot.statusText || snapshot.status || 'Ready';

        // 2. Dynamic Step Action Buttons (from snapshot.stepMeta.actions or fallback Next Step button)
        if (this.dynamicActionsEl) {
            this.dynamicActionsEl.innerHTML = '';
            const actions = snapshot.stepMeta?.actions || [
                {
                    id: 'NEXT_STEP',
                    label:
                        snapshot.currentStep < (snapshot.totalSteps || 5)
                            ? `Complete Step ${snapshot.currentStep} →`
                            : 'Experiment Complete ✓',
                    style: 'btn-primary full-width',
                    disabled: snapshot.currentStep >= (snapshot.totalSteps || 5) && snapshot.completed,
                },
            ];

            actions.forEach((act) => {
                const btn = document.createElement('button');
                btn.className = act.style || 'btn-primary full-width';
                btn.textContent = act.label;
                if (act.disabled) btn.disabled = true;
                btn.addEventListener('click', () => {
                    btn.disabled = true;
                    this.callbacks.onCustomAction?.(act.id, act.payload, () => {
                        btn.disabled = false;
                    });
                });
                this.dynamicActionsEl.appendChild(btn);
            });
        }

        // 3. Dynamic Instrument Tab Content
        if (this.dynamicInstrumentEl) {
            const inst = snapshot.instrument || {
                tabLabel: 'Instrument',
                title: `${this.experiment?.subject || 'Lab'} Apparatus Readout`,
                primaryLabel: 'Current Step Status',
                primaryValue: `Step ${snapshot.currentStep}`,
                primaryUnit: `of ${snapshot.totalSteps || this.experiment?.procedure?.length || 5}`,
                rows: (this.experiment?.apparatus || []).slice(0, 3).map((item, i) => ({
                    label: `Apparatus ${i + 1}`,
                    value: item,
                })),
            };

            if (this.tabInstrumentLabelEl && inst.tabLabel) {
                this.tabInstrumentLabelEl.textContent = inst.tabLabel;
            }
            if (this.instrumentTitleEl && inst.title) {
                this.instrumentTitleEl.textContent = inst.title;
            }

            const rowsHtml = (inst.rows || [])
                .map(
                    (r) =>
                        `<div style="margin-top:4px;">${r.label}: <strong>${r.value}</strong></div>`
                )
                .join('');

            this.dynamicInstrumentEl.innerHTML = `
        <div class="burette-widget">
          <div class="digital-block" style="width: 100%;">
            <span class="sub-label">${inst.primaryLabel || 'Measurement'}</span>
            <div class="readout-value">
              <span>${inst.primaryValue ?? '0.00'}</span>
              <small>${inst.primaryUnit || ''}</small>
            </div>
            <div class="flask-summary">
              ${rowsHtml}
            </div>
          </div>
        </div>
      `;
        }

        // 4. Dynamic Camera Presets (if defined by the experiment)
        if (snapshot.cameraPresets && this.camPresetGridEl) {
            this.camPresetGridEl.innerHTML = '';
            snapshot.cameraPresets.forEach((preset, idx) => {
                const btn = document.createElement('button');
                btn.className = `btn-cam ${idx === 0 ? 'active' : ''}`;
                btn.textContent = preset.label;
                btn.addEventListener('click', () => {
                    this.camPresetGridEl
                        .querySelectorAll('.btn-cam')
                        .forEach((b) => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.callbacks.onSelectCamera?.(preset.id);
                });
                this.camPresetGridEl.appendChild(btn);
            });
        }
    }

    render(snapshot) {
        if (!snapshot) return;

        // Update Step Header & Instructions
        if (this.stepCounterEl) {
            this.stepCounterEl.textContent =
                snapshot.stepMeta?.tag || `STEP ${snapshot.currentStep}`;
        }
        if (this.stepTitleEl) {
            this.stepTitleEl.textContent = snapshot.stepMeta?.title || '';
        }
        if (this.stepInstructionEl) {
            this.stepInstructionEl.textContent = snapshot.stepMeta?.instruction || '';
        }

        // Update Checklist
        this.renderChecklist(snapshot);

        if (!this.isTitration) {
            this.renderDynamicExperimentUI(snapshot);
            return;
        }

        // --- TITRATION SPECIFIC RENDERING ---
        if (this.buretteValEl) {
            this.buretteValEl.textContent = (snapshot.buretteVolume ?? 0).toFixed(2);
        }
        if (this.flaskVolValEl) {
            this.flaskVolValEl.textContent = (snapshot.flaskVolume ?? 0).toFixed(1);
        }

        const vol = snapshot.buretteVolume ?? 0;
        const baseTick = Math.floor(vol * 2) / 2;
        if (this.tickTopEl) this.tickTopEl.textContent = Math.max(0, baseTick - 0.5).toFixed(1);
        if (this.tickMidEl) this.tickMidEl.textContent = vol.toFixed(2);
        if (this.tickBotEl) this.tickBotEl.textContent = (baseTick + 0.5).toFixed(1);

        if (this.endpointBadgeEl) {
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
        }

        this.btnStep1?.classList.toggle('hidden', snapshot.currentStep !== 1);
        this.btnStep2?.classList.toggle('hidden', snapshot.currentStep !== 2);
        this.btnStep3?.classList.toggle('hidden', snapshot.currentStep !== 3);
        this.titrationControls?.classList.toggle('hidden', snapshot.currentStep !== 4);
    }

    cleanup() {
        if (this.streamInterval) clearInterval(this.streamInterval);
    }
}