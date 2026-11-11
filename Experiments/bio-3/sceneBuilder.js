import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { buildLabRoomAndBench } from '../shared/labEnvironment.js';

/**
 * BIO-3: Osmosis in Plant Tissue and Visking Tubing
 * Starter scene: shared lab room + workbench ready for custom apparatus.
 * TODO: Replace placeholder with real apparatus code.
 */
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

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xd6d3cd, 1.15);
    scene.add(hemiLight);
    const keyLight = new THREE.DirectionalLight(0xfffef8, 1.25);
    keyLight.position.set(2.2, 4.2, 3.2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xe0f2fe, 0.55);
    fillLight.position.set(-3.2, 2.2, 1.0);
    scene.add(fillLight);

    // ── PLACEHOLDER APPARATUS ─────────────────────────────────────────────
    // TODO: Replace with BIO-3 apparatus:
    //   – 6 beakers (sucrose gradient 0–1 mol/dm³)
    //   - Potato cylinders on a tile
    //   - Cork borer + scalpel + ruler
    //   - Balance for massing cylinders
    // ─────────────────────────────────────────────────────────────────────
    const placeholderMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5 });
    const placeholder = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), placeholderMat);
    placeholder.position.set(0, 0.55, 0);
    placeholder.castShadow = true;
    scene.add(placeholder);

    const labelAnchors = [
        { id: 'placeholder', title: 'BIO-3 — Osmosis in Plant Tissue and Visking Tubing', sub: 'Paste apparatus code here', pos: new THREE.Vector3(0.1, 0.72, 0) },
    ];

    function syncWithState(snapshot) {
        // TODO: wire visual state to experiment snapshot
    }

    function setCameraPreset(presetName) {
        let targetPos, targetLook;
        if (presetName === 'bench') {
            targetPos = new THREE.Vector3(0.15, 1.38, 2.55);
            targetLook = new THREE.Vector3(0, 1.02, 0);
        } else if (presetName === 'flask') {
            targetPos = new THREE.Vector3(0, 0.86, 0.92);
            targetLook = new THREE.Vector3(0, 0.66, 0);
        }
        if (targetPos) cameraTransition = { targetPos, targetLook, framesLeft: 38 };
    }

    function updateCamera() {
        if (cameraTransition) {
            camera.position.lerp(cameraTransition.targetPos, 0.12);
            controls.target.lerp(cameraTransition.targetLook, 0.12);
            if (--cameraTransition.framesLeft <= 0) cameraTransition = null;
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
        controls.dispose();
        renderer.dispose();
        renderer.domElement?.parentNode?.removeChild(renderer.domElement);
    }

    return { scene, camera, renderer, controls, labelAnchors, syncWithState, setCameraPreset, updateCamera, cleanup };
}