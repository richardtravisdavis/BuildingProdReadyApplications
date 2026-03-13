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
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer navy arc — wraps ~300° with gap at bottom-left */}
      <path
        d="M18.3 68.5A40 40 0 1 1 35.5 83.2"
        stroke="#00273B"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      {/* Red-orange arc — wraps ~280° with gap at top-left */}
      <path
        d="M27.5 30A30 30 0 1 1 22 55"
        stroke="#FC6200"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Teal arc — wraps ~250° with gap at bottom-right */}
      <path
        d="M68 62A20 20 0 1 1 62 35"
        stroke="#68DDDC"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Center C letterform in navy */}
      <path
        d="M58 40a12 12 0 1 0 0 20"
        stroke="#00273B"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
