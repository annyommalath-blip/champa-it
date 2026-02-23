

## Plan: Add Company Logo and Match Theme Color

### 1. Copy the logo into the project
- Copy `user-uploads://IMG_7844.jpg` to `src/assets/logo.jpg` for use in React components
- Also copy to `public/logo.jpg` for use as favicon

### 2. Update the favicon
- Update `index.html` to reference the new logo as favicon

### 3. Use the logo throughout the app
- **Nav header** (desktop + mobile): Replace the "C" square icon with the actual logo image
- **Footer**: Replace the "C" square icon with the logo
- **About hero**: Add the logo above the heading

### 4. Adjust theme color to match the logo
The logo uses a warm golden yellow (approximately `hsl(45, 96%, 53%)` - a slightly warmer, more golden tone than the current `hsl(48, 100%, 50%)`). Update `src/index.css` CSS variables:
- `--primary` from `48 100% 50%` to `45 96% 53%`
- `--accent` to match
- `--ring`, `--sidebar-primary`, `--sidebar-ring` to match
- Update all glow/gradient custom tokens to use the new hue

### Files to modify
- `index.html` — favicon reference
- `src/index.css` — primary color variables
- `src/components/Layout.tsx` — logo in nav header and footer area
- `src/pages/About.tsx` — logo in hero section and footer

### Technical details
- Import the logo in components via `import logo from "@/assets/logo.jpg"`
- Render as `<img src={logo} alt="Champa Enterprise" />` with appropriate sizing
- The tagline "BEST SERVICE MIND WITH REASONABLE PRICE" from the logo will be added as a subtitle in the hero section

