
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

in vec2 uvOffsets;

// out vec2 vUv;
out vec2 vUvOffsets;

void main() {
    // vUv = uv;
    vUvOffsets = uvOffsets;
    mat4 mvp = projectionMatrix * modelViewMatrix * instanceMatrix;
    gl_Position = mvp * vec4(position, 1.0);
}