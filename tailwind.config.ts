import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
	darkMode: ["class"],
	content: ["./src/**/*.tsx"],
	theme: {
		extend: {
			animation: {
				'marquee': 'marquee 10s linear infinite',
				'bounce-marquee': 'bounce-marquee 5s linear infinite',
				'marquee-infinite': 'marquee-infinite 15s linear infinite',
			},
			keyframes: {
				marquee: {
					'0%': { transform: 'translateX(100%)' },
					'100%': { transform: 'translateX(-100%)' },
				},
				'bounce-marquee': {
					'0%': { transform: 'translateX(0)' },             // Start from the left
					'50%': { transform: 'translateX(calc(-100% + 100vw))' }, // Move just enough to the left to show the end of the text
					'100%': { transform: 'translateX(0)' },             // Return to the original position
				},
				'marquee-infinite': {
					'0%': { transform: 'translateX(100%)' },   // Start offscreen to the right
					'100%': { transform: 'translateX(-100%)' }, // Move completely to the left
				},
			},
				fontFamily: {
					sans: ["var(--font-geist-sans)", ...fontFamily.sans]
				},
				borderRadius: {
					lg: 'var(--radius)',
					md: 'calc(var(--radius) - 2px)',
					sm: 'calc(var(--radius) - 4px)'
				},
				colors: {
					background: 'hsl(var(--background))',
					foreground: 'hsl(var(--foreground))',
					card: {
						DEFAULT: 'hsl(var(--card))',
						foreground: 'hsl(var(--card-foreground))'
					},
					popover: {
						DEFAULT: 'hsl(var(--popover))',
						foreground: 'hsl(var(--popover-foreground))'
					},
					primary: {
						DEFAULT: 'hsl(var(--primary))',
						foreground: 'hsl(var(--primary-foreground))'
					},
					secondary: {
						DEFAULT: 'hsl(var(--secondary))',
						foreground: 'hsl(var(--secondary-foreground))'
					},
					muted: {
						DEFAULT: 'hsl(var(--muted))',
						foreground: 'hsl(var(--muted-foreground))'
					},
					accent: {
						DEFAULT: 'hsl(var(--accent))',
						foreground: 'hsl(var(--accent-foreground))'
					},
					destructive: {
						DEFAULT: 'hsl(var(--destructive))',
						foreground: 'hsl(var(--destructive-foreground))'
					},
					border: 'hsl(var(--border))',
					input: 'hsl(var(--input))',
					ring: 'hsl(var(--ring))',
					chart: {
						'1': 'hsl(var(--chart-1))',
						'2': 'hsl(var(--chart-2))',
						'3': 'hsl(var(--chart-3))',
						'4': 'hsl(var(--chart-4))',
						'5': 'hsl(var(--chart-5))'
					}
				}
			}
		},
		plugins: [require("tailwindcss-animate")],
	} satisfies Config;
