import * as THREE from "three";
import vertexShader from "./shaders/rain.vert.glsl?raw";
import fragmentShader from "./shaders/rain.frag.glsl?raw";

export class RainSystem {
	constructor(opts = {}) {
		this.count = opts.count ?? 40000;
		this.baseIntensity = opts.intensity ?? 1;
		this.radius = opts.radius ?? 20;
		this.height = opts.height ?? 15;
		this.fadeRadius = opts.fadeRadius ?? 30;
		this.killRadius = opts.killRadius ?? 40;

		this.baseSize = 8;
		this.minAngleSizeScale = 0.7;
		this.minAngleUvSquash = 0.05;

		this._camDir = new THREE.Vector3();
		this._lastVerticalFacing = -1;
		this._distanceFade = 1;

		const positions = new Float32Array(this.count * 3);
		const speeds = new Float32Array(this.count);

		for (let i = 0; i < this.count; i++) {
			const angle = Math.random() * Math.PI * 2;
			const r = Math.sqrt(Math.random()) * this.radius;
			positions[i * 3 + 0] = Math.cos(angle) * r;
			positions[i * 3 + 1] = Math.random() * this.height;
			positions[i * 3 + 2] = Math.sin(angle) * r;
			speeds[i] = 0.5 + Math.random();
		}

		this.geometry = new THREE.BufferGeometry();
		this.geometry.setAttribute(
			"position",
			new THREE.BufferAttribute(positions, 3),
		);
		this.geometry.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));

		this.uniforms = {
			uTime: { value: 0 },
			uTexture: { value: opts.texture ?? null },
			uSize: { value: 5 },
			uOpacity: { value: 1 },
			uOverallSpeed: { value: 40 },
			uColor: { value: new THREE.Color(0xffffff) },
			uUvSquash: { value: 1 },
			uIntensity: { value: this.baseIntensity },
			uHeight: { value: this.height },
		};

		this.material = new THREE.ShaderMaterial({
			uniforms: this.uniforms,
			vertexShader,
			fragmentShader,
			depthWrite: false,
			transparent: true,
			blending: THREE.NormalBlending,
		});

		this.points = new THREE.Points(this.geometry, this.material);
		this.points.frustumCulled = false;

		this.group = new THREE.Group();
		this.group.add(this.points);
	}

	update(dt, camera) {
		this.uniforms.uTime.value += dt;

		this._distanceFade = 1;
		this.uniforms.uIntensity.value = this.baseIntensity;
		this.geometry.setDrawRange(0, this.count);
		this.group.visible = true;

		camera.getWorldDirection(this._camDir);
		const verticalFacing = Math.abs(this._camDir.y);
		if (Math.abs(verticalFacing - this._lastVerticalFacing) > 0.001) {
			this._lastVerticalFacing = verticalFacing;
			const sizeScale = THREE.MathUtils.lerp(
				1,
				this.minAngleSizeScale,
				verticalFacing,
			);
			const uvSquash = THREE.MathUtils.lerp(
				1,
				this.minAngleUvSquash,
				verticalFacing,
			);

			this.uniforms.uUvSquash.value = uvSquash;
			this.uniforms.uSize.value =
				this.baseSize * sizeScale * (0.5 + 0.5 * uvSquash);
		}
	}
}
