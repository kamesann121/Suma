// 1. スマホで読み込みを確認するためのアラート
alert("JSの読み込みを開始しました！");

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

// --- デバッグログ出力関数 ---
const logEl = document.getElementById('debug-log');
const animListEl = document.getElementById('anim-list');

function debug(msg, isError = false) {
    console.log(msg);
    if (!logEl) return;
    const div = document.createElement('div');
    div.style.color = isError ? '#ff4444' : '#0f0';
    div.style.borderBottom = '1px solid #333';
    div.style.padding = '2px 0';
    div.innerText = `> ${msg}`;
    logEl.appendChild(div);
    logEl.scrollTop = logEl.scrollHeight;
}

debug("Three.js Modules Loaded");

// --- 3D基本設定 ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const light = new THREE.AmbientLight(0xffffff, 2);
scene.add(light);

let mixer;
const loader = new GLTFLoader();

// --- モデル読み込み開始 ---
debug("Loading: Mannequin_Medium.glb...");

loader.load('./public/Mannequin_Medium.glb', (gltf) => {
    scene.add(gltf.scene);
    debug("SUCCESS: Model Loaded");

    debug("Loading: UAL2_Standard.glb...");
    loader.load('./public/UAL2_Standard.glb', (animGltf) => {
        debug(`SUCCESS: ${animGltf.animations.length} Anims Found`);
        
        mixer = new THREE.AnimationMixer(gltf.scene);

        // アニメーションボタンの作成
        animGltf.animations.forEach((clip) => {
            const btn = document.createElement('button');
            btn.className = 'anim-btn';
            btn.innerText = clip.name;
            btn.onclick = () => {
                mixer.stopAllAction();
                mixer.clipAction(clip).play();
                debug(`Play: ${clip.name}`);
            };
            animListEl.appendChild(btn);
        });

        debug("ALL READY: Tap buttons on the right");

    }, undefined, (err) => {
        debug("ANIM ERROR: " + err.message, true);
    });

}, undefined, (err) => {
    debug("MODEL ERROR: Check file name/path", true);
    debug("Path tried: ./public/Mannequin_Medium.glb", true);
});

// --- アニメーションループ ---
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    renderer.render(scene, camera);
}
animate();

// リサイズ対応
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
