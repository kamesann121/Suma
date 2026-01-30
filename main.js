import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

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
let mixer, currentAction;
const clock = new THREE.Clock();

// UI用のコンテナを作成
const uiContainer = document.createElement('div');
uiContainer.style.cssText = 'position:absolute; top:50px; left:10px; display:flex; flex-direction:column; gap:5px; max-height:80vh; overflow-y:auto;';
document.body.appendChild(uiContainer);

async function init() {
    try {
        // キャラクター本体
        const charData = await loader.loadAsync('./Barbarian.glb');
        const model = charData.scene;
        scene.add(model);
        
        // アニメーションデータ
        const animData = await loader.loadAsync('./UAL1_Standard.glb');
        mixer = new THREE.AnimationMixer(model);

        // 各アニメーションの再生ボタンを作成
        animData.animations.forEach((clip) => {
            const btn = document.createElement('button');
            btn.innerText = clip.name;
            btn.style.padding = '5px';
            btn.onclick = () => {
                if (currentAction) currentAction.stop();
                currentAction = mixer.clipAction(clip);
                currentAction.play();
                document.getElementById('info').innerText = "再生中: " + clip.name;
            };
            uiContainer.appendChild(btn);
        });

        document.getElementById('info').innerText = "ボタンを押してアニメーションを選択";

    } catch (error) {
        console.error(error);
        document.getElementById('info').innerText = "読み込みエラー";
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
