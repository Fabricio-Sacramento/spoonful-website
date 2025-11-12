// src/components/PreloaderTitle.jsx
import SpoonfulSVG from '../assets/images/SPOONFUL_Loader.svg?react';

const PreloaderTitle = () => {
  return (
    <div className="preloader__title-wrapper" aria-label="Spoonful">
      <SpoonfulSVG />
    </div>
  );
};

export default PreloaderTitle;