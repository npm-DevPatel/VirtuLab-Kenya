'use client';

/**
 * VirtuLab Kenya — Universal 3D Lab Shell
 * =========================================
 * A single component that powers ALL 12 KCSE interactive experiments.
 *
 * Usage:
 *   <LabShell experiment={experiment} onExit={handleExit} />
 *
 * Where `experiment` is one of the objects exported from lib/experiments.js.
 *
 * The shell dynamically imports three modules from the experiment's folder:
 *   @/Experiments/<experiment.id>/sceneBuilder.js  → createLabScene()
 *   @/Experiments/<experiment.id>/state.js          → ExperimentState class
 *   @/Experiments/<experiment.id>/fx.js             → ExperimentFx class
 *
 * The shared Kenyan school lab room is loaded once via
 *   @/Experiments/shared/labEnvironment.js (called inside each sceneBuilder)
 *
 * CSS is loaded from @/Experiments/shared/labShell.css which uses the
 * .lab-shell-root scope (identical to .exp1-root for chem-1 compatibility).
 */

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { getExperiment } from '@/lib/experiments.js';

import '@/Experiments/shared/labShell.css';

// ── Paper badge text per experiment ────────────────────────────────────────
const PAPER_BADGE = {
    'titration':             'KCSE 233/3',
    'chem-1':                'KCSE 233/3',
    'qualitative-inorganic': 'KCSE 233/3',
    'chem-2':                'KCSE 233/3',
    'qualitative-organic':   'KCSE 233/3',
    'chem-3':                'KCSE 233/3',
    'thermochemistry':       'KCSE 233/3',
    'chem-4':                'KCSE 233/3',
    'ohms-law':              'KCSE 232/3',
    'phys-1':                'KCSE 232/3',
    'convex-lenses':         'KCSE 232/3',
    'phys-2':                'KCSE 232/3',
    'simple-pendulum':       'KCSE 232/3',
    'phys-3':                'KCSE 232/3',
    'hookes-law':            'KCSE 232/3',
    'phys-4':                'KCSE 232/3',
    'food-tests':            'KCSE 231/3',
    'bio-1':                 'KCSE 231/3',
    'enzyme-activity':       'KCSE 231/3',
    'bio-2':                 'KCSE 231/3',
    'osmosis':               'KCSE 231/3',
    'bio-3':                 'KCSE 231/3',
    'dichotomous-keys':      'KCSE 231/3',
    'bio-4':                 'KCSE 231/3',
};

// ── Experiment number within its subject (1–4) ──────────────────────────────
const EXP_NUMBER = {
    'titration':             1,
    'chem-1':                1,
    'qualitative-inorganic': 2,
    'chem-2':                2,
    'qualitative-organic':   3,
    'chem-3':                3,
    'thermochemistry':       4,
    'chem-4':                4,
    'ohms-law':              1,
    'phys-1':                1,
    'convex-lenses':         2,
    'phys-2':                2,
    'simple-pendulum':       3,
    'phys-3':                3,
    'hookes-law':            4,
    'phys-4':                4,
    'food-tests':            1,
    'bio-1':                 1,
    'enzyme-activity':       2,
    'bio-2':                 2,
    'osmosis':               3,
    'bio-3':                 3,
    'dichotomous-keys':      4,
    'bio-4':                 4,
};

