import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa0a0a0);
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(2, 2, 4);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
const light = new THREE.HemisphereLight(0xffffff, 0x444444, 2);
scene.add(light);

const loader = new GLTFLoader();
let mixer;
const clock = new THREE.Clock();
const uiContainer = document.createElement('div');
uiContainer.style.cssText = 'position:absolute; top:50px; left:10px; display:flex; flex-direction:column; gap:2px; max-height:80vh; overflow-y:auto; z-index:100;';
document.body.appendChild(uiContainer);

// 柔軟なボーンマッピング用キーワード辞書
const KEYWORD_MAP = {
    "spine": "body",
    "pelvis": "body",
    "neck": "head",
    "head": "head",
    "upperarm_l": "arm.l",
    "lowerarm_l": "forearm.l",
    "hand_l": "hand.l",
    "upperarm_r": "arm.r",
    "lowerarm_r": "forearm.r",
    "hand_r": "hand.r",
    "thigh_l": "leg.l",
    "calf_l": "shin.l",
    "foot_l": "foot.l",
    "thigh_r": "leg.r",
    "calf_r": "shin.r",
    "foot_r": "foot.r"
};

async function init() {
    try {
        const charData = await loader.loadAsync('./Barbarian.glb');
        const model = charData.scene;
        scene.add(model);

        const animData = await loader.loadAsync('./UAL1_Standard.glb');
        mixer = new THREE.AnimationMixer(model);

        animData.animations.forEach((clip) => {
            const btn = document.createElement('button');
            btn.innerText = clip.name;
            btn.onclick = () => {
                mixer.stopAllAction();
                const newClip = clip.clone();
                
                newClip.tracks = newClip.tracks.filter(track => {
                    const trackParts = track.name.split('.');
                    const rawBoneName = trackParts[0].toLowerCase(); // アニメ側のボーン名（小文字化）
                    const property = trackParts[1]; // .quaternion 等
                    
                    let targetBoneName = null;

                    // キーワードが含まれているかチェックして、Barbarian側の名前に変換
                    for (const key in KEYWORD_MAP) {
                        if (rawBoneName.includes(key)) {
                            targetBoneName = KEYWORD_MAP[key];
                            break;
                        }
                    }

                    if (targetBoneName) {
                        track.name = targetBoneName + "." + property;
                        return true; // 変換できたものは残す
                    }
                    return false; // 変換できなかった不要なボーン（指など）は捨てる
                });

                if (newClip.tracks.length > 0) {
                    mixer.clipAction(newClip).play();
                    document.getElementById('info').innerText = "再生中: " + clip.name;
                } else {
                    document.getElementById('info').innerText = "有効なボーンが見つかりません";
                }
            };
            uiContainer.appendChild(btn);
        });
        document.getElementById('info').innerText = "読み込み完了。ボタンを押してください。";
    } catch (e) { console.error(e); }
}

function animate() {
    requestAnimationFrame(animate);
    if (mixer) mixer.update(clock.getDelta());
    controls.update();
    renderer.render(scene, camera);
}
init();
animate();
