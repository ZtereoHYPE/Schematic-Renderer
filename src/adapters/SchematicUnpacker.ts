import { BuildData } from "../main";
import { UnpackedSchematic } from "../renderer/generation/UnpackedSchematic";

export function unpackSchematic(data: BuildData): UnpackedSchematic {
    const schematic = new UnpackedSchematic(data.sizeX, data.sizeY, data.sizeZ);

    for (let i = 0; i < data.schem.length; i += 2) {
        let blockType = data.schem[i];
        let blockAmount = data.schem[i + 1];

        for (let j = 0; j < blockAmount; j++)
            schematic.pushBlock(blockType);
    }

    schematic.setTextureData(data.atlas, data.textureCount, data.usedTextures);

    return schematic;
}