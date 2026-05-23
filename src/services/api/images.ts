const destinationImages = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80",
];

export function pickMockImage(items: string[], index: number) {
  return items[index % items.length];
}

export function getPlacePhotoUrl(photoName: string) {
  return `/api/places/photo?name=${encodeURIComponent(photoName)}`;
}

export function getPlaceImages(index: number, photoNames: string[] = []) {
  // TODO: Replace fallback image list with a production image CDN/cache layer.
  const googleImages = photoNames.map(getPlacePhotoUrl);

  if (googleImages.length) {
    return {
      image: googleImages[0],
      gallery: googleImages.slice(0, 3),
    };
  }

  return {
    image: pickMockImage(destinationImages, index),
    gallery: [
      pickMockImage(destinationImages, index),
      pickMockImage(destinationImages, index + 1),
      pickMockImage(destinationImages, index + 2),
    ],
  };
}
