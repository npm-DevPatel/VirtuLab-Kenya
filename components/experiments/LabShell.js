'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';

import '@/Experiments/shared/labShell.css';
import { HudController } from '@/Experiments/shared/hudController.js';

export default function LabShell({ experiment }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const containerRef = useRef(null);

    useEffect(() => {
        if (!loading && !user && experiment?.id) {
            router.push(`/login?redirect=/experiments/${experiment.id}`);
        }
    }, [user, loading, router, experiment]);

    useEffect(() => {
        if (loading || !user || !containerRef.current || !experiment?.id) return;

        let isMounted = true;
        let animId = null;
        let hud = null;
        let labScene = null;

        async function initExperiment() {
            try {
                const expId = experiment.id;
                const [sceneMod, stateMod, fxMod] = await Promise.all([
                    import(`@/Experiments/${expId}/sceneBuilder.js`),
                    import(`@/Experiments/${expId}/state.js`),
                    import(`@/Experiments/${expId}/fx.js`),
                ]);

                if (!isMounted || !containerRef.current) return;

                const container = containerRef.current;
                // Clear any leftover canvas
                const oldCanvas = container.querySelector('canvas');
                if (oldCanvas) oldCanvas.remove();

                labScene = sceneMod.createLabScene(container, experiment);

                const StateClass =
                    stateMod.ExperimentState || stateMod.TitrationState || stateMod.default;
                const state = new StateClass(experiment);

                const FxClass = fxMod.ExperimentFx || fxMod.DropletFx || fxMod.default;
                const fx = new FxClass(labScene);

                function syncAll(snapshot) {
                    if (labScene?.syncWithState) labScene.syncWithState(snapshot);
                    if (hud) hud.render(snapshot);
                }

                hud = new HudController(labScene, {
                    experiment,
                    state,
                    fx,
                    syncAll,
                    onConfirmStep1: (doneCallback) => {
                        if (fx.playPipetteTransfer && state.confirmStep1) {
                            labScene.setCameraPreset?.('bench');
                            hud.setCameraButtonUI?.('bench');
                            fx.playPipetteTransfer(() => {
                                const snap = state.confirmStep1();
                                syncAll(snap);
                                labScene.setCameraPreset?.('flask');
                                hud.setCameraButtonUI?.('flask');
                                if (doneCallback) doneCallback();
                            });
                        } else {
                            const snap = state.nextStep ? state.nextStep() : state.getSnapshot();
                            syncAll(snap);
                            if (doneCallback) doneCallback();
                        }
                    },
                    onAddIndicator: (doneCallback) => {
                        if (fx.playIndicatorDropper && state.addIndicator) {
                            labScene.setCameraPreset?.('flask');
                            hud.setCameraButtonUI?.('flask');
                            fx.playIndicatorDropper(() => {
                                fx.triggerSwirl?.();
                                const snap = state.addIndicator();
                                syncAll(snap);
                                setTimeout(() => {
                                    labScene.setCameraPreset?.('meniscus');
                                    hud.setCameraButtonUI?.('meniscus');
                                    if (doneCallback) doneCallback();
                                }, 650);
                            });
                        }
                    },
                    onConfirmMeniscus: () => {
                        if (state.confirmMeniscus) {
                            const snap = state.confirmMeniscus();
                            labScene.setCameraPreset?.('bench');
                            hud.setCameraButtonUI?.('bench');
                            syncAll(snap);
                        }
                    },
                    onStreamAcid: () => {
                        if (state.dispenseAcid) {
                            fx.showStream?.();
                            const snap = state.dispenseAcid(0.35);
                            syncAll(snap);
                        }
                    },
                    onDropAcid: () => {
                        if (state.dispenseAcid) {
                            fx.spawnDrop?.('acid', 1);
                            const snap = state.dispenseAcid(0.05);
                            syncAll(snap);
                        }
                    },
                    onSwirlFlask: () => {
                        fx.triggerSwirl?.();
                    },
                    onFinishTitration: () => {
                        if (state.finishTitration) {
                            const snap = state.finishTitration();
                            labScene.setCameraPreset?.('flask');
                            hud.setCameraButtonUI?.('flask');
                            syncAll(snap);
                        }
                    },
                    // Universal action handler for Experiments 2–12
                    onCustomAction: (actionId, payload, doneCallback) => {
                        if (typeof state.handleAction === 'function') {
                            const result = state.handleAction(actionId, payload, { labScene, fx, syncAll });
                            if (result && typeof result.then === 'function') {
                                result.then((snap) => {
                                    if (snap) syncAll(snap);
                                    if (doneCallback) doneCallback();
                                });
                            } else {
                                syncAll(result || state.getSnapshot());
                                if (doneCallback) doneCallback();
                            }
                        } else if (typeof state.nextStep === 'function') {
                            const snap = state.nextStep();
                            syncAll(snap);
                            if (doneCallback) doneCallback();
                        }
                    },
                    onReset: () => {
                        state.reset?.();
                        const snap = state.getSnapshot();
                        labScene.setCameraPreset?.('bench');
                        hud.setCameraButtonUI?.('bench');
                        syncAll(snap);
                    },
                    onSelectCamera: (preset) => {
                        labScene.setCameraPreset?.(preset);
                    },
                });

                syncAll(state.getSnapshot());

                function animate() {
                    animId = requestAnimationFrame(animate);
                    labScene.updateCamera?.();
                    fx.update?.();
                    hud.update3DLabels?.();
                    labScene.renderer.render(labScene.scene, labScene.camera);
                }
                animate();
            } catch (err) {
                console.error('Error initializing 3D experiment:', err);
            }
        }

        initExperiment();

        return () => {
            isMounted = false;
            if (animId) cancelAnimationFrame(animId);
            if (hud?.cleanup) hud.cleanup();
            if (labScene?.cleanup) labScene.cleanup();
        };
    }, [user, loading, experiment]);

    if (loading || !user) return null;

    const isTitration =
        experiment?.id === 'titration' || experiment?.id === 'chem-1';

    return (
        <div id="app" className="lab-shell-root exp1-root">
            {/* Top Navigation Bar */}
            <header className="lab-header">
                <div className="header-left">
                    <Link href="/experiments" className="btn-exit">
                        ← Back to Catalogue
                    </Link>
                    <div className="header-divider" />
                    <span className="badge">{experiment?.paper || 'KCSE Paper 3'}</span>
                    <h1>
                        EXP {experiment?.number || 1}: {experiment?.title}
                    </h1>
                </div>

                <div className="header-right">
                    <button
                        id="btn-toggle-labels"
                        className="btn-nav-tool active"
                        title="Show/Hide 3D Apparatus Names"
                    >
                        <span className="dot-indicator"></span> 3D Labels: ON
                    </button>
                    <button
                        id="btn-swap-side"
                        className="btn-nav-tool"
                        title="Move Sidebar Left or Right"
                    >
                        ⇄ Dock Left / Right
                    </button>
                    <button id="btn-reset" className="btn-nav-tool">
                        ↺ Reset Lab
                    </button>
                </div>
            </header>

            {/* Main Split Workspace */}
            <main id="workspace" className="workspace dock-right">
                <div id="canvas-container" ref={containerRef} className="canvas-stage">
                    <div id="labels-layer" className="labels-layer"></div>

                    <button
                        id="btn-collapse-sidebar"
                        className="sidebar-toggle-fab"
                        title="Collapse / Expand Sidebar"
                    >
                        ✕ Hide Panel
                    </button>
                </div>

                {/* Unified Lab Sidebar */}
                <aside id="lab-sidebar" className="lab-sidebar">
                    {/* TOP HALF: Locked Active Experiment Steps & Actions */}
                    <section className="sidebar-top-steps">
                        <div className="step-header-row">
                            <span id="step-counter" className="step-tag">
                                STEP 1
                            </span>
                            <span id="endpoint-badge" className="status-pill status-neutral">
                                Ready
                            </span>
                        </div>

                        <h2 id="step-title">Loading step...</h2>
                        <p id="step-instruction">Preparing laboratory bench...</p>

                        <div className="step-actions">
                            {/* Titration-specific buttons (only shown when Exp 1 is active) */}
                            <div
                                id="titration-step-buttons"
                                className={isTitration ? '' : 'hidden'}
                            >
                                <button id="btn-step1" className="btn-primary full-width">
                                    Pipette 25.0 cm³ NaOH into Flask →
                                </button>

                                <button
                                    id="btn-step2"
                                    className="btn-primary btn-pink full-width hidden"
                                >
                                    Add 3 Drops Phenolphthalein →
                                </button>

                                <button id="btn-step3" className="btn-primary full-width hidden">
                                    Confirm 0.00 cm³ Meniscus Level →
                                </button>

                                <div id="titration-controls" className="titration-grid hidden">
                                    <button
                                        id="btn-stream"
                                        className="btn-action"
                                        title="Hold down for continuous stream"
                                    >
                                        Hold: Fast Stream
                                    </button>
                                    <button
                                        id="btn-drop"
                                        className="btn-accent"
                                        title="Add single 0.05 cm³ drop"
                                    >
                                        + Single Drop (0.05)
                                    </button>
                                    <button id="btn-swirl" className="btn-secondary">
                                        Swirl Flask
                                    </button>
                                    <button id="btn-record" className="btn-primary">
                                        Record Final Titre ✓
                                    </button>
                                </div>
                            </div>

                            {/* Dynamic Action Buttons Container for Experiments 2–12 */}
                            <div
                                id="dynamic-step-actions"
                                className={isTitration ? 'hidden' : ''}
                            ></div>
                        </div>
                    </section>

                    {/* BOTTOM HALF: Clean Segmented Tabs */}
                    <section className="sidebar-bottom-tabs">
                        <nav className="tab-icon-bar" role="tablist">
                            <button
                                className="tab-btn active"
                                data-tab="tab-burette"
                                title="Instrument Readout"
                            >
                                <svg
                                    width="15"
                                    height="15"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M9 2v17a3 3 0 0 0 6 0V2" />
                                    <line x1="7" y1="2" x2="17" y2="2" />
                                    <line x1="9" y1="12" x2="15" y2="12" />
                                </svg>
                                <span id="tab-instrument-label">
                                    {isTitration ? 'Burette' : 'Instrument'}
                                </span>
                            </button>

                            <button
                                className="tab-btn"
                                data-tab="tab-progress"
                                title="Procedure Progress"
                            >
                                <svg
                                    width="15"
                                    height="15"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M9 11l3 3L22 4" />
                                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                                </svg>
                                <span>Progress</span>
                            </button>

                            <button
                                className="tab-btn"
                                data-tab="tab-camera"
                                title="3D Camera Controls"
                            >
                                <svg
                                    width="15"
                                    height="15"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                    <circle cx="12" cy="13" r="4" />
                                </svg>
                                <span>3D View</span>
                            </button>
                        </nav>

                        <div className="tab-panels">
                            {/* TAB 1: Instrument Readout */}
                            <div id="tab-burette" className="tab-pane active">
                                <div id="instrument-pane-title" className="pane-title">
                                    {isTitration
                                        ? 'Burette Titrant (0.1M HCl)'
                                        : 'Instrument Readout'}
                                </div>

                                {/* Titration Burette Widget */}
                                <div
                                    id="titration-instrument-widget"
                                    className={`burette-widget ${isTitration ? '' : 'hidden'}`}
                                >
                                    <div className="digital-block">
                                        <span className="sub-label">Volume Dispensed</span>
                                        <div className="readout-value">
                                            <span id="burette-val">0.00</span> <small>cm³</small>
                                        </div>
                                        <div className="flask-summary">
                                            <div>
                                                Flask Vol: <strong id="flask-vol-val">0.0</strong> cm³
                                            </div>
                                            <div>
                                                Target Titre: <strong>24.80 cm³</strong>
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        className="meniscus-loupe"
                                        title="Live Optical Meniscus Zoom"
                                    >
                                        <div className="loupe-label">MENISCUS</div>
                                        <div className="loupe-tube">
                                            <div className="loupe-ticks">
                                                <span id="tick-top">0.0</span>
                                                <span id="tick-mid">0.00</span>
                                                <span id="tick-bot">0.5</span>
                                            </div>
                                            <div className="loupe-water">
                                                <div className="meniscus-curve"></div>
                                            </div>
                                            <div className="loupe-redline"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Universal Dynamic Instrument Readout (Experiments 2–12) */}
                                <div
                                    id="dynamic-instrument-widget"
                                    className={isTitration ? 'hidden' : ''}
                                ></div>
                            </div>

                            {/* TAB 2: Procedure Checklist */}
                            <div id="tab-progress" className="tab-pane">
                                <div className="pane-title">KCSE Procedure Checklist</div>
                                <ul className="step-list" id="step-checklist"></ul>
                            </div>

                            {/* TAB 3: 3D Camera Controls & Presets */}
                            <div id="tab-camera" className="tab-pane">
                                <div className="pane-title">Camera Snap Angles</div>
                                <div id="cam-preset-grid" className="cam-preset-grid">
                                    <button id="cam-bench" className="btn-cam active">
                                        Full Bench View
                                    </button>
                                    {isTitration && (
                                        <>
                                            <button id="cam-meniscus" className="btn-cam">
                                                Zoom Burette Scale
                                            </button>
                                            <button id="cam-flask" className="btn-cam">
                                                Zoom Conical Flask
                                            </button>
                                        </>
                                    )}
                                </div>

                                <div className="pane-title" style={{ marginTop: '18px' }}>
                                    Mouse 3D Orbit Controls
                                </div>
                                <div className="hint-list">
                                    <div className="hint-row">
                                        <kbd>Left Drag</kbd> <span>Orbit 360° around Lab</span>
                                    </div>
                                    <div className="hint-row">
                                        <kbd>Scroll</kbd> <span>Zoom In / Out</span>
                                    </div>
                                    <div className="hint-row">
                                        <kbd>Right Drag</kbd> <span>Pan Camera</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </aside>
            </main>
        </div>
    );
}