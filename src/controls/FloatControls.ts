import * as THREE from 'three';

/**
 * Orbit controls allow the camera to float around a target.
 * @param object - The camera to be controlled. The camera must not
 * be a child of another object, unless that object is the scene itself.
 * @param domElement - The HTML element used for
 * event listeners.
 */
export class FloatControls {
    private camera: THREE.Camera;
    private canvas: HTMLElement;

    public enabled: boolean = true;
    private target: THREE.Vector3 = new THREE.Vector3(5, 10, 10);
    private distance: number = 20;
    private panSpeed: number = 2.0;

    private windowHalfX: number;
    private windowHalfY: number;
    private mouseX: number = 0;
    private mouseY: number = 0;

    constructor(camera: THREE.Camera, domElement: HTMLElement) {
        this.camera = camera;
        this.canvas = domElement;

        this.windowHalfX = domElement.clientWidth / 2;
        this.windowHalfY = domElement.clientWidth / 2;

        this.camera.position.x = this.target.x + this.distance;
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

        const target = this.target;
        const camera = this.camera;

        const correctedMouseX = this.mouseX / this.windowHalfX;
        const correctedMouseY = this.mouseY / this.windowHalfY;
        
        const cameraDeltaZ = (correctedMouseX + target.z - camera.position.z) * 0.05 * this.panSpeed;
        const cameraDeltaY = (correctedMouseY + target.y - camera.position.y) * 0.05 * this.panSpeed;

        camera.position.z += cameraDeltaZ
        camera.position.y += cameraDeltaY

        camera.lookAt( target );
    }
}