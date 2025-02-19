import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const FuturisticCore = () => {
  const meshRef = useRef();

  const shaderMaterial = new THREE.ShaderMaterial({
    // UNIFORMS usados tanto no vertex quanto no fragment shader
    uniforms: {
      time: { value: 0 },
      resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      coreColor: { value: new THREE.Vector3(0.1, 0.3, 0.8) },
      accentColor: { value: new THREE.Vector3(0.8, 0.8, 0.8) },
    },
    vertexShader: `
      // Precisamos declarar o 'uniform float time;' aqui também
      uniform float time;
      varying vec2 vUv;
      varying vec3 vPos;
      
      void main() {
          vUv = uv;
          vPos = position;

          // Deslocamento que depende do 'time'
          vec3 displacedPosition = position + normal * sin(time * 2.0 + position.x * 2.0) * 0.3;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
      }
    `,
    fragmentShader: `
      // Ativa extensão para usar fwidth (se necessário)
      #extension GL_OES_standard_derivatives : enable

      uniform float time;
      uniform vec2 resolution;
      uniform vec3 coreColor;
      uniform vec3 accentColor;
      varying vec2 vUv;
      varying vec3 vPos;

      // Função para criar um padrão de grade sutil
      float grid(vec2 uv, float divisions) {
          vec2 grid = abs(fract(uv * divisions - 0.5) - 0.5) / fwidth(uv);
          float line = min(grid.x, grid.y);
          return 1.0 - smoothstep(0.0, 1.0, line);
      }
      
      void main() {
          // Gradiente radial baseado na distância do centro
          float r = length(vUv - 0.5);
          // Padrão dinâmico com deslocamento e mais divisões para evidenciar o efeito
          float pattern = grid(
            vUv + vec2(sin(time * 0.8) * 0.2, cos(time * 0.8) * 0.2),
            12.0
          );
          // Mistura as cores com base no gradiente
          vec3 color = mix(coreColor
