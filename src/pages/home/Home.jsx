// src/pages/Home/Home.jsx
import { useState, useEffect, useRef } from "react";
import styles from "./Home.module.css";
import Header from "../../components/header/Header";
import Bottom from "../../components/bottom/Bottom";

import SearchInput from "../../components/searchInput/SearchInput";
import MapView from "../../components/mapView/MapView";
import AreaList from "../../components/areaList/AreaList";
import AreaModal from "../../components/areaModal/AreaModal";

function Home() {
  const position = [-26.790845466968143, -48.62679229044237];

  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    titulo: "",
    preco: "",
    cor: "#77A2E8",
  });
  const [points, setPoints] = useState([]);
  const [areas, setAreas] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [oldPolygon, setOldPolygon] = useState([]);
  const [pois, setPois] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const mapRef = useRef(null);

  async function fetchPOIs(lat, lon) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=restaurant&limit=12&lat=${lat}&lon=${lon}`
      );
      const data = await res.json();
      setPois(data);
    } catch (err) {
      console.error("Erro ao buscar POIs:", err);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1000);
    fetchPOIs(position[0], position[1]);
    return () => clearTimeout(timeout);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    if (editingIndex !== null) {
      const updatedAreas = [...areas];
      const currentArea = updatedAreas[editingIndex];

      updatedAreas[editingIndex] = {
        ...currentArea,
        titulo: formData.titulo,
        preco: Number(formData.preco),
        cor: formData.cor,
        pontos: points.length > 0 ? points : currentArea.pontos,
      };

      setAreas(updatedAreas);
    } else {
      if (points.length < 3) {
        alert("Você precisa selecionar pelo menos 3 pontos no mapa!");
        return;
      }

      const newArea = {
        ...formData,
        preco: Number(formData.preco),
        pontos: points,
      };

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
    setStep(1);
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

  return (
    <div className={styles.container}>
      <Header />
      <main>
        <AreaList
          areas={areas}
          onCreate={() => setShowModal(true)}
          onEdit={handleEdit}
        />

        <div className={styles.mapSection}>
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <MapView
            position={position}
            areas={areas}
            pois={pois}
            loading={loading}
            fetchPOIs={fetchPOIs}
            points={points}
            setPoints={setPoints}
            mapRef={mapRef}
          />
        </div>
      </main>

      <Bottom />

      <AreaModal
        show={showModal}
        step={step}
        setStep={setStep}
        formData={formData}
        handleChange={handleChange}
        handleConfirm={handleConfirm}
        handleClose={handleClose}
        handleDelete={handleDelete}
        editingIndex={editingIndex}
        oldPolygon={oldPolygon}
        points={points}
        setPoints={setPoints}
        position={position}
      />
    </div>
  );
}

export default Home;