// ── Dynamic module loaders ───────────────────────────────────────────────────
// Next.js requires static-ish import() strings for tree-shaking.
// We map both canonical experiment IDs and KCSE codes (chem-1..bio-4).
const SCENE_LOADERS = {
    'titration':             () => import('@/Experiments/titration/sceneBuilder.js'),
    'chem-1':                () => import('@/Experiments/chem-1/sceneBuilder.js'),
    'qualitative-inorganic': () => import('@/Experiments/qualitative-inorganic/sceneBuilder.js'),
    'chem-2':                () => import('@/Experiments/chem-2/sceneBuilder.js'),
    'qualitative-organic':   () => import('@/Experiments/qualitative-organic/sceneBuilder.js'),
    'chem-3':                () => import('@/Experiments/chem-3/sceneBuilder.js'),
    'thermochemistry':       () => import('@/Experiments/thermochemistry/sceneBuilder.js'),
    'chem-4':                () => import('@/Experiments/chem-4/sceneBuilder.js'),
    'ohms-law':              () => import('@/Experiments/ohms-law/sceneBuilder.js'),
    'phys-1':                () => import('@/Experiments/phys-1/sceneBuilder.js'),
    'convex-lenses':         () => import('@/Experiments/convex-lenses/sceneBuilder.js'),
    'phys-2':                () => import('@/Experiments/phys-2/sceneBuilder.js'),
    'simple-pendulum':       () => import('@/Experiments/simple-pendulum/sceneBuilder.js'),
    'phys-3':                () => import('@/Experiments/phys-3/sceneBuilder.js'),
    'hookes-law':            () => import('@/Experiments/hookes-law/sceneBuilder.js'),
    'phys-4':                () => import('@/Experiments/phys-4/sceneBuilder.js'),
    'food-tests':            () => import('@/Experiments/food-tests/sceneBuilder.js'),
    'bio-1':                 () => import('@/Experiments/bio-1/sceneBuilder.js'),
    'enzyme-activity':       () => import('@/Experiments/enzyme-activity/sceneBuilder.js'),
    'bio-2':                 () => import('@/Experiments/bio-2/sceneBuilder.js'),
    'osmosis':               () => import('@/Experiments/osmosis/sceneBuilder.js'),
    'bio-3':                 () => import('@/Experiments/bio-3/sceneBuilder.js'),
    'dichotomous-keys':      () => import('@/Experiments/dichotomous-keys/sceneBuilder.js'),
    'bio-4':                 () => import('@/Experiments/bio-4/sceneBuilder.js'),
};

const STATE_LOADERS = {
    'titration':             () => import('@/Experiments/titration/state.js'),
    'chem-1':                () => import('@/Experiments/chem-1/state.js'),
    'qualitative-inorganic': () => import('@/Experiments/qualitative-inorganic/state.js'),
    'chem-2':                () => import('@/Experiments/chem-2/state.js'),
    'qualitative-organic':   () => import('@/Experiments/qualitative-organic/state.js'),
    'chem-3':                () => import('@/Experiments/chem-3/state.js'),
    'thermochemistry':       () => import('@/Experiments/thermochemistry/state.js'),
    'chem-4':                () => import('@/Experiments/chem-4/state.js'),
    'ohms-law':              () => import('@/Experiments/ohms-law/state.js'),
    'phys-1':                () => import('@/Experiments/phys-1/state.js'),
    'convex-lenses':         () => import('@/Experiments/convex-lenses/state.js'),
    'phys-2':                () => import('@/Experiments/phys-2/state.js'),
    'simple-pendulum':       () => import('@/Experiments/simple-pendulum/state.js'),
    'phys-3':                () => import('@/Experiments/phys-3/state.js'),
    'hookes-law':            () => import('@/Experiments/hookes-law/state.js'),
    'phys-4':                () => import('@/Experiments/phys-4/state.js'),
    'food-tests':            () => import('@/Experiments/food-tests/state.js'),
    'bio-1':                 () => import('@/Experiments/bio-1/state.js'),
    'enzyme-activity':       () => import('@/Experiments/enzyme-activity/state.js'),
    'bio-2':                 () => import('@/Experiments/bio-2/state.js'),
    'osmosis':               () => import('@/Experiments/osmosis/state.js'),
    'bio-3':                 () => import('@/Experiments/bio-3/state.js'),
    'dichotomous-keys':      () => import('@/Experiments/dichotomous-keys/state.js'),
    'bio-4':                 () => import('@/Experiments/bio-4/state.js'),
};

