export const ASSETS = {
  logos: {
    next: "/next.svg",
    vercel: "/vercel.svg",
    globe: "/globe.svg",
    window: "/window.svg",
    file: "/file.svg",
  },
  images: {
    defaultAvatar: "/default-avatar.png",
  },
} as const;

export type AssetCategory = keyof typeof ASSETS;

export type AssetKey<C extends AssetCategory> = keyof (typeof ASSETS)[C];

export type AssetPath = {
  [C in AssetCategory]: (typeof ASSETS)[C][keyof (typeof ASSETS)[C]];
}[AssetCategory];

export function getAsset<C extends AssetCategory, K extends AssetKey<C>>(
  category: C,
  key: K
): (typeof ASSETS)[C][K] {
  return ASSETS[category][key];
}


