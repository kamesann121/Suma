import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import nipplejs from 'nipplejs';

// --- シーン・カメラ・レンダラーの設定 ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x333333); // 背景を少し暗いグレーに（モデルを見やすく）

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 3, 7); // カメラを少し後ろに引く
camera.lookAt(0, 1, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio); // スマホでのぼやけ防止
document.body.appendChild(renderer.domElement);

// --- ライト（明るくする） ---
const hLight = new THREE.HemisphereLight(0xffffff, 0x444444, 3);
scene.add(hLight);
const dLight = new THREE.DirectionalLight(0xffffff, 1);
dLight.position.set(5, 5, 5);
scene.add(dLight);

// --- 変数管理 ---
let mixer, currentAction, isMoving = false;
const actions = {};
const loader = new GLTFLoader();

// --- 3Dモデル読み込み ---
// 注意：ファイル名は正確に一致させてください
const modelPath = 'public/Mannequin_Medium.glb';
const animPath = 'public/UAL2_Standard.glb';

loader.load(modelPath, (gltf) => {
    const model = gltf.scene;
    scene.add(model);
    console.log("キャラモデルの読み込みに成功しました");

    // アニメーション用ファイルを読み込み
    loader.load(animPath, (animGltf) => {
        mixer = new THREE.AnimationMixer(model);
        
        animGltf.animations.forEach((clip) => {
            // Quaterniusさんのパック内の名前に合わせて登録
            // もし動かない場合は 'Walking' を 'walk' などに書き換えが必要な場合があります
            actions[clip.name] = mixer.clipAction(clip);
        });

        // 待機状態を再生
        if (actions['Idle']) {
            currentAction = actions['Idle'];
            currentAction.play();
        } else {
            // Idleがない場合、最初のアニメーションを再生
            currentAction = mixer.clipAction(animGltf.animations[0]);
            currentAction.play();
        }
        console.log("アニメーションの読み込みに成功しました");
    }, undefined, (e) => console.error("アニメ読み込みエラー:", e));

}, undefined, (e) => {
    alert("モデル読み込みエラー！パスを確認してください: " + modelPath);
    console.error(e);
});

// --- スマホ用ジョイスティックの設定 ---
const joystick = nipplejs.create({
    zone: document.getElementById('joystick-zone'),
    mode: 'static',
    position: { left: '80px', bottom: '80px' },
    color: 'white',
    size: 120
});

joystick.on('move', () => { isMoving = true; });
joystick.on('end', () => { isMoving = false; });

// --- 更新ループ ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    if (mixer) {
        mixer.update(delta);

        // アニメーション切り替え（IdleとWalkingは実際のファイル内の名前に合わせてください）
        const nextAction = isMoving ? (actions['Walking'] || actions['Walk']) : (actions['Idle'] || actions['idle']);
        
        if (nextAction && currentAction !== nextAction) {
            currentAction.fadeOut(0.2);
            nextAction.reset().fadeIn(0.2).play();
            currentAction = nextAction;
        }
    }
    renderer.render(scene, camera);
}
animate();

// 画面のリサイズ対応
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
