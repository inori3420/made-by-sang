import Link from "next/link";
import Button from "../Button/Button";
import Navlink from "../Navlink/Navlink";
import styles from "./navbar.module.css";

const navigation = [
  { label: "Index", href: "/" },
  { label: "About", href: "/about" },
  { label: "Works", href: "/works" },
  { label: "Archive", href: "/archive" },
];

export default function Navbar() {
  return (
    <header className={styles.navbar}>
      <Link href="/" className={styles.logo} aria-label="Made by Sang home">
        Made by Sang
      </Link>

      <nav className={styles.navigation} aria-label="Primary navigation">
        {navigation.map(({ label, href }) => (
          <Navlink href={href} key={href}>
            {label}
          </Navlink>
        ))}
      </nav>

      <div className={styles.action}>
        <Button href="/contact">Contact</Button>
      </div>
    </header>
  );
}
