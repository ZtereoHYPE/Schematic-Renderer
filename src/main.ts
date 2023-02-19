import './style.css'

import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js'

import { GeometryPlacer } from './GeometryPlacer';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass';
import {SSAOPass} from 'three/examples/jsm/postprocessing/SSAOPass';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const canvas = document.querySelector('#bg') as HTMLCanvasElement;

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
});

type worldObject = {
    mesh: THREE.Mesh,
    position: THREE.Vector3
}

const raycaster = new THREE.Raycaster();
let raycastableObjects: worldObject[] = [];
let currentSelection: THREE.Object3D | null = null;
let pointer = new THREE.Vector2();

type buildData = {
    sizeX: number,
    sizeY: number,
    sizeZ: number,
    schem: number[],
    usedTextures: {          // the index is the first number in the schem, the values are either top bottom side ends or all and represents the faces and their mappings
        [index: string]: {
            [index: string]: number
        }
    }
    atlas: string,
    textureCount: number
}

const data: buildData = {"sizeX":35,"sizeY":71,"sizeZ":85,"textureCount":5,"schem":[0,84755,1,5,0,78,1,10,0,75,1,10,0,72,1,14,0,69,1,16,0,69,1,16,0,68,1,17,0,33,1,5,0,30,1,17,0,32,1,7,0,29,1,17,0,31,1,9,0,27,1,18,0,22,1,19,0,25,1,19,0,20,1,21,0,25,1,21,0,6,1,33,0,25,1,23,0,1,1,37,0,24,1,23,0,1,1,37,0,24,1,61,0,24,1,60,0,25,1,59,0,26,1,59,0,26,1,59,0,26,1,59,0,26,1,58,0,28,1,57,0,29,1,56,0,29,1,55,0,30,1,54,0,31,1,53,0,32,1,52,0,33,1,51,0,34,1,50,0,35,1,50,0,35,1,50,0,35,1,50,0,35,1,50,0,35,1,49,0,36,1,49,0,36,1,48,0,37,1,48,0,37,1,47,0,39,1,45,0,40,1,45,0,42,1,42,0,43,1,41,0,45,1,39,0,48,1,36,0,49,1,35,0,50,1,34,0,51,1,33,0,53,1,31,0,55,1,29,0,56,1,27,0,58,1,27,0,58,1,22,0,64,1,18,0,67,1,17,0,68,1,11,0,74,1,10,0,76,1,8,0,78,1,5,0,81,1,3,0,1442,2,3,0,81,2,5,0,79,2,6,0,78,2,8,0,76,2,11,0,73,2,13,0,71,2,15,0,70,2,16,0,69,2,16,0,14,2,2,0,52,2,17,0,12,2,5,0,51,2,17,0,11,2,7,0,50,2,17,0,11,2,7,0,50,2,17,0,8,2,11,0,49,2,37,0,48,2,38,0,47,2,39,0,46,2,40,0,45,2,40,0,46,2,40,0,45,2,40,0,45,2,40,0,45,2,40,0,45,2,40,0,45,2,39,0,47,2,38,0,48,2,37,0,48,2,36,0,49,2,35,0,50,2,33,0,53,2,31,0,54,2,30,0,56,2,28,0,58,2,26,0,60,2,25,0,60,2,24,0,62,2,20,0,65,2,19,0,66,2,17,0,68,2,16,0,70,2,14,0,71,2,12,0,74,2,10,0,76,2,8,0,77,2,7,0,79,2,5,0,2285,2,3,0,81,2,5,0,79,2,6,0,78,2,8,0,76,2,11,0,73,2,13,0,71,2,15,0,70,2,16,0,69,2,16,0,14,2,2,0,52,2,17,0,12,2,5,0,51,2,17,0,11,2,7,0,50,2,17,0,11,2,7,0,50,2,17,0,8,2,11,0,49,2,37,0,48,2,38,0,47,2,39,0,46,2,40,0,45,2,40,0,46,2,40,0,45,2,40,0,45,2,40,0,45,2,40,0,45,2,40,0,45,2,39,0,47,2,38,0,48,2,37,0,48,2,36,0,49,2,35,0,50,2,33,0,53,2,31,0,54,2,30,0,56,2,28,0,58,2,26,0,60,2,25,0,60,2,24,0,62,2,20,0,65,2,19,0,66,2,17,0,68,2,16,0,70,2,14,0,71,2,12,0,74,2,10,0,76,2,8,0,77,2,7,0,79,2,5,0,2207,3,3,0,80,3,2,0,3,3,2,0,77,3,1,0,7,3,1,0,75,3,1,0,9,3,1,0,73,3,1,0,11,3,1,0,72,3,1,0,12,3,2,0,69,3,1,0,15,3,1,0,68,3,1,0,15,3,1,0,68,3,1,0,16,3,1,0,67,3,1,0,16,3,1,0,67,3,1,0,17,3,1,0,66,3,1,0,18,3,1,0,65,3,1,0,18,3,1,0,65,3,1,0,19,3,4,0,61,3,1,0,23,3,1,0,60,3,1,0,23,3,1,0,60,3,1,0,23,3,1,0,60,3,1,0,23,3,1,0,60,3,1,0,23,3,1,0,61,3,1,0,22,3,1,0,61,3,1,0,22,3,1,0,62,3,1,0,21,3,1,0,63,3,1,0,20,3,1,0,63,3,1,0,20,3,1,0,63,3,1,0,20,3,1,0,64,3,1,0,19,3,1,0,65,3,1,0,18,3,1,0,66,3,1,0,17,3,1,0,66,3,1,0,17,3,1,0,67,3,1,0,16,3,1,0,68,3,1,0,15,3,1,0,68,3,1,0,15,3,1,0,69,3,2,0,13,3,2,0,68,3,2,0,14,3,2,0,68,3,1,0,15,3,1,0,69,3,1,0,14,3,1,0,69,3,1,0,14,3,1,0,70,3,2,0,12,3,1,0,72,3,2,0,10,3,1,0,72,3,2,0,10,3,1,0,72,3,2,0,11,3,1,0,72,3,1,0,11,3,1,0,72,3,1,0,11,3,1,0,72,3,1,0,11,3,1,0,73,3,1,0,10,3,1,0,73,3,1,0,10,3,1,0,73,3,1,0,10,3,1,0,73,3,1,0,10,3,1,0,74,3,2,0,8,3,1,0,76,3,1,0,6,3,1,0,77,3,1,0,6,3,1,0,77,3,1,0,5,3,1,0,79,3,5,0,1596,3,3,0,80,3,2,0,3,3,2,0,77,3,1,0,7,3,1,0,75,3,1,0,9,3,1,0,73,3,1,0,11,3,1,0,72,3,1,0,12,3,2,0,69,3,1,0,15,3,1,0,68,3,1,0,15,3,1,0,68,3,1,0,16,3,1,0,67,3,1,0,16,3,1,0,67,3,1,0,17,3,1,0,66,3,1,0,18,3,1,0,65,3,1,0,18,3,1,0,65,3,1,0,19,3,4,0,61,3,1,0,23,3,1,0,60,3,1,0,23,3,1,0,60,3,1,0,23,3,1,0,60,3,1,0,23,3,1,0,60,3,1,0,23,3,1,0,61,3,1,0,22,3,1,0,61,3,1,0,22,3,1,0,62,3,1,0,21,3,1,0,63,3,1,0,20,3,1,0,63,3,1,0,20,3,1,0,63,3,1,0,20,3,1,0,64,3,1,0,19,3,1,0,65,3,1,0,18,3,1,0,66,3,1,0,17,3,1,0,66,3,1,0,17,3,1,0,67,3,1,0,16,3,1,0,68,3,1,0,15,3,1,0,68,3,1,0,15,3,1,0,69,3,2,0,13,3,2,0,68,3,2,0,14,3,2,0,68,3,1,0,15,3,1,0,69,3,1,0,14,3,1,0,69,3,1,0,14,3,1,0,70,3,2,0,12,3,1,0,72,3,2,0,10,3,1,0,72,3,2,0,10,3,1,0,72,3,2,0,11,3,1,0,72,3,1,0,11,3,1,0,72,3,1,0,11,3,1,0,72,3,1,0,11,3,1,0,73,3,1,0,10,3,1,0,73,3,1,0,10,3,1,0,73,3,1,0,10,3,1,0,73,3,1,0,10,3,1,0,74,3,2,0,8,3,1,0,76,3,1,0,6,3,1,0,77,3,1,0,6,3,1,0,77,3,1,0,5,3,1,0,79,3,5,0,3384,4,2,0,16,4,1,0,66,5,2,0,16,4,1,0,66,5,2,0,16,4,1,0,66,4,2,0,16,4,1,0,66,4,2,0,16,4,1,0,66,4,2,0,16,4,1,0,66,4,2,0,16,4,1,0,66,4,2,0,16,4,1,0,66,4,2,0,3,4,2,0,11,4,1,0,66,4,7,0,8,4,4,0,66,4,7,0,8,4,4,0,66,4,5,0,10,4,4,0,66,4,3,0,13,4,3,0,66,4,3,0,13,4,3,0,490,4,9,0,4005,4,1,0,66,5,3,0,13,4,5,0,64,5,3,0,13,4,5,0,63,5,4,0,13,4,5,0,63,5,4,0,13,4,5,0,63,5,1,4,2,5,1,0,13,4,5,0,63,4,1,5,2,4,1,0,5,5,2,0,6,4,5,0,63,5,4,0,5,5,2,0,6,4,5,0,63,4,4,0,5,5,3,0,5,4,5,0,63,4,4,0,5,5,5,0,3,4,5,0,63,4,4,0,5,5,5,0,3,4,5,0,63,4,4,0,2,4,2,0,3,5,3,4,2,0,1,4,5,0,63,4,4,0,2,4,2,0,3,5,3,4,2,0,1,4,5,0,63,4,9,0,3,5,2,4,8,0,63,4,11,0,1,5,2,4,8,0,63,4,11,0,1,5,2,4,8,0,63,4,8,0,6,5,1,4,7,0,63,4,6,0,10,4,6,0,63,4,6,0,10,4,6,0,64,4,3,0,13,4,3,0,66,4,3,0,13,4,3,0,233,4,13,0,71,4,15,0,71,4,13,0,72,4,13,0,3833,4,1,0,66,5,3,0,13,4,5,0,64,5,3,0,13,4,5,0,63,5,4,0,13,4,5,0,63,5,4,0,13,4,5,0,63,5,1,4,2,5,1,0,13,4,5,0,63,5,4,0,5,5,2,0,6,4,5,0,63,4,1,5,2,4,1,0,5,5,2,0,6,4,5,0,63,5,1,4,2,5,1,0,5,5,3,0,5,4,5,0,63,4,4,0,5,5,5,0,3,4,5,0,63,4,4,0,5,5,5,0,3,4,5,0,63,4,4,0,2,4,2,0,3,5,3,4,2,0,1,4,5,0,63,4,4,0,2,4,2,0,3,5,3,4,2,0,1,4,5,0,63,4,9,0,3,5,2,4,8,0,63,4,11,0,1,5,2,4,8,0,63,4,11,0,1,5,2,4,8,0,63,4,8,0,6,4,1,5,1,4,6,0,63,4,6,0,10,4,6,0,63,4,6,0,10,4,6,0,64,4,3,0,13,4,5,0,64,4,3,0,13,4,3,0,149,4,11,0,72,4,15,0,69,4,16,0,70,4,15,0,71,4,13,0,74,4,9,0,3748,4,3,0,66,5,3,0,13,4,5,0,64,5,3,0,13,4,5,0,63,5,4,0,13,4,5,0,63,5,4,0,13,4,5,0,63,5,1,4,2,5,1,0,13,4,5,0,63,4,1,5,2,4,1,0,5,5,2,0,6,4,5,0,63,5,4,0,5,5,2,0,6,4,5,0,63,4,4,0,5,5,3,0,5,4,5,0,63,4,4,0,5,5,5,0,3,4,5,0,63,4,4,0,5,5,5,0,3,4,5,0,63,4,4,0,2,4,2,0,3,5,3,4,2,0,1,4,5,0,63,4,4,0,2,4,2,0,3,5,3,4,2,0,1,4,5,0,63,4,9,0,3,5,2,4,8,0,63,4,11,0,1,5,2,4,8,0,63,4,11,0,1,5,2,4,8,0,63,4,8,0,6,5,1,4,7,0,63,4,6,0,10,4,6,0,63,4,6,0,10,4,6,0,64,4,3,0,13,4,5,0,64,4,3,0,13,4,5,0,80,4,3,0,63,4,13,0,71,4,15,0,69,4,17,0,69,4,15,0,71,4,13,0,73,4,11,0,3747,4,5,0,64,5,3,0,13,4,5,0,64,5,3,0,13,4,5,0,63,5,4,0,13,4,5,0,63,5,4,0,13,4,5,0,63,5,1,4,2,5,1,0,13,4,5,0,63,5,4,0,5,5,2,0,6,4,5,0,63,4,1,5,2,4,1,0,5,5,2,0,6,4,5,0,63,4,4,0,5,5,3,0,5,4,5,0,63,4,3,5,1,0,5,5,5,0,3,4,5,0,63,4,4,0,5,5,5,0,3,4,5,0,63,4,4,0,2,4,2,0,3,5,3,4,2,0,1,4,5,0,63,4,4,0,2,4,2,0,3,5,3,4,2,0,1,4,5,0,63,4,9,0,3,5,2,4,8,0,63,4,11,0,1,5,2,4,8,0,63,4,11,0,1,5,2,4,8,0,63,4,8,0,6,4,1,5,1,4,6,0,63,4,6,0,10,4,6,0,63,4,6,0,10,4,6,0,64,4,3,0,13,4,5,0,64,4,3,0,13,4,5,0,80,4,3,0,63,4,13,0,71,4,15,0,69,4,17,0,69,4,15,0,71,4,13,0,73,4,11,0,3747,4,5,0,64,5,3,0,13,4,5,0,64,5,3,0,13,4,5,0,63,5,4,0,13,4,5,0,63,5,4,0,13,4,5,0,63,5,1,4,2,5,1,0,13,4,5,0,63,4,1,5,2,4,1,0,5,5,2,0,6,4,5,0,63,5,4,0,5,5,2,0,6,4,5,0,63,4,4,0,5,5,3,0,5,4,5,0,63,4,4,0,5,5,5,0,3,4,5,0,63,4,4,0,5,5,5,0,3,4,5,0,63,4,4,0,2,4,2,0,3,5,3,4,2,0,1,4,5,0,63,4,4,0,2,4,2,0,3,5,3,4,2,0,1,4,5,0,63,4,9,0,3,5,2,4,8,0,63,4,11,0,1,5,2,4,8,0,63,4,11,0,1,5,3,4,7,0,63,4,8,0,6,5,1,4,7,0,63,4,6,0,10,4,6,0,63,4,6,0,10,4,6,0,64,4,3,0,13,4,5,0,64,4,3,0,13,4,5,0,80,4,3,0,63,4,13,0,71,4,15,0,69,4,17,0,69,4,15,0,71,4,13,0,73,4,11,0,3747,4,5,0,64,5,3,0,13,4,5,0,64,5,3,0,13,4,5,0,63,5,4,0,13,4,5,0,63,5,4,0,13,4,5,0,63,5,1,4,2,5,1,0,13,4,5,0,63,5,4,0,5,5,2,0,6,4,5,0,63,4,1,5,2,4,1,0,5,5,2,0,6,4,5,0,63,5,1,4,2,5,1,0,5,5,3,0,5,4,5,0,63,4,4,0,5,5,5,0,3,4,5,0,63,4,4,0,5,5,5,0,3,4,5,0,63,4,4,0,2,4,2,0,3,5,3,4,2,0,1,4,5,0,63,4,4,0,2,4,2,0,3,5,3,4,2,0,1,4,5,0,63,4,9,0,3,5,2,4,8,0,63,4,11,0,1,5,2,4,8,0,63,4,11,0,1,5,2,4,8,0,63,4,8,0,6,4,1,5,1,4,6,0,63,4,6,0,10,4,6,0,63,4,6,0,10,4,6,0,64,4,3,0,13,4,5,0,64,4,3,0,13,4,5,0,80,4,3,0,63,4,13,0,71,4,15,0,69,4,17,0,69,4,15,0,71,4,13,0,73,4,11,0,3747,4,5,0,64,5,3,0,13,4,5,0,64,5,3,0,13,4,5,0,63,5,4,0,13,4,5,0,63,5,4,0,13,4,5,0,63,5,1,4,2,5,1,0,13,4,5,0,63,4,1,5,2,4,1,0,5,5,2,0,6,4,5,0,63,5,4,0,5,5,2,0,6,4,5,0,63,4,4,0,5,5,3,0,5,4,5,0,63,4,4,0,5,5,5,0,3,4,5,0,63,4,4,0,5,5,5,0,3,4,5,0,63,4,4,0,2,4,2,0,3,5,3,4,2,0,1,4,5,0,63,4,4,0,2,4,2,0,3,5,3,4,2,0,1,4,5,0,63,4,9,0,3,5,2,4,8,0,63,4,11,0,1,5,2,4,8,0,63,4,11,0,1,5,2,4,8,0,63,4,8,0,6,5,1,4,7,0,63,4,6,0,10,4,6,0,63,4,6,0,10,4,6,0,64,4,3,0,13,4,5,0,64,4,3,0,13,4,5,0,80,4,3,0,63,4,13,0,71,4,15,0,69,4,17,0,69,4,15,0,71,4,13,0,73,4,11,0,3747,4,5,0,64,5,3,0,13,4,5,0,64,5,3,0,13,4,5,0,63,5,4,0,13,4,5,0,63,5,4,0,13,4,5,0,63,5,1,4,2,5,1,0,13,4,5,0,63,5,4,0,5,5,2,0,6,4,5,0,63,4,1,5,2,4,1,0,5,5,2,0,6,4,5,0,63,4,4,0,5,5,3,0,5,4,5,0,63,4,3,5,1,0,5,5,5,0,3,4,5,0,63,4,4,0,5,5,5,0,3,4,5,0,63,4,4,0,2,4,2,0,3,5,3,4,2,0,1,4,5,0,63,4,4,0,2,4,2,0,3,5,3,4,2,0,1,4,5,0,63,4,9,0,3,5,2,4,8,0,63,4,11,0,1,5,2,4,8,0,63,4,11,0,1,5,2,4,8,0,63,4,8,0,6,4,1,5,1,4,6,0,63,4,6,0,10,4,6,0,63,4,6,0,10,4,6,0,64,4,3,0,13,4,5,0,64,4,3,0,13,4,5,0,80,4,3,0,63,4,13,0,71,4,15,0,69,4,17,0,69,4,15,0,71,4,13,0,73,4,11,0,3749,4,1,0,66,5,3,0,13,4,5,0,64,5,3,0,13,4,5,0,63,5,4,0,13,4,5,0,63,5,4,0,13,4,5,0,63,5,1,4,2,5,1,0,13,4,5,0,63,4,1,5,2,4,1,0,5,5,2,0,6,4,5,0,63,5,4,0,5,5,2,0,6,4,5,0,63,4,4,0,5,5,3,0,5,4,5,0,63,4,4,0,5,5,5,0,3,4,5,0,63,4,4,0,5,5,5,0,3,4,5,0,63,4,4,0,2,4,2,0,3,5,3,4,2,0,1,4,5,0,63,4,4,0,2,4,2,0,3,5,3,4,2,0,1,4,5,0,63,4,9,0,3,5,2,4,8,0,63,4,11,0,1,5,2,4,8,0,63,4,11,0,1,5,2,4,8,0,63,4,8,0,6,5,1,4,7,0,63,4,6,0,10,4,6,0,63,4,6,0,10,4,6,0,64,4,3,0,13,4,5,0,64,4,3,0,13,4,3,0,149,4,11,0,72,4,15,0,69,4,17,0,69,4,15,0,71,4,13,0,74,4,9,0,3750,4,1,0,66,5,3,0,13,4,5,0,64,5,3,0,13,4,5,0,63,5,4,0,13,4,5,0,63,5,4,0,13,4,5,0,63,5,1,4,2,5,1,0,13,4,5,0,63,5,4,0,5,5,2,0,6,4,5,0,63,5,4,0,5,5,2,0,6,4,5,0,63,5,1,4,2,5,1,0,5,5,3,0,5,4,5,0,63,4,4,0,5,5,5,0,3,4,5,0,63,4,4,0,5,5,5,0,3,4,5,0,63,4,4,0,2,4,2,0,3,5,4,4,1,0,1,4,5,0,63,4,4,0,2,4,2,0,3,5,3,4,2,0,1,4,5,0,63,4,9,0,3,5,2,4,8,0,63,4,11,0,1,5,2,4,8,0,63,4,11,0,1,5,2,4,8,0,63,4,8,0,6,5,1,4,7,0,63,4,6,0,10,4,6,0,63,4,6,0,10,4,6,0,64,4,3,0,13,4,3,0,66,4,3,0,13,4,3,0,150,4,9,0,74,4,13,0,71,4,15,0,71,4,13,0,72,4,13,0,32096],"usedTextures":{"2":{"all":1},"0":{},"1":{"all":0},"3":{"all":4},"4":{"all":2},"5":{"all":3}},"atlas":"iVBORw0KGgoAAAANSUhEUgAAAFAAAAAQCAIAAAAOK2+WAAADzUlEQVR4XnWWQVZUQQxFu5s1oAsQGAGyJO3eA7qD/u0A3RTgSOQIOEN7Jya5qVf5BZ6TUye/6k9u3kuqFmfvv52ef61hO2zWo/OL3Dn8NBFvPu8OL7eR+2qfvjM/tfX4y/d3u9sTW7fXlnhMkUw3rEd2NN3Yb8R+s/rzYbFfL/cfFx7rpX9G/tc/45TPSO4en348PP58+m2JreR8slNzWxeVcIAUtsUM2DkTUqiVtvNfbo3HaJ1qdwu8xVGwAXzMqVXBSjDdgGHx7Nir/ebA1/Uq94NfYSUwwsqmT5KX5AZ8BQ9gCgEH6pWqUMUcOVPwmcigGg+E6NnkvaYWOrKAzUiqzrA9B2RRe2k/D2B82orUJDV3hV/VtjK3xLGTMOwq4LfzTT7JQ7oI/Lx18oQMcpyMyCduaZcU4GB2edPejdz+SfiNA1c/W9w3qQkKcd8qsjABZdeKN+SyQLKV0M4oeJRAHjbUtK7auATOtyS96jAH6BmE0bpWC5RH3mhp0SoGnaufHfgl2yC4EnKRdPIQ1rpaPqcKJB0PV9OrcDafo7YDT9ehpHvVkTa+Gnz087JBxinkmwPUq5xd7V8P0tny3sMoLDbEpLfZ4ZN/upOTszJnIXQalu4TOK0rYQO++TnG9e5W7g3gEDkcTg+Tq7etFoIEuOoMufZTYakHmGLYVDlC2D6iyUHNvMED3GdVW1F4ZnJhG7B8683cLqfo2yZvBrNNqC1SyYFcv7mlBTMXNpWvVThr11LXtipcdNZaNRRbAsdn1zxmGLr1Rm0DrMAvnxld0cNik574ecCW1DOFWzizUIcbK7t3dgNlDjOnaXt6uN1GSb6ljZvO7e0hS4OHjYWa1/LaaY2ZUykM5KvCojzJHUOr+lZq16SWABIpLEnr9IaZZkY35hZzGOwk5/kV04vN0NZfF8goqd3A9DA7rRZMLICHfiYG2WfAyk/76JodnbaHh7Qd+KvbE7gpTHR7RwOjqhKmNA3sl5O3bg5k8FoSl/N6ZUWRnhL5f8Fv/VoqetaxnMNZ2FDVLp21dDuaWTplrK/Icg9jgXiQYGmaMx+VwawSAE+TUxE5GQHVq3zqxtLmK8CDsEMhwEieQEXJ2X7xNja2jk0ZJyazNzCEhPLew/Jwm9KgttGVcwsw0Va1VQueWamwLmFJ+lLwKvLg3oqHvGxqn2lUL6emKk/OHF3Uwn6TpVNkCZ6Rro5a+DADUmauzKg6lGD2lq4vkEFwymE/ICwwlVaCK0lg8KI/O3BTlWg+99+Yz8kZb2aJ2eHzTvYSyL0SWZDaEb+t/wDpBi+xnhHObAAAAABJRU5ErkJggg\u003d\u003d"}

