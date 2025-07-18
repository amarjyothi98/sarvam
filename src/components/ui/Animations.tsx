'use client';

import React, { useState, useEffect } from 'react';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

interface SlideInProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  duration?: number;
  className?: string;
}

interface ScaleInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

interface StaggeredAnimationProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  animationType?: 'fade' | 'slide' | 'scale';
  className?: string;
}

export function FadeIn({ 
  children, 
  delay = 0, 
  duration = 500, 
  className = '' 
}: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`transition-opacity ease-in-out ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transitionDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  );
}

export function SlideIn({ 
  children, 
  direction = 'up', 
  delay = 0, 
  duration = 500, 
  className = '' 
}: SlideInProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const getTransformValues = () => {
    if (isVisible) return 'translate(0, 0)';
    
    switch (direction) {
      case 'left':
        return 'translate(-100%, 0)';
      case 'right':
        return 'translate(100%, 0)';
      case 'up':
        return 'translate(0, 20px)';
      case 'down':
        return 'translate(0, -20px)';
      default:
        return 'translate(0, 20px)';
    }
  };

  return (
    <div
      className={`transition-all ease-out ${className}`}
      style={{
        transform: getTransformValues(),
        opacity: isVisible ? 1 : 0,
        transitionDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  );
}

export function ScaleIn({ 
  children, 
  delay = 0, 
  duration = 300, 
  className = '' 
}: ScaleInProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`transition-all ease-out ${className}`}
      style={{
        transform: isVisible ? 'scale(1)' : 'scale(0.9)',
        opacity: isVisible ? 1 : 0,
        transitionDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  );
}

export function StaggeredAnimation({ 
  children, 
  staggerDelay = 100, 
  animationType = 'fade',
  className = '' 
}: StaggeredAnimationProps) {
  const AnimationComponent = animationType === 'fade' ? FadeIn : 
                            animationType === 'slide' ? SlideIn : 
                            ScaleIn;

  return (
    <div className={className}>
      {children.map((child, index) => (
        <AnimationComponent key={index} delay={index * staggerDelay}>
          {child}
        </AnimationComponent>
      ))}
    </div>
  );
}

// Hover animations
interface HoverLiftProps {
  children: React.ReactNode;
  lift?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function HoverLift({ 
  children, 
  lift = 'md', 
  className = '' 
}: HoverLiftProps) {
  const liftClasses = {
    sm: 'hover:-translate-y-1 hover:shadow-md',
    md: 'hover:-translate-y-2 hover:shadow-lg',
    lg: 'hover:-translate-y-3 hover:shadow-xl'
  };

  return (
    <div className={`transition-all duration-200 ease-out ${liftClasses[lift]} ${className}`}>
      {children}
    </div>
  );
}

// Loading animations
export function PulseAnimation({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={`animate-pulse ${className}`}>
      {children}
    </div>
  );
}

export function BounceAnimation({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={`animate-bounce ${className}`}>
      {children}
    </div>
  );
}

export function SpinAnimation({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={`animate-spin ${className}`}>
      {children}
    </div>
  );
}

// Page transition
interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <div className={`animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ${className}`}>
      {children}
    </div>
  );
}

// Success/Error animations
export function SuccessAnimation({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={`animate-in zoom-in-95 duration-300 ${className}`}>
      {children}
    </div>
  );
}

export function ErrorShake({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={`animate-in shake duration-500 ${className}`}>
      {children}
    </div>
  );
}

// Progress animation
interface ProgressBarAnimationProps {
  progress: number;
  className?: string;
}

export function ProgressBarAnimation({ 
  progress, 
  className = '' 
}: ProgressBarAnimationProps) {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div 
        className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
      />
    </div>
  );
}

// Notification animations
export function NotificationSlideIn({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={`animate-in slide-in-from-right-full duration-300 ${className}`}>
      {children}
    </div>
  );
}

// Interactive animations
interface ButtonRippleProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function ButtonRipple({ 
  children, 
  onClick, 
  className = '' 
}: ButtonRippleProps) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples(prev => [...prev, { x, y, id }]);

    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== id));
    }, 600);

    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      className={`relative overflow-hidden transition-all duration-200 ${className}`}
    >
      {children}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white opacity-30 rounded-full pointer-events-none animate-ping"
          style={{
            left: ripple.x - 25,
            top: ripple.y - 25,
            width: 50,
            height: 50,
            transform: 'scale(0)',
            animation: 'ripple 0.6s ease-out'
          }}
        />
      ))}
      <style jsx>{`
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>
    </button>
  );
}

const AnimationComponents = {
  FadeIn,
  SlideIn,
  ScaleIn,
  StaggeredAnimation,
  HoverLift,
  PulseAnimation,
  BounceAnimation,
  SpinAnimation,
  PageTransition,
  SuccessAnimation,
  ErrorShake,
  ProgressBarAnimation,
  NotificationSlideIn,
  ButtonRipple
};

export default AnimationComponents;
