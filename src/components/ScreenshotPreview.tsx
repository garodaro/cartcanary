import Image from "next/image";

export function ScreenshotPreview({
  title,
  src,
}: {
  title: string;
  src?: string;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3">
        <h3 className="font-bold text-slate-950">{title}</h3>
      </div>
      {src ? (
        <Image
          src={src}
          alt={`${title} screenshot`}
          width={900}
          height={540}
          unoptimized
          className="h-72 w-full object-cover object-top"
        />
      ) : (
        <div className="flex h-72 items-center justify-center bg-slate-50 px-6 text-center text-sm text-slate-500">
          Screenshot unavailable for this audit.
        </div>
      )}
    </article>
  );
}
