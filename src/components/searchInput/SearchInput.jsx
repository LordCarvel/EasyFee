import React, { useEffect, useRef, useState } from "react";
import styles from "./SearchInput.module.css";

/**
 * Props:
 *  value: string (texto da rua/avenida digitado)
 *  onChange: (e) => void
 *  suggestions: array (resultados da busca de rua)
 *  onSelect: (item) => void   // chamado ao escolher uma rua
 *  loading: boolean
 *  selectedStreet: objeto rua selecionada (ou null)
 *  onNumberChange: (value) => void
 *  addressNumber: string
 *  onConfirmAddress: () => void  // confirmar rua + número (Enter / botão)
 *  onClearStreet?: () => void    // opcional: limpar rua selecionada
 */
function SearchInput({
  value,
  onChange,
  suggestions = [],
  onSelect,
  loading,
  selectedStreet,
  onNumberChange,
  addressNumber,
  onConfirmAddress,
  onClearStreet,
}) {
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);
  const numberInputRef = useRef(null);

  // Posiciona dropdown fixo
  useEffect(() => {
    const updatePosition = () => {
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        setDropdownPos({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    };
    updatePosition();
    window.addEventListener("scroll", updatePosition);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, []);

  // Fecha ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Confirmar com Enter (desktop e celular)
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && onConfirmAddress) {
      e.preventDefault();
      onConfirmAddress();
    }
  };

  return (
    <div ref={wrapperRef} className={styles.searchWrapper}>
      {/* Campo principal (rua/avenida). Quando há rua selecionada, deixo readOnly
          pra evitar que o hook continue buscando enquanto o usuário só quer digitar o número */}
      <input
        ref={inputRef}
        type="text"
        placeholder="Buscar rua/avenida..."
        value={
          selectedStreet
            ? `${selectedStreet.rua || selectedStreet.name}${
                selectedStreet.bairro ? `, ${selectedStreet.bairro}` : ""
              }${selectedStreet.cidade ? `, ${selectedStreet.cidade}` : ""}${
                selectedStreet.estado ? ` - ${selectedStreet.estado}` : ""
              }`
            : value
        }
        onChange={(e) => {
          if (selectedStreet) return; // travado após seleção; use o botão limpar
          onChange(e);
          setOpen(true);
        }}
        className={styles.searchInput}
        readOnly={!!selectedStreet}
      />

      {/* Botão LIMPAR quando há rua selecionada */}
      {selectedStreet && (
        <button
          type="button"
          className={styles.clearStreetBtn}
          onClick={() => {
            onClearStreet?.();
            setOpen(false);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          title="Limpar rua selecionada"
          aria-label="Limpar rua selecionada"
        >
          ✕
        </button>
      )}

      {/* Loader de 3 pontos */}
      {loading && !selectedStreet && (
        <div className={styles.dotsLoader}>
          <span></span><span></span><span></span>
        </div>
      )}

      {/* Dropdown de sugestões (apenas quando NÃO há rua selecionada) */}
      {open && !selectedStreet && suggestions.length > 0 && (
        <div
          className={styles.suggestionsDropdown}
          style={{
            top: `${dropdownPos.top}px`,
            left: `${dropdownPos.left}px`,
            width: `${dropdownPos.width}px`,
          }}
        >
          {suggestions.slice(0, 5).map((item, index) => (
            <div
              key={item.id || index}
              className={styles.suggestionItem}
              onClick={() => {
                onSelect?.(item);
                setOpen(false);
                setTimeout(() => numberInputRef.current?.focus(), 100);
              }}
            >
              <b>{item.rua || item.name}</b>
              <br />
              <span style={{ fontSize: "0.8em", color: "#777" }}>
                {item.bairro ? `${item.bairro}, ` : ""}
                {item.cidade} - {item.estado}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Nenhum resultado */}
      {open && !selectedStreet && !loading && value && suggestions.length === 0 && (
        <div
          className={styles.suggestionsDropdown}
          style={{
            top: `${dropdownPos.top}px`,
            left: `${dropdownPos.left}px`,
            width: `${dropdownPos.width}px`,
          }}
        >
          <div className={styles.noResults}>Nenhum resultado encontrado</div>
        </div>
      )}

      {/* Campo de número (aparece só após escolher a rua) */}
      {selectedStreet && (
        <div className={styles.numberField}>
          <input
            ref={numberInputRef}
            type="number"
            inputMode="numeric"
            placeholder="Número..."
            value={addressNumber || ""}
            onChange={(e) => onNumberChange?.(e.target.value)}
            onKeyDown={handleKeyPress}
            className={styles.numberInput}
          />
          <button
            type="button"
            onClick={onConfirmAddress}
            className={styles.confirmButton}
            aria-label="Confirmar endereço"
          >
            🔍
          </button>
        </div>
      )}
    </div>
  );
}

export default SearchInput;
