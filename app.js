// McLaren P1 3D Configurator
// Powered by Three.js & glTF Loader

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// Global variables
let scene, camera, renderer, controls;
let carModel;
let carModelGlb = null;
let carModelObj = null;
let paintParts = [], rimParts = [], caliperParts = [];
let headlights = [], taillights = [];
let wheels = [];
let spoiler = null; // object.009_cb_0 (McLaren active wing)
let mainCeilingLight, keyNeonCyanLight, rimNeonOrangeLight; // Showroom Lights

let dashboardMesh = null;
let dashboardCanvas = null;
let dashboardContext = null;
let dashboardTexture = null;

// Materials configuration
const materials = {
    body: null,
    glass: null,
    rim: null,
    tire: null,
    caliper: null,
    headlight: null,
    taillight: null,
    chrome: null,
    carbon: null,
    brakeDisc: null,
    dashboard: null
};

// UI Toggles & Controls
const modelGlbBtn = document.getElementById('model-glb');
const modelObjBtn = document.getElementById('model-obj');
const colorButtons = document.querySelectorAll('.color-btn');
const finishMetallic = document.getElementById('finish-metallic');
const finishMatte = document.getElementById('finish-matte');
const sliderRoughness = document.getElementById('slider-roughness');
const sliderMetalness = document.getElementById('slider-metalness');
const rimSport = document.getElementById('rim-sport');
const rimAero = document.getElementById('rim-aero');
const caliperButtons = document.querySelectorAll('.caliper-btn');
const spoilerToggle = document.getElementById('spoiler-toggle');
const lightNeonBtn = document.getElementById('light-neon');
const lightStudioBtn = document.getElementById('light-studio');
const lightSunsetBtn = document.getElementById('light-sunset');
const lightsToggle = document.getElementById('lights-toggle');
const btnSpin = document.getElementById('btn-spin');
const btnReset = document.getElementById('btn-reset');
const btnDrive = document.getElementById('btn-drive');
const btnCockpit = document.getElementById('btn-cockpit');
const dashboardControls = document.getElementById('dashboard-controls');
const btnDashMode = document.getElementById('btn-dash-mode');

const loaderContainer = document.getElementById('loader-container');
const progressBar = document.getElementById('progress-bar');
const loaderStatus = document.getElementById('loader-status');

// App state
let config = {
    color: '#ff5a00',
    metallic: true,
    rimFinish: 'stealth', // stealth vs chrome
    caliperColor: '#ffcc00',
    spoilerActive: true,
    lightsActive: true,
    autoRotate: false,
    driveMode: false,
    cockpitView: false,
    trackMode: false
};

let currentSpeed = 0;
let currentRpm = 0;

// Base positions of the spoiler for active aerodynamics animation
let initialSpoilerY = null;
let initialSpoilerZ = null;

function init() {
    // 1. Create Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color('#030305');
    scene.fog = new THREE.FogExp2('#030305', 0.015);

    // 2. Create Camera
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(5.5, 2.0, 5.5);

    // 3. Create WebGL Renderer
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('webgl'), antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    // Setup a basic environment map for reflections
    const environment = new RoomEnvironment();
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(environment).texture;

    // 4. Create Orbit Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.03; // Limit camera from going below ground
    controls.minDistance = 3.5;
    controls.maxDistance = 14;

    // 5. Setup Materials
    setupMaterials();

    // 6. Build Showroom Floor & Stage Grid
    createEnvironment();

    // 7. Setup Advanced Studio Lighting
    setupLighting();

    // 8. Load McLaren P1 GLB Model
    loadModel();

    // 9. Attach Event Listeners
    setupEventListeners();

    // 10. Start Animation Loop
    animate();
}

