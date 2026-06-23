import Image from "next/image";

const mascotPath = "/brand/cartcanary-icon.png";

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Image
        src={mascotPath}
        alt="CartCanary mascot"
        width={compact ? 34 : 76}
        height={compact ? 34 : 76}
        className={`${compact ? "h-8 w-8" : "h-16 w-16 sm:h-[4.75rem] sm:w-[4.75rem]"} object-contain`}
      />
      <span className={`${compact ? "text-base" : "text-[2rem]"} font-black tracking-tight text-slate-950`}>
        Cart<span className="text-yellow-400">Canary</span>
      </span>
    </div>
  );
}
