"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import Button from "../Button/Button";
import Globe from "../Globe/Globe";
import Navlink from "../Navlink/Navlink";
import { gsap, interactionEase } from "../../../lib/animation";
import styles from "./navbar.module.css";

const navigation = [
  { label: "Index", href: "/" },
  { label: "About", href: "/about" },
  { label: "Works", href: "/works" },
  { label: "Archive", href: "/archive" },
];

export default function Navbar() {
  const navbarRef = useRef(null);

  useLayoutEffect(() => {
    const navbar = navbarRef.current;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const entranceContext = gsap.context(() => {
      if (reduceMotion) {
        gsap.set(navbar, { yPercent: 0, autoAlpha: 1 });
        return;
      }

      gsap.set(navbar, { yPercent: -110, autoAlpha: 0 });
      gsap.to(navbar, {
        yPercent: 0,
        autoAlpha: 1,
        duration: 0.9,
        delay: 0.15,
        ease: interactionEase,
      });
    }, navbar);

    return () => entranceContext.revert();
  }, []);

  return (
    <header
      ref={navbarRef}
      className={styles.navbar}
      style={{
        opacity: 0,
        visibility: "hidden",
      }}
    >
      <Link href="/" className={styles.logo} aria-label="Made by Sang home">
        <Globe />
      </Link>

      <nav className={styles.navigation} aria-label="Primary navigation">
        {navigation.map(({ label, href }) => (
          <Navlink href={href} key={href}>
            {label}
          </Navlink>
        ))}
      </nav>

      <div className={styles.action}>
        <Button href="/contact">Let&apos;s talk</Button>
      </div>
    </header>
  );
}
