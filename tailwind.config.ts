
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#4A90E2',
        'secondary': '#50E3C2',
        'accent': '#F5A623',
        'neutral-100': '#F8F9FA',
        'neutral-200': '#E9ECEF',
        'neutral-500': '#868E96',
        'neutral-700': '#495057',
        'neutral-900': '#212529',
        'success': '#28a745',
        'warning': '#ffc107',
        'error': '#dc3545',
      },
    },
  },
  plugins: [],
}
export default config
