export function getMapUrl(query: string, placeId?: string) {
  // TODO: Use a real Maps embed/navigation flow when booking pages are added.
  const encodedQuery = encodeURIComponent(query);
  const placePart = placeId ? `&query_place_id=${encodeURIComponent(placeId)}` : "";

  return `https://www.google.com/maps/search/?api=1&query=${encodedQuery}${placePart}`;
}