const FX_LOADERS = {
    'titration':             () => import('@/Experiments/titration/fx.js'),
    'chem-1':                () => import('@/Experiments/chem-1/fx.js'),
    'qualitative-inorganic': () => import('@/Experiments/qualitative-inorganic/fx.js'),
    'chem-2':                () => import('@/Experiments/chem-2/fx.js'),
    'qualitative-organic':   () => import('@/Experiments/qualitative-organic/fx.js'),
    'chem-3':                () => import('@/Experiments/chem-3/fx.js'),
    'thermochemistry':       () => import('@/Experiments/thermochemistry/fx.js'),
    'chem-4':                () => import('@/Experiments/chem-4/fx.js'),
    'ohms-law':              () => import('@/Experiments/ohms-law/fx.js'),
    'phys-1':                () => import('@/Experiments/phys-1/fx.js'),
    'convex-lenses':         () => import('@/Experiments/convex-lenses/fx.js'),
    'phys-2':                () => import('@/Experiments/phys-2/fx.js'),
    'simple-pendulum':       () => import('@/Experiments/simple-pendulum/fx.js'),
    'phys-3':                () => import('@/Experiments/phys-3/fx.js'),
    'hookes-law':            () => import('@/Experiments/hookes-law/fx.js'),
    'phys-4':                () => import('@/Experiments/phys-4/fx.js'),
    'food-tests':            () => import('@/Experiments/food-tests/fx.js'),
    'bio-1':                 () => import('@/Experiments/bio-1/fx.js'),
    'enzyme-activity':       () => import('@/Experiments/enzyme-activity/fx.js'),
    'bio-2':                 () => import('@/Experiments/bio-2/fx.js'),
    'osmosis':               () => import('@/Experiments/osmosis/fx.js'),
    'bio-3':                 () => import('@/Experiments/bio-3/fx.js'),
    'dichotomous-keys':      () => import('@/Experiments/dichotomous-keys/fx.js'),
    'bio-4':                 () => import('@/Experiments/bio-4/fx.js'),
};

// ── HudController loader (shared across all experiments) ────────────────────
function loadHudController() {
    return import('@/Experiments/shared/hudController.js');
}

