import * as THREE from 'three';

/**
 * FollowCursorControls allow the target to softly follow where the cursor is.
 * @param object - The camera to be controlled. The camera must not
 * be a child of another object, unless that object is the scene itself.
 * @param domElement - The HTML element used for
 * event listeners.
 */
export class FollowCursorControls {
    private camera: THREE.Camera;

    public enabled: boolean = true;
    private _target: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
    private _distance: number = 20;
    public panSpeed: number = 1.0;
    public tiltFactor: number = 5.0;

    private windowHalfX: number;
    private windowHalfY: number;
    private mouseX: number = 0;
    private mouseY: number = 0;

    constructor(camera: THREE.Camera, domElement: HTMLElement) {
        this.camera = camera;

        this.windowHalfX = domElement.clientWidth / 2;
        this.windowHalfY = domElement.clientHeight / 2;

        this.camera.position.x = this._target.x + this._distance;
        // this.camera.position.y = this.target.y;
        // this.camera.position.z = this.target.z;

        const onMouseMove = (event: MouseEvent) => {
            if (!this.enabled) return;

            this.mouseX = (event.clientX - this.windowHalfX);
            this.mouseY = (event.clientY - this.windowHalfY);
        }

        domElement.addEventListener('mousemove', onMouseMove, false);
    }

    public update() {
        if (!this.enabled) return;

        const target = this._target;
        const camera = this.camera;

        const correctedMouseX = this.mouseX / this.windowHalfX * this.tiltFactor;
        const correctedMouseY = this.mouseY / this.windowHalfY * this.tiltFactor;

        console.log(correctedMouseX, correctedMouseY)
        
        const cameraDeltaZ = (correctedMouseX + target.z - camera.position.z) * 0.10 * this.panSpeed;
        const cameraDeltaY = (correctedMouseY + target.y - camera.position.y) * 0.10 * this.panSpeed;

        camera.position.z += cameraDeltaZ
        camera.position.y += cameraDeltaY

        camera.lookAt( target );
    }

    public set distance(distance: number) {
        this._distance = distance;
        this.camera.position.x = this.target.x + this._distance;
    }

    public get distance() {
        return this._distance;
    }

    public set target(target: THREE.Vector3) {
        this._target = target;
        this.camera.position.x = this.target.x + this._distance;
    }

    public get target() {
        return this._target;
    }
}