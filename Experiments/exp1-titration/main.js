import './style.css';
import { createLabScene } from './src/sceneBuilder.js';
import { TitrationState } from './src/titrationState.js';
import { HudController } from './src/hudController.js';
import { DropletFx } from './src/dropletFx.js';

const container = document.getElementById('canvas-container');
const labScene = createLabScene(container);
const state = new TitrationState();
const fx = new DropletFx(labScene);

function syncAll(snapshot) {
    labScene.syncWithState(snapshot);
    hud.render(snapshot);
}

const hud = new HudController(labScene, {
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
    requestAnimationFrame(animate);
    labScene.updateCamera();
    fx.update();
    hud.update3DLabels();
    labScene.renderer.render(labScene.scene, labScene.camera);
}
animate();