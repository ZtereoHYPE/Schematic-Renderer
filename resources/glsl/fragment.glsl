uniform sampler2D uTexture;
uniform float uUvScale;

in vec2 vUv;
in vec3 vNormal;
in vec4 vInstanceColor;

void main() {
    // get how much the face is facing east/west or top/bottom, to darken accordingly
    float weast = abs(dot(vec3(1.0, 0.0, 0.0), vNormal));
    float nouth = abs(dot(vec3(0.0, 0.0, 1.0), vNormal));
    float darken = 1.0 - (weast * 0.25 + nouth * 0.15);

    vec4 tex = texture2D(uTexture, vUv);

    vec4 color = tex * vec4(darken, darken, darken, 1.0) + vInstanceColor;
    pc_fragColor = color;
}