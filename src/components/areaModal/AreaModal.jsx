import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polygon,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./AreaModal.module.css";

function AreaModal({
  show,
  step,
  setStep,
  formData,
  handleChange,
  handleConfirm,
  handleClose,
  handleDelete,
  editingIndex,
  oldPolygon,
  points,
  setPoints,
  position,
  formColor,
}) {
  if (!show) return null;

  function MapClickHandler() {
    useMapEvents({
      click(e) {
        setPoints((prev) => [...prev, [e.latlng.lat, e.latlng.lng]]);
      },
    });
    return null;
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalLarge}>
        {editingIndex !== null && (
          <button className={styles.deleteButton} onClick={handleDelete}>
            Apagar
          </button>
        )}

        {step === 1 && (
          <>
            <h2>{editingIndex !== null ? "Editar área" : "Criar nova área"}</h2>

            <label>
              Título:
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
              />
            </label>

            <label>
              Preço:
              <input
                type="number"
                step="0.01"
                name="preco"
                value={formData.preco}
                onChange={handleChange}
              />
            </label>

            <label>
              Cor da área:
              <input
                type="color"
                name="cor"
                value={formData.cor}
                onChange={handleChange}
              />
            </label>

            <div className={styles.modalActions}>
              <button onClick={() => setStep(2)}>Avançar para o mapa</button>
              <button onClick={handleClose} className={styles.cancelButton}>
                Cancelar
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2>Selecione os pontos da área</h2>
            <MapContainer
              center={oldPolygon.length > 0 ? oldPolygon[0] : position}
              zoom={16}
              style={{ height: "70vh", width: "100%", borderRadius: "1rem" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap"
              />

              <MapClickHandler />

              {/* Polígono antigo (em cinza) */}
              {oldPolygon.length >= 3 && points.length === 0 && (
                <Polygon
                  positions={oldPolygon}
                  pathOptions={{
                    color: "#ccc",
                    fillColor: "#ccc",
                    fillOpacity: 0.2,
                  }}
                />
              )}

              {/* Pontos novos clicados */}
              {points.map((p, i) => (
                <Marker key={i} position={p}>
                  <Popup>Ponto {i + 1}</Popup>
                </Marker>
              ))}

              {/* Polígono novo */}
              {points.length >= 3 && (
                <Polygon
                  positions={points}
                  pathOptions={{
                    color: formColor || formData.cor,
                    fillColor: formColor || formData.cor,
                    fillOpacity: 0.4,
                  }}
                />
              )}
            </MapContainer>

            <div className={styles.modalActions}>
              <button onClick={handleConfirm}>Confirmar</button>
              <button onClick={handleClose} className={styles.cancelButton}>
                Cancelar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AreaModal;