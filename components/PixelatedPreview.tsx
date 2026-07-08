interface PixelatedPreviewProps {
  subjectSrc: string;
  objectSrc: string;
}

export function PixelatedPreview({ subjectSrc, objectSrc }: PixelatedPreviewProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <PreviewImage title="Subject map" src={subjectSrc} />
      <PreviewImage title="Object palette" src={objectSrc} />
    </div>
  );
}

function PreviewImage({ title, src }: { title: string; src: string }) {
  return (
    <figure className="rounded-lg border border-zinc-800 bg-black/40 p-3">
      <figcaption className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
        {title}
      </figcaption>
      <img src={src} alt={title} className="h-44 w-full rounded object-contain" />
    </figure>
  );
}
