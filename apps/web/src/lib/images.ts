const shimmer = (width: number, height: number) => `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g">
        <stop stop-color="#10141B" offset="20%" />
        <stop stop-color="#1A202A" offset="50%" />
        <stop stop-color="#10141B" offset="70%" />
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="#10141B" />
    <rect id="r" width="${width}" height="${height}" fill="url(#g)" />
    <animate xlink:href="#r" attributeName="x" from="-${width}" to="${width}" dur="1.2s" repeatCount="indefinite" />
  </svg>`;

const toBase64 = (value: string) =>
  typeof window === 'undefined' ? Buffer.from(value).toString('base64') : window.btoa(value);

export const getBlurDataUrl = (width = 800, height = 450) =>
  `data:image/svg+xml;base64,${toBase64(shimmer(width, height))}`;
