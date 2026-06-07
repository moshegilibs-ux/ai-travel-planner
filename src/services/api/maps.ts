export function getMapUrl(destination: string, placeId?: string) {
  const params = new URLSearchParams({
    api: "1",
    query: destination,
  });

  if (placeId) {
    params.set("query_place_id", placeId);
  }

  return `https://www.google.com/maps/search/?${params.toString()}`;
}
