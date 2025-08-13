const fs = require('fs');
const path = require('path');

// Icon sizes needed for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create SVG template for Feel Sharper icon
function createIconSVG(size) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="#0B2A4A"/>
  
  <!-- Lightning bolt icon representing "sharper" -->
  <g transform="translate(${size * 0.2}, ${size * 0.15})">
    <!-- Lightning bolt path -->
    <path d="M${size * 0.25} 0 L${size * 0.1} ${size * 0.4} L${size * 0.2} ${size * 0.4} L${size * 0.15} ${size * 0.7} L${size * 0.35} ${size * 0.3} L${size * 0.25} ${size * 0.3} L${size * 0.25} 0 Z" 
          fill="#FFFFFF"/>
  </g>
  
  <!-- Feel Sharper branding circle -->
  <circle cx="${size * 0.75}" cy="${size * 0.25}" r="${size * 0.08}" fill="#1F5798" opacity="0.8"/>
</svg>`;
}

// Create shortcut icons
function createShortcutSVG(type, size = 96) {
  const icons = {
    workout: `
      <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="#0B2A4A"/>
      <g transform="translate(${size * 0.2}, ${size * 0.2})">
        <rect x="${size * 0.1}" y="${size * 0.05}" width="${size * 0.4}" height="${size * 0.05}" rx="${size * 0.025}" fill="#FFFFFF"/>
        <circle cx="${size * 0.15}" cy="${size * 0.25}" r="${size * 0.08}" fill="#FFFFFF"/>
        <circle cx="${size * 0.35}" cy="${size * 0.25}" r="${size * 0.08}" fill="#FFFFFF"/>
        <rect x="${size * 0.23}" y="${size * 0.15}" width="${size * 0.04}" height="${size * 0.3}" fill="#FFFFFF"/>
      </g>
    `,
    meal: `
      <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="#0B2A4A"/>
      <g transform="translate(${size * 0.15}, ${size * 0.15})">
        <circle cx="${size * 0.35}" cy="${size * 0.35}" r="${size * 0.25}" fill="none" stroke="#FFFFFF" stroke-width="${size * 0.03}"/>
        <circle cx="${size * 0.35}" cy="${size * 0.25}" r="${size * 0.04}" fill="#FFFFFF"/>
        <circle cx="${size * 0.25}" cy="${size * 0.4}" r="${size * 0.04}" fill="#FFFFFF"/>
        <circle cx="${size * 0.45}" cy="${size * 0.4}" r="${size * 0.04}" fill="#FFFFFF"/>
      </g>
    `,
    coach: `
      <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="#0B2A4A"/>
      <g transform="translate(${size * 0.2}, ${size * 0.2})">
        <circle cx="${size * 0.3}" cy="${size * 0.15}" r="${size * 0.08}" fill="#FFFFFF"/>
        <path d="M${size * 0.15} ${size * 0.35} Q${size * 0.3} ${size * 0.25} ${size * 0.45} ${size * 0.35} L${size * 0.45} ${size * 0.5} L${size * 0.15} ${size * 0.5} Z" fill="#FFFFFF"/>
        <circle cx="${size * 0.55}" cy="${size * 0.25}" r="${size * 0.03}" fill="#1F5798"/>
        <circle cx="${size * 0.62}" cy="${size * 0.25}" r="${size * 0.03}" fill="#1F5798"/>
        <circle cx="${size * 0.69}" cy="${size * 0.25}" r="${size * 0.03}" fill="#1F5798"/>
      </g>
    `,
    today: `
      <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="#0B2A4A"/>
      <g transform="translate(${size * 0.2}, ${size * 0.2})">
        <rect x="0" y="${size * 0.1}" width="${size * 0.6}" height="${size * 0.5}" rx="${size * 0.05}" fill="none" stroke="#FFFFFF" stroke-width="${size * 0.025}"/>
        <rect x="${size * 0.15}" y="0" width="${size * 0.05}" height="${size * 0.15}" fill="#FFFFFF"/>
        <rect x="${size * 0.4}" y="0" width="${size * 0.05}" height="${size * 0.15}" fill="#FFFFFF"/>
        <line x1="${size * 0.1}" y1="${size * 0.25}" x2="${size * 0.5}" y2="${size * 0.25}" stroke="#FFFFFF" stroke-width="${size * 0.02}"/>
        <circle cx="${size * 0.2}" cy="${size * 0.35}" r="${size * 0.02}" fill="#1F5798"/>
        <circle cx="${size * 0.3}" cy="${size * 0.35}" r="${size * 0.02}" fill="#1F5798"/>
        <circle cx="${size * 0.4}" cy="${size * 0.35}" r="${size * 0.02}" fill="#1F5798"/>
      </g>
    `
  };

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  ${icons[type]}
</svg>`;
}

// Generate main app icons
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

console.log('Generating PWA icons...');

iconSizes.forEach(size => {
  const svgContent = createIconSVG(size);
  const filename = `icon-${size}x${size}.png.svg`;
  const filePath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filePath, svgContent);
  console.log(`Created ${filename}`);
});

// Generate shortcut icons
const shortcuts = ['workout', 'meal', 'coach', 'today'];

shortcuts.forEach(shortcut => {
  const svgContent = createShortcutSVG(shortcut);
  const filename = `${shortcut}-shortcut.png.svg`;
  const filePath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filePath, svgContent);
  console.log(`Created ${filename}`);
});

// Generate action icons for notifications
const actionIcons = {
  'workout-action': createShortcutSVG('workout', 48),
  'meal-action': createShortcutSVG('meal', 48),
  'badge-72x72': createIconSVG(72)
};

Object.entries(actionIcons).forEach(([name, content]) => {
  const filename = `${name}.png.svg`;
  const filePath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filePath, content);
  console.log(`Created ${filename}`);
});

console.log('✅ PWA icons generated successfully!');
console.log('📝 Note: These are SVG files with .png.svg extension for development.');
console.log('💡 For production, convert these to actual PNG files using a tool like ImageMagick or online converters.');