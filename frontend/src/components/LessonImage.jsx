export default function LessonImage({ src, alt = "", sizes = "(max-width: 800px) calc(100vw - 64px), 45vw", ...props }) {
  const photo = src?.startsWith("/media/photos/");
  return <img src={src} alt={alt} width="960" height="600" decoding="async"
    srcSet={photo ? `${src.replace("-960.webp", "-480.webp")} 480w, ${src} 960w` : undefined}
    sizes={photo ? sizes : undefined} {...props} />;
}
