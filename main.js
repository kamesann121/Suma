import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x333333);
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(2, 2, 4);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
const light = new THREE.DirectionalLight(0xffffff, 3);
light.position.set(1, 1, 1);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 1));

const loader = new GLTFLoader();
let mixer;
const clock = new THREE.Clock();

const uiContainer = document.createElement('div');
uiContainer.style.cssText = 'position:absolute; top:50px; left:10px; display:flex; flex-direction:column; gap:2px; max-height:80vh; overflow-y:auto; z-index:100;';
document.body.appendChild(uiContainer);

// 対応表（Barbarianのボーン名に完全準拠）
const MAP = {
    "arm.l": ["upperarm_l", "arm_l", "shoulder_l"],
    "forearm.l": ["lowerarm_l", "forearm_l"],
    "hand.l": ["hand_l", "wrist_l"],
    "arm.r": ["upperarm_r", "arm_r", "shoulder_r"],
    "forearm.r": ["lowerarm_r", "forearm_r"],
    "hand.r": ["hand_r", "wrist_r"],
    "leg.l": ["thigh_l", "leg_l", "upperleg_l"],
    "shin.l": ["calf_l", "shin_l", "lowerleg_l"],
    "foot.l": ["foot_l", "ankle_l"],
    "leg.r": ["thigh_r", "leg_r", "upperleg_r"],
    "shin.r": ["calf_r", "shin_r", "lowerleg_r"],
    "foot.r": ["foot_r", "ankle_r"],
    "body": ["spine", "pelvis", "hips", "root"],
    "head": ["head", "neck"]
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
                const newTracks = [];

                newClip.tracks.forEach(track => {
                    const trackName = track.name.toLowerCase();
                    const property = track.name.split('.')[1]; // .quaternion など

                    // 辞書を使って強制マッチング
                    for (const targetBone in MAP) {
                        const keywords = MAP[targetBone];
                        if (keywords.some(kw => trackName.includes(kw))) {
                            track.name = targetBone + "." + property;
                            newTracks.push(track);
                            break;
                        }
                    }
                });

                newClip.tracks = newTracks;
                if (newClip.tracks.length > 0) {
                    const action = mixer.clipAction(newClip);
                    action.play();
                }
            };
            uiContainer.appendChild(btn);
        });
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
