// React Button Component Example

import React, { useState } from 'react';

interface ButtonProps {
  /**
   * Button label text
   */
  label: string;
  /**
   * Click handler
   */
  onClick: () => void;
  /**
   * Button variant
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'danger';
  /**
   * Button size
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Whether button is disabled
   * @default false
   */
  disabled?: boolean;
  /**
   * Additional CSS class
   */
  className?: string;
}

/**
 * Primary button component for user interactions
 */
export function Button({
  label,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  className = ''
}: ButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleClick = async () => {
    if (disabled || isLoading) return;
    
    setIsLoading(true);
    try {
      await onClick();
    } finally {
      setIsLoading(false);
    }
  };
  
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  const disabledClass = disabled || isLoading ? 'btn-disabled' : '';
  
  return (
    <button
      className={`${baseClass} ${variantClass} ${sizeClass} ${disabledClass} ${className}`}
      onClick={handleClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? 'Loading...' : label}
    </button>
  );
}

export default Button;
