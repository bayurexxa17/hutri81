type LogoProps = {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
};

export default function Logo({ variant = "dark", size = "md" }: LogoProps) {
  const text = variant === "light" ? "text-white" : "text-[#0a7a6d]";
  const sub = variant === "light" ? "text-white/80" : "text-[#0d9b8a]";
  const dim =
    size === "lg" ? "h-11 w-11" : size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const word =
    size === "lg" ? "text-[28px]" : size === "sm" ? "text-[18px]" : "text-[22px]";

  return (
    <div className="flex items-center gap-2">
      <svg className={dim} viewBox="0 0 48 48" fill="none" aria-hidden>
        <defs>
          <linearGradient id="oxyRing" x1="6" y1="4" x2="44" y2="44">
            <stop stopColor="#14b8a6" />
            <stop offset="0.55" stopColor="#22c55e" />
            <stop offset="1" stopColor="#f97316" />
          </linearGradient>
        </defs>
        <circle cx="24" cy="24" r="22" fill="url(#oxyRing)" />
        <circle cx="24" cy="24" r="14.5" fill={variant === "light" ? "#0b1d36" : "#fff"} />
        <circle cx="24" cy="24" r="6.2" fill="#14b8a6" />
        <circle cx="24" cy="24" r="2.6" fill="#fff" />
        <path
          d="M24 9.2c7.4 0 13.4 4.6 13.4 6.4"
          stroke="#fff"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.85"
        />
      </svg>
      <div className="leading-none">
        <span className={`font-display font-extrabold tracking-tight ${word} ${text}`}>
          oxygen
          <span className={sub}>.id</span>
        </span>
      </div>
    </div>
  );
}
