uniform sampler2D uTexture;
uniform float uUvScale;

in vec2 vUv;
in vec3 vNormal;
in vec4 vInstanceColor;
in float vDarken;

void main() {
    vec4 tex = texture2D(uTexture, vUv);
    vec4 color = tex * vec4(vDarken, vDarken, vDarken, 1.0) + vInstanceColor;
    pc_fragColor = color;
}