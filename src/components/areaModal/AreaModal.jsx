import React from "react";
import { GoogleMap, Marker, Polygon, useLoadScript } from "@react-google-maps/api";
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
    // Handled by onClick on GoogleMap (below)
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
            {(() => {
              const { isLoaded, loadError } = useLoadScript({
                googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
                libraries: ["places"],
              });

              if (loadError) return <div>Erro ao carregar mapa</div>;
              if (!isLoaded) return <div>Carregando mapa...</div>;

              const center = oldPolygon.length > 0 ? { lat: oldPolygon[0][0], lng: oldPolygon[0][1] } : { lat: position[0], lng: position[1] };

              return (
                <GoogleMap
                  center={center}
                  zoom={16}
                  mapContainerStyle={{ height: "70vh", width: "100%", borderRadius: "1rem" }}
                  onClick={(e) => setPoints((prev) => [...prev, [e.latLng.lat(), e.latLng.lng()]])}
                >
                  {/* Polígono antigo (em cinza) */}
                  {oldPolygon.length >= 3 && points.length === 0 && (
                    <Polygon
                      paths={oldPolygon.map((p) => ({ lat: p[0], lng: p[1] }))}
                      options={{
                        strokeColor: "#ccc",
                        fillColor: "#ccc",
                        fillOpacity: 0.2,
                      }}
                    />
                  )}

                  {/* Pontos novos clicados */}
                  {points.map((p, i) => (
                    <Marker key={i} position={{ lat: p[0], lng: p[1] }} />
                  ))}

                  {/* Polígono novo */}
                  {points.length >= 3 && (
                    <Polygon
                      paths={points.map((p) => ({ lat: p[0], lng: p[1] }))}
                      options={{
                        strokeColor: formColor || formData.cor,
                        fillColor: formColor || formData.cor,
                        fillOpacity: 0.4,
                      }}
                    />
                  )}
                </GoogleMap>
              );
            })()}

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