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
out vec3 vNormal;
out vec4 vInstanceColor;

void main() {
    vUv = uv;
    vNormal = normal;
    vInstanceColor = vec4(instanceColor, 0.0);
    
    mat4 mvp = projectionMatrix * modelViewMatrix * instanceMatrix;
    gl_Position = mvp * vec4(position, 1.0);
}