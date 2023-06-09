// uniform mat4 modelMatrix;
// uniform mat4 modelViewMatrix;
// uniform mat4 projectionMatrix;
// uniform mat4 instanceMatrix;
// uniform mat4 viewMatrix;
// uniform mat3 normalMatrix;
// uniform vec3 cameraPosition;

// in vec3 position;
// attribute vec3 normal;
// attribute vec2 uv;

in vec3 instanceColor;

out vec2 vUv;
out vec4 vInstanceColor;
out float vDarken;

void main() {
    vUv = uv;
    vInstanceColor = vec4(instanceColor, 0.0);

    float weast = abs(dot(vec3(1.0, 0.0, 0.0), normal));
    float nouth = abs(dot(vec3(0.0, 0.0, 1.0), normal));
    vDarken = 1.0 - (weast * 0.25 + nouth * 0.15);
    
    mat4 mvp = projectionMatrix * modelViewMatrix * instanceMatrix;
    gl_Position = mvp * vec4(position, 1.0);
}