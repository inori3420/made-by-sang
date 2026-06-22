"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RiArrowRightUpLine } from "@remixicon/react";
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
  const pathname = usePathname();
  const navbarRef = useRef(null);
  const menuRef = useRef(null);
  const overlayRef = useRef(null);
  const darkRef = useRef(null);
  const toggleRef = useRef(null);
  const timelineRef = useRef(null);
  const isOpenRef = useRef(false);
  const [isOpen, setIsOpen] = useState(false);

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
        clearProps: "transform",
      });
    }, navbar);

    return () => entranceContext.revert();
  }, []);

  useLayoutEffect(() => {
    const navbar = navbarRef.current;
    const menu = menuRef.current;
    const overlay = overlayRef.current;
    const dark = darkRef.current;
    const toggle = toggleRef.current;
    const main = document.querySelector("[data-main]");

    if (!menu || !overlay || !dark || !toggle || !main) return;

    const labels = toggle.querySelectorAll("[data-menu-label]");
    const bars = toggle.querySelectorAll("[data-menu-bar]");
    const menuItems = menu.querySelectorAll("[data-menu-item]");
    const media = gsap.matchMedia();

    media.add(
      {
        isMobile: "(max-width: 767px)",
        reduceMotion: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        const { isMobile, reduceMotion } = context.conditions;
        if (!isMobile) return;

        const duration = reduceMotion ? 0 : 0.65;
        const menuOffset = () => -menu.offsetWidth;

        gsap.set(overlay, {
          visibility: "hidden",
          pointerEvents: "none",
        });
        gsap.set(menu, {
          visibility: "hidden",
          x: 0,
          xPercent: 100,
        });
        gsap.set(dark, { autoAlpha: 0 });
        gsap.set(main, { x: 0 });
        gsap.set(labels, { yPercent: 0 });
        gsap.set(bars, { y: 0, rotation: 0 });
        gsap.set(menuItems, {
          clearProps: "opacity,visibility,transform",
        });

        const timeline = gsap.timeline({
          paused: true,
          defaults: {
            ease: interactionEase,
          },
          onReverseComplete: () => {
            gsap.set(overlay, {
              visibility: "hidden",
              pointerEvents: "none",
            });
            gsap.set(menu, { visibility: "hidden" });
            document.body.style.overflow = "";
          },
        });

        timeline
          .set([menu, overlay], { visibility: "visible" }, 0)
          .set(overlay, { pointerEvents: "auto" }, 0)
          .to(
            menu,
            {
              xPercent: 0,
              duration,
            },
            0,
          )
          .to(
            [main, overlay],
            {
              x: menuOffset,
              duration,
            },
            0,
          )
          .to(
            dark,
            {
              autoAlpha: 1,
              duration: reduceMotion ? 0 : 0.45,
            },
            0,
          )
          .to(
            labels,
            {
              yPercent: -100,
              duration: reduceMotion ? 0 : 0.38,
            },
            0,
          )
          .to(
            bars[0],
            {
              y: "0.22rem",
              rotation: 45,
              duration: reduceMotion ? 0 : 0.35,
            },
            0.04,
          )
          .to(
            bars[1],
            {
              y: "-0.22rem",
              rotation: -45,
              duration: reduceMotion ? 0 : 0.35,
            },
            0.04,
          )
          .fromTo(
            menuItems,
            {
              x: reduceMotion ? 0 : "1.5rem",
              autoAlpha: 1,
            },
            {
              x: 0,
              autoAlpha: 1,
              duration: reduceMotion ? 0 : 0.58,
              stagger: reduceMotion ? 0 : 0.05,
            },
            0.08,
          );

        timelineRef.current = timeline;

        function onResize() {
          if (isOpenRef.current) {
            gsap.set(menu, { xPercent: 0 });
            gsap.set([main, overlay], { x: menuOffset });
          } else {
            timeline.invalidate();
          }
        }

        window.addEventListener("resize", onResize);

        return () => {
          window.removeEventListener("resize", onResize);
          timeline.kill();
          timelineRef.current = null;
          isOpenRef.current = false;
          document.body.style.overflow = "";
          gsap.set([main, overlay], { clearProps: "transform" });
          gsap.set(menu, {
            visibility: "hidden",
            clearProps: "transform",
          });
        };
      },
    );

    return () => media.revert();
  }, []);

  useEffect(() => {
    if (!isOpenRef.current) return;

    isOpenRef.current = false;
    setIsOpen(false);
    timelineRef.current?.reverse();
  }, [pathname]);

  function toggleMenu() {
    const timeline = timelineRef.current;
    if (!timeline) return;

    const nextIsOpen = !isOpenRef.current;
    isOpenRef.current = nextIsOpen;
    setIsOpen(nextIsOpen);

    if (nextIsOpen) {
      const menuItems =
        menuRef.current?.querySelectorAll("[data-menu-item]") ?? [];

      gsap.set(menuItems, {
        opacity: 1,
        visibility: "visible",
      });
      document.body.style.overflow = "hidden";
      timeline.invalidate().play();
    } else {
      timeline.reverse();
    }
  }

  function closeMenu() {
    if (!isOpenRef.current) return;

    isOpenRef.current = false;
    setIsOpen(false);
    timelineRef.current?.reverse();
  }

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key !== "Escape" || !isOpenRef.current) return;

      closeMenu();
      toggleRef.current?.focus();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <header
        ref={navbarRef}
        className={`${styles.navbar} ${isOpen ? styles.menuOpen : ""}`}
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

        <div className={styles.desktopAction}>
          <Button href="/contact">Let&apos;s talk</Button>
        </div>

        <div ref={toggleRef} className={styles.mobileAction}>
          <Button
            type="button"
            className={styles.menuToggle}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            onClick={toggleMenu}
          >
            <span className={styles.toggleText}>
              <span data-menu-label>Menu</span>
              <span data-menu-label>Close</span>
            </span>
            <span className={styles.toggleIcon} aria-hidden="true">
              <span data-menu-bar />
              <span data-menu-bar />
            </span>
          </Button>
        </div>
      </header>

      <aside
        ref={menuRef}
        id="mobile-navigation"
        className={styles.mobileMenu}
        aria-hidden={!isOpen}
      >
        <nav className={styles.mobileMenuInner} aria-label="Mobile navigation">
          <ul className={styles.mobileMenuList}>
            {navigation.map(({ label, href }) => (
              <li data-menu-item key={href}>
                <Link
                  href={href}
                  className={`${styles.mobileMenuLink} ${
                    pathname === href ? styles.mobileMenuLinkActive : ""
                  }`}
                  aria-current={pathname === href ? "page" : undefined}
                  onClick={closeMenu}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className={styles.mobileMenuDetails}>
            <div data-menu-item className={styles.mobileMenuDetailGroup}>
              <p className={styles.mobileMenuDetailLabel}>Socials</p>
              <div className={styles.mobileMenuDetailLinks}>
                <a
                  href="https://www.instagram.com/sun_tnhut"
                  target="_blank"
                  rel="noreferrer"
                  className={styles.mobileMenuDetailLink}
                >
                  <span>Instagram</span>
                  <RiArrowRightUpLine aria-hidden="true" size={16} />
                </a>
                <a
                  href="https://www.linkedin.com/in/suntnhut/"
                  target="_blank"
                  rel="noreferrer"
                  className={styles.mobileMenuDetailLink}
                >
                  <span>Linkedin</span>
                  <RiArrowRightUpLine aria-hidden="true" size={16} />
                </a>
              </div>
            </div>

            <div data-menu-item className={styles.mobileMenuDetailGroup}>
              <p className={styles.mobileMenuDetailLabel}>Contact</p>
              <a
                href="mailto:trannhatsang2000@gmail.com"
                className={styles.mobileMenuDetailLink}
              >
                trannhatsang2000@gmail.com
              </a>
            </div>
          </div>
        </nav>
      </aside>

      <div
        ref={overlayRef}
        className={styles.mobileOverlay}
        aria-hidden="true"
        onClick={closeMenu}
      >
        <div ref={darkRef} className={styles.mobileOverlayDark} />
      </div>
    </>
  );
}
