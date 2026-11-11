import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { buildLabRoomAndBench } from '../shared/labEnvironment.js';

/**
 * CHEM-2: Qualitative Analysis — Cations & Anions
 * Starter scene: shared lab room + workbench ready for custom apparatus.
 * Replace the placeholder apparatus below with the real inorganic analysis setup.
 */
export function createLabScene(container) {
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight - 54;

    // Scene + Shared Lab Room & Workbench
    const scene = new THREE.Scene();
    buildLabRoomAndBench(scene);

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0.15, 1.38, 2.55);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    container.appendChild(renderer.domElement);

    // OrbitControls
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
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe0f2fe, 0.55);
    fillLight.position.set(-3.2, 2.2, 1.0);
    scene.add(fillLight);

    // ── PLACEHOLDER APPARATUS ──────────────────────────────────────────────
    // TODO: Replace with chem-2 inorganic analysis apparatus:
    //   – Test tube rack with 6 test tubes
    //   – Dropping bottles (NaOH, NH₃, HCl, BaCl₂, AgNO₃)
    //   – Spotting tile / white tile
    //   – Unknown sample beaker
    // ──────────────────────────────────────────────────────────────────────
    const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xcbd5e1, transparent: true, opacity: 0.34,
        roughness: 0.08, metalness: 0.08, reflectivity: 0.9,
        depthWrite: false, side: THREE.DoubleSide,
    });

    // Simple test tube rack placeholder (3 tubes)
    const rackMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
    const rackBase = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.025, 0.12), rackMat);
    rackBase.position.set(0, 0.512, 0);
    rackBase.receiveShadow = true;
    scene.add(rackBase);

    for (let i = 0; i < 3; i++) {
        const tube = new THREE.Mesh(
            new THREE.CylinderGeometry(0.018, 0.018, 0.14, 20, 1, true),
            glassMat
        );
        tube.position.set(-0.14 + i * 0.14, 0.59, 0);
        tube.renderOrder = 2;
        scene.add(tube);
    }

    // 3D Label Anchors
    const labelAnchors = [
        { id: 'rack', title: 'Test Tube Rack', sub: 'Chem-2: Inorganic Analysis', pos: new THREE.Vector3(0, 0.75, 0) },
    ];

    function syncWithState(snapshot) {
        // TODO: wire up to state changes (colour tube liquid, show precipitates, etc.)
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
        if (targetPos) {
            cameraTransition = { targetPos, targetLook, framesLeft: 38 };
        }
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

    return {
        scene, camera, renderer, controls,
        labelAnchors, syncWithState, setCameraPreset, updateCamera, cleanup,
    };
}

