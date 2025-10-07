import { ReactNode } from 'react';

export type BadgeVariant = 'default' | 'genre' | 'vibe' | 'match' | 'service';
export type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700',
  genre: 'bg-gray-100 text-gray-700',
  vibe: 'bg-purple-100 text-purple-700',
  match: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
  service: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1 text-sm',
};

export default function Badge({
  variant = 'default',
  size = 'md',
  children,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        rounded-full font-medium inline-block
        ${className}
      `}
    >
      {children}
    </span>
  );
}
