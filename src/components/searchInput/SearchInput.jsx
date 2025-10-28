import React, { useEffect, useRef, useState } from "react";
import styles from "./SearchInput.module.css";

function SearchInput({ value, onChange, suggestions = [], onSelect, loading }) {
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef(null);

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

  return (
    <div className={styles.searchWrapper}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Buscar endereço..."
        value={value}
        onChange={onChange}
        className={styles.searchInput}
      />

      {/* Animação de 3 pontos no canto direito */}
      {loading && (
        <div className={styles.dotsLoader}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      )}

      {/* Dropdown fixo de sugestões */}
      {suggestions.length > 0 && (
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
              onClick={() => onSelect && onSelect(item)}
            >
              {item.name}
            </div>
          ))}
        </div>
      )}

      {/* Caso não tenha resultados */}
      {!loading && value && suggestions.length === 0 && (
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
    </div>
  );
}

export default SearchInput;
