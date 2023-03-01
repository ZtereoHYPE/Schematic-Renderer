uniform sampler2D uTexture;
uniform float uUvScale;

in vec2 vUv;
in vec3 vNormal;
in vec3 vColor;

void main() {
    // get how much the face is facing east/west or top/bottom, to darken accordingly
    float weast = abs(dot(vec3(1.0, 0.0, 0.0), vNormal));
    float bottop = abs(dot(vec3(0.0, 1.0, 0.0), vNormal));
    float darken = 1.0 - (weast * 0.2 + bottop * 0.1);

    vec4 tex = texture2D(uTexture, vUv);

    vec4 color = tex * vec4(darken, darken, darken, 1.0) + vec4(vColor, 0.0);
    // vec4 color = tex * vec4(vColor, 1.0);
    pc_fragColor = color;
}