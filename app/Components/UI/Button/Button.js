import Link from "next/link";
import styles from "./button.module.css";

export default function Button({
  children,
  className = "",
  href,
  type = "button",
  ...props
}) {
  const classes = [styles.button, className].filter(Boolean).join(" ");
  const content = (
    <>
      <span className={styles.label}>{children}</span>
      <span className={styles.arrow} aria-hidden="true">
        ↗
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {content}
    </button>
  );
}
