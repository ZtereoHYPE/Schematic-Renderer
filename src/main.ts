import './style.css'

import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js'

import { UnpackedSchematic } from './GeometryPlacer';
import { RaycastEvents, SchematicRenderer } from './SchematicRenderer';

const data: BuildData = {"sizeX":13,"sizeY":21,"sizeZ":15,"schem":[0,135,1,2,0,3,1,1,0,3,1,1,0,3,1,2,2,3,0,1,2,3,0,1,2,3,0,1,2,3,0,2,2,3,0,1,2,3,0,1,2,3,0,5,1,1,0,3,1,1,0,3,1,1,0,139,3,1,0,3,3,1,0,3,3,1,0,3,3,1,0,47,3,2,0,1,3,3,0,1,3,3,0,1,3,2,0,2,4,1,2,3,4,1,2,3,4,1,2,3,4,1,0,2,4,1,0,3,4,1,0,3,4,1,0,3,4,1,0,2,4,1,0,3,4,1,0,3,4,1,0,3,4,1,0,2,4,1,0,3,4,1,0,3,4,1,0,3,4,1,0,1,1,1,4,13,1,1,5,15,1,15,0,135,3,1,6,13,3,1,0,1,6,1,0,1,7,1,0,1,6,1,0,1,7,1,0,1,6,1,0,1,7,1,0,1,6,1,0,2,6,1,0,1,7,1,0,1,6,1,0,1,7,1,0,1,6,1,0,1,7,1,0,1,6,1,0,2,6,1,7,3,6,1,7,3,6,1,7,3,6,1,0,2,4,1,3,1,7,1,3,1,4,1,3,1,7,1,3,1,4,1,3,1,7,1,3,1,4,1,0,1,8,1,4,1,0,1,6,1,0,1,4,1,0,1,6,1,0,1,4,1,0,1,6,1,0,1,4,1,8,1,0,1,5,1,9,3,0,1,9,3,0,1,9,3,5,1,0,2,5,1,9,1,10,1,9,1,0,1,9,1,10,1,9,1,0,1,9,1,10,1,9,1,5,1,0,2,5,1,9,1,10,1,9,1,0,1,9,1,10,1,9,1,0,1,9,1,10,1,9,1,5,1,0,2,4,1,9,3,0,1,9,3,0,1,9,3,4,1,0,2,5,1,0,11,5,1,0,1,5,15,1,15,0,121,6,1,11,1,6,1,11,1,4,1,11,1,6,1,11,1,4,1,11,1,6,1,11,1,6,1,0,3,11,1,6,1,11,1,4,1,11,1,6,1,11,1,4,1,11,1,6,1,11,1,0,4,11,1,6,1,11,1,4,1,11,1,6,1,11,1,4,1,11,1,6,1,11,1,0,3,7,1,6,3,4,1,6,3,4,1,6,3,7,1,0,2,3,1,11,1,6,1,11,1,4,1,11,1,6,1,11,1,4,1,11,1,6,1,11,1,3,1,0,1,2,1,4,2,5,1,4,1,5,5,4,1,5,1,4,2,2,1,12,1,4,2,13,1,4,1,5,1,13,1,9,2,5,1,4,1,13,1,4,2,12,2,4,2,0,1,4,1,5,1,0,1,14,1,0,1,5,1,4,1,0,1,4,2,12,2,4,2,1,1,4,1,5,1,0,3,5,1,4,1,1,1,4,2,12,1,1,1,4,1,0,1,4,1,0,1,5,1,2,1,1,1,2,1,5,1,0,1,4,1,0,1,4,1,1,1,0,1,4,1,0,4,5,3,0,4,4,1,0,2,4,1,0,4,1,1,0,6,4,1,0,1,5,15,1,15,0,93,5,9,0,4,6,2,15,2,7,1,16,1,7,1,17,1,18,1,8,1,19,1,6,2,0,2,7,1,6,1,2,2,7,1,3,1,16,1,7,1,0,2,12,1,6,1,7,1,0,2,7,1,6,1,0,2,20,1,3,2,0,2,21,2,6,1,7,1,0,2,7,1,6,1,0,3,7,1,0,4,21,1,6,1,7,1,0,2,3,1,6,1,0,1,22,1,4,1,6,1,22,2,4,1,22,2,6,1,3,1,0,1,1,1,4,1,5,1,0,1,5,8,0,1,4,1,1,1,0,2,9,1,0,1,12,1,7,1,23,1,13,4,24,1,9,1,0,4,10,1,0,1,12,1,7,2,25,1,0,1,26,1,12,1,0,1,10,1,0,3,2,1,9,1,1,1,5,1,27,1,7,1,0,3,5,1,1,1,9,1,2,1,0,1,1,1,4,1,0,1,4,1,1,1,13,1,7,1,0,2,13,1,1,1,4,1,0,1,4,1,1,1,0,1,5,1,0,3,9,1,7,1,1,2,9,1,0,3,5,1,0,2,4,1,0,3,9,1,7,1,1,1,0,5,4,1,0,2,5,1,0,4,9,1,0,6,5,1,0,1,5,3,28,2,5,10,0,3,28,2,0,13,28,2,0,13,28,1,7,1,0,13,7,2,0,13,29,2,0,28,5,9,0,4,6,1,11,1,0,1,2,1,0,1,30,1,7,1,18,1,31,1,18,1,31,1,11,1,6,1,0,3,11,1,5,1,2,1,0,7,11,1,0,4,11,1,2,1,0,8,11,1,0,3,7,1,6,1,0,8,21,1,6,1,7,1,0,2,3,1,11,1,0,1,22,1,4,1,22,3,4,1,22,2,11,1,3,1,0,1,1,1,4,1,5,1,0,1,5,8,0,1,4,1,1,1,0,2,9,1,0,2,17,1,0,2,22,1,13,2,24,1,9,1,0,4,10,1,0,5,26,1,0,1,25,1,0,1,10,1,0,3,2,1,9,1,1,2,0,5,1,2,9,1,2,1,0,1,1,1,4,1,0,1,4,1,2,1,0,5,2,1,4,1,0,1,4,1,1,1,0,1,4,1,0,2,22,7,0,2,4,1,0,2,4,1,0,4,22,1,0,6,4,1,8,1,0,1,4,1,0,11,4,1,8,1,1,1,4,1,0,4,5,1,0,6,4,1,1,16,0,78,5,9,0,3,3,1,6,1,4,1,0,1,2,1,0,1,32,2,18,1,13,3,4,1,6,1,3,1,0,1,6,1,4,1,0,6,25,1,26,1,33,1,4,1,6,1,0,2,6,1,4,1,2,1,0,7,27,1,4,1,6,1,0,2,6,1,4,1,2,1,0,8,4,1,6,1,0,2,4,2,0,1,22,1,4,9,0,1,2,1,4,2,0,1,5,8,4,2,2,1,12,1,4,2,0,3,17,1,32,2,0,1,32,1,8,1,4,2,12,2,4,2,0,9,4,2,12,2,4,2,0,9,4,2,12,1,1,1,4,1,0,1,5,2,0,5,5,2,0,1,4,1,1,1,0,1,13,1,0,2,22,2,1,3,22,2,0,2,13,1,0,2,10,1,0,11,10,1,0,2,10,1,0,11,10,1,0,1,1,1,4,1,0,11,4,1,1,16,0,78,5,9,0,4,6,1,11,1,34,1,8,1,17,1,32,1,18,1,31,1,22,3,11,1,6,1,0,3,11,1,16,1,0,5,14,1,25,1,33,1,11,1,0,4,11,1,0,9,11,1,0,3,7,1,6,1,2,1,0,8,6,1,7,1,0,2,3,1,11,1,2,1,22,1,4,1,22,3,4,1,22,2,11,1,3,1,0,1,1,1,4,1,5,1,0,1,5,8,0,1,4,1,1,1,0,2,9,1,0,2,32,2,17,1,0,1,18,1,32,1,18,1,9,1,0,4,10,1,0,9,10,1,0,3,2,1,9,1,1,2,0,5,1,2,9,1,2,1,0,1,1,1,4,1,0,1,4,1,2,1,0,5,2,1,4,1,0,1,4,1,1,1,0,1,4,1,0,2,22,7,0,2,4,1,0,2,4,1,0,11,4,1,8,1,0,1,4,1,0,11,4,1,8,1,1,1,4,1,0,11,4,1,1,16,0,78,5,9,0,4,6,2,34,1,19,1,8,2,17,1,8,1,13,3,6,2,0,2,7,1,6,1,34,1,35,1,0,1,8,1,0,1,8,1,33,1,26,1,14,1,6,1,7,1,0,2,7,1,6,1,16,1,36,1,0,1,8,3,0,3,6,1,7,1,0,2,7,1,6,1,0,3,8,3,0,3,6,1,7,1,0,2,3,1,6,1,0,1,22,1,4,1,22,3,4,1,22,2,6,1,3,1,0,1,1,1,4,1,5,1,2,1,5,8,0,1,4,1,1,1,0,2,9,1,0,1,12,1,0,1,32,1,0,1,18,1,19,1,12,1,18,1,9,1,0,4,10,1,0,1,12,1,0,4,37,1,12,1,0,1,10,1,0,3,2,1,9,1,1,1,5,1,0,5,5,1,1,1,9,1,2,1,0,1,1,1,4,1,0,1,4,1,1,1,13,1,0,3,13,1,1,1,4,1,0,1,4,1,1,1,0,1,5,1,0,3,9,1,1,3,9,1,0,3,5,1,0,2,4,1,0,11,4,1,0,2,5,1,0,11,5,1,0,1,5,15,0,97,5,1,0,8,6,1,11,1,6,1,11,1,4,1,5,1,38,1,5,1,4,1,11,1,6,1,11,1,6,1,0,3,11,1,6,1,11,1,4,1,5,1,38,1,5,1,4,1,11,1,6,1,11,1,0,4,11,1,6,1,11,1,4,1,5,3,4,1,11,1,6,1,11,1,0,3,7,1,6,3,4,1,5,3,4,1,6,3,7,1,0,2,3,1,11,1,6,1,11,1,4,1,5,3,4,1,11,1,6,1,11,1,3,1,0,1,2,1,4,2,5,1,4,1,5,5,4,1,5,1,4,2,2,1,12,1,4,2,13,1,4,1,5,1,0,3,5,1,4,1,13,1,4,2,12,2,4,2,0,1,4,1,5,1,0,3,5,1,4,1,0,1,4,2,12,2,4,2,1,1,4,1,5,1,0,3,5,1,4,1,1,1,4,2,12,1,1,1,4,1,0,1,4,3,2,1,1,1,2,1,4,3,0,1,4,1,1,1,0,1,4,1,0,4,5,3,0,4,4,1,0,2,4,1,0,11,4,1,0,1,5,15,1,15,0,96,5,3,0,1,6,3,0,2,3,1,6,5,8,1,0,1,8,1,6,5,3,1,0,1,6,1,0,1,7,1,0,1,6,1,8,1,0,1,8,1,6,1,0,1,7,1,0,1,6,1,0,2,6,1,0,1,7,1,0,1,6,1,8,3,6,1,0,1,7,1,0,1,6,1,0,2,6,1,7,3,6,1,3,1,20,1,3,1,6,1,7,3,6,1,0,2,4,1,3,1,7,1,3,1,6,5,3,1,7,1,3,1,4,1,0,1,8,1,4,1,6,11,4,1,8,1,0,1,5,1,9,3,0,1,9,3,0,1,9,3,5,1,0,2,5,1,9,1,10,1,9,1,0,1,9,1,10,1,9,1,0,1,9,1,10,1,9,1,5,1,0,2,5,1,9,1,10,1,9,1,0,1,9,1,10,1,9,1,0,1,9,1,10,1,9,1,5,1,0,2,4,1,0,1,9,1,0,2,9,3,0,2,9,1,0,1,4,1,0,2,5,1,0,11,5,1,0,1,5,15,1,3,5,1,1,3,5,1,1,3,5,1,1,3,0,3,1,1,0,3,1,1,0,3,1,1,0,109,3,1,0,3,3,1,0,3,3,1,0,3,3,1,0,47,3,2,0,1,3,3,0,1,3,3,0,1,3,2,0,2,4,1,2,3,4,1,2,3,4,1,2,3,4,1,0,2,4,1,39,3,4,1,39,3,4,1,39,3,4,1,0,2,4,1,40,1,37,1,41,1,4,1,40,1,42,1,43,1,4,1,44,1,37,1,41,1,4,1,0,2,4,1,0,3,4,1,0,3,4,1,0,3,4,1,0,1,1,1,4,13,1,1,5,3,4,1,5,3,4,1,5,3,4,1,5,3,1,2,2,1,5,1,2,1,1,1,2,1,5,1,2,1,1,1,2,1,5,1,2,1,1,2,0,3,5,1,0,3,5,1,0,3,5,1,0,6,1,1,0,3,1,1,0,3,1,1,0,200,8,3,0,1,8,3,0,1,8,3,0,17,1,1,2,1,0,3,2,1,0,3,2,1,0,3,2,1,1,1,2,3,0,1,2,3,0,1,2,3,0,1,2,3,0,2,5,1,4,1,5,1,0,1,5,1,4,1,5,1,0,1,5,1,4,1,5,1,0,4,2,3,0,1,2,3,0,1,2,3,0,5,2,1,0,3,2,1,0,3,2,1],"usedTextures":{"4":{"end":18,"side":17},"26":{"wool":36},"1":{"bottom":31,"side":31,"top":31},"16":{"front":21,"side":22,"top":23},"23":{"top":9},"38":{},"0":{},"11":{"all":33},"13":{"bottom":19,"side":19,"top":19},"31":{"bottom":26,"side":26,"top":26},"35":{},"6":{"all":13},"5":{"all":31},"14":{"particle":1,"bottom":0,"top":2,"side":1},"44":{"cross":35},"43":{"cross":10},"20":{"bottom":13,"side":13,"top":13},"39":{"bottom":20,"side":28,"top":29},"18":{},"22":{"bottom":19,"side":19,"top":19},"32":{"wool":12},"37":{"cross":11},"10":{},"21":{"all":7},"24":{},"2":{"bottom":31,"side":31,"top":31},"15":{"particle":26},"33":{"texture":25},"27":{"torch":34},"34":{"down":26,"east":15,"north":14,"particle":14,"south":15,"up":16,"west":14},"3":{"bottom":13,"side":13,"top":13},"17":{"wool":24},"25":{"particle":5,"flowerpot":5,"dirt":4},"9":{"all":19},"19":{"all":20},"12":{},"7":{},"41":{"cross":8},"30":{"particle":3,"base":3,"lever":6},"28":{"all":32},"42":{"cross":30},"29":{"bottom":33,"side":33,"top":33},"8":{},"36":{},"40":{"cross":27}},"atlas":"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\u003d\u003d", textureCount: 37}

