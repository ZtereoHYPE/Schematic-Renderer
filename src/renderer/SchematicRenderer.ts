// import THREE from "three";
import * as THREE from "three";
import * as TWEEN from '@tweenjs/tween.js'

import { GeometryGenerator } from "./generation/GeometryGenerator";

import Stats from 'stats.js';
import { UnpackedSchematic } from "./generation/UnpackedSchematic";
import { FollowCursorControls } from "../controls/FollowCursorControls";
import { Controls } from "../controls/Controls";

export enum RaycastEvents {
    HOVERED,
    UNHOVERED,
    CLICKED
}

export class SchematicRenderer {
    private initialised: boolean = false;

    private placer: GeometryGenerator = new GeometryGenerator();

    private canvas: HTMLCanvasElement;
    private scene: THREE.Scene | undefined;
    private camera: THREE.PerspectiveCamera | undefined;
    private renderer: THREE.WebGLRenderer | undefined;

    private raycaster: THREE.Raycaster | undefined;
    private selectables: Set<THREE.InstancedMesh> = new Set();
    private hovered: [THREE.InstancedMesh, number] | null = null;

    private hoverCallbacks: Array<(mesh: THREE.InstancedMesh, index: number) => void> = [];
    private unhoverCallbacks: Array<(mesh: THREE.InstancedMesh, index: number) => void> = [];
    private clickCallbacks: Array<(mesh: THREE.InstancedMesh, index: number) => void> = [];

    private statsInstance = new Stats();
    private controls: Controls | undefined;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;

        this.init();
    }

    // init method to start renderer
    public init(fov: number = 75) {
        this.statsInstance.showPanel(0);
        this.statsInstance.dom.style.position = 'absolute';
        this.statsInstance.dom.style.right = '0px';
        this.statsInstance.dom.style.top = '0px';
        document.body.appendChild(this.statsInstance.dom);

        this.initScene(fov);
        this.initRenderer();
        this.initRaycaster();
        
        this.initialised = true;        
    }

    public start() {
        this.assertInitialised();

        this.renderLoop();
    }
    
    private renderLoop() {
        requestAnimationFrame(this.renderLoop.bind(this));
        TWEEN.update();

       this.controls?.update();

        this.renderer!.render(this.scene!, this.camera!);
        this.statsInstance.update();
        // console.log(this.renderer!.info.render);
        this.renderer!.info.reset();
    }
    
    public setSchematic(schematic: UnpackedSchematic) {
        this.assertInitialised();

        // clear everything
        this.scene!.remove(...this.scene!.children);
        this.selectables.clear();
        this.hovered = null;
        this.clickCallbacks = [];
        this.hoverCallbacks = [];
        this.unhoverCallbacks = [];

        this.placer.create(schematic, this.addToScene.bind(this));
    }

    public setControls(controls: Controls) {
        this.assertInitialised();

        this.controls = controls;
    }

    // todo: take in scene and camera???
    private initScene(fov: number = 75) {
        this.scene = new THREE.Scene();

        this.camera = (new THREE.PerspectiveCamera(fov, this.canvas.clientWidth / this.canvas.clientHeight, 0.1, 1000));
    }

    private initRenderer() {
        //todo: make renderer more efficient by removing unused features ie stencil buffer, depth buffer, etc (constructor)
        const renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            stencil: false,
            depth: true,
            antialias: false,
        });
        
        renderer.info.autoReset = false;
        renderer.setClearColor(0x0, 0);
        
        const adaptCanvasSize = () => {
            const canvas = renderer.domElement;

            // look up the size the canvas is being displayed
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;

            // adjust displayBuffer size to match
            if (canvas.width !== width || canvas.height !== height) {
                // you must pass false here or three.js sadly fights the browser
                renderer.setSize(width, height, false);
                this.camera!.aspect = width / height;
                this.camera!.updateProjectionMatrix();

                const pixelRatio = Math.min(window.devicePixelRatio, 2);
                renderer.setPixelRatio(pixelRatio);
            }
        }

        window.addEventListener('resize', adaptCanvasSize);
        adaptCanvasSize();
    
        this.renderer = renderer;
    }
    
    private addToScene(mesh: THREE.InstancedMesh) {
        this.scene!.add(mesh);

        this.selectables.add(mesh);
    }
    
    private initRaycaster() {
        this.raycaster = new THREE.Raycaster();

        let lastMove = 0;
        const delay = 10;

        const onPointerMove = async (event: { clientX: number; clientY: number; }) => {
            if (Date.now() - lastMove < delay) return;
            lastMove = Date.now();

            const pointer = new THREE.Vector2();
            pointer.x = ( event.clientX / this.canvas.clientWidth ) * 2 - 1;
            pointer.y = - ( event.clientY / this.canvas.clientHeight ) * 2 + 1;

            this.raycaster!.setFromCamera(pointer, this.camera!);

            const intersect = this.raycaster!.intersectObjects(Array.from(this.selectables))[0];
            if (!intersect) {
                if (this.hovered) {
                    this.unhoverCallbacks.forEach(callback => callback(this.hovered![0], this.hovered![1]));
                    this.hovered = null;
                }

                return;
            };

            const mesh = intersect.object as THREE.InstancedMesh;
            const id = intersect.instanceId ?? 0;

            if (this.hovered && this.hovered[0] === mesh && this.hovered[1] === id) return;

            if (this.hovered) 
                this.unhoverCallbacks.forEach(callback => callback(this.hovered![0], this.hovered![1]));

            this.hovered = [mesh, id];
            this.hoverCallbacks.forEach(callback => callback(mesh, id));
        };

        const onClick = () => {
            if (!this.hovered) return;

            const [mesh, id] = this.hovered;
            
            this.clickCallbacks.forEach(callback => callback(mesh, id));
        };

        document.addEventListener( 'pointermove', onPointerMove );
        document.addEventListener( 'click', onClick );
    }

    public onRaycast(event: RaycastEvents, callback: (mesh: THREE.InstancedMesh, id: number) => void) {
        switch (event) {
            case RaycastEvents.HOVERED:
                this.hoverCallbacks.push(callback);
                break;
            case RaycastEvents.UNHOVERED:
                this.unhoverCallbacks.push(callback);
                break;
            case RaycastEvents.CLICKED:
                this.clickCallbacks.push(callback);
                break;
        }    
    }

    public getCamera() {
        this.assertInitialised();
        return this.camera!;
    }

    public getControls() {
        this.assertInitialised();
        return this.controls!;
    }

    private assertInitialised() {
        if (!this.initialised) {
            throw new Error("SchematicRenderer was not initialised");
        }
    }

    public setSchematicLocation(pos: THREE.Vector3, duration: number) {
        this.assertInitialised();

        this.scene!.traverse((object) => {
            let source: THREE.Vector3 = object.position;
        
            new TWEEN.Tween(source)
                .to(pos, duration)
                .easing(TWEEN.Easing.Exponential.InOut)
                .start();
        });
    }

    public setSchematicRotation(rotation: THREE.Euler, duration: number) {
        this.assertInitialised();

        this.scene!.traverse((object) => {
            let source: THREE.Euler = object.rotation;
        
            new TWEEN.Tween(source)
                .to(rotation, duration)
                .easing(TWEEN.Easing.Exponential.InOut)
                .start();
        });
    }
}