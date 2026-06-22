import styles from "./status.module.css";

export default function Status({
  className = "",
  label = "STATUS",
  status = "OPEN TO WORKS",
}) {
  const classes = [styles.status, className].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      <span className={styles.label}>[{label}]</span>
      <div className={styles.container}>
        <span className={styles.indicator} aria-hidden="true" />
        <span className={styles.value}>{status}</span>
      </div>
    </div>
  );
}
