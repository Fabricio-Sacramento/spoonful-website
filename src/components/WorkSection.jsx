// src/components/WorkSection.jsx

import WorkIntro from './WorkIntro';
import PortfolioSlide from './PortfolioSlide';
import { portfolio } from '../data/portfolio';

export default function WorkSection() {
  return (
    <div id="work-section">
      {/* Slide inicial com a palavra WORK */}
      <WorkIntro />

      {/* Slides de cada projeto do portfólio */}
      {portfolio.map(({ id, categories, title, subtitle, imageUrl }) => (
        <PortfolioSlide
          key={id}
          categories={categories}
          title={title}
          subtitle={subtitle}
          imageUrl={imageUrl}
        />
      ))}
    </div>
  );
}
