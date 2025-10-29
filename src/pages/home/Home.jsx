// src/pages/Home/Home.jsx
import { useState, useEffect, useRef } from "react";
import { useLoadScript } from "@react-google-maps/api";
import styles from "./Home.module.css";
import Header from "../../components/header/Header";
import Bottom from "../../components/bottom/Bottom";

import SearchInput from "../../components/searchInput/SearchInput";
import MapView from "../../components/mapView/MapView";
import AreaList from "../../components/areaList/AreaList";
import AreaModal from "../../components/areaModal/AreaModal";
import { useSearch } from "../../hooks/UseSearch";
import { addressSearch } from "../../hooks/AdressSearch";

function Home() {
  const position = [-26.790845466968143, -48.62679229044237];

  // Load Google Maps JS API (Places + Geocoder)
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
    libraries: ["places"],
  });

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

  const mapRef = useRef(null);

  // hook de busca (rua sem número)
  const { query, setQuery, results, loading: searchLoading } = useSearch(addressSearch);

  // controle do ponto selecionado e endereço detalhado
  const [selectedSearchPoint, setSelectedSearchPoint] = useState(null);
  const [selectedStreet, setSelectedStreet] = useState(null);
  const [addressNumber, setAddressNumber] = useState("");

  // buscar POIs (restaurantes, etc)
  async function fetchPOIs(lat, lon) {
    try {
      const targetUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=restaurant&limit=12&lat=${lat}&lon=${lon}`;
      const url = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
      const res = await fetch(url);
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

  if (loadError) return <div>Erro ao carregar Google Maps: {String(loadError)}</div>;
  if (!isLoaded) return <div>Carregando Google Maps...</div>;

  // handlers básicos de modal
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

  // seleção da rua (NÃO centraliza ainda)
  const handleSelectSearchResult = (item) => {
    setSelectedStreet(item);
    setAddressNumber("");
  };

  // confirmação rua + número -> busca precisa
  const handleConfirmAddress = async () => {
    if (!selectedStreet) return;

    const fullAddress =
      `${selectedStreet.rua || selectedStreet.name} ${addressNumber || ""}, ` +
      `${selectedStreet.cidade || "Penha"}, ${selectedStreet.estado || "SC"}, Brasil`;

    try {
      const preciseResults = await addressSearch(fullAddress);
      if (preciseResults.length > 0) {
        const best = preciseResults[0];
        setSelectedSearchPoint({
          lat: best.lat,
          lng: best.lng,
          name: best.name,
        });
      } else {
        alert("Não foi possível encontrar esse número.");
      }
    } catch (err) {
      console.error("Erro ao buscar endereço preciso:", err);
    }
  };

  // limpar rua selecionada
  const handleClearStreet = () => {
    setSelectedStreet(null);
    setAddressNumber("");
    setQuery("");
    setSelectedSearchPoint(null);
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
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            loading={searchLoading}
            suggestions={results}
            onSelect={handleSelectSearchResult}
            selectedStreet={selectedStreet}
            addressNumber={addressNumber}
            onNumberChange={setAddressNumber}
            onConfirmAddress={handleConfirmAddress}
            onClearStreet={handleClearStreet}
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
            selectedSearchPoint={selectedSearchPoint}
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
