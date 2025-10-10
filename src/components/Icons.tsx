import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement>;

const defaultProps: IconProps = {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const UploadIcon = (props: IconProps) => (
  <svg {...defaultProps} {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

export const BotIcon = (props: IconProps) => (
  <svg {...defaultProps} {...props}>
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8" y2="16" />
    <line x1="16" y1="16" x2="16" y2="16" />
  </svg>
);

export const UserIcon = (props: IconProps) => (
  <svg {...defaultProps} {...props}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const ArrowLeftIcon = (props: IconProps) => (
  <svg {...defaultProps} {...props}>
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

export const PlayIcon = (props: IconProps) => (
  <svg {...defaultProps} {...props}>
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

export const LoaderCircle = (props: IconProps) => (
  <svg {...defaultProps} {...props}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export const CheckCircle = (props: IconProps) => (
  <svg {...defaultProps} {...props}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export const XCircle = (props: IconProps) => (
  <svg {...defaultProps} {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

export const MicIcon = (props: IconProps) => (
  <svg {...defaultProps} {...props}>
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
  </svg>
);

export const RestartIcon = (props: IconProps) => (
  <svg {...defaultProps} {...props}>
    <path d="M21 12a9 9 0 1 1-3.5-7.24" />
    <path d="M21 2v4h-4" />
  </svg>
);

export const TrophyIcon = (props: IconProps) => (
  <svg {...defaultProps} {...props}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);