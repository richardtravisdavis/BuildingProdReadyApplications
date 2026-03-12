export default function CresoraLogo({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer ring */}
      <circle cx="24" cy="24" r="22" stroke="#FC6200" strokeWidth="2.5" />
      {/* Inner accent arc */}
      <path
        d="M12 24c0-6.627 5.373-12 12-12s12 5.373 12 12"
        stroke="#68DDDC"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* C letterform */}
      <path
        d="M30 17.5a10 10 0 1 0 0 13"
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