type BuildData = {
    atlas: string,
    schem: number[],
    sizeX: number,
    sizeY: number,
    sizeZ: number,
    usedTextures: {
        [index: string]: {
            [index: string]: number
        }
    },
    textureCount: number
}

function unpackSchematic(data: BuildData): UnpackedSchematic {
    const schematic = new UnpackedSchematic(data.sizeX, data.sizeY, data.sizeZ);

    for (let i = 0; i < data.schem.length; i+=2) {
        let blockType = data.schem[i];
        let blockAmount = data.schem[i + 1];

        for (let j = 0; j < blockAmount; j++) 
            schematic.pushBlock(blockType);
    }

    schematic.setTextureData(data.atlas, data.textureCount, data.usedTextures);

    return schematic;
}

const canvas = document.querySelector('#bg') as HTMLCanvasElement;

const schemRend = new SchematicRenderer(canvas);

schemRend.init();
schemRend.setSchematic(unpackSchematic(data));

schemRend.onRaycast(RaycastEvents.HOVERED, (mesh, index) => {
    let sourceColor: THREE.Color = new THREE.Color(0x000000);
    if(mesh.instanceColor)
        mesh.getColorAt(index, sourceColor);

    let destinationColor = new THREE.Color(0x777777);

    new TWEEN.Tween( sourceColor )
        .to( destinationColor, 300)
        .easing( TWEEN.Easing.Exponential.Out )
        .onUpdate( (vColor) => {
            mesh.setColorAt(index, vColor);
            mesh.instanceColor!.needsUpdate = true;
        })
        .start();
});

