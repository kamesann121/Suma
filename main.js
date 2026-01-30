import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- 基本設定 ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa0a0a0);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(1, 2, 3);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);

const loader = new GLTFLoader();
let mixer;
const clock = new THREE.Clock();

// --- 3Dモデルとアニメーションの読み込み ---
async function init() {
    try {
        // 1. キャラクター本体を読み込み
        const charData = await loader.loadAsync('./Barbarian.glb');
        const model = charData.scene;
        scene.add(model);
        
        // 2. アニメーションファイルを読み込み
        const animData = await loader.loadAsync('./UAL1_Standard.glb');
        
        // アニメーションミキサーの作成
        mixer = new THREE.AnimationMixer(model);
        
        // アニメーションデータがあるか確認して再生
        if (animData.animations.length > 0) {
            const action = mixer.clipAction(animData.animations[0]);
            action.play();
            document.getElementById('info').innerText = "再生中: " + animData.animations[0].name;
        } else {
            document.getElementById('info').innerText = "アニメーションが見つかりませんでした。";
        }

    } catch (error) {
        console.error(error);
        document.getElementById('info').innerText = "エラーが発生しました。コンソールを確認してください。";
    }
}

// ループ処理
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

init();
animate();
