'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import '@/Experiments/exp1-titration/style.css';
import { createLabScene } from '@/Experiments/exp1-titration/src/sceneBuilder.js';
import { TitrationState } from '@/Experiments/exp1-titration/src/titrationState.js';
import { HudController } from '@/Experiments/exp1-titration/src/hudController.js';
import { DropletFx } from '@/Experiments/exp1-titration/src/dropletFx.js';
import { useAuth } from '@/components/AuthProvider';

export default function Exp1Titration({ onExit }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading || !user) return;

    const container = document.getElementById('canvas-container');
    if (!container) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    let animId;
    let labScene = null;
    let hud = null;

    try {
      labScene = createLabScene(container);
      const state = new TitrationState();
      const fx = new DropletFx(labScene);

      function syncAll(snapshot) {
        labScene.syncWithState(snapshot);
        hud.render(snapshot);
      }

      hud = new HudController(labScene, {
        // Step 1: Animated Pipette Transfer from NaOH Beaker into Conical Flask
        onConfirmStep1: (doneCallback) => {
          labScene.setCameraPreset('bench');
          hud.setCameraButtonUI('bench');
          fx.playPipetteTransfer(() => {
            const snap = state.confirmStep1();
            syncAll(snap);
            labScene.setCameraPreset('flask');
            hud.setCameraButtonUI('flask');
            if (doneCallback) doneCallback();
          });
        },

        // Step 2: Animated Dropper Transfer of Phenolphthalein Indicator
        onAddIndicator: (doneCallback) => {
          labScene.setCameraPreset('flask');
          hud.setCameraButtonUI('flask');
          fx.playIndicatorDropper(() => {
            fx.triggerSwirl();
            const snap = state.addIndicator();
            syncAll(snap);
            setTimeout(() => {
              labScene.setCameraPreset('meniscus');
              hud.setCameraButtonUI('meniscus');
              if (doneCallback) doneCallback();
            }, 650);
          });
        },

        // Step 3: Confirm 0.00 cm³ Meniscus Reading
        onConfirmMeniscus: () => {
          const snap = state.confirmMeniscus();
          labScene.setCameraPreset('bench');
          hud.setCameraButtonUI('bench');
          syncAll(snap);
        },

        // Step 4A: Fast Stream (Hold or Click)
        onStreamAcid: () => {
          fx.showStream();
          const snap = state.dispenseAcid(0.35);
          syncAll(snap);
        },

        // Step 4B: Single Dropwise Addition (+0.05 cm³)
        onDropAcid: () => {
          fx.spawnDrop('acid', 1);
          const snap = state.dispenseAcid(0.05);
          syncAll(snap);
        },

        // Step 4C: Swirl Conical Flask
        onSwirlFlask: () => {
          fx.triggerSwirl();
        },

        // Step 5: Record Final Titre
        onFinishTitration: () => {
          const snap = state.finishTitration();
          labScene.setCameraPreset('flask');
          hud.setCameraButtonUI('flask');
          syncAll(snap);
        },

        // Reset Experiment
        onReset: () => {
          state.reset();
          const snap = state.getSnapshot();
          labScene.setCameraPreset('bench');
          hud.setCameraButtonUI('bench');
          syncAll(snap);
        },

        onSelectCamera: (preset) => {
          labScene.setCameraPreset(preset);
        },
      });

      // Initial Sync
      syncAll(state.getSnapshot());

      // Main Render & Animation Loop
      function animate() {
        animId = requestAnimationFrame(animate);
        labScene.updateCamera();
        fx.update();
        hud.update3DLabels();
        labScene.renderer.render(labScene.scene, labScene.camera);
      }
      animate();
    } catch (err) {
      console.error('Failed to initialize 3D Lab Scene:', err);
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      if (animId) cancelAnimationFrame(animId);
      if (hud && hud.dispose) hud.dispose();
      if (labScene && labScene.dispose) labScene.dispose();
    };
  }, [user, loading]);

  // Auth Safeguard Check
  if (loading) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: '#0f172a',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          gap: '16px',
        }}
      >
        <p style={{ fontSize: '18px', fontWeight: 500 }}>Loading 3D Laboratory...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: '#0f172a',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            maxWidth: '460px',
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '36px 32px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(13, 148, 136, 0.15)',
              color: '#2dd4bf',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '22px',
            }}
          >
            🔒
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '10px', color: '#f8fafc' }}>
            Authentication Required
          </h2>
          <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '24px' }}>
            You must be logged in with a VirtuLab Kenya account to access the interactive 3D laboratory workspace.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link
              href="/login?redirect=/experiments/titration?lab=true"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0d9488',
                color: '#ffffff',
                padding: '10px 20px',
                borderRadius: '6px',
                fontWeight: 600,
                textDecoration: 'none',
                fontSize: '14px',
              }}
            >
              Log in to Launch 3D Lab
            </Link>
            <Link
              href="/experiments"
              onClick={(e) => {
                if (onExit) {
                  e.preventDefault();
                  onExit();
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                color: '#94a3b8',
                padding: '8px 16px',
                fontSize: '13px',
                textDecoration: 'none',
              }}
            >
              ← Back to Catalogue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="app">
      {/* Top Navigation Bar */}
      <header className="lab-header">
        <div className="header-left">
          <Link
            href="/experiments"
            onClick={(e) => {
              if (onExit) {
                e.preventDefault();
                onExit();
              }
            }}
            className="btn-outline"
            title="Exit simulation back to experiment catalogue"
          >
            ← Back to Catalogue
          </Link>
          <span className="badge">KCSE 233/3</span>
          <h1>EXP 1: Volumetric Analysis (Acid–Base Titration)</h1>
        </div>

        <div className="header-right">
          <button id="btn-toggle-labels" className="btn-chip active" title="Show/Hide 3D Apparatus Names">
            <span className="dot-indicator"></span> 3D Labels: ON
          </button>
          <button id="btn-swap-side" className="btn-outline" title="Move Sidebar Left or Right">
            ⇄ Dock Left / Right
          </button>
          <button id="btn-reset" className="btn-outline">Reset Lab</button>
        </div>
      </header>

      {/* Main Split Workspace: Pure 3D View + Unified Sidebar */}
      <main id="workspace" className="workspace dock-right">
        {/* 100% Uncluttered 3D Viewport */}
        <div id="canvas-container" className="canvas-stage">
          <div id="labels-layer" className="labels-layer"></div>

          {/* Floating Sidebar Collapse/Expand Tab */}
          <button id="btn-collapse-sidebar" className="sidebar-toggle-fab" title="Collapse / Expand Sidebar">
            ☰ Lab Panel
          </button>
        </div>

        {/* Unified Lab Sidebar */}
        <aside id="lab-sidebar" className="lab-sidebar">
          {/* TOP HALF: Locked Active Experiment Steps & Actions */}
          <section className="sidebar-top-steps">
            <div className="step-header-row">
              <span id="step-counter" className="step-tag">STEP 1 OF 5</span>
              <span id="endpoint-badge" className="status-pill status-neutral">Flask Empty</span>
            </div>

            <h2 id="step-title">Pipette 25.0 cm³ of 0.1M NaOH</h2>
            <p id="step-instruction">
              Draw 25.0 cm³ of Sodium Hydroxide (Solution B) from the beaker using the volumetric pipette and transfer it
              into the conical flask on the white tile.
            </p>

            {/* Step Action Buttons */}
            <div className="step-actions">
              <button id="btn-step1" className="btn-primary full-width">
                Pipette 25.0 cm³ NaOH into Flask →
              </button>

              <button id="btn-step2" className="btn-primary btn-pink full-width hidden">
                Add 3 Drops Phenolphthalein →
              </button>

              <button id="btn-step3" className="btn-primary full-width hidden">
                Confirm 0.00 cm³ Meniscus Level →
              </button>

              <div id="titration-controls" className="titration-grid hidden">
                <button id="btn-stream" className="btn-action" title="Hold down for continuous stream">
                  Hold: Fast Stream
                </button>
                <button id="btn-drop" className="btn-accent" title="Add single 0.05 cm³ drop">
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

          {/* BOTTOM HALF: Icon Tabs for Burette Titrant, Progress & 3D Controls */}
          <section className="sidebar-bottom-tabs">
            <nav className="tab-icon-bar" role="tablist">
              <button className="tab-btn active" data-tab="tab-burette" title="Burette Titrant & Meniscus">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 2v17a3 3 0 0 0 6 0V2" />
                  <line x1="7" y1="2" x2="17" y2="2" />
                  <line x1="9" y1="12" x2="15" y2="12" />
                </svg>
                <span>Burette</span>
              </button>

              <button className="tab-btn" data-tab="tab-progress" title="Procedure Progress">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
                <span>Progress</span>
              </button>

              <button className="tab-btn" data-tab="tab-camera" title="3D Camera Controls">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span>3D View</span>
              </button>
            </nav>

            {/* Tab Content Panels */}
            <div className="tab-panels">
              {/* TAB 1: Burette Titrant & Live Meniscus Zoom */}
              <div id="tab-burette" className="tab-pane active">
                <div className="pane-title">Burette Titrant (0.1M HCl)</div>
                <div className="burette-widget">
                  <div className="digital-block">
                    <span className="sub-label">Volume Dispensed</span>
                    <div className="readout-value">
                      <span id="burette-val">0.00</span> <small>cm³</small>
                    </div>
                    <div className="flask-summary">
                      <div>Flask Vol: <strong id="flask-vol-val">0.0</strong> cm³</div>
                      <div>Endpoint: <strong>24.80 cm³</strong></div>
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
                        <div className="meniscus-curve"></div>
                      </div>
                      <div className="loupe-redline"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* TAB 2: Procedure Checklist */}
              <div id="tab-progress" className="tab-pane">
                <div className="pane-title">KCSE Procedure Checklist</div>
                <ul className="step-list" id="step-checklist">
                  <li data-step="1" className="active">1. Pipette 25.0 cm³ NaOH</li>
                  <li data-step="2">2. Add Phenolphthalein</li>
                  <li data-step="3">3. Zero Burette Meniscus</li>
                  <li data-step="4">4. Titrate to End-Point</li>
                  <li data-step="5">5. Record Final Titre</li>
                </ul>
              </div>

              {/* TAB 3: 3D Camera Controls & Presets */}
              <div id="tab-camera" className="tab-pane">
                <div className="pane-title">Camera Snap Angles</div>
                <div className="cam-preset-grid">
                  <button id="cam-bench" className="btn-cam active">Full Bench View</button>
                  <button id="cam-meniscus" className="btn-cam">Zoom Burette Scale</button>
                  <button id="cam-flask" className="btn-cam">Zoom Conical Flask</button>
                </div>

                <div className="pane-title" style={{ marginTop: '14px' }}>Mouse 3D Orbit Controls</div>
                <div className="hint-list">
                  <div className="hint-row"><kbd>Left Drag</kbd> <span>Orbit 360° around Lab</span></div>
                  <div className="hint-row"><kbd>Scroll</kbd> <span>Zoom In / Out</span></div>
                  <div className="hint-row"><kbd>Right Drag</kbd> <span>Pan Camera</span></div>
                </div>
              </div>
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
}

