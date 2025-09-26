import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./Home.module.css";
import Bottom from "../../components/bottom/Bottom";
import Header from "../../components/header/Header";
import edit from "../../../public/Edit.png";

function Home() {
  const position = [-26.790845466968143, -48.62679229044237];

  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1); // 1 = form, 2 = mapa
  const [formData, setFormData] = useState({
    titulo: "",
    preco: "",
    cor: "#77A2E8",
  });
  const [points, setPoints] = useState([]);
  const [areas, setAreas] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [oldPolygon, setOldPolygon] = useState([]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleClose = () => {
    setShowModal(false);
    setFormData({ titulo: "", preco: "", cor: "#77A2E8" });
    setPoints([]);
    setStep(1);
    setEditingIndex(null);
    setOldPolygon([]);
  };

  const handleConfirm = () => {
    if (points.length < 3) {
      alert("Você precisa selecionar pelo menos 3 pontos no mapa!");
      return;
    }

    const newArea = { ...formData, pontos: points };

    if (editingIndex !== null) {
      const updatedAreas = [...areas];
      updatedAreas[editingIndex] = newArea;
      setAreas(updatedAreas);
    } else {
      setAreas((prev) => [...prev, newArea]);
    }

    handleClose();
  };

  const handleEdit = (index) => {
    const area = areas[index];
    setFormData({
      titulo: area.titulo,
      preco: area.preco,
      cor: area.cor,
    });
    setPoints([]);
    setOldPolygon(area.pontos);
    setEditingIndex(index);
    setStep(1); // inicia pelo formulário
    setShowModal(true);
  };

  const handleDelete = () => {
    if (editingIndex !== null) {
      if (window.confirm("Deseja realmente apagar esta área?")) {
        setAreas((prev) => prev.filter((_, i) => i !== editingIndex));
        handleClose();
      }
    }
  };

  function MapClickHandler() {
    useMapEvents({
      click(e) {
        setPoints((prev) => [...prev, [e.latlng.lat, e.latlng.lng]]);
      },
    });
    return null;
  }

  return (
    <div className={styles.container}>
      <Header />
      <main>
        <div className={styles.areasContainer}>
          <h1 className={styles.title}>Áreas de entrega</h1>
          <div className={styles.savedAreasContainer}>
            <button onClick={() => setShowModal(true)}>Criar nova área</button>
            <div className={styles.areaCardContainer}>
              {areas.length === 0 && (
                <p className={styles.emptyMessage}>Nenhuma área registrada</p>
              )}

              {areas.map((area, index) => (
                <div key={index} className={styles.card}>
                  <p>
                    <span
                      className={styles.color}
                      style={{ backgroundColor: area.cor }}
                    ></span>
                    {area.titulo}{" "}
                    <span>{parseFloat(area.preco).toFixed(2)}R$</span>
                  </p>
                  <img
                    src={edit}
                    alt="Editar"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleEdit(index)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.mapContainer}>
          <input type="text" placeholder="Buscar endereço" id="searchLocate" />

          <MapContainer
            center={position}
            zoom={18}
            style={{ height: "75vh", width: "50vw", marginTop: "20px" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={position}>
              <Popup>Av. Eugênio Krause, 3075 - Armação, Penha - SC</Popup>
            </Marker>

            {/* Polígonos das áreas registradas */}
            {areas.map((area, idx) =>
              area.pontos.length >= 3 ? (
                <Polygon
                  key={idx}
                  positions={area.pontos}
                  pathOptions={{
                    color: area.cor,
                    fillColor: area.cor,
                    fillOpacity: 0.4,
                  }}
                />
              ) : null
            )}
          </MapContainer>
        </div>
      </main>
      <Bottom />

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalLarge}>
            {/* Botão de apagar só aparece no modal de edição */}
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
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap'
                  />

                  <MapClickHandler />

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

                  {points.map((p, i) => (
                    <Marker key={i} position={p}>
                      <Popup>Ponto {i + 1}</Popup>
                    </Marker>
                  ))}

                  {points.length >= 3 && (
                    <Polygon
                      positions={points}
                      pathOptions={{
                        color: formData.cor,
                        fillColor: formData.cor,
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
      )}
    </div>
  );
}

export default Home;
