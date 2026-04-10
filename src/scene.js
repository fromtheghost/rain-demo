import * as THREE from "three";

const SKY_VERT = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SKY_FRAG = /* glsl */ `
  uniform vec3 uZenith;
  uniform vec3 uHorizon;
  uniform vec3 uNadir;
  uniform vec3 uGlow;
  varying vec3 vDir;
  void main() {
    float vertical = clamp(vDir.y * 0.5 + 0.5, 0.0, 1.0);
    vec3 base = mix(uNadir, uHorizon, smoothstep(0.0, 0.45, vertical));
    base = mix(base, uZenith, smoothstep(0.38, 0.95, vertical));

    float glowX = 1.0 - abs(vDir.x);
    float glowZ = 1.0 - abs(vDir.z);
    float horizonGlow = pow(max(glowX * glowZ, 0.0), 3.0) * (1.0 - abs(vDir.y));
    vec3 color = base + uGlow * horizonGlow * 0.35;

    gl_FragColor = vec4(color, 1.0);
  }
`;

function buildSky(scene) {
	const mat = new THREE.ShaderMaterial({
		vertexShader: SKY_VERT,
		fragmentShader: SKY_FRAG,
		uniforms: {
			uZenith: { value: new THREE.Color("black") },
			uHorizon: { value: new THREE.Color("teal") },
			uNadir: { value: new THREE.Color("'teal'") },
			uGlow: { value: new THREE.Color("lightblue") },
		},
		side: THREE.BackSide,
		depthWrite: false,
		fog: false,
	});
	const mesh = new THREE.Mesh(new THREE.BoxGeometry(260, 180, 260), mat);
	mesh.frustumCulled = false;
	scene.add(mesh);
	return mesh;
}

export function buildScene(scene) {
	const sky = buildSky(scene);
	const ground = new THREE.Mesh(
		new THREE.PlaneGeometry(140, 140),
		new THREE.MeshStandardMaterial({ color: 0x1d2520, roughness: 1 }),
	);
	ground.rotation.x = -Math.PI / 2;
	scene.add(ground);

	const grid = new THREE.GridHelper(140, 70, 0x3e4b42, 0x263028);
	grid.position.y = 0.01;
	scene.add(grid);

	const player = new THREE.Object3D();
	scene.add(player);

	return { player, ground, sky };
}
