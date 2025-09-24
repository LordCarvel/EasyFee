import styles from "./Home.module.css";
import Bottom from "../../components/bottom/Bottom";
import Header from "../../components/header/Header";

function Home () {

 return (
  <div className={styles.container}>
    <Header />
    <main>
      <p>sla</p>
    </main>
    <Bottom />
  </div>
 );
}

export default Home;