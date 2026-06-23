import ScrollText from "../../UI/ScrollText/ScrollText";
import styles from "./about.module.css";

const paragraphs = [
  "Somewhere between the sketch and the ship date is where I do my best work. Three years in, I've learned that engaging design isn't about decoration — it's about clarity.",
  "I take complex ideas and translate them into clean, intuitive interfaces, balancing what looks right with what actually works. My favorite outcome? Users who never have to wonder where to click next.",
];

export default function About() {
  return (
    <section className={styles.about}>
      <div className={styles.content}>
        <ScrollText paragraphs={paragraphs} />
      </div>
      <div className={styles.infor}>
        <div>
          <span className={styles.name}>Sang Tran</span>
          <span className={styles.role}>Visual Designer</span>
        </div>
      </div>
    </section>
  );
}
