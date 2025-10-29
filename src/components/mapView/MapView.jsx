import React, { useEffect, useRef } from "react";
import { GoogleMap, Marker, Polygon, Polyline, useLoadScript } from "@react-google-maps/api";
import styles from "./MapView.module.css";

function calcDistanceKm([lat1, lon1], [lat2, lon2]) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function CenterButton({ center, mapRef }) {
  return (
    <button
      onClick={() => {
        if (mapRef?.current) mapRef.current.panTo({ lat: center[0], lng: center[1] });
        if (mapRef?.current) mapRef.current.setZoom(16);
      }}
      style={{
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 1000,
        background: "#fff",
        border: "1px solid #ccc",
        borderRadius: "6px",
        padding: "6px 10px",
        cursor: "pointer",
        boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
      }}
    >
      Centralizar loja
    </button>
  );
}

// Centraliza somente quando o ponto FINAL (rua + número) muda
function MapCenterUpdater({ point, mapRef }) {
  const lastPoint = useRef(null);

  useEffect(() => {
    if (
      point &&
      (!lastPoint.current || point.lat !== lastPoint.current.lat || point.lng !== lastPoint.current.lng)
    ) {
      if (mapRef?.current) {
        mapRef.current.panTo({ lat: point.lat, lng: point.lng });
        mapRef.current.setZoom(17);
      }
      lastPoint.current = point;
    }
  }, [point, mapRef]);

  return null;
}

function MapView({
  position,
  areas,
  pois,
  loading,
  fetchPOIs,
  points,
  setPoints,
  mapRef,
  selectedSearchPoint, // <- só muda quando confirma rua + número
}) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
    libraries: ["places"],
  });

  useEffect(() => {
    if (mapRef?.current && typeof mapRef.current === "object" && mapRef.current.panTo) {
      // noop
    }
  }, [mapRef]);

  if (loadError) return <div>Erro ao carregar Google Maps</div>;
  if (!isLoaded) return <div>Carregando mapa...</div>;

  const center = { lat: position[0], lng: position[1] };

  const onMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setPoints((prev) => [...prev, [lat, lng]]);
  };

  return (
    <div className={styles.mapContainer}>
      <GoogleMap
        mapContainerStyle={{ height: "75vh", width: "50vw", marginTop: "10px" }}
        center={center}
        zoom={16}
        onLoad={(map) => (mapRef.current = map)}
        onClick={onMapClick}
      >
        <Marker position={center} />

        {selectedSearchPoint && (
          <>
            <Marker position={{ lat: selectedSearchPoint.lat, lng: selectedSearchPoint.lng }} />

            <Polyline
              path={[center, { lat: selectedSearchPoint.lat, lng: selectedSearchPoint.lng }]}
              options={{ strokeColor: "orange", strokeOpacity: 1, strokeWeight: 2 }}
            />
          </>
        )}

        {!loading &&
          areas.map(
            (area, idx) =>
              area.pontos.length >= 3 && (
                <Polygon
                  key={idx}
                  paths={area.pontos.map((p) => ({ lat: p[0], lng: p[1] }))}
                  options={{
                    strokeColor: area.cor,
                    fillColor: area.cor,
                    fillOpacity: 0.4,
                  }}
                />
              )
          )}

        {!loading &&
          pois.map((poi, idx) => (
            <Marker key={idx} position={{ lat: poi.lat, lng: poi.lon }} />
          ))}

        <MapCenterUpdater point={selectedSearchPoint} mapRef={mapRef} />
        <CenterButton center={position} mapRef={mapRef} />
      </GoogleMap>
    </div>
  );
}

export default MapView;
