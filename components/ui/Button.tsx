import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className, ...props }) => {
  const baseClasses = "font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-space-blue-900 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none";
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-2.5 text-base",
  };

  const variantClasses = {
    primary: "bg-accent-cyan text-space-blue-900 hover:bg-white focus:ring-accent-cyan shadow-[0_0_15px_rgba(0,255,255,0.3)] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transform hover:-translate-y-px active:translate-y-0",
    secondary: "bg-space-blue-800/80 text-gray-200 hover:bg-space-blue-700/90 focus:ring-accent-cyan border border-space-blue-700 hover:border-accent-cyan",
    ghost: "bg-transparent text-gray-400 hover:bg-accent-cyan/10 hover:text-accent-cyan focus:ring-accent-cyan"
  };

  return (
    <button className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;