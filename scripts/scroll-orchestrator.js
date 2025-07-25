// src/scroll-orchestrator.js

import '../scripts/hero-text-animation.js';
import '../scripts/hero-text-exit-animation.js';
import '../scripts/hero-transition.js';
import '../scripts/aboutus-animation.js';

// Registra plugin GSAP
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

window.addEventListener('load', () => {
  setTimeout(() => {
    ScrollTrigger.refresh();
  }, 200);
});
