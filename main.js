import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
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
controls.target.set(0, 1, 0);
controls.update();

// ライト設定
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 2));
const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(5, 5, 5);
scene.add(dirLight);

const loader = new GLTFLoader();
let mixer;
const clock = new THREE.Clock();

async function init() {
    try {
        // 1. 本体読み込み
        const charData = await loader.loadAsync('./Barbarian_Mixamo.glb');
        const model = charData.scene;
        scene.add(model);

        // 2. 動き読み込み
        const animData = await loader.loadAsync('./Animation_Mixamo.glb');
        
        mixer = new THREE.AnimationMixer(model);

        if (animData.animations.length > 0) {
            // MixamoのGLBアニメーションを再生
            const action = mixer.clipAction(animData.animations[0]);
            action.play();
            document.getElementById('info').innerText = "成功！全身アニメーション再生中";
        } else {
            document.getElementById('info').innerText = "エラー: アニメーションデータが空です";
        }

    } catch (error) {
        console.error(error);
        document.getElementById('info').innerText = "エラー: ファイル名が違うか、アップロードされていません";
    }
}

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

init();
animate();
