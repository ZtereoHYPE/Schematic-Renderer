/*

*/

in float vertex_ID;
in vec3 vertex_normal;

void main() {
    pc_fragColor = vec4(1, 1, 1, 1.0);
    // if (fract(vertex_ID) < 0.00001 || fract(vertex_ID) > -0.00001) {
    //     gl_FragColor = vec4(1.0, 0.9, 0.9, 1.0);
    // }
}