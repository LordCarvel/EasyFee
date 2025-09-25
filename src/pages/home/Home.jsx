import styles from "./Home.module.css";
import Bottom from "../../components/bottom/Bottom";
import Header from "../../components/header/Header";
import edit from "../../../public/Edit.png"

function Home() {

  return (
    <div className={styles.container}>
      <Header />
      <main>
        <div className={styles.areasContainer}>
          <h1 className={styles.title}>Áreas de entrega</h1>

          <div className={styles.savedAreasContainer}>
            <button>Criar nova área</button>

            <div className={styles.areaCardContainer}>
              <div className={styles.card}><p><span className={styles.color}></span>Penha 2 <span>8.00R$</span></p> <img src={edit} alt="" /></div>
              <div className={styles.card}><p><span className={styles.color}></span>Penha 2 <span>8.00R$</span></p> <img src={edit} alt="" /></div>
            </div>
          </div>
        </div>
        <div className={styles.mapContainer}>
          <input type="text" />
        </div>
      </main>
      <Bottom />
    </div>
  );
}

export default Home;