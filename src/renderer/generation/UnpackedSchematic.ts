export class UnpackedSchematic {
    private sizeX: number;
    private sizeY: number;
    private sizeZ: number;

    private textureCount: number | undefined;
    private textureData: string | undefined;
    private textureDictionary: {
        [index: string]: {
            [index: string]: number
        }
    } | undefined;

    private schematic: number[] = [];

    private blockCounts: Map<number, number> = new Map();

    constructor(sizeX: number, sizeY: number, sizeZ: number) {
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.sizeZ = sizeZ;

        this.schematic = [];
    }

    public setBlock(type: number, x: number, y: number, z: number) {
        if (!this.blockCounts.has(type) && type != 0) 
            this.blockCounts.set(type, 0);

        this.blockCounts.set(type, this.blockCounts.get(type)! + 1);

        if (x < 0 || x >= this.sizeX || y < 0 || y >= this.sizeY || z < 0 || z >= this.sizeZ)
            throw new Error("Block is out of bounds!");

        this.schematic[this.getSchematicLocation(x, y, z)] = type;
    }

    public pushBlock(type: number) {
        if (!this.blockCounts.has(type) && type != 0)
            this.blockCounts.set(type, 0);

        this.blockCounts.set(type, this.blockCounts.get(type)! + 1);

        if (this.schematic.length > this.sizeX * this.sizeY * this.sizeZ) {
            throw new Error("Schematic is full!");
        }

        this.schematic.push(type);
    }

    // todo: might be wrong
    private getSchematicLocation(x: number, y: number, z: number) {
        return x + y * this.sizeX + z * this.sizeX * this.sizeY;
    }

    /**
     * @param {string} texture The texture data in a base64 encoded png where all the textures are lined up from left to right.
     * @param {number} textureCount The total amount of textures in the texture data.
     * @param {number} textureResolution The resolution of the textures in the texture data.
     * @param {{ [index: string]: { [index: string]: number } }} textureMapping The mapping that the block types will have for the textures.
     * 
     * The format of the mapping is as follows:
     * ```json
     * {
     * .    "blockType": {
     * .        "textureMapping": textureIndex,
     * .        "textureMapping2": textureIndex2,
     * .        [...]
     * .    }
     * }
     * ```
     * 
     * Where blockType is an index used to determine the current block type, 
     * textureMapping is the mapping that the block type will have for the textures,
     * and textureIndex is the index of the texture in the texture data (starting from 0).
     * 
     * Available textureMappings are:
     * - top
     * - bottom
     * - north
     * - east
     * - south
     * - front (north)
     * - all (6 sides)
     * - sides (north, east, south, west)
     * - end (top, bottom)
     * @returns {void}
     * @memberof UnpackedSchematic
     */
    public setTextureData(texture: string, textureCount: number, textureMapping: { [index: string]: { [index: string]: number } }) {
        this.textureData = texture;
        this.textureCount = textureCount;
        this.textureDictionary = textureMapping;
    }

    public getBlockCount() {
        return this.blockCounts;
    }

    public getSchem() {
        return this.schematic;
    }

    public getSizeX() {
        return this.sizeX;
    }

    public getSizeY() {
        return this.sizeY;
    }

    public getSizeZ() {
        return this.sizeZ;
    }

    public getTextureData() {
        return this.textureData;
    }

    public getTextureCount() {
        return this.textureCount;
    }

    public getTextureDictionary() {
        return this.textureDictionary;
    }
}