export default function LabShell({ experiment, expId: expIdProp, onExit }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const containerRef = useRef(null);

    const exp = experiment || getExperiment(expIdProp);
    const expId = exp?.id || expIdProp || 'titration';

    // Guard: redirect unauthenticated users
    useEffect(() => {
        if (!loading && !user && exp) {
            router.push(`/login?redirect=/experiments/${exp.id}?lab=true`);
        }
    }, [user, loading, router, exp]);

    // ── 3D scene bootstrap ─────────────────────────────────────────────────
    useEffect(() => {
        if (loading || !user || !containerRef.current || !exp) return;

        const container = containerRef.current;
        let animId;
        let labScene, state, fx, hud;

        (async () => {
            const loaderKey = SCENE_LOADERS[exp.id] ? exp.id : (exp.code || expId);

            const [sceneModule, stateModule, fxModule, hudModule] = await Promise.all([
                SCENE_LOADERS[loaderKey]?.(),
                STATE_LOADERS[loaderKey]?.(),
                FX_LOADERS[loaderKey]?.(),
                loadHudController(),
            ]);

            if (!sceneModule) {
                console.error(`[LabShell] No sceneBuilder found for experiment id: ${expId}`);
                return;
            }

            const { createLabScene } = sceneModule;
            const StateClass = stateModule?.ExperimentState || stateModule?.TitrationState;
            const FxClass    = fxModule?.ExperimentFx    || fxModule?.DropletFx;
            const { HudController } = hudModule;

            labScene = createLabScene(container);
            state    = StateClass ? new StateClass() : null;
            fx       = FxClass    ? new FxClass(labScene) : null;

            function syncAll(snapshot) {
                labScene.syncWithState(snapshot);
                if (hud && hud.render) hud.render(snapshot);
            }

            // Build callbacks for HudController — titration-specific ones are
            // wired fully; for other experiments they are no-ops until apparatus
            // code is pasted in.
            const callbacks = {
                // ── chem-1 (titration) specific ─────────────────────────────
                onConfirmStep1: (done) => {
                    if (!state || !fx) return;
                    labScene.setCameraPreset('bench');
                    hud?.setCameraButtonUI?.('bench');
                    fx.playPipetteTransfer?.(() => {
                        const snap = state.confirmStep1?.() || state.getSnapshot();
                        syncAll(snap);
                        labScene.setCameraPreset('flask');
                        hud?.setCameraButtonUI?.('flask');
                        done?.();
                    });
                },
                onAddIndicator: (done) => {
                    if (!state || !fx) return;
                    labScene.setCameraPreset('flask');
                    hud?.setCameraButtonUI?.('flask');
                    fx.playIndicatorDropper?.(() => {
                        fx.triggerSwirl?.();
                        const snap = state.addIndicator?.() || state.getSnapshot();
                        syncAll(snap);
                        setTimeout(() => {
                            labScene.setCameraPreset('meniscus');
                            hud?.setCameraButtonUI?.('meniscus');
                            done?.();
                        }, 650);
                    });
                },
                onConfirmMeniscus: () => {
                    const snap = state?.confirmMeniscus?.() || state?.getSnapshot();
                    labScene.setCameraPreset('bench');
                    hud?.setCameraButtonUI?.('bench');
                    if (snap) syncAll(snap);
                },
                onStreamAcid: () => {
                    fx?.showStream?.();
                    const snap = state?.dispenseAcid?.(0.35) || state?.getSnapshot();
                    if (snap) syncAll(snap);
                },
                onDropAcid: () => {
                    fx?.spawnDrop?.('acid', 1);
                    const snap = state?.dispenseAcid?.(0.05) || state?.getSnapshot();
                    if (snap) syncAll(snap);
                },
                onSwirlFlask: () => fx?.triggerSwirl?.(),
                onFinishTitration: () => {
                    const snap = state?.finishTitration?.() || state?.getSnapshot();
                    labScene.setCameraPreset('flask');
                    hud?.setCameraButtonUI?.('flask');
                    if (snap) syncAll(snap);
                },

                // ── Generic step progression (all other experiments) ──────────
                onNextStep: () => {
                    const snap = state?.nextStep?.() || state?.getSnapshot();
                    if (snap) syncAll(snap);
                },

                // ── Universal controls ────────────────────────────────────────
                onReset: () => {
                    state?.reset?.();
                    const snap = state?.getSnapshot();
                    labScene.setCameraPreset('bench');
                    hud?.setCameraButtonUI?.('bench');
                    if (snap) syncAll(snap);
                },
                onSelectCamera: (preset) => labScene.setCameraPreset(preset),
            };

            hud = HudController ? new HudController(labScene, callbacks) : null;

            // Initial sync
            const initialSnap = state?.getSnapshot();
            if (initialSnap) syncAll(initialSnap);

            // Animation loop
            function animate() {
                animId = requestAnimationFrame(animate);
                labScene.updateCamera();
                fx?.update?.();
                hud?.update3DLabels?.();
                labScene.renderer.render(labScene.scene, labScene.camera);
            }
            animate();
        })();

        return () => {
            if (animId) cancelAnimationFrame(animId);
            hud?.cleanup?.();
            hud?.dispose?.();
            labScene?.cleanup?.();
        };
    }, [user, loading, exp]);

    if (loading || !user || !exp) return null;

    const badge     = exp.paper || PAPER_BADGE[exp.id] || exp.subject || 'KCSE';
    const expNumber = exp.number ?? EXP_NUMBER[exp.id] ?? 1;
    const expTitle  = exp.title;

    return (
        <div id="app" className="lab-shell-root exp1-root">
            {/* ── Top Navigation Bar ──────────────────────────────────────── */}
            <header className="lab-header">
                <div className="header-left">
                    {onExit ? (
                        <button type="button" className="btn-exit" onClick={onExit}>
                            ← Back to Catalogue
                        </button>
                    ) : (
                        <Link href="/experiments" className="btn-exit">
                            ← Back to Catalogue
                        </Link>
                    )}
                    <div className="header-divider" />
                    <span className="badge">{badge}</span>
                    <h1>EXP {expNumber}: {expTitle}</h1>
                </div>

                <div className="header-right">
                    <button
                        id="btn-toggle-labels"
                        className="btn-nav-tool active"
                        title="Show/Hide 3D Apparatus Names"
                    >
                        <span className="dot-indicator" /> 3D Labels: ON
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

            {/* ── Main Split Workspace ─────────────────────────────────────── */}
            <main id="workspace" className="workspace dock-right">
                {/* 3D Viewport */}
                <div id="canvas-container" ref={containerRef} className="canvas-stage">
                    <div id="labels-layer" className="labels-layer" />

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
                    {/* TOP HALF: Active Step + Action Buttons */}
                    <section className="sidebar-top-steps">
                        <div className="step-header-row">
                            <span id="step-counter" className="step-tag">
                                STEP 1 OF {exp.procedure?.length ?? '?'}
                            </span>
                            <span id="endpoint-badge" className="status-pill status-neutral">
                                Ready
                            </span>
                        </div>

                        <h2 id="step-title">
                            {exp.procedure?.[0]
                                ? exp.procedure[0].slice(0, 60) + '…'
                                : 'Loading…'}
                        </h2>
                        <p id="step-instruction">
                            {exp.procedure?.[0] ?? ''}
                        </p>

                        <div className="step-actions">
                            {/* chem-1 titration-specific buttons — hidden for other experiments
                                by HudController; starter state for others gets "Next Step" */}
                            <button id="btn-step1" className="btn-primary full-width">
                                Pipette 25.0 cm³ NaOH into Flask →
                            </button>
                            <button
                                id="btn-step2"
                                className="btn-primary btn-pink full-width hidden"
                            >
                                Add 3 Drops Phenolphthalein →
                            </button>
                            <button
                                id="btn-step3"
                                className="btn-primary full-width hidden"
                            >
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
                    </section>

                    {/* BOTTOM HALF: Segmented Tabs */}
                    <section className="sidebar-bottom-tabs">
                        <nav className="tab-icon-bar" role="tablist">
                            <button
                                className="tab-btn active"
                                data-tab="tab-burette"
                                title="Instrument Readout"
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 2v17a3 3 0 0 0 6 0V2" />
                                    <line x1="7" y1="2" x2="17" y2="2" />
                                    <line x1="9" y1="12" x2="15" y2="12" />
                                </svg>
                                <span>Instrument</span>
                            </button>

                            <button
                                className="tab-btn"
                                data-tab="tab-progress"
                                title="Procedure Progress"
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                    <circle cx="12" cy="13" r="4" />
                                </svg>
                                <span>3D View</span>
                            </button>
                        </nav>

                        <div className="tab-panels">
                            {/* TAB 1: Instrument Readout + Meniscus Loupe */}
                            <div id="tab-burette" className="tab-pane active">
                                <div className="pane-title">Instrument Readout</div>
                                <div className="burette-widget">
                                    <div className="digital-block">
                                        <span className="sub-label">Volume Dispensed</span>
                                        <div className="readout-value">
                                            <span id="burette-val">0.00</span>{' '}
                                            <small>cm³</small>
                                        </div>
                                        <div className="flask-summary">
                                            <div>
                                                Flask Vol:{' '}
                                                <strong id="flask-vol-val">0.0</strong> cm³
                                            </div>
                                            <div>
                                                Target Titre: <strong>24.80 cm³</strong>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="meniscus-loupe" title="Live Optical Meniscus Zoom">
                                        <div className="loupe-label">MENISCUS</div>
                                        <div className="loupe-tube">
                                            <div className="loupe-ticks">
                                                <span id="tick-top">0.0</span>
                                                <span id="tick-mid">0.00</span>
                                                <span id="tick-bot">0.5</span>
                                            </div>
                                            <div className="loupe-water">
                                                <div className="meniscus-curve" />
                                            </div>
                                            <div className="loupe-redline" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* TAB 2: Procedure Checklist */}
                            <div id="tab-progress" className="tab-pane">
                                <div className="pane-title">KCSE Procedure Checklist</div>
                                <ul className="step-list" id="step-checklist">
                                    {(exp.procedure || []).map((step, i) => (
                                        <li key={i} data-step={i + 1} className={i === 0 ? 'active' : ''}>
                                            {i + 1}. {step.slice(0, 70)}{step.length > 70 ? '…' : ''}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* TAB 3: 3D Camera Controls */}
                            <div id="tab-camera" className="tab-pane">
                                <div className="pane-title">Camera Snap Angles</div>
                                <div className="cam-preset-grid">
                                    <button id="cam-bench" className="btn-cam active">
                                        Full Bench View
                                    </button>
                                    <button id="cam-meniscus" className="btn-cam">
                                        Zoom Instrument Scale
                                    </button>
                                    <button id="cam-flask" className="btn-cam">
                                        Zoom Flask / Sample
                                    </button>
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

