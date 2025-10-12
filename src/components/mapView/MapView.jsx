// src/components/MapView/MapView.jsx
import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./MapView.module.css";

function MapView({
  position,
  areas,
  pois,
  loading,
  fetchPOIs,
  points,
  setPoints,
  mapRef,
}) {
  // Atualiza POIs quando o mapa é movido
  function MapPOILoader() {
    useMapEvents({
      moveend: (e) => {
        const center = e.target.getCenter();
        fetchPOIs(center.lat, center.lng);
      },
    });
    return null;
  }

  // Permite clicar no mapa para marcar pontos
  function MapClickHandler() {
    useMapEvents({
      click(e) {
        setPoints((prev) => [...prev, [e.latlng.lat, e.latlng.lng]]);
      },
    });
    return null;
  }

  useEffect(() => {
    // apenas para garantir que a ref pegue o mapa corretamente
    if (mapRef?.current) {
      mapRef.current.invalidateSize();
    }
  }, [mapRef]);

  return (
    <div className={styles.mapContainer}>
      <MapContainer
        center={position}
        zoom={16}
        style={{ height: "75vh", width: "50vw", marginTop: "10px" }}
        whenCreated={(map) => (mapRef.current = map)}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* Marcador principal */}
        <Marker position={position}>
          <Popup>Av. Eugênio Krause, 3075 - Armação, Penha - SC</Popup>
        </Marker>

        {/* Polígonos das áreas salvas */}
        {!loading &&
          areas.map(
            (area, idx) =>
              area.pontos.length >= 3 && (
                <Polygon
                  key={idx}
                  positions={area.pontos}
                  pathOptions={{
                    color: area.cor,
                    fillColor: area.cor,
                    fillOpacity: 0.4,
                  }}
                />
              )
          )}

        {/* POIs (restaurantes, etc.) */}
        <MapPOILoader />
        {!loading &&
          pois.map((poi, idx) => (
            <Marker key={idx} position={[poi.lat, poi.lon]}>
              <Popup>
                <b>{poi.display_name}</b>
              </Popup>
            </Marker>
          ))}

        {/* Captura de cliques no mapa */}
        <MapClickHandler />
      </MapContainer>
    </div>
  );
}

export default MapView;
