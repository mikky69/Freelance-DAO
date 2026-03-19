const WaveBackground = () => {
  return (
    <svg
      className="absolute inset-0 z-0 h-full w-full"
      viewBox="0 0 1440 900"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#AE16A7" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0.4" />
        </linearGradient>

        <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="100" />
        </filter>
      </defs>

      <path
  d="
    M0,0
    C250,700 500,650 750,500
    C1000,350 1200,200 1440,100
    L1440,900
    Z
  "
  fill="url(#waveGradient)"
  filter="url(#blur)"
/>
    </svg>
  );
};

export default WaveBackground