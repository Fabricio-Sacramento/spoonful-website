import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/108/three.module.js';

let str = "WHAT WE DO WHAT WE DO";
let camera, scene, renderer, mesh, material;

// Seleciona o container definido para a animação na C3
const container = document.getElementById("three-container");

function init() {
  const width = container.clientWidth;
  const height = container.clientHeight;

  camera = new THREE.PerspectiveCamera(70, width / height, 1, 10000);
  camera.position.z = 125;
  scene = new THREE.Scene();

  material = new THREE.MeshBasicMaterial();
  mesh = new THREE.Mesh(new THREE.TorusBufferGeometry(15, 25, 50, 50), material);
  scene.add(mesh);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  container.appendChild(renderer.domElement);

  window.addEventListener('resize', onWindowResize, false);

  setCanvas();
  onWindowResize();
}

function setCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const context = canvas.getContext("2d");

  context.strokeStyle = '#F4A70B';
  context.lineWidth = 2;
  context.font = "150px Helvetica, Arial"; // Atualize a fonte e o tamanho conforme necessário

  for (let i = 0; i < 6; i++) {
    context.strokeText(str, 0, i * 200);
  }
  
  material.map = new THREE.CanvasTexture(
    canvas,
    THREE.UVMapping,
    THREE.RepeatWrapping,
    THREE.RepeatWrapping
  );
}

function onWindowResize() {
  const width = container.clientWidth;
  const height = container.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  material.map.offset.x -= 0.001;
  material.map.offset.y += 0.005;
  material.map.needsUpdate = true;
  
  mesh.rotation.x += 0.01;
  mesh.rotation.y -= 0.01;
  mesh.rotation.z += 0.01;
  
  renderer.render(scene, camera);
}

init();
animate();
