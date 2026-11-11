/**
 * chem-2 — Qualitative Analysis: Inorganic (Cations and Anions)
 * Starter sceneBuilder: sets up the 3D lab room, camera, controls, lights.
 * Paste custom apparatus code below the buildLabRoomAndBench() call.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { buildLabRoomAndBench } from '../shared/labEnvironment.js';

export function createLabScene(container) {
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight - 54;

    const scene = new THREE.Scene();
    buildLabRoomAndBench(scene);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0.15, 1.38, 2.55);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.02, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.minDistance = 0.45;
    controls.maxDistance = 3.1;
    controls.maxPolarAngle = Math.PI / 2 + 0.05;
    controls.update();

    let cameraTransition = null;

    // Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xd6d3cd, 1.15);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffef8, 1.25);
    keyLight.position.set(2.2, 4.2, 3.2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const windowFillLight = new THREE.DirectionalLight(0xe0f2fe, 0.55);
    windowFillLight.position.set(-3.2, 2.2, 1.0);
    scene.add(windowFillLight);

    // ── TODO: Paste custom 3D apparatus for this experiment below ──
    // e.g. test tubes, reagent bottles, spotting tile, etc.

    const labelAnchors = [];

    function syncWithState(snapshot) {
        // TODO: update 3D apparatus visuals based on experiment state
    }

    function setCameraPreset(presetName) {
        let targetPos, targetLook;
        if (presetName === 'bench') {
            targetPos = new THREE.Vector3(0.15, 1.38, 2.55);
            targetLook = new THREE.Vector3(0, 1.02, 0);
        }
        if (targetPos && targetLook) {
            cameraTransition = { targetPos, targetLook, framesLeft: 38 };
        }
    }

    function updateCamera() {
        if (cameraTransition) {
            camera.position.lerp(cameraTransition.targetPos, 0.12);
            controls.target.lerp(cameraTransition.targetLook, 0.12);
            cameraTransition.framesLeft--;
            if (cameraTransition.framesLeft <= 0) cameraTransition = null;
        }
        controls.update();
    }

    function handleResize() {
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight - 54;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    }
    window.addEventListener('resize', handleResize);

    function cleanup() {
        window.removeEventListener('resize', handleResize);
        if (controls && controls.dispose) controls.dispose();
        if (renderer) {
            renderer.dispose();
            if (renderer.domElement && renderer.domElement.parentNode) {
                renderer.domElement.parentNode.removeChild(renderer.domElement);
            }
        }
    }

    return {
        scene, camera, renderer, controls,
        labelAnchors, syncWithState, setCameraPreset, updateCamera, cleanup,
    };
}
