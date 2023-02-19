import * as THREE from 'three';
import { Material, Scene } from 'three';

type worldObject = {
    mesh: THREE.Mesh,
    position: THREE.Vector3
}


type buildData = {
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

enum Offset {
    TOP = 16,
    NORTH = 0,
    EAST = 8,
    SOUTH = 32,
    WEST = 40,
    BOTTOM = 24
}

export class GeometryPlacer {
    private scene: Scene;
    private data: buildData;
    private uvCache: { [index: string]: Float32Array } = {};

    constructor(scene: Scene, data: buildData) {
        this.scene = scene;
        this.data = data;
    }

    public place(raycastableObjects: worldObject[]) {
        const material = this.generateMaterial();

        let unwrappedData: (Float32Array | undefined)[] = [];

        for (let i = 0; i < this.data.schem.length; i+=2) {
            let blockType = this.data.schem[i];
            let blockAmount = this.data.schem[i + 1];
            
            let uvMappedFaces = this.unwrapUVs(blockType);

            for (let j = 0; j < blockAmount; j++) {
                unwrappedData.push(uvMappedFaces);
            }
        }
    
        let blockIndex = 0;
        for (let x = 0; x < this.data.sizeX; x++) {
            for (let y = 0; y < this.data.sizeY; y++) {
                    for (let z = 0; z < this.data.sizeZ; z++) {
                    let blockUVs = unwrappedData[blockIndex++];

                    if (!blockUVs) {
                        continue;
                    }

                    const mesh = this.generateBlockMesh(x, y, z, new Float32Array(blockUVs), material); //todo use a float32array since the very beginning
                    this.scene.add(mesh);
                    raycastableObjects.push({mesh: mesh, position: new THREE.Vector3(x, y, z)});
                }
            }
        }    
    }

    private mapTextures(mapping: Float32Array, stride: number, offset: number) {
        let textureAmount = this.data.textureCount;
        let u0 = (stride) / textureAmount + 0.00001;
        let v0 = 0.0;
        let u1 = (stride + 1) / textureAmount - 0.00001;
        let v1 = 1.0;
    
        let uvs = [u1, v1, u0, v1, u1, v0, u0, v0];
    
        for (let i = 0; i < 8; i++) {
            if (mapping[offset + i] == -1) // if the value is already set, don't overwrite it (why do some blocks have multiple textures per faceee)
                mapping[offset + i] = uvs[i];
        }
    }
    

    private unwrapUVs(blockType: number) {
        if (!this.uvCache[blockType]) {
            let blockUVData = this.data.usedTextures[blockType];

            if (Object.keys(blockUVData).length == 0) return undefined;

            let uvMappedFaces = new Float32Array(48);
            uvMappedFaces.fill(-1);

            for (let key in blockUVData) {
                const value = blockUVData[key];
                switch (key) {
                    case "all":
                        this.mapTextures(uvMappedFaces, value, Offset.TOP);
                        this.mapTextures(uvMappedFaces, value, Offset.BOTTOM);
                    case "side":
                        this.mapTextures(uvMappedFaces, value, Offset.NORTH);
                        this.mapTextures(uvMappedFaces, value, Offset.EAST);
                        this.mapTextures(uvMappedFaces, value, Offset.SOUTH);
                        this.mapTextures(uvMappedFaces, value, Offset.WEST);
                        break;
                    case "top":
                        this.mapTextures(uvMappedFaces, value, Offset.TOP);
                        break;
                    case "bottom":
                        this.mapTextures(uvMappedFaces, value, Offset.BOTTOM);
                        break;
                    case "end":
                        this.mapTextures(uvMappedFaces, value, Offset.TOP);
                        this.mapTextures(uvMappedFaces, value, Offset.BOTTOM);
                        break;
                    case "front":
                    case "north":
                        this.mapTextures(uvMappedFaces, value, Offset.NORTH);
                        break;
                    case "east":
                        this.mapTextures(uvMappedFaces, value, Offset.EAST);
                        break;
                    case "south":
                        this.mapTextures(uvMappedFaces, value, Offset.SOUTH);
                        break;
                    case "west":
                        this.mapTextures(uvMappedFaces, value, Offset.WEST);
                        break;
                    default: 
                }
            }

            // fill all empty spots of the array (0..47)
            for (let i = 0; i < 48; i++) {
                if (uvMappedFaces[i] == -1) {
                    // console.log("found undefined at index " + i)
                    uvMappedFaces[i] = 0.5;
                }
            }

            this.uvCache[blockType] = uvMappedFaces;
        }
        
        return this.uvCache[blockType];
    }

    private generateBlockMesh(x: number, y: number, z: number, uvArray: Float32Array, material: Material) {
        let blockgeometry = new THREE.BoxGeometry(1, 1, 1);

        blockgeometry.setAttribute('uv', new THREE.BufferAttribute(uvArray, 2));
        blockgeometry.computeVertexNormals();

        let mesh = new THREE.Mesh(blockgeometry, material);

        mesh.position.set(x, y, z);

        return mesh;
    }

    private generateMaterial() {
        let texture = new THREE.TextureLoader().load('data:image/png;base64, ' + this.data.atlas);

        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.premultiplyAlpha = true;

        let material = new THREE.MeshLambertMaterial({ map: texture, transparent: true, flatShading: false });
        material.flatShading = false;
        return material;
    }
}

// class TextureMapper {

// }