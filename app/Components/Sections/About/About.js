import ScrollText from "../../UI/ScrollText/ScrollText";
import styles from "./about.module.css";

const paragraphs = [
  "Most businesses grow faster than their website does. The brand evolves, the offer sharpens, the work gets better but the site stays frozen, still telling the old story.",
  "And the longer it stays that way, the more it costs. People form opinions before you ever speak to them, and a weak site loses the room before you walk in.",
];

export default function About() {
  return (
    <section className={styles.about} data-navbar-theme="inverse">
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
