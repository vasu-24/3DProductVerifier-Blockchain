import * as THREE from 'https://esm.sh/three@0.158.0';
import { OrbitControls } from 'https://esm.sh/three@0.158.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://esm.sh/three@0.158.0/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'https://esm.sh/three@0.158.0/examples/jsm/loaders/RGBELoader.js';

// Canvas and Model
const canvas = document.getElementById('three-canvas') || document.getElementById('consumerModelCanvas');
const modelPath = canvas?.dataset.model || 'model1.glb';

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(canvas.clientWidth, canvas.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping; // for metallic shine
renderer.toneMappingExposure = 1.2;

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
camera.position.set(0, 1.5, 3);

// Lights
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 2.0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 3);
dirLight.position.set(5, 10, 5);
dirLight.castShadow = true;
scene.add(dirLight);

const ambient = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambient);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Optional: Environment map for shiny reflection simulation (uses preset blur sky)
new RGBELoader().load('https://threejs.org/examples/textures/equirectangular/royal_esplanade_1k.hdr', (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
});

// Load Model
let model = null;
const loader = new GLTFLoader();

loader.load(
  modelPath,
  (gltf) => {
    model = gltf.scene;

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    model.position.sub(center);
    const scale = 2 / Math.max(size.x, size.y, size.z);
    model.scale.setScalar(scale);

    scene.add(model);
    animate();
  },
  undefined,
  (err) => console.error('Error loading model:', err)
);

// Animate
function animate() {
  requestAnimationFrame(animate);
  if (model) model.rotation.y += 0.003;
  controls.update();
  renderer.render(scene, camera);
}

// Resize
window.addEventListener('resize', () => {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});
