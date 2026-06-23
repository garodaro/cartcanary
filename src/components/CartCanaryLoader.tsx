import Image from "next/image";

export function CartCanaryLoader() {
  return (
    <div className="mx-auto mb-7 w-full max-w-xs">
      <div className="cartcanary-loader" aria-hidden="true">
        <div className="cartcanary-loader__light" />
        <Image
          src="/brand/mascot-loader-mine-cart.png"
          alt=""
          width={164}
          height={202}
          priority
          unoptimized
          className="cartcanary-loader__cart"
        />
        <div className="cartcanary-loader__track">
          <div className="cartcanary-loader__ties" />
          <div className="cartcanary-loader__rail cartcanary-loader__rail--top" />
          <div className="cartcanary-loader__rail cartcanary-loader__rail--bottom" />
        </div>
      </div>
      <span className="sr-only">CartCanary is building your report.</span>
    </div>
  );
}
