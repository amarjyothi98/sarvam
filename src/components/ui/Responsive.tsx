'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
}

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  className?: string;
}

interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
  className?: string;
}

export function ResponsiveLayout({ 
  children, 
  sidebar, 
  header, 
  className = '' 
}: ResponsiveLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      {header && (
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            {sidebar && isMobile && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
            )}
            <div className="flex-1">{header}</div>
          </div>
        </header>
      )}

      <div className="flex">
        {/* Sidebar */}
        {sidebar && (
          <>
            {/* Mobile sidebar overlay */}
            {isMobile && isSidebarOpen && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={toggleSidebar}
              />
            )}
            
            {/* Sidebar */}
            <aside className={`
              ${isMobile ? 'fixed' : 'relative'} 
              inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform 
              ${isMobile ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
              transition-transform duration-300 ease-in-out
              ${!isMobile ? 'border-r border-gray-200' : ''}
            `}>
              {isMobile && (
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                  <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              )}
              <div className="p-4">
                {sidebar}
              </div>
            </aside>
          </>
        )}

        {/* Main content */}
        <main className={`
          flex-1 
          ${sidebar && !isMobile ? 'ml-0' : ''}
          ${header ? 'pt-0' : ''}
          min-h-screen
        `}>
          {children}
        </main>
      </div>
    </div>
  );
}

export function ResponsiveGrid({ 
  children, 
  columns = { sm: 1, md: 2, lg: 3, xl: 4 }, 
  gap = 4, 
  className = '' 
}: ResponsiveGridProps) {
  const getGridClasses = () => {
    const colClasses = [];
    
    if (columns.sm) colClasses.push(`grid-cols-${columns.sm}`);
    if (columns.md) colClasses.push(`md:grid-cols-${columns.md}`);
    if (columns.lg) colClasses.push(`lg:grid-cols-${columns.lg}`);
    if (columns.xl) colClasses.push(`xl:grid-cols-${columns.xl}`);
    
    return colClasses.join(' ');
  };

  return (
    <div className={`grid ${getGridClasses()} gap-${gap} ${className}`}>
      {children}
    </div>
  );
}

export function ResponsiveContainer({ 
  children, 
  maxWidth = 'lg', 
  padding = true, 
  className = '' 
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-full'
  };

  const paddingClasses = padding ? 'px-4 sm:px-6 lg:px-8' : '';

  return (
    <div className={`mx-auto ${maxWidthClasses[maxWidth]} ${paddingClasses} ${className}`}>
      {children}
    </div>
  );
}

// Responsive video player
interface ResponsiveVideoProps {
  src: string;
  poster?: string;
  className?: string;
}

export function ResponsiveVideo({ 
  src, 
  poster, 
  className = '' 
}: ResponsiveVideoProps) {
  return (
    <div className={`relative w-full ${className}`}>
      <div className="aspect-video">
        <video
          src={src}
          poster={poster}
          className="w-full h-full object-cover rounded-lg"
          controls
        />
      </div>
    </div>
  );
}

// Responsive image
interface ResponsiveImageProps {
  src: string;
  alt: string;
  aspectRatio?: 'square' | 'video' | 'wide' | 'tall';
  className?: string;
}

export function ResponsiveImage({ 
  src, 
  alt, 
  aspectRatio = 'square', 
  className = '' 
}: ResponsiveImageProps) {
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[16/9]',
    tall: 'aspect-[3/4]'
  };

  return (
    <div className={`relative w-full ${aspectClasses[aspectRatio]} ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover rounded-lg"
      />
    </div>
  );
}

// Responsive text
interface ResponsiveTextProps {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  className?: string;
}

export function ResponsiveText({ 
  children, 
  size = 'base', 
  weight = 'normal', 
  className = '' 
}: ResponsiveTextProps) {
  const sizeClasses = {
    xs: 'text-xs sm:text-sm',
    sm: 'text-sm sm:text-base',
    base: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl',
    xl: 'text-xl sm:text-2xl',
    '2xl': 'text-2xl sm:text-3xl',
    '3xl': 'text-3xl sm:text-4xl',
    '4xl': 'text-4xl sm:text-5xl'
  };

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  };

  return (
    <div className={`${sizeClasses[size]} ${weightClasses[weight]} ${className}`}>
      {children}
    </div>
  );
}

// Responsive card
interface ResponsiveCardProps {
  children: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function ResponsiveCard({ 
  children, 
  padding = 'md', 
  shadow = 'sm', 
  className = '' 
}: ResponsiveCardProps) {
  const paddingClasses = {
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  };

  const shadowClasses = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  return (
    <div className={`bg-white rounded-lg ${paddingClasses[padding]} ${shadowClasses[shadow]} ${className}`}>
      {children}
    </div>
  );
}

// Responsive navigation
interface ResponsiveNavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  active?: boolean;
}

interface ResponsiveNavProps {
  items: ResponsiveNavItem[];
  className?: string;
}

export function ResponsiveNav({ items, className = '' }: ResponsiveNavProps) {
  return (
    <nav className={`${className}`}>
      <div className="hidden md:flex space-x-8">
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              item.active 
                ? 'bg-blue-100 text-blue-900' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {item.icon && <item.icon className="w-4 h-4 mr-2" />}
            {item.label}
          </a>
        ))}
      </div>
      
      {/* Mobile nav */}
      <div className="md:hidden">
        <div className="space-y-1">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                item.active 
                  ? 'bg-blue-100 text-blue-900' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {item.icon && <item.icon className="w-5 h-5 mr-3" />}
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}

const ResponsiveComponents = {
  ResponsiveLayout,
  ResponsiveGrid,
  ResponsiveContainer,
  ResponsiveVideo,
  ResponsiveImage,
  ResponsiveText,
  ResponsiveCard,
  ResponsiveNav
};

export default ResponsiveComponents;
