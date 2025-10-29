/**
 * Busca endereços usando a Google Maps JavaScript API (Places Autocomplete + Geocoder).
 * Requer que o script do Google Maps esteja carregado (o app carrega via @react-google-maps/api)
 * e a variável de ambiente VITE_GOOGLE_MAPS_KEY no .env.
 */

export async function addressSearch(query, { signal } = {}) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
  if (!apiKey) {
    console.error("❌ Google Maps API key ausente. Adicione VITE_GOOGLE_MAPS_KEY no .env");
    return [];
  }

  if (!query || query.trim().length < 1) return [];

  // If Google Maps JS API isn't loaded yet, return empty — the app loads the script in Home.
  if (typeof window === "undefined" || !window.google || !window.google.maps || !window.google.maps.places) {
    return [];
  }

  const service = new window.google.maps.places.AutocompleteService();
  const geocoder = new window.google.maps.Geocoder();

  return new Promise((resolve) => {
    service.getPlacePredictions(
      { input: query, componentRestrictions: { country: "br" }, types: ["address"] },
      async (predictions, status) => {
        if (!predictions || predictions.length === 0) return resolve([]);

        try {
          const promises = predictions.slice(0, 8).map((pred) => {
            return new Promise((res) => {
              // geocode by placeId to obtain lat/lng and components
              geocoder.geocode({ placeId: pred.place_id }, (results) => {
                if (!results || results.length === 0) return res(null);
                const item = results[0];
                const components = item.address_components || [];
                const getComp = (types) => {
                  const c = components.find((cc) => types.some((t) => cc.types.includes(t)));
                  return c ? c.long_name : "";
                };

                res({
                  id: pred.place_id,
                  name: pred.description,
                  lat: item.geometry.location.lat(),
                  lng: item.geometry.location.lng(),
                  rua: getComp(["route", "street_address"]) || "",
                  numero: getComp(["street_number"]) || "",
                  bairro: getComp(["sublocality", "neighborhood"]) || "",
                  cidade: getComp(["locality", "administrative_area_level_2"]) || "",
                  estado: getComp(["administrative_area_level_1"]) || "",
                  pais: getComp(["country"]) || "",
                });
              });
            });
          });

          const results = await Promise.all(promises);
          resolve(results.filter(Boolean));
        } catch (err) {
          console.error("Erro na busca Google Places:", err);
          resolve([]);
        }
      }
    );
  });
}
