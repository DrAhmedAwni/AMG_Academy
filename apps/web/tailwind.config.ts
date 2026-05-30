import type { Config } from 'tailwindcss';
import preset from '../../packages/config/tailwind/preset';

const config: Config = {
  presets: [preset],
  content: ['./src/**/*.{ts,tsx,mdx}'],
};

export default config;
