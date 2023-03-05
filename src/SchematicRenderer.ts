// import THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as TWEEN from '@tweenjs/tween.js'
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import Stats from 'stats.js';
import { SSAOPass } from "three/examples/jsm/postprocessing/SSAOPass";
import { GeometryPlacer, UnpackedSchematic } from "./GeometryPlacer";
import * as THREE from "three";

export enum RaycastEvents {
    HOVERED,
    UNHOVERED,
    CLICKED
}

export class SchematicRenderer {
    private initialised: boolean = false;

    private placer: GeometryPlacer = new GeometryPlacer();

    private canvas: HTMLCanvasElement;
    private scene: THREE.Scene | undefined;
    private camera: THREE.PerspectiveCamera | undefined;

    private renderer: THREE.WebGLRenderer | undefined;
    private composer: EffectComposer | undefined;

    //todo: a
    private raycaster: THREE.Raycaster | undefined;
    private selectables: Set<THREE.InstancedMesh> = new Set();
    private hovered: [THREE.InstancedMesh, number] | null = null;

    private hoverCallbacks: Array<(mesh: THREE.InstancedMesh, index: number) => void> = [];
    private unhoverCallbacks: Array<(mesh: THREE.InstancedMesh, index: number) => void> = [];
    private clickCallbacks: Array<(mesh: THREE.InstancedMesh, index: number) => void> = [];

    private statsInstance = new Stats();
    private controls: OrbitControls | undefined;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;

        this.init();
    }

    // init method to start renderer
    public init(fov: number = 75, debugControls: boolean = true) {
        this.statsInstance.showPanel(0);
        this.statsInstance.dom.style.position = 'absolute';
        this.statsInstance.dom.style.right = '0px';
        this.statsInstance.dom.style.top = '0px';
        document.body.appendChild(this.statsInstance.dom);

        this.initScene(fov);
        this.initRenderer();
        this.initRaycaster();
        this.initControls(debugControls);
        this.initPostProcessing();
        
        this.initialised = true;        
    }

    public start() {
        if (!this.initialised) {
            console.warn("SchematicRenderer not initialised");
            return;
        }

        this.renderLoop();
    }
    
    private renderLoop() {
        requestAnimationFrame(this.renderLoop.bind(this));
        TWEEN.update();

        this.composer!.render();
        this.statsInstance.update();
        // console.log(this.renderer!.info.render);
        this.renderer!.info.reset();
    }
    
    public setSchematic(schematic: UnpackedSchematic) {
        if (!this.initialised) {
            console.warn("SchematicRenderer not initialised");
            return;
        }

        // clear everything
        this.scene!.remove(...this.scene!.children);
        this.selectables.clear();
        this.hovered = null;
        this.clickCallbacks = [];
        this.hoverCallbacks = [];
        this.unhoverCallbacks = [];

        this.placer.create(schematic, this.addToScene.bind(this));

        this.controls!.target = new THREE.Vector3(schematic.getSizeX() / 2, schematic.getSizeY() / 2, schematic.getSizeZ() / 2);
        this.controls!.update();
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
            alpha: true,
            stencil: false,
            depth: false,
            antialias: false,
            powerPreference: "high-performance"
        });
        
        renderer.info.autoReset = false;

        //todo: find a better way to cap pixel ratio
        let pixelRatio = Math.min(window.devicePixelRatio, 2)
        renderer.setPixelRatio(pixelRatio);

        renderer.setClearColor(0x007777, 0.5);

        //todo: find a way to set it to the canvas size
        // renderer.setSize( window.innerWidth, window.innerHeight );
    
        this.renderer = renderer;
    }

    private initPostProcessing() {
        const composer = new EffectComposer(this.renderer!);

        const ssaoPass = new SSAOPass(this.scene!, this.camera!);
        ssaoPass.kernelRadius = 1;
        ssaoPass.minDistance = 0.0001;
        ssaoPass.maxDistance = 0.001;
        composer.addPass(ssaoPass);
    
        this.composer = composer;
    }

    private initControls(debug: boolean) {
        if (debug) {
            const controls = new OrbitControls(this.camera!, this.renderer!.domElement);
            controls.screenSpacePanning = false;
            controls.minDistance = 1;
            controls.maxDistance = 1000;
            controls.target.set(0, 0, 0);
            controls.update();

            this.controls = controls;
        } else {
            //todo: figure out a nice controls model (rotates slightly as you move the cursor to face it???)
            // const controls = new PointerLockControls(this.camera!, this.renderer!.domElement);
            
        }
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
            //todo: add a timeout to prevent spamming
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
        if (!this.initialised) {
            return;
        }
        return this.camera!;
    }
}