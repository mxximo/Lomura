export default function GlassCard({
  as: Tag = "section",
  className = "",
  children,
  ...props
}) {
  return (
    <Tag className={`glass ${className}`} {...props}>
      {children}
    </Tag>
  );
}