//todo: make renderer more efficient by removing unused features ie stencil buffer, depth buffer, etc (constructor)
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );

renderer.setClearColor(0x007777, 0);

THREE.ColorManagement.legacyMode = false;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;

const placer = new GeometryPlacer(scene, data);

placer.place(raycastableObjects);

// add the base64 image as img in the html
const img = document.createElement('img');
img.src = "data:image/png;base64, " + data.atlas;
document.body.appendChild(img);

// give a diagonal rotation to the camera
camera.rotation.x = -0.3;
camera.rotation.y = 1;

camera.position.x = 14;
camera.position.y = 4;
camera.position.z = 14;

camera.translateOnAxis(new THREE.Vector3(0, 0, 1), -7);

// add camera controls
const controls = new OrbitControls( camera, renderer.domElement );
controls.screenSpacePanning = false;
controls.minDistance = 1;
controls.maxDistance = 1000;

// controls.addEventListener( 'change', animate ); 

const ambientLight = new THREE.AmbientLight( 0xd0d0d0 );
const hemisphereLight = new THREE.HemisphereLight( 0x777777, 0x333355, 0.6 );
const directionalLight = new THREE.DirectionalLight( 0xffffdf, 1 );

directionalLight.position.set( 2, 1, 1 );

scene.add(ambientLight);
scene.add(hemisphereLight);
scene.add(directionalLight);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const ssaoPass = new SSAOPass(scene, camera);
ssaoPass.kernelRadius = 1;
ssaoPass.minDistance = 0.0001;
ssaoPass.maxDistance = 0.001;
composer.addPass(ssaoPass);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize( window.innerWidth, window.innerHeight );
}
window.addEventListener( 'resize', onWindowResize );

