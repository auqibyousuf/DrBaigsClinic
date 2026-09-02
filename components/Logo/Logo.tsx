// Recolors the original uploaded logo artwork to the brand gradient without
// touching the artwork itself: the PNG's alpha channel is used as a CSS
// mask, and the actual pixels painted are our primary→accent gradient. Same
// shape/logo the clinic uploaded, just brand-colored instead of whatever
// color it was exported in.
export default function Logo({
  src,
  className = 'w-full h-full',
}: {
  src: string;
  className?: string;
}) {
  return (
    <span
      role="img"
      aria-label="Clinic logo"
      className={className}
      style={{
        display: 'inline-block',
        backgroundImage: 'linear-gradient(135deg, #4640d0 0%, #10b77f 100%)',
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
      }}
    />
  );
}