function setupMaterials() {
    // Premium Metallic paint with Clearcoat reflections
    materials.body = new THREE.MeshStandardMaterial({
        color: new THREE.Color(config.color),
        roughness: 0.12,
        metalness: 0.92,
        clearcoat: 1.0,
        clearcoatRoughness: 0.04,
        envMapIntensity: 2.0
    });

    // Highly reflective dark tinted glass
    materials.glass = new THREE.MeshStandardMaterial({
        color: 0x0a0a0d,
        roughness: 0.02,
        metalness: 0.95,
        transparent: true,
        opacity: 0.90,
        side: THREE.DoubleSide,
        envMapIntensity: 1.5
    });

    // Stealth Matte Black rims
    materials.rim = new THREE.MeshStandardMaterial({
        color: 0x151515,
        roughness: 0.35,
        metalness: 0.8,
        envMapIntensity: 1.5
    });

    // Realistic tire rubber
    materials.tire = new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.72,
        metalness: 0.08
    });

    // Colored brake calipers
    materials.caliper = new THREE.MeshStandardMaterial({
        color: new THREE.Color(config.caliperColor),
        roughness: 0.25,
        metalness: 0.85
    });

    // Xenon white headlights
    materials.headlight = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide
    });

    // McLaren signature taillights
    materials.taillight = new THREE.MeshBasicMaterial({
        color: 0xff003c,
        side: THREE.DoubleSide
    });

    // Brushed metal details (Exhaust, badges)
    materials.chrome = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        roughness: 0.08,
        metalness: 0.95,
        envMapIntensity: 3.0
    });

    // Carbon fiber elements
    materials.carbon = new THREE.MeshStandardMaterial({
        color: 0x141414,
        roughness: 0.45,
        metalness: 0.65
    });

    // Metallic brake discs
    materials.brakeDisc = new THREE.MeshStandardMaterial({
        color: 0x555555,
        roughness: 0.35,
        metalness: 0.9,
        envMapIntensity: 1.5
    });

    // Create offscreen canvas for dashboard
    dashboardCanvas = document.createElement('canvas');
    dashboardCanvas.width = 512;
    dashboardCanvas.height = 256;
    dashboardContext = dashboardCanvas.getContext('2d');

    // Initial draw
    drawDashboard(0, 0, false);

    dashboardTexture = new THREE.CanvasTexture(dashboardCanvas);
    dashboardTexture.colorSpace = THREE.SRGBColorSpace;
    dashboardTexture.minFilter = THREE.LinearFilter;
    dashboardTexture.magFilter = THREE.LinearFilter;

    materials.dashboard = new THREE.MeshBasicMaterial({
        map: dashboardTexture,
        side: THREE.DoubleSide
    });
}

function drawDashboard(speed, rpmPercent, trackMode) {
    const ctx = dashboardContext;
    const w = dashboardCanvas.width;
    const h = dashboardCanvas.height;

    // Clear background
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    // Use scale and translate to flip horizontally and vertically because the UV mapping is inverted
    ctx.translate(w, h);
    ctx.scale(-1, -1);

    if (trackMode) {
        // Track Telemetry Mode
        ctx.fillStyle = '#ff003c';
        ctx.font = 'bold 36px "Courier New", Courier, monospace';
        ctx.textAlign = 'left';
        ctx.fillText('RACE MODE', 20, 40);

        ctx.fillStyle = '#00ffff';
        ctx.font = '24px "Courier New", Courier, monospace';
        ctx.fillText(`GEAR: ${speed > 0 ? Math.ceil(speed / 50) : 'N'}`, 20, 80);
        ctx.fillText(`LAP: 01:24.3`, 20, 110);

        ctx.fillStyle = '#ffaa00';
        ctx.font = '24px "Courier New", Courier, monospace';
        ctx.fillText('G-FORCE', 380, 80);
        ctx.beginPath();
        ctx.arc(420, 140, 40, 0, Math.PI * 2);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 4;
        ctx.stroke();

        // G-force dot
        ctx.beginPath();
        ctx.arc(420 + Math.sin(Date.now() * 0.005) * 15, 140 + Math.cos(Date.now() * 0.003) * 15, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#ffaa00';
        ctx.fill();

        // RPM Bar
        ctx.fillStyle = '#333';
        ctx.fillRect(20, h - 40, w - 40, 20);
        ctx.fillStyle = '#ff003c';
        ctx.fillRect(20, h - 40, (w - 40) * rpmPercent, 20);

        // Speed
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 80px "Courier New", Courier, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.floor(speed)}`, w/2, h/2 + 30);
        ctx.font = '20px "Courier New", Courier, monospace';
        ctx.fillText('KM/H', w/2, h/2 + 60);

    } else {
        // Standard Mode
        ctx.fillStyle = '#ffffff';
        ctx.font = '30px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('COMFORT', 20, 40);

        // RPM Arc
        ctx.beginPath();
        ctx.arc(w/2, h/2 + 20, 80, Math.PI, 0);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 15;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(w/2, h/2 + 20, 80, Math.PI, Math.PI + (Math.PI * rpmPercent));
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 15;
        ctx.stroke();

        // Speed
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.floor(speed)}`, w/2, h/2 + 10);
        ctx.font = '20px Arial';
        ctx.fillText('km/h', w/2, h/2 + 35);

        // Battery/Fuel
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(w - 60, h - 60, 40, 20);
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.fillText('EV', w - 40, h - 25);
    }
    ctx.restore();
}

