
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
    darkUrl: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&q=80&w=1920'
  },
  {
    id: 'mountain_lake',
    category: 'Nature',
    lightUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1920',
    darkUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1920'
  },
  {
    id: 'tokyo_night',
    category: 'City',
    lightUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=1920',
    darkUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=1920'
  },
  {
    id: 'anime_landscape',
    category: 'Anime',
    lightUrl: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?auto=format&fit=crop&q=80&w=1920',
    darkUrl: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=1920'
  },
  {
    id: 'cozy_cafe',
    category: 'Cafe',
    lightUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1920',
    darkUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=1920'
  },
  {
    id: 'forest_path',
    category: 'Nature',
    lightUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1920',
    darkUrl: 'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&q=80&w=1920'
  },
  {
    id: 'cyberpunk_city',
    category: 'City',
    lightUrl: 'https://images.unsplash.com/photo-1605142859862-978be7eba909?auto=format&fit=crop&q=80&w=1920',
    darkUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1920'
  },
  {
    id: 'ocean_waves',
    category: 'Nature',
    lightUrl: 'https://images.unsplash.com/photo-1505118380757-91f5f45d8de4?auto=format&fit=crop&q=80&w=1920',
    darkUrl: 'https://images.unsplash.com/photo-1439405326854-014607f694d7?auto=format&fit=crop&q=80&w=1920'
  },
  {
    id: 'desert_dunes',
    category: 'Nature',
    lightUrl: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&q=80&w=1920',
    darkUrl: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&q=80&w=1920'
  },
  {
    id: 'ny_skyline',
    category: 'City',
    lightUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=1920',
    darkUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=1920'
  },
  {
    id: 'cozy_cat',
    category: 'Animal',
    lightUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=1920',
    darkUrl: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&q=80&w=1920'
  },
  {
    id: 'loyal_dog',
    category: 'Animal',
    lightUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=1920',
    darkUrl: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=1920'
  },
  {
    id: 'rainy_window',
    category: 'Specials',
    lightUrl: 'https://images.unsplash.com/photo-1428592953211-077101b2021b?auto=format&fit=crop&q=80&w=1920',
    darkUrl: 'https://images.unsplash.com/photo-1534274988757-a28bf1f539cf?auto=format&fit=crop&q=80&w=1920'
  },
  {
    id: 'old_library',
    category: 'Exclusive',
    lightUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=1920',
    darkUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=1920'
  },
  {
    id: 'nebula_cloud',
    category: 'Specials',
    lightUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=1920',
    darkUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=1920'
  },
  {
    id: 'cyber_street',
    category: 'City',
    lightUrl: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&q=80&w=1920',
    darkUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&q=80&w=1920'
  },
  {
    id: 'forest_mist',
    category: 'Nature',
    lightUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1920',
    darkUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=1920'
  },
  {
    id: 'cute_panda',
    category: 'Animal',
    lightUrl: 'https://images.unsplash.com/photo-1564349683136-77e08bef1ed1?auto=format&fit=crop&q=80&w=1920',
    darkUrl: 'https://images.unsplash.com/photo-1527118732049-c88155f2107c?auto=format&fit=crop&q=80&w=1920'
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
