// src/components/PortfolioSlide.jsx

import PropTypes from 'prop-types';

export default function PortfolioSlide({ categories, title, subtitle, imageUrl }) {
  return (
    <section className="flex flex-col lg:flex-row w-full h-screen">
      {/* S1: Informações */}
      <div className="flex flex-col justify-between items-center p-8 w-full h-1/2 lg:w-1/2 lg:h-screen">
        {/* Topo: categorias */}
        <div className="flex flex-wrap justify-center items-start gap-x-6 gap-y-2 md:gap-8 text-white text-sm font-medium leading-[2.5rem] tracking-[0.01rem]">
          {categories.map((cat, i) => (
            <span key={i}>{cat}</span>
          ))}
        </div>
        {/* Título central */}
        <h2 className="text-white text-center font-extrabold font-['Alumni Sans'] text-[3.9375rem] leading-[2.5625rem] tracking-[0.03938rem] md:font-black md:font-['Neue Haas Grotesk Display Pro'] md:text-[5.75rem] md:leading-[5rem] md:tracking-[0.115rem]">
          {title}
        </h2>
        {/* Texto inferior */}
        <p className="text-white text-center font-light font-montserrat text-[1.375rem] tracking-[0.01375rem] md:text-[1.875rem] md:tracking-[0.01875rem]">
          {subtitle}
        </p>
      </div>
      {/* S2: Imagem */}
      <div className="flex justify-center items-center w-full h-1/2 lg:w-1/2 lg:h-screen">
        <img src={imageUrl} alt={title} className="object-contain max-w-[59.6875rem] max-h-[67.5rem]" />
      </div>
    </section>
  );
}

PortfolioSlide.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  imageUrl: PropTypes.string.isRequired,
};
