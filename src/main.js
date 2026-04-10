import "./style.css";
import * as THREE from "three";
import rainTextureUrl from "./assets/rainDrop.png";
import { RainSystem } from "./RainSystem.js";
import { FPSController } from "./controls/FPSController.js";
import { buildScene } from "./scene.js";

const app = document.getElementById("app");

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0a1020, 0.03);

const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	300,
);
camera.position.set(0, 1.7, 8);

const { player, sky } = buildScene(scene);

const rainTexture = new THREE.TextureLoader().load(rainTextureUrl);
rainTexture.colorSpace = THREE.SRGBColorSpace;

const rain = new RainSystem({
	texture: rainTexture,
});

player.add(rain.group);

const fps = new FPSController(camera, renderer.domElement);
fps.setPosition(0, 1.7, 8);

const clock = new THREE.Clock();

function resize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", resize);

const hud = document.createElement("div");
hud.className = "hud";
hud.innerHTML = `
  <div class="panel">
    <div class="title">Rain Demo by Peter Adams</div>
    <div>Click to lock pointer</div>
    <div>WASD move &middot; Space / Shift up-down</div>
  </div>
`;
app.appendChild(hud);

function animate() {
	const dt = Math.min(clock.getDelta(), 0.05);
	fps.update(dt);
	player.position.copy(fps.position);
	sky.position.copy(fps.position);

	rain.update(dt, camera);

	renderer.render(scene, camera);
	requestAnimationFrame(animate);
}
animate();
