export async function mockSearch(query) {
  const dataset = [
    { id: "1", name: "Rua das Flores, 123", lat: -26.765, lng: -48.647 },
    { id: "2", name: "Avenida Central, 2500", lat: -26.770, lng: -48.650 },
    { id: "3", name: "Travessa São João, 45", lat: -26.768, lng: -48.640 },
  ];

  await new Promise((res) => setTimeout(res, 400));

  return dataset.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );
}
