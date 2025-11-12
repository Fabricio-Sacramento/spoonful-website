// src/components/PreloaderTitle.jsx
import { useEffect, useState } from 'react';
import SpoonfulSVG from '../assets/images/SPOONFUL_Loader.svg?react';

const PreloaderTitle = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Listener para atualizar o progresso
    const handleProgressUpdate = (event) => {
      if (event.detail && typeof event.detail.progress === 'number') {
        setProgress(Math.round(event.detail.progress));
      }
    };

    window.addEventListener('preloader:progress', handleProgressUpdate);

    return () => {
      window.removeEventListener('preloader:progress', handleProgressUpdate);
    };
  }, []);

  return (
    <div className="preloader__title-wrapper" aria-label="Spoonful">
      <SpoonfulSVG />
      <span className="preloader__counter" aria-live="polite">
        {progress}
      </span>
    </div>
  );
};

export default PreloaderTitle;