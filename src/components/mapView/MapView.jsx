import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  Polyline,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./MapView.module.css";

function calcDistanceKm([lat1, lon1], [lat2, lon2]) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function CenterButton({ center }) {
  const map = useMap();
  return (
    <button
      onClick={() => map.flyTo(center, 16, { animate: true })}
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

function MapView({
  position,
  areas,
  pois,
  loading,
  fetchPOIs,
  points,
  setPoints,
  mapRef,
  selectedSearchPoint,
}) {
  function MapPOILoader() {
    useMapEvents({
      moveend: (e) => {
        const center = e.target.getCenter();
        fetchPOIs(center.lat, center.lng);
      },
    });
    return null;
  }

  function MapClickHandler() {
    useMapEvents({
      click(e) {
        setPoints((prev) => [...prev, [e.latlng.lat, e.latlng.lng]]);
      },
    });
    return null;
  }

  function MapCenterUpdater({ point }) {
    const map = useMap();
    useEffect(() => {
      if (point) {
        map.flyTo([point.lat, point.lng], 17, { animate: true });
      }
    }, [point, map]);
    return null;
  }

  useEffect(() => {
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

        {/* Marcador da loja */}
        <Marker position={position}>
          <Popup>📍 Loja - Ponto inicial</Popup>
        </Marker>

        {/* Marcador do ponto buscado */}
        {selectedSearchPoint && (
          <>
            <Marker position={[selectedSearchPoint.lat, selectedSearchPoint.lng]}>
              <Popup>
                {selectedSearchPoint.name}
                <br />
                Distância:{" "}
                {calcDistanceKm(position, [
                  selectedSearchPoint.lat,
                  selectedSearchPoint.lng,
                ]).toFixed(2)}{" "}
                km
              </Popup>
            </Marker>

            <Polyline
              positions={[
                position,
                [selectedSearchPoint.lat, selectedSearchPoint.lng],
              ]}
              pathOptions={{ color: "orange", dashArray: "5,10" }}
            />
          </>
        )}

        {/* Polígonos das áreas */}
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

        {/* POIs */}
        <MapPOILoader />
        {!loading &&
          pois.map((poi, idx) => (
            <Marker key={idx} position={[poi.lat, poi.lon]}>
              <Popup>
                <b>{poi.display_name}</b>
              </Popup>
            </Marker>
          ))}

        <MapClickHandler />
        <MapCenterUpdater point={selectedSearchPoint} />
        <CenterButton center={position} />
      </MapContainer>
    </div>
  );
}

export default MapView;
