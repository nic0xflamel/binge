import { ReactNode } from 'react';

export type CardVariant = 'default' | 'elevated' | 'bordered';

interface CardProps {
  variant?: CardVariant;
  children: ReactNode;
  className?: string;
  padding?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-white rounded-2xl shadow-lg',
  elevated: 'bg-white rounded-2xl shadow-2xl',
  bordered: 'bg-white rounded-2xl border-2 border-gray-200',
};

export default function Card({
  variant = 'default',
  children,
  className = '',
  padding = true,
}: CardProps) {
  return (
    <div className={`${variantStyles[variant]} ${padding ? 'p-8' : ''} ${className}`}>
      {children}
    </div>
  );
}
