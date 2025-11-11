// src/components/Preloader.jsx
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import FontFaceObserver from 'fontfaceobserver';
import PropTypes from 'prop-types'; // Adicionado para validação de props

const Preloader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  // Removi a variável textState que não estava sendo usada
  
  // Refs
  const preloaderRef = useRef(null);
  const progressBarRef = useRef(null);
  const percentageRef = useRef(null);
  const textContainerRef = useRef(null);
  const initialTextRef = useRef(null);
  const completeTextRef = useRef(null);
  
  // Estados de carregamento
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [sceneLoaded, setSceneLoaded] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
  // Monitora o progresso
  useEffect(() => {
    // Verifica se tudo está carregado
    if (fontsLoaded && sceneLoaded && imagesLoaded) {
      // Atinge 100% com suavidade
      gsap.to({ value: progress }, {
        value: 100,
        duration: 0.5,
        onUpdate: function() {
          setProgress(Math.round(this.targets()[0].value));
        },
        onComplete: () => {
          // Quando o progresso atinge 100%, inicia a transição
          setIsComplete(true);
        }
      });
    }
  }, [fontsLoaded, sceneLoaded, imagesLoaded, progress]);

  // Carregamento de fontes
  useEffect(() => {
    // Lista das fontes principais utilizadas no projeto
    const fontFamilies = [
      'Neue Haas Grotesk Display Pro', 
      'Montserrat'
    ];
    
    // Progress value for fonts: 30% do total
    const fontPromises = fontFamilies.map(family => {
      const font = new FontFaceObserver(family);
      return font.load(null, 5000); // 5 segundo timeout
    });

    // Atualiza progresso durante carregamento
    let fontProgress = 0;
    const fontUpdateInterval = setInterval(() => {
      if (fontProgress < 30) {
        fontProgress += 1;
        setProgress(prev => Math.min(prev + 1, 99));
      } else {
        clearInterval(fontUpdateInterval);
      }
    }, 100);

    // Quando todas as fontes forem carregadas
    Promise.all(fontPromises)
      .then(() => {
        clearInterval(fontUpdateInterval);
        setFontsLoaded(true);
        setProgress(prev => Math.max(prev, 30)); // Garante pelo menos 30% de progresso
        console.log('Fonts loaded successfully');
      })
      .catch(err => {
        clearInterval(fontUpdateInterval);
        console.warn('Some fonts failed to load', err);
        setFontsLoaded(true); // Continua mesmo se falhar
        setProgress(prev => Math.max(prev, 30));
      });
      
    return () => clearInterval(fontUpdateInterval);
  }, []);

  // Carregamento da cena 3D
  useEffect(() => {
    const handleCanvasReady = () => {
      setSceneLoaded(true);
      setProgress(prev => Math.max(prev, 60)); // Garante pelo menos 60% de progresso
      console.log('Canvas ready event received');
    };

    window.addEventListener('canvas:ready', handleCanvasReady);
    
    // Se o evento já foi disparado ou estamos em um ambiente de teste
    const checkForCanvas = () => {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        console.log('Canvas already in DOM, marking as ready');
        setTimeout(handleCanvasReady, 300);
      } else {
        // Tenta novamente em breve
        setTimeout(checkForCanvas, 100);
      }
    };

    // Começa a verificar após um pequeno delay
    const canvasCheckTimeout = setTimeout(checkForCanvas, 500);

    return () => {
      clearTimeout(canvasCheckTimeout);
      window.removeEventListener('canvas:ready', handleCanvasReady);
    };
  }, []);

  // Carregamento de imagens
  useEffect(() => {
    // Encontra todas as imagens que precisam ser pré-carregadas
    const imageSources = [];
    
    // Adiciona URLs das imagens de fundo/importantes
    document.querySelectorAll('img[data-preload="true"]').forEach(img => {
      if (img.src && !imageSources.includes(img.src)) {
        imageSources.push(img.src);
      }
    });
    
    // Se não houver imagens marcadas para preload
    if (imageSources.length === 0) {
      console.log('No images marked for preload');
      setImagesLoaded(true);
      setProgress(prev => Math.max(prev, 90)); // Avança até 90%
      return;
    }

    // Carrega as imagens
    let loadedCount = 0;
    const totalImages = imageSources.length;

    const imagePromises = imageSources.map(src => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = img.onerror = () => {
          loadedCount++;
          setProgress(prev => Math.max(prev, 60 + Math.floor((loadedCount / totalImages) * 30)));
          resolve();
        };
        img.src = src;
      });
    });

    Promise.all(imagePromises)
      .then(() => {
        setImagesLoaded(true);
        setProgress(prev => Math.max(prev, 90));
        console.log('All images loaded');
      });
  }, []);

  // Animação de saída quando o carregamento estiver completo
  useEffect(() => {
    if (!isComplete || !preloaderRef.current) return;

    // Timing da animação
    const tl = gsap.timeline({
      onComplete: () => {
        if (onComplete) {
          onComplete();
        }
      }
    });

    tl.to(initialTextRef.current, {
      y: '-100%',
      duration: 0.5,
      ease: 'power2.inOut'
    })
    .to(completeTextRef.current, {
      y: '0%',
      duration: 0.5,
      ease: 'power2.inOut'
    }, '<')
    .to([percentageRef.current, textContainerRef.current], {
      y: -50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power2.inOut'
    })
    .to(preloaderRef.current, {
      y: '-100vh',
      duration: 1,
      ease: 'power2.inOut'
    }, '<0.3');
    
  }, [isComplete, onComplete]);

  return (
    <div className="preloader" ref={preloaderRef}>
      <div 
        className="progress-bar" 
        ref={progressBarRef} 
        style={{ width: `${progress}%` }}
      ></div>
      
      <div className="text-container" ref={textContainerRef}>
        <div className="loading-text initial" ref={initialTextRef}>SPOONFUL</div>
        <div className="loading-text complete" ref={completeTextRef}>COMPLETE</div>
      </div>
      
      <div className="percentage-wrap">
        <div className="percentage" ref={percentageRef}>{progress}</div>
      </div>
    </div>
  );
};

// Adicionado PropTypes para validação
Preloader.propTypes = {
  onComplete: PropTypes.func
};

export default Preloader;