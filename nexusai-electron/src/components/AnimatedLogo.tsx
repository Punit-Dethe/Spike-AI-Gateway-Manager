import { useState, useEffect, useRef } from 'react';
import hedgehogGif from '../assets/hedgehog.gif';
import hedgehogStatic from '../assets/hedgehog.png';

interface AnimatedLogoProps {
  size?: string;
  intervalSeconds?: number;
}

const AnimatedLogo = ({ size = 'w-7 h-7', intervalSeconds = 8 }: AnimatedLogoProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [key, setKey] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Function to trigger animation
    const triggerAnimation = () => {
      setIsAnimating(true);
      setKey(prev => prev + 1); // Force re-render to restart GIF
      
      // Stop animation after GIF completes (assume ~2 seconds for the animation)
      setTimeout(() => {
        setIsAnimating(false);
      }, 2000);
    };

    // Set up interval for animations (starts after first interval)
    const interval = setInterval(() => {
      triggerAnimation();
    }, intervalSeconds * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [intervalSeconds]);

  return (
    <img
      ref={imgRef}
      key={key}
      src={isAnimating ? hedgehogGif : hedgehogStatic}
      alt="Logo"
      className={`${size} object-contain`}
    />
  );
};

export default AnimatedLogo;
