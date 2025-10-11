'use client';

import { MailIcon } from '@/components/MailIcon';

interface AnimatedEmailInputProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  focusColorClass: string;
}

const PeekingCreature = ({ pupilOffset }: { pupilOffset: number }) => (
  <svg
    width="32"
    height="16"
    viewBox="0 0 32 16"
    className="absolute top-0 left-10 z-10 -translate-y-1/2 bg-white px-1 text-neutral-300"
    aria-hidden="true"
  >
    <path
      d="M0 0C0 0 2.28571 16 16 16C29.7143 16 32 0 32 0H0Z"
      className="fill-current"
    />
    <g
      className="transition-transform duration-200 ease-out"
      style={{ transform: `translateX(${pupilOffset}px)` }}
    >
      <circle cx="10" cy="8" r="2" className="fill-neutral-700" />
      <circle cx="22" cy="8" r="2" className="fill-neutral-700" />
    </g>
  </svg>
);


export const AnimatedEmailInput = ({
  id,
  value,
  onChange,
  placeholder,
  focusColorClass,
}: AnimatedEmailInputProps) => {
  const pupilOffset = Math.min(value.length * 0.7, 14);

  return (
    <div className="relative mt-2">
      <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
      <PeekingCreature pupilOffset={pupilOffset} />
      <input
        id={id}
        name="email"
        type="email"
        autoComplete="email"
        required
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`pl-10 block w-full rounded-lg border-neutral-200 shadow-sm focus:ring focus:ring-opacity-50 py-3 placeholder:text-base ${focusColorClass}`}
      />
    </div>
  );
};