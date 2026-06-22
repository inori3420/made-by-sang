"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Button from "../Button/Button";
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
  const globeRef = useRef(null);

  useEffect(() => {
    const globe = globeRef.current;
    const circles = globe.querySelectorAll("[data-globe-circle]");
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (circles.length < 6 || reduceMotion) return;

    let cleanupScroll = () => {};

    const context = gsap.context(() => {
      const widths = [
        ["50%", "33.333%"],
        ["33.333%", "16.667%"],
        ["calc(16.667% + 1px)", "calc(0% + 1px)"],
        ["calc(0% + 1px)", "calc(16.667% + 1px)"],
        ["16.667%", "33.333%"],
        ["33.333%", "50%"],
      ];

      const timeline = gsap.timeline({
        repeat: -1,
        defaults: { duration: 1, ease: "none" },
      });

      circles.forEach((circle, index) => {
        const [fromWidth, toWidth] = widths[index];
        timeline.fromTo(
          circle,
          { width: fromWidth },
          { width: toWidth },
          index === 0 ? 0 : "<",
        );
      });

      let resetTimer;
      let resetTween;
      let previousScrollY = window.scrollY;
      let previousTime = performance.now();

      function accelerateGlobe() {
        const now = performance.now();
        const elapsed = now - previousTime;
        const distance = window.scrollY - previousScrollY;
        const velocity = elapsed > 0 ? (distance / elapsed) * 1000 : 0;

        previousScrollY = window.scrollY;
        previousTime = now;
        timeline.timeScale(Math.abs(0.005 * velocity) + 1);

        window.clearTimeout(resetTimer);
        resetTimer = window.setTimeout(() => {
          resetTween = gsap.to(timeline, {
            timeScale: 1,
            duration: 0.6,
            ease: interactionEase,
            overwrite: true,
          });
        }, 100);
      }

      window.addEventListener("scroll", accelerateGlobe, { passive: true });

      cleanupScroll = () => {
        window.clearTimeout(resetTimer);
        window.removeEventListener("scroll", accelerateGlobe);
        resetTween?.kill();
      };
    }, globe);

    return () => {
      cleanupScroll();
      context.revert();
    };
  }, []);

  const globeCircles = Array.from({ length: 3 });

  return (
    <header className={styles.navbar}>
      <Link href="/" className={styles.logo} aria-label="Made by Sang home">
        <div ref={globeRef} className={styles.globe} aria-hidden="true">
          <div className={styles.globeBack}>
            <div className={styles.globeOutline} />
            <div className={`${styles.globeLatitude} ${styles.latitude1}`} />
            <div className={`${styles.globeLatitude} ${styles.latitude2}`} />
            <div className={`${styles.globeLatitude} ${styles.latitude3}`} />
            <div className={`${styles.globeLatitude} ${styles.latitude4}`} />
            <div className={`${styles.globeLatitude} ${styles.latitude5}`} />
          </div>

          <div className={styles.globeFront}>
            <div className={styles.globeMirror}>
              {globeCircles.map((_, index) => (
                <div
                  className={styles.globeCircle}
                  data-globe-circle
                  key={index}
                >
                  <div className={styles.globeCircleInner} />
                </div>
              ))}
            </div>

            <div className={`${styles.globeMirror} ${styles.duplicate}`}>
              {globeCircles.map((_, index) => (
                <div
                  className={styles.globeCircle}
                  data-globe-circle
                  key={index}
                >
                  <div className={styles.globeCircleInner} />
                </div>
              ))}
            </div>
          </div>
        </div>
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