function createEnvironment() {
    // Showroom floor
    const floorGeo = new THREE.PlaneGeometry(60, 60);
    const floorMat = new THREE.MeshStandardMaterial({
        color: 0x060609,
        roughness: 0.25,
        metalness: 0.85
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Glowing Neon Ring on ground
    const ringGeo = new THREE.RingGeometry(4.2, 4.3, 64);
    const ringMat = new THREE.MeshBasicMaterial({
        color: 0xff5a00,
        side: THREE.DoubleSide
    });
    const glowRing = new THREE.Mesh(ringGeo, ringMat);
    glowRing.rotation.x = -Math.PI / 2;
    glowRing.position.y = 0.003;
    scene.add(glowRing);

    // Showroom grid helper
    const gridHelper = new THREE.GridHelper(30, 30, 0xff5a00, 0x151520);
    gridHelper.position.y = 0.005;
    scene.add(gridHelper);
}

function setupLighting() {
    // Soft overall ambient light
    const ambient = new THREE.HemisphereLight(0x0e0e18, 0x05050a, 0.6);
    scene.add(ambient);

    // Main Studio ceiling light (creates shadows)
    mainCeilingLight = new THREE.DirectionalLight(0xffffff, 2.0);
    mainCeilingLight.position.set(0, 10, 0);
    mainCeilingLight.castShadow = true;
    mainCeilingLight.shadow.mapSize.width = 2048;
    mainCeilingLight.shadow.mapSize.height = 2048;
    mainCeilingLight.shadow.camera.near = 0.5;
    mainCeilingLight.shadow.camera.far = 15;
    mainCeilingLight.shadow.bias = -0.0004;
    scene.add(mainCeilingLight);

    // Futuristic LED Side bars (simulated via directional lighting)
    keyNeonCyanLight = new THREE.DirectionalLight(0x00ffff, 1.2);
    keyNeonCyanLight.position.set(5, 3, -5);
    scene.add(keyNeonCyanLight);

    rimNeonOrangeLight = new THREE.DirectionalLight(0xff5a00, 1.5);
    rimNeonOrangeLight.position.set(-5, 3, 5);
    scene.add(rimNeonOrangeLight);

    // Extra highlight from the front
    const frontSpot = new THREE.SpotLight(0xffffff, 1.5, 20, Math.PI / 6, 0.5, 1);
    frontSpot.position.set(0, 4, -8);
    scene.add(frontSpot);
}

function loadModel() {
    const loader = new GLTFLoader();
    
    loader.load(
        'mclaren_p1.glb',
        // onLoad callback
        function (gltf) {
            carModel = gltf.scene;
            carModelGlb = carModel;

            // 1. Auto-Scale and Auto-Center based on physical model dimensions
            const box = new THREE.Box3().setFromObject(carModel);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());

            // Scale to a standard showroom length (e.g. 4.5 units)
            const maxDim = Math.max(size.x, size.y, size.z);
            const scaleFactor = 4.5 / maxDim;
            carModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

            // Recompute bounding box after scaling to position perfectly on grid
            const scaledBox = new THREE.Box3().setFromObject(carModel);
            const scaledMinY = scaledBox.min.y;
            
            // Center the model in X and Z, and place the lowest point on the floor (Y = 0)
            carModel.position.set(-center.x * scaleFactor, -scaledMinY, -center.z * scaleFactor);
            
            // Traverse model nodes and assign materials matching P1 structure
            carModel.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    
                    const name = child.name.toLowerCase();

                    // Apply paint body shell
                    if (name.includes('_bod_') || name.includes('_flack_')) {
                        child.material = materials.body;
                        paintParts.push(child);
                    }
                    // Apply glass windows
                    else if (name.includes('_glack_')) {
                        child.material = materials.glass;
                    }
                    // Apply wheels / rims
                    else if (name.includes('_rim_')) {
                        child.material = materials.rim;
                        rimParts.push(child);
                    }
                    // Apply tire rubber
                    else if (name.includes('_ty_')) {
                        child.material = materials.tire;
                    }
                    // Apply brake calipers
                    else if (name.startsWith('cal') || name.includes('_caliper')) {
                        child.material = materials.caliper;
                        caliperParts.push(child);
                    }
                    // Apply brake discs
                    else if (name.includes('_disk_')) {
                        child.material = materials.brakeDisc;
                    }
                    // Apply carbon fiber trim / spoiler wing
                    else if (name.includes('_cb_')) {
                        child.material = materials.carbon;
                        
                        // "object.009_cb_0" is the active spoiler wing
                        if (name.includes('009')) {
                            spoiler = child;
                            initialSpoilerY = spoiler.position.y;
                            initialSpoilerZ = spoiler.position.z;
                        }
                    }
                    // Apply headlights (xenon)
                    else if (name.includes('_xenon_')) {
                        child.material = materials.headlight;
                        headlights.push(child);
                    }
                    // Apply taillights
                    else if (name.includes('_rev_') || name.includes('material.006_0') || name.includes('material.004_0')) {
                        child.material = materials.taillight;
                        taillights.push(child);
                    }
                    // Apply chrome exhaust trim
                    else if (name.includes('_chrome_')) {
                        child.material = materials.chrome;
                    }
                    // Apply dashboard texture
                    else if (name.includes('_guage_') || name.includes('guage')) {
                        dashboardMesh = child;
                        child.material = materials.dashboard;
                    }
                }
                
                // Track wheels for rotation physics
                if (child.name.toLowerCase().startsWith('wheel') && !child.name.includes('_')) {
                    wheels.push(child);
                }
            });

            scene.add(carModel);

            // Hide Loading Screen
            loaderContainer.style.opacity = '0';
            loaderContainer.style.visibility = 'hidden';
            setTimeout(() => loaderContainer.remove(), 500);
        },
        // onProgress callback
        function (xhr) {
            if (xhr.total > 0) {
                const percent = (xhr.loaded / xhr.total * 100).toFixed(0);
                progressBar.style.width = percent + '%';
                loaderStatus.innerText = `Lädt 3D-Ressourcen... ${percent}%`;
            }
        },
        // onError callback
        function (error) {
            console.error('Error loading GLTF model:', error);
            loaderStatus.innerText = 'Fehler beim Laden des Modells.';
        }
    );
}

