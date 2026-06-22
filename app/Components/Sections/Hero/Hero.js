import Heading from "../Heading/Heading";
import Meta from "../../UI/Meta/Meta";
import styles from "./hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <Heading />
      <Meta />
    </section>
  );
}