function onPointerMove( event: { clientX: number; clientY: number; } ) {
    pointer.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );
    raycaster.setFromCamera( pointer, camera );
    const intersects = raycaster.intersectObjects( raycastableObjects.map(o => o.mesh), false );
    
    if ( intersects.length > 0 ) {
        const intersect = intersects[ 0 ];
        if (currentSelection == intersect.object) {
            return;
        }
        
        if (currentSelection != null)
        setResizeAnimation(currentSelection, currentSelection.scale, new THREE.Vector3(1, 1, 1));
        
        currentSelection = intersect.object;
        
        setResizeAnimation(currentSelection, currentSelection.scale, new THREE.Vector3(1.2, 1.2, 1.2));
    } else {
        if (currentSelection != null) {
            setResizeAnimation(currentSelection, currentSelection.scale, new THREE.Vector3(1, 1, 1));
        }
        currentSelection = null;
    }
}
document.addEventListener( 'pointermove', onPointerMove );

function onClick() {
    if (currentSelection != null) {
        let zoomedElement = currentSelection;
        
        let rotationTarget = camera.quaternion.clone();
        let source = zoomedElement.quaternion.clone();
        let duration = 500;

        const rotationTween = new TWEEN.Tween( source )
            .to( rotationTarget, duration )
            .easing( TWEEN.Easing.Exponential.Out )
            .onUpdate( () => { 
                zoomedElement.quaternion.copy( source );
            });

        const distanceFromCamera = 3;  // 3 units
        const target = new THREE.Vector3(0, 0, -distanceFromCamera);
        target.applyMatrix4(camera.matrixWorld);

        const positionTween = new TWEEN.Tween( zoomedElement.position )
            .to( target, duration )
            .easing( TWEEN.Easing.Exponential.Out )
            .onUpdate( () => {
                zoomedElement.position.copy( zoomedElement.position );
            }
        );
        // olderPosition = zoomedElement.position.clone();
        rotationTween.start();
        positionTween.start();
    }
}
window.addEventListener( 'click', onClick );

function setResizeAnimation(object: THREE.Object3D, source: THREE.Vector3, target: THREE.Vector3) {
    let duration = 300;

    new TWEEN.Tween( source )
        .to( target, duration )
        .easing( TWEEN.Easing.Exponential.Out )
        .onUpdate( () => { object.scale.copy( source );})
        // .onComplete(() => cancelAnimationFrame(animationFrame))
        .start();
}

function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();
    composer.render();
}

animate();
