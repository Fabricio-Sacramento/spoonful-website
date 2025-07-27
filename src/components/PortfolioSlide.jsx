// src/components/PortfolioSlide.jsx

import PropTypes from 'prop-types';

export default function PortfolioSlide({ title, subtitle, labels, image }) {
  return (
    <div className="work-slide portfolio-slide">
      <div className="slide-s1">
        <div className="slide-top">
          {labels.map(label => (
            <span key={label} className="label">
              {label}
            </span>
          ))}
        </div>
        <h2 className="slide-title">{title}</h2>
        <p className="slide-subtitle">{subtitle}</p>
      </div>
      <div className="slide-s2">
        <img src={image} alt={title} className="slide-image" />
      </div>
    </div>
  );
}

PortfolioSlide.propTypes = {
  title:    PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  labels:   PropTypes.arrayOf(PropTypes.string).isRequired,
  image:    PropTypes.string.isRequired,
};