schemRend.onRaycast(RaycastEvents.UNHOVERED, (mesh, index) => {
    let sourceColor: THREE.Color = new THREE.Color(0x000000);
    if(mesh.instanceColor)
        mesh.getColorAt(index, sourceColor);

    let destinationColor = new THREE.Color(0x000000);

    new TWEEN.Tween( sourceColor )
        .to( destinationColor, 300)
        .easing( TWEEN.Easing.Exponential.Out )
        .onUpdate( (vColor) => {
            mesh.setColorAt(index, vColor);
            mesh.instanceColor!.needsUpdate = true;
        })
        .start();
});

schemRend.onRaycast(RaycastEvents.CLICKED, (mesh, index) => {
    let dummy = new THREE.Object3D();
    mesh.getMatrixAt(index, dummy.matrix)

    let dirVector = new THREE.Vector3(0, 0, 0);
    schemRend.getCamera()!.getWorldDirection(dirVector);

    dirVector.multiplyScalar(3);

    let targetArr = schemRend.getCamera()!.matrix.clone().toArray();

    // shift matrix location away from camera vector
    targetArr[12] += dirVector.x;
    targetArr[13] += dirVector.y;
    targetArr[14] += dirVector.z;

    let target = new THREE.Matrix4().fromArray(targetArr);
    let duration = 500;

    const matrixTween = new TWEEN.Tween( dummy.matrix )
        .to( target, duration )
        .easing( TWEEN.Easing.Exponential.Out )
        .onUpdate( () => {
            mesh.setMatrixAt(index, dummy.matrix);
            mesh.instanceMatrix!.needsUpdate = true;
        }
    );

    matrixTween.start();
});

schemRend.start();
