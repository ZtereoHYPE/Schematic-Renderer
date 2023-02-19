/*
uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat3 normalMatrix;
uniform vec3 cameraPosition;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
*/

out float vertex_ID;
out vec3 vertex_normal;

void main() {
    vertex_ID = position.x;
    vertex_normal = normal;
    mat4 mvp = projectionMatrix * modelViewMatrix * modelViewMatrix;
    gl_Position = mvp * vec4(position, 1.0);
}