import { Controls } from "./Controls";
import * as THREE from 'three';

export class StaticControls extends Controls {
    private target: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
    
    constructor(camera: THREE.Camera) {
        super(camera);
    }

    public update() {
        // Do nothing
    }

    public setPosition(x: number, y: number, z: number) {
        this.camera.position.set(x, y, z);
    }

    public setTarget(x: number, y: number, z: number) {
        this.target.set(x, y, z);
        this.camera.lookAt(this.target);
    }
}