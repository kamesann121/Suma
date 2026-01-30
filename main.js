import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import nipplejs from 'nipplejs'; // ジョイスティック用

// --- 基本設定は同じ ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa0a0a0);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 3, 6);
camera.lookAt(0, 1, 0);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const light = new THREE.HemisphereLight(0xffffff, 0x444444, 3);
scene.add(light);

let mixer, currentAction, isMoving = false;
const actions = {};
const loader = new GLTFLoader();

// モデル読み込み
loader.load('./public/Mannequin_Medium.glb', (gltf) => {
    const model = gltf.scene;
    scene.add(model);

    loader.load('./public/UAL2_Standard.glb', (animGltf) => {
        mixer = new THREE.AnimationMixer(model);
        animGltf.animations.forEach((clip) => {
            actions[clip.name] = mixer.clipAction(clip);
        });
        if (actions['Idle']) {
            currentAction = actions['Idle'];
            currentAction.play();
        }
    });
});

// --- スマホ用ジョイスティックの設定 ---
const joystick = nipplejs.create({
    zone: document.getElementById('joystick-zone'),
    mode: 'static',
    position: { left: '80px', bottom: '80px' },
    color: 'white'
});

joystick.on('move', () => { isMoving = true; });
joystick.on('end', () => { isMoving = false; });

// --- 更新処理 ---
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    if (mixer) {
        mixer.update(delta);

        // ジョイスティックを触っている間はWalking、離したらIdle
        const nextAction = isMoving ? actions['Walking'] : actions['Idle'];
        
        if (nextAction && currentAction !== nextAction) {
            currentAction.fadeOut(0.2);
            nextAction.reset().fadeIn(0.2).play();
            currentAction = nextAction;
        }
    }
    renderer.render(scene, camera);
}
animate();

// 画面サイズ変更対応
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
