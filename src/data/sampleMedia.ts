export interface SampleItem {
  id: string;
  type: 'image' | 'video';
  title: string;
  titleKm: string;
  description: string;
  previewUrl: string;
  mimeType: string;
  dataBase64?: string;
  videoBlobUrl?: string;
}

// Crisp inline lightweight SVG/Canvas rendered samples converted to base64
export const SAMPLE_IMAGES = [
  {
    id: 'angkor-sunrise',
    title: 'Angkor Wat at Golden Dawn',
    titleKm: 'ប្រាសាទអង្គរវត្តពេលព្រឹកព្រាង',
    category: 'Architecture & Heritage',
    aspect: '16:9',
    svgData: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
      <defs>
        <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#1e1035"/>
          <stop offset="40%" stop-color="#70224d"/>
          <stop offset="70%" stop-color="#d9532f"/>
          <stop offset="90%" stop-color="#fca311"/>
          <stop offset="100%" stop-color="#ffe6a7"/>
        </linearGradient>
        <linearGradient id="water" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffe6a7" stop-opacity="0.8"/>
          <stop offset="20%" stop-color="#d9532f" stop-opacity="0.6"/>
          <stop offset="100%" stop-color="#140d2b"/>
        </linearGradient>
        <radialGradient id="sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="30%" stop-color="#fff275"/>
          <stop offset="70%" stop-color="#ff8c00" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#ff8c00" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="1280" height="720" fill="url(#sky)"/>
      <circle cx="640" cy="380" r="140" fill="url(#sun)"/>
      
      <!-- Mist layer -->
      <ellipse cx="640" cy="460" rx="600" ry="40" fill="#fca311" opacity="0.35" filter="blur(15px)"/>
      
      <!-- Distant Jungle silhouette -->
      <path d="M0,490 Q200,470 400,485 T800,475 T1280,490 L1280,510 L0,510 Z" fill="#201124"/>
      
      <!-- Central Angkor Towers Silhouette -->
      <!-- Central lotus sanctuary -->
      <path d="M640,210 C625,260 620,330 605,370 L675,370 C660,330 655,260 640,210 Z" fill="#0f0714"/>
      <path d="M605,370 L590,490 L690,490 L675,370 Z" fill="#0f0714"/>
      
      <!-- Left inner tower -->
      <path d="M540,260 C530,300 525,360 515,390 L565,390 C555,360 550,300 540,260 Z" fill="#0f0714"/>
      <path d="M515,390 L505,490 L575,490 L565,390 Z" fill="#0f0714"/>
      
      <!-- Right inner tower -->
      <path d="M740,260 C730,300 725,360 715,390 L765,390 C755,360 750,300 740,260 Z" fill="#0f0714"/>
      <path d="M715,390 L705,490 L775,490 L765,390 Z" fill="#0f0714"/>

      <!-- Left outer tower -->
      <path d="M440,310 C430,340 425,390 418,420 L462,420 C455,390 450,340 440,310 Z" fill="#0f0714"/>
      <path d="M418,420 L410,490 L470,490 L462,420 Z" fill="#0f0714"/>

      <!-- Right outer tower -->
      <path d="M840,310 C830,340 825,390 818,420 L862,420 C855,390 850,340 840,310 Z" fill="#0f0714"/>
      <path d="M818,420 L810,490 L870,490 L862,420 Z" fill="#0f0714"/>

      <!-- Base gallery structure -->
      <rect x="360" y="440" width="560" height="50" fill="#0f0714"/>
      <rect x="300" y="470" width="680" height="25" fill="#0a050d"/>

      <!-- Reflecting Pool -->
      <rect y="495" width="1280" height="225" fill="url(#water)"/>
      
      <!-- Water reflections -->
      <ellipse cx="640" cy="540" rx="70" ry="12" fill="#ffe6a7" opacity="0.4"/>
      <ellipse cx="640" cy="580" rx="140" ry="8" fill="#d9532f" opacity="0.5"/>
      <ellipse cx="540" cy="560" rx="50" ry="6" fill="#fca311" opacity="0.3"/>
      <ellipse cx="740" cy="560" rx="50" ry="6" fill="#fca311" opacity="0.3"/>
      
      <!-- Lotus blossoms in foreground -->
      <circle cx="280" cy="640" r="14" fill="#ff70a6" opacity="0.8"/>
      <ellipse cx="280" cy="655" rx="35" ry="10" fill="#1b4332"/>
      <circle cx="980" cy="660" r="12" fill="#ff70a6" opacity="0.75"/>
      <ellipse cx="980" cy="672" rx="30" ry="8" fill="#1b4332"/>
    </svg>`,
  },
  {
    id: 'cyberpunk-tokyo',
    title: 'Neon Cyberpunk Metropolis',
    titleKm: 'ទីក្រុងអនាគតបែប Cyberpunk ពន្លឺនេអុង',
    category: 'Sci-Fi & Cinematic',
    aspect: '16:9',
    svgData: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
      <defs>
        <linearGradient id="cyberSky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#02010a"/>
          <stop offset="50%" stop-color="#0b0826"/>
          <stop offset="100%" stop-color="#180e3d"/>
        </linearGradient>
        <linearGradient id="wetRoad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#180e3d"/>
          <stop offset="100%" stop-color="#05030f"/>
        </linearGradient>
      </defs>
      <rect width="1280" height="720" fill="url(#cyberSky)"/>
      
      <!-- Rain streaks -->
      <g stroke="#00f0ff" stroke-width="0.8" opacity="0.25">
        <line x1="100" y1="50" x2="80" y2="170"/>
        <line x1="300" y1="20" x2="280" y2="140"/>
        <line x1="550" y1="80" x2="530" y2="220"/>
        <line x1="850" y1="40" x2="830" y2="180"/>
        <line x1="1100" y1="90" x2="1080" y2="230"/>
        <line x1="420" y1="260" x2="400" y2="380"/>
        <line x1="720" y1="220" x2="700" y2="350"/>
      </g>
      
      <!-- Skyscrapers -->
      <rect x="80" y="140" width="160" height="420" fill="#080718" stroke="#ff007f" stroke-width="1.5"/>
      <rect x="270" y="80" width="220" height="480" fill="#0c0b24" stroke="#00f0ff" stroke-width="2"/>
      <rect x="520" y="180" width="240" height="380" fill="#09081a" stroke="#ffe600" stroke-width="1"/>
      <rect x="790" y="60" width="210" height="500" fill="#0e0c29" stroke="#ff007f" stroke-width="2"/>
      <rect x="1030" y="130" width="170" height="430" fill="#070614" stroke="#00f0ff" stroke-width="1.5"/>
      
      <!-- Hologram signs & Kanji -->
      <rect x="310" y="120" width="140" height="60" rx="8" fill="#ff007f" opacity="0.85"/>
      <text x="380" y="160" fill="#ffffff" font-size="28" font-family="monospace" text-anchor="middle" font-weight="bold">AI 2099</text>
      
      <rect x="830" y="110" width="130" height="180" rx="6" fill="#00f0ff" opacity="0.8"/>
      <text x="895" y="170" fill="#05030f" font-size="34" font-family="sans-serif" text-anchor="middle" font-weight="900">未来</text>
      <text x="895" y="230" fill="#05030f" font-size="34" font-family="sans-serif" text-anchor="middle" font-weight="900">電脳</text>
      
      <!-- Flying car / spinner with light trails -->
      <ellipse cx="640" cy="220" rx="75" ry="18" fill="#1f1d36" stroke="#00f0ff" stroke-width="2"/>
      <line x1="565" y1="220" x2="280" y2="210" stroke="#00f0ff" stroke-width="4" opacity="0.6"/>
      <line x1="715" y1="220" x2="1000" y2="230" stroke="#ff007f" stroke-width="4" opacity="0.6"/>

      <!-- Asphalt & Wet Street Reflective Ground -->
      <rect y="520" width="1280" height="200" fill="url(#wetRoad)"/>
      <ellipse cx="380" cy="580" rx="130" ry="12" fill="#ff007f" opacity="0.45" filter="blur(8px)"/>
      <ellipse cx="890" cy="600" rx="140" ry="15" fill="#00f0ff" opacity="0.5" filter="blur(10px)"/>
      <ellipse cx="640" cy="620" rx="90" ry="10" fill="#ffe600" opacity="0.35" filter="blur(6px)"/>
      
      <!-- Lone figure with umbrella in rainy mist -->
      <path d="M620,530 Q640,510 660,530 Z" fill="#ff007f"/>
      <line x1="640" y1="520" x2="640" y2="570" stroke="#ff007f" stroke-width="2"/>
      <ellipse cx="640" cy="572" rx="12" ry="4" fill="#000" opacity="0.8"/>
    </svg>`,
  },
  {
    id: 'steampunk-airship',
    title: 'Steampunk Airship Floating Through Clouds',
    titleKm: 'កប៉ាល់ហោះបែប Steampunk លើពពកមាស',
    category: 'Fantasy & Adventure',
    aspect: '16:9',
    svgData: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
      <defs>
        <linearGradient id="cloudSky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#2a3d66"/>
          <stop offset="45%" stop-color="#d48c46"/>
          <stop offset="85%" stop-color="#f3c68f"/>
          <stop offset="100%" stop-color="#fdf0d5"/>
        </linearGradient>
        <linearGradient id="brass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#b8860b"/>
          <stop offset="50%" stop-color="#ffd700"/>
          <stop offset="100%" stop-color="#8b6508"/>
        </linearGradient>
      </defs>
      <rect width="1280" height="720" fill="url(#cloudSky)"/>
      
      <!-- Cloud banks -->
      <circle cx="200" cy="620" r="180" fill="#fdf0d5" opacity="0.9"/>
      <circle cx="450" cy="640" r="220" fill="#f3c68f" opacity="0.85"/>
      <circle cx="750" cy="600" r="190" fill="#fdf0d5" opacity="0.9"/>
      <circle cx="1080" cy="630" r="240" fill="#e8af7a" opacity="0.8"/>
      
      <!-- Main Zeppelin Airship Hull -->
      <ellipse cx="640" cy="280" rx="320" ry="110" fill="#5c4033" stroke="#b8860b" stroke-width="4"/>
      <!-- Brass Ribs / Straps -->
      <ellipse cx="500" cy="280" rx="30" ry="105" fill="none" stroke="url(#brass)" stroke-width="5"/>
      <ellipse cx="640" cy="280" rx="30" ry="108" fill="none" stroke="url(#brass)" stroke-width="6"/>
      <ellipse cx="780" cy="280" rx="30" ry="105" fill="none" stroke="url(#brass)" stroke-width="5"/>
      
      <!-- Gondola / Bridge -->
      <rect x="520" y="390" width="240" height="55" rx="10" fill="url(#brass)" stroke="#3e2723" stroke-width="3"/>
      <!-- Portholes -->
      <circle cx="560" cy="415" r="10" fill="#ffe082" stroke="#4e342e" stroke-width="2"/>
      <circle cx="610" cy="415" r="10" fill="#ffe082" stroke="#4e342e" stroke-width="2"/>
      <circle cx="660" cy="415" r="10" fill="#ffe082" stroke="#4e342e" stroke-width="2"/>
      <circle cx="710" cy="415" r="10" fill="#ffe082" stroke="#4e342e" stroke-width="2"/>
      
      <!-- Brass Propellers and Steam -->
      <circle cx="340" cy="310" r="24" fill="#3e2723"/>
      <ellipse cx="320" cy="310" rx="40" ry="8" fill="#ffd700" opacity="0.8" transform="rotate(25 340 310)"/>
      <circle cx="940" cy="310" r="24" fill="#3e2723"/>
      <ellipse cx="960" cy="310" rx="40" ry="8" fill="#ffd700" opacity="0.8" transform="rotate(-25 940 310)"/>
      
      <!-- Steam plume -->
      <ellipse cx="310" cy="290" rx="45" ry="20" fill="#ffffff" opacity="0.5" filter="blur(6px)"/>
      <ellipse cx="240" cy="270" rx="70" ry="30" fill="#ffffff" opacity="0.3" filter="blur(10px)"/>
    </svg>`,
  },
];

// Helper to convert SVG data to base64 Data URL
export function svgToDataUrl(svg: string): string {
  const base64 = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${base64}`;
}
