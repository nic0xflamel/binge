'use client';

import { useRouter } from 'next/navigation';

interface BackButtonProps {
  /** The path to navigate back to */
  href?: string;
  /** Custom label for the button */
  label?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * BackButton component for consistent back navigation
 *
 * Provides a reusable back button with optional custom href and label.
 * If href is provided, navigates to that path; otherwise uses router.back()
 */
export default function BackButton({
  href,
  label = 'Back',
  className = '',
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`hover:underline ${className}`}
      aria-label={`Go back to ${label.toLowerCase()}`}
    >
      ← {label}
    </button>
  );
}
