"use client";

import { RiArrowRightLine, RiArrowRightUpLine } from "@remixicon/react";
import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "../../../lib/animation";
import Button from "../../UI/Button/Button";
import Navlink from "../../UI/Navlink/Navlink";
import styles from "./footer.module.css";
import FooterShaders from "../../UI/FooterShader/FooterShaders";

const navigation = [
  { label: "Index", href: "/" },
  { label: "About", href: "/about" },
  { label: "Works", href: "/works" },
  { label: "Archive", href: "/archive" },
];

const socials = [
  { label: "Youtube", href: "https://youtube.com" },
  { label: "Linkedin", href: "https://linkedin.com" },
  { label: "Instagram", href: "https://instagram.com" },
];

const email = "trannhatsang2000@gmail.com";
const callRequestHref = `mailto:${email}?subject=Call%20request`;
const compactMediaQuery = "(max-width: 63.9375rem)";
const mobileMediaQuery = "(max-width: 47.9375rem)";

function getRevealDistance() {
  if (window.matchMedia(mobileMediaQuery).matches) {
    return window.innerHeight * 0.26;
  }

  if (window.matchMedia(compactMediaQuery).matches) {
    return window.innerHeight * 0.32;
  }

  return window.innerHeight * 0.6;
}

function formatFooterDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return `${values.weekday}, ${values.month} ${values.day}, ${values.year} (GMT +7)`;
}

export default function Footer() {
  const sectionRef = useRef(null);
  const footerRef = useRef(null);
  const footerDate = formatFooterDate();

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const footer = footerRef.current;
    if (!section || !footer) return;

    const context = gsap.context(() => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      gsap.set(footer, {
        yPercent: 0,
        force3D: true,
      });

      if (reduceMotion) return;

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        invalidateOnRefresh: true,
        animation: gsap.to(footer, {
          y: () => -getRevealDistance(),
          ease: "none",
        }),
      });
    }, section);

    return () => {
      context.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.footerSection}
      data-navbar-theme="inverse"
      aria-label="Footer"
    >
      <FooterShaders
        decorative={false}
        className={styles.signalLayer}
        navbarTheme="inverse"
      />

      <footer ref={footerRef} className={styles.footer}>
        <div className={styles.content}>
          <div className={styles.ctaColumn}>
            <h2 className={styles.heading}>
              Let&apos;s make something
              <br />
              worth showing off
            </h2>

            <Button href={`mailto:${email}`} className={styles.ctaButton}>
              Drop a message
            </Button>
          </div>

          <nav className={styles.navigation} aria-label="Footer navigation">
            <p className={styles.eyebrow}>Navigation</p>
            <ul className={styles.navList}>
              {navigation.map((item) => (
                <li key={item.href}>
                  <Navlink href={item.href} className={styles.navLink}>
                    {item.label}
                  </Navlink>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.socialColumn}>
            <p className={styles.eyebrow}>Follow me on</p>
            <ul className={styles.socialList}>
              {socials.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className={styles.socialLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>{item.label}</span>
                    <RiArrowRightUpLine size={32} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.contactActions}>
            <a href={`mailto:${email}`} className={styles.contactButton}>
              <span className={styles.corner} aria-hidden="true" />
              <span className={styles.corner} aria-hidden="true" />
              <span className={styles.corner} aria-hidden="true" />
              <span className={styles.corner} aria-hidden="true" />
              <span className={styles.contactLabel}>Send Email</span>
              <RiArrowRightLine size={32} aria-hidden="true" />
            </a>

            <a href={callRequestHref} className={styles.contactButton}>
              <span className={styles.corner} aria-hidden="true" />
              <span className={styles.corner} aria-hidden="true" />
              <span className={styles.corner} aria-hidden="true" />
              <span className={styles.corner} aria-hidden="true" />
              <span className={styles.contactLabel}>Call me</span>
              <RiArrowRightLine size={32} aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <p>{footerDate}</p>
          <p>©2026 MADEBYSANG</p>
        </div>
      </footer>
    </section>
  );
}
