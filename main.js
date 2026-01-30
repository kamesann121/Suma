import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// シーン、カメラ、レンダラーの設定
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa0a0a0);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(2, 2, 4);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, 0);

// 環境光と平行光源
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 2));
const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(5, 5, 5);
scene.add(dirLight);

const loader = new GLTFLoader();
let mixer;
const clock = new THREE.Clock();

async function init() {
    try {
        // --- 1. キャラクター本体を読み込み ---
        // GitHubに上げた実際のファイル名に書き換えてください
        const charData = await loader.loadAsync('./Barbarian_Mixamo.glb');
        const model = charData.scene;
        scene.add(model);

        // --- 2. アニメーションを読み込み ---
        // アニメーション専用のGLB、または本体と同じファイルを指定
        const animData = await loader.loadAsync('./Animation_Mixamo.glb');
        
        // ミキサーの作成（modelに対してアニメーションを適用）
        mixer = new THREE.AnimationMixer(model);

        if (animData.animations.length > 0) {
            // MixamoのGLBは通常 [0] 番目にアニメーションが入っています
            const action = mixer.clipAction(animData.animations[0]);
            action.play();
            document.getElementById('info').innerText = "アニメーション再生中";
        } else {
            document.getElementById('info').innerText = "アニメーションが見つかりません";
        }

    } catch (error) {
        console.error("読み込みエラー:", error);
        document.getElementById('info').innerText = "エラー: ファイルが見つかりません";
    }
}

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
