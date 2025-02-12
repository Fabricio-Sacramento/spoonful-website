attribute vec3 instancePosition;
uniform float time;
varying vec3 vColor;

void main() {
  vec3 pos = instancePosition;

  // Simulação simples de fluído: oscilar partículas no tempo
  pos.y += sin(time + pos.x * 2.0) * 0.02;

  vColor = vec3(0.0, 0.5, 1.0); // Azul para fluído
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
