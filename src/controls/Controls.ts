import * as THREE from 'three';

/**
 * FollowCursorControls allow the target to softly follow where the cursor is.
 * @param object - The camera to be controlled. The camera must not
 * be a child of another object, unless that object is the scene itself.
 * @param domElement - The HTML element used for
 * event listeners.
 */
export abstract class Controls {
    protected camera: THREE.Camera;
    public enabled: boolean = true;

    constructor(camera: THREE.Camera) {
        this.camera = camera;
    }

    public abstract update(): void;
}