function setupEventListeners() {
    // Lighting Presets
    if (lightNeonBtn && lightStudioBtn && lightSunsetBtn) {
        lightNeonBtn.addEventListener('click', () => {
            lightNeonBtn.classList.add('active');
            lightStudioBtn.classList.remove('active');
            lightSunsetBtn.classList.remove('active');

            if (keyNeonCyanLight) {
                keyNeonCyanLight.intensity = 1.2;
                keyNeonCyanLight.color.setHex(0x00ffff);
            }
            if (rimNeonOrangeLight) {
                rimNeonOrangeLight.intensity = 1.5;
                rimNeonOrangeLight.color.setHex(0xff5a00);
            }
            if (mainCeilingLight) {
                mainCeilingLight.intensity = 2.0;
                mainCeilingLight.color.setHex(0xffffff);
            }
        });

        lightStudioBtn.addEventListener('click', () => {
            lightStudioBtn.classList.add('active');
            lightNeonBtn.classList.remove('active');
            lightSunsetBtn.classList.remove('active');

            if (keyNeonCyanLight) {
                keyNeonCyanLight.intensity = 0.5;
                keyNeonCyanLight.color.setHex(0xffffff);
            }
            if (rimNeonOrangeLight) {
                rimNeonOrangeLight.intensity = 0.5;
                rimNeonOrangeLight.color.setHex(0xffffff);
            }
            if (mainCeilingLight) {
                mainCeilingLight.intensity = 3.5;
                mainCeilingLight.color.setHex(0xffffff);
            }
        });

        lightSunsetBtn.addEventListener('click', () => {
            lightSunsetBtn.classList.add('active');
            lightNeonBtn.classList.remove('active');
            lightStudioBtn.classList.remove('active');

            if (keyNeonCyanLight) {
                keyNeonCyanLight.intensity = 0.4;
                keyNeonCyanLight.color.setHex(0xffaa44);
            }
            if (rimNeonOrangeLight) {
                rimNeonOrangeLight.intensity = 2.5;
                rimNeonOrangeLight.color.setHex(0xff3300);
            }
            if (mainCeilingLight) {
                mainCeilingLight.intensity = 0.8;
                mainCeilingLight.color.setHex(0xffddaa);
            }
        });
    }

    // 0. Model Toggle
    modelGlbBtn.addEventListener('click', () => {
        if (carModel === carModelGlb) return;
        
        modelGlbBtn.classList.add('active');
        modelObjBtn.classList.remove('active');
        
        if (carModelObj) {
            scene.remove(carModelObj);
        }
        
        carModel = carModelGlb;
        if (carModelGlb) {
            scene.add(carModelGlb);
        }
    });

    modelObjBtn.addEventListener('click', () => {
        if (carModel === carModelObj) return;

        modelObjBtn.classList.add('active');
        modelGlbBtn.classList.remove('active');

        if (carModelGlb) {
            scene.remove(carModelGlb);
        }

        if (carModelObj) {
            carModel = carModelObj;
            scene.add(carModelObj);
        } else {
            // Show loader while loading OBJ
            loaderContainer.style.visibility = 'visible';
            loaderContainer.style.opacity = '1';
            loaderStatus.innerText = 'Lädt OBJ Modell... 0%';
            progressBar.style.width = '0%';

            const objLoader = new OBJLoader();
            objLoader.load(
                'mclaren.obj',
                function (object) {
                    carModelObj = object;
                    carModel = carModelObj;

                    // 1. Auto-Scale and Auto-Center based on physical model dimensions
                    const box = new THREE.Box3().setFromObject(carModelObj);
                    const size = box.getSize(new THREE.Vector3());
                    const center = box.getCenter(new THREE.Vector3());

                    // Scale to a standard showroom length (e.g. 4.5 units)
                    const maxDim = Math.max(size.x, size.y, size.z);
                    const scaleFactor = 4.5 / maxDim;
                    carModelObj.scale.set(scaleFactor, scaleFactor, scaleFactor);

                    // Recompute bounding box after scaling to position perfectly on grid
                    const scaledBox = new THREE.Box3().setFromObject(carModelObj);
                    const scaledMinY = scaledBox.min.y;
                    
                    // Center the model in X and Z, and place the lowest point on the floor (Y = 0)
                    carModelObj.position.set(-center.x * scaleFactor, -scaledMinY, -center.z * scaleFactor);

                    // Apply materials (simple approach: apply body material to all meshes)
                    carModelObj.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                            child.material = materials.body;
                        }
                    });

                    scene.add(carModelObj);

                    // Hide Loading Screen
                    loaderContainer.style.opacity = '0';
                    setTimeout(() => {
                        loaderContainer.style.visibility = 'hidden';
                    }, 500);
                },
                function (xhr) {
                    if (xhr.total > 0) {
                        const percent = (xhr.loaded / xhr.total * 100).toFixed(0);
                        progressBar.style.width = percent + '%';
                        loaderStatus.innerText = `Lädt OBJ Modell... ${percent}%`;
                    }
                },
                function (error) {
                    console.error('Error loading OBJ model:', error);
                    loaderStatus.innerText = 'Fehler beim Laden des OBJ-Modells.';
                    // Hide after error
                    setTimeout(() => {
                        loaderContainer.style.opacity = '0';
                        setTimeout(() => loaderContainer.style.visibility = 'hidden', 500);
                    }, 2000);
                }
            );
        }
    });

    // 1. Paint Color changer
    colorButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            colorButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            config.color = btn.getAttribute('data-color');
            materials.body.color.set(config.color);
        });
    });

    // 2. Glossy Metallic vs Matte
    finishMetallic.addEventListener('click', () => {
        finishMetallic.classList.add('active');
        finishMatte.classList.remove('active');
        config.metallic = true;
        
        materials.body.roughness = 0.12;
        materials.body.metalness = 0.92;
        materials.body.clearcoat = 1.0;
        materials.body.clearcoatRoughness = 0.04;
        materials.body.needsUpdate = true;
        
        if (sliderRoughness) sliderRoughness.value = 0.12;
        if (sliderMetalness) sliderMetalness.value = 0.92;
    });

    finishMatte.addEventListener('click', () => {
        finishMatte.classList.add('active');
        finishMetallic.classList.remove('active');
        config.metallic = false;

        materials.body.roughness = 0.55;
        materials.body.metalness = 0.28;
        materials.body.clearcoat = 0.05;
        materials.body.clearcoatRoughness = 0.0;
        materials.body.needsUpdate = true;
        
        if (sliderRoughness) sliderRoughness.value = 0.55;
        if (sliderMetalness) sliderMetalness.value = 0.28;
    });

    // 2.5 Slider updates
    if (sliderRoughness) {
        sliderRoughness.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            materials.body.roughness = val;
            materials.body.needsUpdate = true;
            // Uncheck predefined finish modes if customized
            finishMetallic.classList.remove('active');
            finishMatte.classList.remove('active');
        });
    }

    if (sliderMetalness) {
        sliderMetalness.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            materials.body.metalness = val;
            materials.body.needsUpdate = true;
            // Uncheck predefined finish modes if customized
            finishMetallic.classList.remove('active');
            finishMatte.classList.remove('active');
        });
    }

    // 3. Wheel Alloy styling
    rimSport.addEventListener('click', () => {
        rimSport.classList.add('active');
        rimAero.classList.remove('active');
        config.rimFinish = 'stealth';
        materials.rim.color.set(0x151515);
        materials.rim.roughness = 0.35;
        materials.rim.metalness = 0.8;
    });

    rimAero.addEventListener('click', () => {
        rimAero.classList.add('active');
        rimSport.classList.remove('active');
        config.rimFinish = 'chrome';
        materials.rim.color.set(0xcccccc);
        materials.rim.roughness = 0.12;
        materials.rim.metalness = 0.95;
    });

    // 4. Caliper colors
    caliperButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            caliperButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            config.caliperColor = btn.getAttribute('data-color');
            materials.caliper.color.set(config.caliperColor);
        });
    });

    // 5. Active Spoiler active aerodynamic height toggle
    spoilerToggle.addEventListener('change', (e) => {
        config.spoilerActive = e.target.checked;
    });

    // 6. Xenon and tail lights toggle
    lightsToggle.addEventListener('change', (e) => {
        config.lightsActive = e.target.checked;
        if (config.lightsActive) {
            materials.headlight.color.set(0xffffff);
            materials.taillight.color.set(0xff003c);
        } else {
            materials.headlight.color.set(0x1a1a1a);
            materials.taillight.color.set(0x1a0005);
        }
    });

    // 7. Auto Spin Camera
    btnSpin.addEventListener('click', () => {
        config.autoRotate = !config.autoRotate;
        btnSpin.classList.toggle('highlight', config.autoRotate);
    });

    // 8. Reset View
    btnReset.addEventListener('click', () => {
        controls.reset();
        controls.minDistance = 3.5;
        controls.maxDistance = 14;
        controls.target.set(0, 0, 0);
        camera.position.set(5.5, 2.0, 5.5);

        config.driveMode = false;
        config.cockpitView = false;
        btnDrive.classList.remove('highlight');
        btnCockpit.classList.remove('highlight');
        dashboardControls.style.display = 'none';
    });

    // 9. Interactive Drive Mode (Spins wheels, shakes camera slightly)
    btnDrive.addEventListener('click', () => {
        config.driveMode = !config.driveMode;
        btnDrive.classList.toggle('highlight', config.driveMode);
        if (config.driveMode) {
            config.autoRotate = false;
            btnSpin.classList.remove('highlight');
        }
    });

    // 10. Cockpit View
    if (btnCockpit) {
        btnCockpit.addEventListener('click', () => {
            config.cockpitView = !config.cockpitView;
            btnCockpit.classList.toggle('highlight', config.cockpitView);

            if (config.cockpitView) {
                config.autoRotate = false;
                btnSpin.classList.remove('highlight');

                // Set target to look forward at the dashboard/windshield
                // The controls calculate distance from target to camera.
                const targetPos = new THREE.Vector3(0.35, 0.75, -1.0);
                controls.target.copy(targetPos);

                // Position camera inside cockpit
                const cockpitPos = new THREE.Vector3(0.35, 0.85, -0.15);
                camera.position.copy(cockpitPos);

                // Allow looking around from a fixed spot. Set min and max distance to the actual distance
                // between camera and target to avoid snapping.
                const distance = cockpitPos.distanceTo(targetPos);
                controls.minDistance = distance;
                controls.maxDistance = distance;

                dashboardControls.style.display = 'flex';
            } else {
                // Exit cockpit view
                controls.minDistance = 3.5;
                controls.maxDistance = 14;
                controls.target.set(0, 0, 0);
                camera.position.set(5.5, 2.0, 5.5);

                dashboardControls.style.display = 'none';
            }
        });
    }

    if (btnDashMode) {
        btnDashMode.addEventListener('click', () => {
            config.trackMode = !config.trackMode;
            if (dashboardTexture) {
                drawDashboard(currentSpeed, currentRpm, config.trackMode);
                dashboardTexture.needsUpdate = true;
            }
        });
    }

    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    controls.update();

    const time = Date.now() * 0.001;

    // Active Spoiler Animation (Lifts up and tilts down)
    if (spoiler && initialSpoilerY !== null) {
        // High Speed Aerodynamic position: lifts Y and pushes Z slightly back
        const targetY = config.spoilerActive ? initialSpoilerY + 0.15 : initialSpoilerY;
        const targetZ = config.spoilerActive ? initialSpoilerZ + 0.08 : initialSpoilerZ;
        const targetRotX = config.spoilerActive ? -0.18 : 0.0;

        spoiler.position.y += (targetY - spoiler.position.y) * 0.08;
        spoiler.position.z += (targetZ - spoiler.position.z) * 0.08;
        spoiler.rotation.x += (targetRotX - spoiler.rotation.x) * 0.08;
    }

    // Auto camera rotation
    if (config.autoRotate) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 2.0;
    } else {
        controls.autoRotate = false;
    }

    // Interactive drive mode
    if (config.driveMode) {
        // Spin wheels
        wheels.forEach(wheel => {
            // Rotates wheels around their local rotation axis (which is local Y after importing)
            wheel.rotation.y += 0.25;
        });

        // Simulates dynamic driving camera track (only if not in cockpit)
        if (!config.cockpitView) {
            camera.position.x = Math.sin(time * 0.4) * 6.8;
            camera.position.z = Math.cos(time * 0.4) * 6.8;
            camera.position.y = 1.5 + Math.sin(time * 2.5) * 0.04; // High-frequency road vibration
            controls.target.set(0, 0.45 + Math.sin(time * 1.8) * 0.01, 0);
        }
        // Do not alter camera position or target if in cockpit view, to avoid fighting OrbitControls.

        // Update dashboard metrics
        currentSpeed = Math.min(350, currentSpeed + 0.5 + Math.random());
        // Simple RPM simulation
        currentRpm = (currentSpeed % 50) / 50;

        if (dashboardTexture) {
            drawDashboard(currentSpeed, currentRpm, config.trackMode);
            dashboardTexture.needsUpdate = true;
        }

    } else {
        if (currentSpeed > 0) {
            currentSpeed = Math.max(0, currentSpeed - 1.0);
            currentRpm = (currentSpeed % 50) / 50;
            if (dashboardTexture) {
                drawDashboard(currentSpeed, currentRpm, config.trackMode);
                dashboardTexture.needsUpdate = true;
            }
        }
    }

    renderer.render(scene, camera);
}

window.onload = init;
