export default function PhotoCaption({ attribution }) {
  if (!attribution) return null;
  return <figcaption className="photo-caption">
    {attribution.location && <span>{attribution.location}</span>}
    <a href={attribution.url} target="_blank" rel="noreferrer">{attribution.author} · Pexels ↗</a>
  </figcaption>;
}
