
export interface Wallpaper {
  id: string;
  category: string;
  lightUrl: string;
  darkUrl: string;
}

export interface LiveWallpaper {
  id: string;
  name: string;
  thumbUrl: string;
}

export interface AccentColor {
  name: string;
  hex: string;
  hoverHex: string;
}

export const wallpaperCategories = [
  'Nature',
  'City',
  'Anime',
  'Cafe',
  'Animal',
  'Exclusive',
  'Specials'
];

export const wallpapers: Wallpaper[] = [
  {
    id: 'deep_space',
    category: 'Specials',
    lightUrl: 'https://images.unsplash.com/photo-1464802686167-b939a67e06a1?auto=format&fit=crop&q=80&w=1920',
    darkUrl: 'https://images.unsplash.com/photo-1464802686167-b939a67e06a1?auto=format&fit=crop&q=80&w=1920'
  },
  {
    id: 'mountain_lake',
    category: 'Nature',
    lightUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1920',
    darkUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1920'
  },
  {
    id: 'tokyo_night',
    category: 'City',
    lightUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=1920',
    darkUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=1920'
  },
  {
    id: 'anime_landscape',
    category: 'Anime',
    lightUrl: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?auto=format&fit=crop&q=80&w=1920',
    darkUrl: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?auto=format&fit=crop&q=80&w=1920'
  },
  {
    id: 'cozy_cafe',
    category: 'Cafe',
    lightUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1920',
    darkUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1920'
  },
  {
    id: 'forest_path',
    category: 'Nature',
    lightUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1920',
    darkUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1920'
  },
  {
    id: 'cyberpunk_city',
    category: 'City',
    lightUrl: 'https://images.unsplash.com/photo-1605142859862-978be7eba909?auto=format&fit=crop&q=80&w=1920',
    darkUrl: 'https://images.unsplash.com/photo-1605142859862-978be7eba909?auto=format&fit=crop&q=80&w=1920'
  }
];

export const liveWallpapers: LiveWallpaper[] = [
  {
    id: 'live:L_Lup_S0v3Q',
    name: 'Lo-fi Study Girl',
    thumbUrl: 'https://img.youtube.com/vi/L_Lup_S0v3Q/maxresdefault.jpg'
  },
  {
    id: 'live:jfKfPfyJRdk',
    name: 'Lofi Girl - Relaxing Beats',
    thumbUrl: 'https://img.youtube.com/vi/jfKfPfyJRdk/maxresdefault.jpg'
  }
];

export const accentColors: AccentColor[] = [
  { name: 'Blue', hex: '#3b82f6', hoverHex: '#2563eb' },
  { name: 'Purple', hex: '#8b5cf6', hoverHex: '#7c3aed' },
  { name: 'Pink', hex: '#ec4899', hoverHex: '#db2777' },
  { name: 'Red', hex: '#ef4444', hoverHex: '#dc2626' },
  { name: 'Orange', hex: '#f97316', hoverHex: '#ea580c' },
  { name: 'Green', hex: '#10b981', hoverHex: '#059669' },
  { name: 'Cyan', hex: '#06b6d4', hoverHex: '#0891b2' },
  { name: 'Indigo', hex: '#6366f1', hoverHex: '#4f46e5' }
];
