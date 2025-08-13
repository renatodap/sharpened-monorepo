const fs = require('fs');
const path = require('path');

// iOS splash screen sizes - most common device sizes
const iosSplashSizes = [
  // iPhone
  { width: 640, height: 1136, name: 'iphone5' },
  { width: 750, height: 1334, name: 'iphone6' },
  { width: 1242, height: 2208, name: 'iphone6plus' },
  { width: 828, height: 1792, name: 'iphonexr' },
  { width: 1125, height: 2436, name: 'iphonex' },
  { width: 1242, height: 2688, name: 'iphonexsmax' },
  { width: 1170, height: 2532, name: 'iphone12' },
  { width: 1284, height: 2778, name: 'iphone12promax' },
  
  // iPad
  { width: 1536, height: 2048, name: 'ipad' },
  { width: 1668, height: 2224, name: 'ipadpro10' },
  { width: 1668, height: 2388, name: 'ipadpro11' },
  { width: 2048, height: 2732, name: 'ipadpro12' },
];

// Android splash screen sizes
const androidSplashSizes = [
  { width: 320, height: 568, name: 'android-small' },
  { width: 768, height: 1024, name: 'android-medium' },
  { width: 1080, height: 1920, name: 'android-large' },
  { width: 1440, height: 2560, name: 'android-xlarge' },
];

function createSplashSVG(width, height, deviceName) {
  const centerX = width / 2;
  const centerY = height / 2;
  const logoSize = Math.min(width, height) * 0.15;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background gradient -->
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#0A0A0A"/>
      <stop offset="100%" style="stop-color:#161A1F"/>
    </linearGradient>
    <radialGradient id="accentGradient" cx="50%" cy="30%">
      <stop offset="0%" style="stop-color:#1F5798;stop-opacity:0.3"/>
      <stop offset="70%" style="stop-color:#0B2A4A;stop-opacity:0.1"/>
      <stop offset="100%" style="stop-color:#0A0A0A;stop-opacity:0"/>
    </radialGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#bgGradient)"/>
  <rect width="${width}" height="${height}" fill="url(#accentGradient)"/>
  
  <!-- Logo container -->
  <g transform="translate(${centerX - logoSize/2}, ${centerY - logoSize/2})">
    <!-- Logo background circle -->
    <circle cx="${logoSize/2}" cy="${logoSize/2}" r="${logoSize/2 * 0.9}" 
            fill="#0B2A4A" stroke="#1F5798" stroke-width="${logoSize * 0.02}"/>
    
    <!-- Lightning bolt icon -->
    <g transform="translate(${logoSize * 0.2}, ${logoSize * 0.15})">
      <path d="M${logoSize * 0.25} 0 L${logoSize * 0.1} ${logoSize * 0.4} L${logoSize * 0.2} ${logoSize * 0.4} L${logoSize * 0.15} ${logoSize * 0.7} L${logoSize * 0.35} ${logoSize * 0.3} L${logoSize * 0.25} ${logoSize * 0.3} L${logoSize * 0.25} 0 Z" 
            fill="#FFFFFF"/>
    </g>
    
    <!-- Accent circle -->
    <circle cx="${logoSize * 0.75}" cy="${logoSize * 0.25}" r="${logoSize * 0.08}" 
            fill="#1F5798" opacity="0.8"/>
  </g>
  
  <!-- App name -->
  <text x="${centerX}" y="${centerY + logoSize * 0.8}" 
        font-family="system-ui, -apple-system, sans-serif" 
        font-size="${Math.max(24, width * 0.04)}" 
        font-weight="600" 
        fill="#FFFFFF" 
        text-anchor="middle">
    Feel Sharper
  </text>
  
  <!-- Tagline -->
  <text x="${centerX}" y="${centerY + logoSize * 1.1}" 
        font-family="system-ui, -apple-system, sans-serif" 
        font-size="${Math.max(16, width * 0.025)}" 
        font-weight="400" 
        fill="#C7CBD1" 
        text-anchor="middle">
    Your Sharpest Self, Every Day
  </text>
  
  <!-- Loading indicator -->
  <g transform="translate(${centerX - 30}, ${height - 120})">
    <circle cx="30" cy="30" r="20" fill="none" stroke="#1F5798" stroke-width="3" opacity="0.3"/>
    <circle cx="30" cy="30" r="20" fill="none" stroke="#1F5798" stroke-width="3" 
            stroke-dasharray="31.416" stroke-dashoffset="31.416" opacity="0.8">
      <animate attributeName="stroke-dashoffset" 
               values="31.416;0;31.416" 
               dur="2s" 
               repeatCount="indefinite"/>
    </circle>
  </g>
</svg>`;
}

// Create splash screens directory
const splashDir = path.join(__dirname, '..', 'public', 'splash');
if (!fs.existsSync(splashDir)) {
  fs.mkdirSync(splashDir, { recursive: true });
}

console.log('Generating splash screens...');

// Generate iOS splash screens
iosSplashSizes.forEach(({ width, height, name }) => {
  const svgContent = createSplashSVG(width, height, name);
  const filename = `apple-splash-${width}x${height}-${name}.svg`;
  const filePath = path.join(splashDir, filename);
  
  fs.writeFileSync(filePath, svgContent);
  console.log(`Created ${filename}`);
});

// Generate Android splash screens
androidSplashSizes.forEach(({ width, height, name }) => {
  const svgContent = createSplashSVG(width, height, name);
  const filename = `android-splash-${width}x${height}-${name}.svg`;
  const filePath = path.join(splashDir, filename);
  
  fs.writeFileSync(filePath, svgContent);
  console.log(`Created ${filename}`);
});

// Generate a default splash screen
const defaultSplash = createSplashSVG(1125, 2436, 'default');
fs.writeFileSync(path.join(splashDir, 'default-splash.svg'), defaultSplash);
console.log('Created default-splash.svg');

console.log('✅ Splash screens generated successfully!');
console.log('📝 Note: These are SVG files for development.');
console.log('💡 For production, convert these to PNG files and update the HTML meta tags.');