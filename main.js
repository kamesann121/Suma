import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'; // 追加
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa0a0a0);
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(2, 2, 4);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 2));

// --- DRACO解凍の設定 ---
const dracoLoader = new DRACOLoader();
// Googleが提供している解凍用ライブラリをネット経由で読み込む
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader); // GLTFLoaderに解凍ツールを合体

let mixer;
const clock = new THREE.Clock();

async function init() {
    try {
        // 本体 b.glb
        const charData = await loader.loadAsync('./b.glb');
        const model = charData.scene;
        scene.add(model);

        // 動き A.glb
        const animData = await loader.loadAsync('./A.glb');
        
        mixer = new THREE.AnimationMixer(model);
        if (animData.animations.length > 0) {
            mixer.clipAction(animData.animations[0]).play();
            document.getElementById('info').innerText = "DRACO解凍成功！再生中";
        }
    } catch (error) {
        console.error(error);
        document.getElementById('info').innerText = "エラー: " + error.message;
    }
}

function animate() {
    requestAnimationFrame(animate);
    if (mixer) mixer.update(clock.getDelta());
    renderer.render(scene, camera);
}

init();
animate();
