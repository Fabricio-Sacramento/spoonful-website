import { useEffect, useRef } from "react";
import "../styles/Background.css";

const Background = () => {

  console.log("Background carregado!"); // Isso mostrará se o componente está sendo renderizado.

  const interactiveRef = useRef(null);

  useEffect(() => {
    const interBubble = interactiveRef.current;
    let curX = 0, curY = 0, tgX = 0, tgY = 0;
  
    function move() {
      curX += (tgX - curX) / 20;
      curY += (tgY - curY) / 20;
      if (interBubble) {
        interBubble.style.transform = `translate(${Math.round(curX)}px, ${Math.round(curY)}px)`;
      }
      requestAnimationFrame(move);
    }
  
    const handleMouseMove = (event) => {
      tgX = event.clientX - window.innerWidth / 2;
      tgY = event.clientY - window.innerHeight / 2;
    };
  
    window.addEventListener("mousemove", handleMouseMove);
    move();
  
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);  // <-- Este é o fechamento correto do useEffect

  return (
    <div className="gradient-bg">
      <div className="gradients-container">
        <div className="g1"></div>
        <div className="g2"></div>
        <div className="g3"></div>
        <div className="g4"></div>
        <div className="g5"></div>
        <div className="interactive" ref={interactiveRef}></div>
      </div>
    </div>
  );
};

export default Background;
