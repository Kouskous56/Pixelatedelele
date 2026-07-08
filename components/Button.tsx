import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

export function Button({
  children,
  onClick,
  disabled = false,
  isLoading = false,
  className = '',
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={[
        'inline-flex min-h-11 items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition',
        'bg-indigo-500 text-white hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300/70',
        'disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400',
        className,
      ].join(' ')}
    >
      {isLoading ? 'Processing...' : children}
    </button>
  );
}
