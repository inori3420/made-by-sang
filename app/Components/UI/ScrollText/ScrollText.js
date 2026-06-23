"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "../../../lib/animation";
import styles from "./scrollText.module.css";

function CharacterWords({ children }) {
  const words = children.split(" ");

  return words.map((word, wordIndex) => (
    <span className={styles.word} key={`${word}-${wordIndex}`}>
      {Array.from(word).map((character, characterIndex) => (
        <span
          className={styles.character}
          key={`${character}-${characterIndex}`}
        >
          <span className={styles.characterBase}>{character}</span>
          <span
            className={styles.characterFill}
            data-scroll-text-fill
            aria-hidden="true"
          >
            {character}
          </span>
        </span>
      ))}
      {wordIndex < words.length - 1 && " "}
    </span>
  ));
}

export default function ScrollText({
  className = "",
  paragraphs,
  start = "top 80%",
  end = "bottom 45%",
}) {
  const headingRef = useRef(null);
  const classes = [styles.heading, className].filter(Boolean).join(" ");
  const copy = paragraphs.join(" ");

  useLayoutEffect(() => {
    const heading = headingRef.current;
    const fills = heading.querySelectorAll("[data-scroll-text-fill]");

    const context = gsap.context(() => {
      gsap.fromTo(
        fills,
        {
          clipPath: "inset(0 100% 0 0)",
        },
        {
          clipPath: "inset(0 0% 0 0)",
          duration: 0.08,
          ease: "none",
          stagger: 0.025,
          scrollTrigger: {
            trigger: heading,
            start,
            end,
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );

      ScrollTrigger.refresh();
    }, heading);

    return () => context.revert();
  }, [end, start]);

  return (
    <h2 ref={headingRef} className={classes}>
      <span className={styles.screenReaderText}>{copy}</span>
      <span aria-hidden="true">
        {paragraphs.map((paragraph, index) => (
          <span className={styles.paragraph} key={paragraph}>
            <CharacterWords>{paragraph}</CharacterWords>
            {index < paragraphs.length - 1 && " "}
          </span>
        ))}
      </span>
    </h2>
  );
}
