import styles from "./SearchInput.module.css";

function SearchInput({ value, onChange }) {
  return (
    <div className={styles.searchWrapper}>
      <input
        type="text"
        placeholder="Buscar endereço..."
        value={value}
        onChange={onChange}
        className={styles.searchInput}
      />
    </div>
  );
}

export default SearchInput;