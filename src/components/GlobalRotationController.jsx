import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Componente para rotacionar um grupo olhando para a posição do mouse.
 * - Usa as dimensões do canvas (useThree().size.width/height) para normalizar as coordenadas.
 * - Aplica slerp para suavizar a rotação em direção ao quaternion alvo.
 *
 * @param {number} sensitivity   - Fator de interpolação (0.0 ~ 1.0). Ex.: 0.1 => 10% a cada frame
 * @param {number} maxAngleX     - Rotação máxima no eixo X (em radianos)
 * @param {number} maxAngleY     - Rotação máxima no eixo Y (em radianos)
 * @param {object} transformRef  - Ref compartilhado, se quiser sincronizar com outros componentes
 */
const GlobalRotationController = ({
  children,
  sensitivity,
  transformRef,
  maxAngleX,
  maxAngleY,
}) => {
  // Se um transformRef for passado, use-o; caso contrário, crie um interno
  const internalRef = useRef();
  const groupRef = transformRef || internalRef;

  // Obtém as dimensões do canvas (largura e altura)
  const { size } = useThree();

  // Quaternion alvo (onde queremos chegar)
  const [targetQuaternion] = useState(() => new THREE.Quaternion());

  /**
   * onPointerMove: atualiza o quaternion alvo de acordo com a posição do mouse
   */
  const onPointerMove = (event) => {
    // event.clientX / clientY: posição absoluta do mouse na tela
    // Normaliza para -1..1 com base no tamanho do canvas
    const normX = (event.clientX / size.width) * 2 - 1;  // -1 (esquerda) .. +1 (direita)
    const normY = -((event.clientY / size.height) * 2 - 1); // -1 (baixo) .. +1 (topo)

    // Calcula ângulos alvo, limitados pelos maxAngleX e maxAngleY
    const targetAngleY = THREE.MathUtils.clamp(normX * maxAngleY, -maxAngleY, maxAngleY);
    const targetAngleX = THREE.MathUtils.clamp(normY * maxAngleX, -maxAngleX, maxAngleX);

    // Cria um Euler com esses ângulos e converte em quaternion
    const euler = new THREE.Euler(targetAngleX, targetAngleY, 0, 'XYZ');
    targetQuaternion.setFromEuler(euler);
  };

  /**
   * useFrame: a cada frame, interpolamos (slerp) da rotação atual para o targetQuaternion
   */
  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.quaternion.slerp(targetQuaternion, sensitivity);
  });

  return (
    <group ref={groupRef} onPointerMove={onPointerMove}>
      {children}
    </group>
  );
};

GlobalRotationController.propTypes = {
  children: PropTypes.node,
  sensitivity: PropTypes.number,
  transformRef: PropTypes.shape({ current: PropTypes.any }),
  maxAngleX: PropTypes.number,
  maxAngleY: PropTypes.number,
};

GlobalRotationController.defaultProps = {
  sensitivity: 0.1,         // 0.1 => 10% de interpolação a cada frame
  maxAngleX: Math.PI / 8,   // ~22.5° de rotação no eixo X
  maxAngleY: Math.PI / 4,   // ~45° de rotação no eixo Y
};

export default GlobalRotationController;
