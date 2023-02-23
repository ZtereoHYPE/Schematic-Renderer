uniform sampler2D uTexture;
uniform float uUvScale;

in vec2 vUv;
in vec2 vUvOffsets;

void main() {
    vec4 color = texture2D(uTexture, (vUvOffsets));
    pc_fragColor = color;
}