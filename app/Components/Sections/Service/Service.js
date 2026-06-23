import styles from "./service.module.css";

export default function Service() {
  return (
    <section className={styles.services} data-navbar-theme="inverse">
      <div>
        <span>My</span>
        <div></div>
        <span>Services</span>
      </div>
    </section>
  );
}
