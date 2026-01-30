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

// --- 強化されたボーン名対応表 ---
const BONE_MAP = {
    "pelvis": "body",
    "spine_01": "body",
    "spine_02": "body",
    "neck_01": "head",
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

        // モデル側の実際のボーン名をリスト化してデバッグ用に表示
        const realBoneNames = [];
        model.traverse(n => { if(n.isBone) realBoneNames.push(n.name); });
        console.log("モデルの実際のボーン名:", realBoneNames);

        const animData = await loader.loadAsync('./UAL1_Standard.glb');
        mixer = new THREE.AnimationMixer(model);

        animData.animations.forEach((clip) => {
            const btn = document.createElement('button');
            btn.innerText = clip.name;
            btn.onclick = () => {
                mixer.stopAllAction();
                const newClip = clip.clone();
                
                newClip.tracks.forEach(track => {
                    // 大文字小文字の揺れを吸収するために小文字で比較
                    const trackNameLower = track.name.toLowerCase();
                    
                    Object.keys(BONE_MAP).forEach(key => {
                        if (trackNameLower.startsWith(key.toLowerCase())) {
                            // 実際のモデルにあるボーン名に置換
                            // .pos や .quat などの接尾辞を維持しつつ名前を書き換える
                            const suffix = track.name.split('.')[1] || 'quaternion';
                            track.name = BONE_MAP[key] + "." + suffix;
                        }
                    });
                });

                mixer.clipAction(newClip).play();
                document.getElementById('info').innerText = "再生中: " + clip.name;
            };
            uiContainer.appendChild(btn);
        });
        document.getElementById('info').innerText = "読み込み完了。手足が動くか確認してください。";
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
