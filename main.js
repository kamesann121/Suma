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

scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 2));
const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(5, 5, 5);
scene.add(dirLight);

const loader = new GLTFLoader();
let mixer;
const clock = new THREE.Clock();

async function init() {
    try {
        // --- ここをあなたの指定に合わせて修正 ---
        // 本体は小文字の b
        const charData = await loader.loadAsync('./b.glb');
        const model = charData.scene;
        scene.add(model);

        // 動きは大文字の A
        const animData = await loader.loadAsync('./A.glb');
        
        mixer = new THREE.AnimationMixer(model);

        if (animData.animations.length > 0) {
            const action = mixer.clipAction(animData.animations[0]);
            action.play();
            document.getElementById('info').innerText = "成功！再生中";
        } else {
            document.getElementById('info').innerText = "動きのデータが見つかりません";
        }

    } catch (error) {
        console.error(error);
        // エラーの理由を画面に表示
        document.getElementById('info').innerText = "エラー原因: " + error.message;
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
