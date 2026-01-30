import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- シーン設定 ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa0a0a0);
scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(2, 2, 4);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, 0);

const light = new THREE.HemisphereLight(0xffffff, 0x444444, 2);
scene.add(light);

const loader = new GLTFLoader();
let mixer;
const clock = new THREE.Clock();

// UI表示用
const uiContainer = document.createElement('div');
uiContainer.style.cssText = 'position:absolute; top:50px; left:10px; display:flex; flex-direction:column; gap:2px; max-height:80vh; overflow-y:auto; z-index:100;';
document.body.appendChild(uiContainer);

// --- ボーン名の対応辞書 ---
// 左: アニメーションファイルのボーン名 / 右: Barbarian.glbのボーン名
const BONE_MAP = {
    "pelvis": "body",
    "spine_01": "body",
    "spine_02": "body",
    "spine_03": "body",
    "neck_01": "head",
    "head": "head",
    "upperarm_l": "arm.L",
    "lowerarm_l": "forearm.L",
    "hand_l": "hand.L",
    "upperarm_r": "arm.R",
    "lowerarm_r": "forearm.R",
    "hand_r": "hand.R",
    "thigh_l": "leg.L",
    "calf_l": "shin.L",
    "foot_l": "foot.L",
    "thigh_r": "leg.R",
    "calf_r": "shin.R",
    "foot_r": "foot.R"
};

async function init() {
    try {
        // 1. キャラクター本体
        const charData = await loader.loadAsync('./Barbarian.glb');
        const model = charData.scene;
        scene.add(model);

        model.traverse(object => {
            if (object.isMesh) object.castShadow = true;
        });

        // 2. アニメーションデータ
        const animData = await loader.loadAsync('./UAL1_Standard.glb');
        mixer = new THREE.AnimationMixer(model);

        // ボタン作成
        animData.animations.forEach((clip) => {
            const btn = document.createElement('button');
            btn.innerText = clip.name;
            btn.style.padding = '8px';
            btn.style.cursor = 'pointer';

            btn.onclick = () => {
                mixer.stopAllAction();
                
                // クリップをコピーしてボーン名を置換
                const newClip = clip.clone();
                newClip.tracks.forEach(track => {
                    // "spine_01.quaternion" のような文字列からボーン名部分だけを置換
                    Object.keys(BONE_MAP).forEach(key => {
                        if (track.name.startsWith(key)) {
                            track.name = track.name.replace(key, BONE_MAP[key]);
                        }
                    });
                });

                const action = mixer.clipAction(newClip);
                action.play();
                document.getElementById('info').innerText = "再生中: " + clip.name;
            };
            uiContainer.appendChild(btn);
        });

        document.getElementById('info').innerText = "読み込み完了。ボタンを押してください。";

    } catch (error) {
        console.error(error);
        document.getElementById('info').innerText = "エラー: ファイルが見つかりません。";
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
