type LogoProps = {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
};

export default function Logo({ variant = "dark", size = "md" }: LogoProps) {
  const imgDim = size === "lg" ? "h-14" : size === "sm" ? "h-10" : "h-12";
  const word =
    size === "lg" ? "text-[28px]" : size === "sm" ? "text-[18px]" : "text-[22px]";
  const textColor = variant === "light" ? "text-white" : "text-[#0b3a80]";
  const subColor = variant === "light" ? "text-white/80" : "text-[#1769d6]";

  return (
    <div className="flex items-center gap-3">
      <img
        src="/images/putra-logo.png"
        alt="PT Bangun Tirta Pratama"
        className={`${imgDim} w-auto object-contain drop-shadow-sm`}
      />
      <div className="leading-none">
        <span className={`font-display font-extrabold tracking-tight ${word} ${textColor}`}>
          Putra
          <span className={subColor}>.net</span>
        </span>
        {size !== "sm" && (
          <p className={`mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${variant === "light" ? "text-white/60" : "text-slate-500"}`}>
            by PT Bangun Tirta Pratama
          </p>
        )}
      </div>
    </div>
  );
}
