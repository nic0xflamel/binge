import Image from 'next/image';

interface AvatarProps {
  name?: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-lg',
  lg: 'w-16 h-16 text-2xl',
};

// Generate consistent color based on name
function getColorFromName(name: string): string {
  const colors = [
    'from-purple-500 to-pink-500',
    'from-blue-500 to-cyan-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-red-500',
    'from-indigo-500 to-purple-500',
    'from-pink-500 to-rose-500',
  ];

  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export default function Avatar({
  name = 'Unknown',
  imageUrl,
  size = 'md',
  className = '',
}: AvatarProps) {
  const initial = name[0]?.toUpperCase() || '?';
  const gradient = getColorFromName(name);

  if (imageUrl) {
    return (
      <div className={`${sizeStyles[size]} rounded-full overflow-hidden relative ${className}`}>
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="64px"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`
        ${sizeStyles[size]}
        bg-gradient-to-r ${gradient}
        rounded-full flex items-center justify-center
        text-white font-semibold
        ${className}
      `}
    >
      {initial}
    </div>
  );
}
