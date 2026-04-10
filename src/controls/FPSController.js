import * as THREE from 'three';

export class FPSController {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
    this.position = camera.position;
    this.velocity = new THREE.Vector3();
    this.move = { forward: false, backward: false, left: false, right: false, up: false, down: false };
    this.lookSpeed = 0.0022;
    this.moveSpeed = 8;

    domElement.addEventListener('click', () => domElement.requestPointerLock());

    document.addEventListener('pointerlockchange', () => {
      this.enabled = document.pointerLockElement === domElement;
    });

    document.addEventListener('mousemove', (e) => {
      if (!this.enabled) return;
      this.euler.y -= e.movementX * this.lookSpeed;
      this.euler.x -= e.movementY * this.lookSpeed;
      this.euler.x = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, this.euler.x));
      this.camera.quaternion.setFromEuler(this.euler);
    });

    document.addEventListener('keydown', (e) => this.setKey(e.code, true));
    document.addEventListener('keyup', (e) => this.setKey(e.code, false));
  }

  setPosition(x, y, z) {
    this.position.set(x, y, z);
  }

  setKey(code, value) {
    if (code === 'KeyW') this.move.forward = value;
    if (code === 'KeyS') this.move.backward = value;
    if (code === 'KeyA') this.move.left = value;
    if (code === 'KeyD') this.move.right = value;
    if (code === 'Space') this.move.up = value;
    if (code === 'ShiftLeft' || code === 'ShiftRight') this.move.down = value;
  }

  update(dt) {
    const moveX = Number(this.move.right) - Number(this.move.left);
    const moveZ = Number(this.move.backward) - Number(this.move.forward);
    const moveY = Number(this.move.up) - Number(this.move.down);

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
    right.y = 0;
    right.normalize();

    const dir = new THREE.Vector3();
    dir.addScaledVector(forward, -moveZ);
    dir.addScaledVector(right, moveX);
    dir.y += moveY;
    if (dir.lengthSq() > 0) dir.normalize();

    this.position.addScaledVector(dir, this.moveSpeed * dt);
  }
}
