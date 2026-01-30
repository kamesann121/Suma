import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa0a0a0);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ライト
const light = new THREE.HemisphereLight(0xffffff, 0x444444, 2);
scene.add(light);

let mixer, model, actions = {};
const loader = new GLTFLoader();

// モデルとアニメーションの読み込み
loader.load('./public/character.glb', (charGltf) => {
    model = charGltf.scene;
    scene.add(model);

    loader.load('./public/animations.glb', (animGltf) => {
        mixer = new THREE.AnimationMixer(model);
        
        // 全アニメーションを登録
        animGltf.animations.forEach(clip => {
            actions[clip.name] = mixer.clipAction(clip);
        });

        // 初期ポーズ（Idleなどがあれば）
        if(actions['Idle']) actions['Idle'].play();
    });
});

// アニメーションループ
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    renderer.render(scene, camera);
}
animate();
