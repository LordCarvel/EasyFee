// src/components/AreaList/AreaList.jsx
import React from "react";
import styles from "./AreaList.module.css";
import editIcon from "../../../public/Edit.png"; // ajuste o caminho conforme sua estrutura

function AreaList({ areas, onCreate, onEdit }) {
  return (
    <div className={styles.areasContainer}>
      <h1 className={styles.title}>Áreas de entrega</h1>

      <div className={styles.savedAreasContainer}>
        <button onClick={onCreate}>Criar nova área</button>

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
                {area.titulo}
                <span>R$ {parseFloat(area.preco).toFixed(2)}</span>
              </p>
              <img
                src={editIcon}
                alt="Editar"
                onClick={() => onEdit(index)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AreaList; 