'use client';

interface TeddyMascotProps {
  className?: string;
  size?: number;
  mood?: 'happy' | 'thinking' | 'excited';
}

export default function TeddyMascot({
  className = '',
  size = 48,
  mood = 'happy',
}: TeddyMascotProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Maskot Mainan Kita Teddy Bear"
    >
      {/* Ears */}
      <circle cx="26" cy="28" r="14" fill="#D97706" />
      <circle cx="26" cy="28" r="8" fill="#FDE68A" />
      <circle cx="74" cy="28" r="14" fill="#D97706" />
      <circle cx="74" cy="28" r="8" fill="#FDE68A" />

      {/* Head */}
      <ellipse cx="50" cy="52" rx="36" ry="32" fill="#F59E0B" />

      {/* Cheeks blush */}
      <ellipse cx="32" cy="60" rx="6" ry="4" fill="#FCA5A5" opacity="0.7" />
      <ellipse cx="68" cy="60" rx="6" ry="4" fill="#FCA5A5" opacity="0.7" />

      {/* Muzzle */}
      <ellipse cx="50" cy="61" rx="18" ry="14" fill="#FEF3C7" />

      {/* Nose */}
      <path
        d="M45 56C45 54 55 54 55 56C55 59 51.5 61 50 61C48.5 61 45 59 45 56Z"
        fill="#78350F"
      />

      {/* Mouth */}
      {mood === 'happy' && (
        <path
          d="M45 64C47.5 67 52.5 67 55 64"
          stroke="#78350F"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      )}
      {mood === 'excited' && (
        <path
          d="M44 63C44 68 56 68 56 63Z"
          fill="#DC2626"
          stroke="#78350F"
          strokeWidth="2"
        />
      )}
      {mood === 'thinking' && (
        <path
          d="M46 65C48 64 52 64 54 66"
          stroke="#78350F"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      )}

      {/* Eyes */}
      <circle cx="36" cy="48" r="4.5" fill="#1F2937" />
      <circle cx="34.5" cy="46.5" r="1.5" fill="#FFFFFF" />

      <circle cx="64" cy="48" r="4.5" fill="#1F2937" />
      <circle cx="62.5" cy="46.5" r="1.5" fill="#FFFFFF" />

      {/* Bowtie / small accessory */}
      <path d="M43 84L40 89L50 86L60 89L57 84L60 79L50 82L40 79Z" fill="#F28A2E" />
      <circle cx="50" cy="84" r="3.5" fill="#DC2626" />
    </svg>
  );
}
