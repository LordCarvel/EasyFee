/**
 * Busca endereços reais (com número) usando a API do OpenCage.
 * Requer a variável de ambiente VITE_OPENCAGE_KEY no .env.
 * Exemplo: Rua Eugênio Krause 3075, Penha SC, Brasil
 */

export async function addressSearch(query, { signal } = {}) {
  const apiKey = import.meta.env.VITE_OPENCAGE_KEY;
  if (!apiKey) {
    console.error("❌ OpenCage API key ausente. Adicione VITE_OPENCAGE_KEY no .env");
    return [];
  }

  if (!query || query.trim().length < 3) return [];

  const cleanQuery = query.trim().replace(/\s+/g, " ");

  // Faz a requisição
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
    cleanQuery
  )}&key=${apiKey}&countrycode=br&limit=8&language=pt`;

  try {
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error("Erro ao buscar endereço");

    const data = await res.json();
    if (!data.results || data.results.length === 0) return [];

    // Mapeia os resultados para o mesmo formato usado no projeto
    return data.results.map((item, idx) => ({
      id:
        (item.annotations && item.annotations.geohash) ||
        (item.geometry && `${item.geometry.lat},${item.geometry.lng}`) ||
        String(idx),
      name: item.formatted,
      lat: item.geometry.lat,
      lng: item.geometry.lng,
      rua:
        item.components.road ||
        item.components.street ||
        item.components.residential ||
        "",
      numero: item.components.house_number || "0",
      bairro:
        item.components.suburb ||
        item.components.neighbourhood ||
        item.components.village ||
        "",
      cidade:
        item.components.city ||
        item.components.town ||
        item.components.village ||
        "",
      estado: item.components.state || "",
      pais: item.components.country || "",
    }));
  } catch (err) {
    if (err.name === "AbortError") return [];
    console.error("Erro na busca OpenCage:", err);
    return [];
  }
}
