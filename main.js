import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa0a0a0);
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(2, 2, 4);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
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

// 柔軟なマッピング辞書（ここをBarbarianの正確なボーン名に合わせました）
const BONE_MAP = {
    "spine": "body",
    "pelvis": "body",
    "neck": "head",
    "head": "head",
    "arm_l": "arm.l",
    "forearm_l": "forearm.l",
    "hand_l": "hand.l",
    "arm_r": "arm.r",
    "forearm_r": "forearm.r",
    "hand_r": "hand.r",
    "leg_l": "leg.l",
    "shin_l": "shin.l",
    "foot_l": "foot.l",
    "leg_r": "leg.r",
    "shin_r": "shin.r",
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
                
                newClip.tracks.forEach(track => {
                    // アニメ側のボーン名を「.」や「_」を抜いた小文字に変換 (例: UpperArm_L -> upperarml)
                    const cleanTrackName = track.name.split('.')[0].toLowerCase().replace(/[_.]/g, '');
                    const property = track.name.split('.')[1]; // .quaternion など
                    
                    for (const key in BONE_MAP) {
                        const cleanKey = key.toLowerCase().replace(/[_.]/g, '');
                        if (cleanTrackName.includes(cleanKey)) {
                            // 一致したらBarbarian側のボーン名に書き換え
                            track.name = BONE_MAP[key] + "." + property;
                        }
                    }
                });

                mixer.clipAction(newClip).play();
                document.getElementById('info').innerText = "再生中: " + clip.name;
            };
            uiContainer.appendChild(btn);
        });
        document.getElementById('info').innerText = "読み込み完了。これで動くはずです！";
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
