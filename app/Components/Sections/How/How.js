"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import {
  gsap,
  interactionEase,
  ScrollTrigger,
  SplitText,
} from "../../../lib/animation";
import styles from "./how.module.css";

const imageClipClosed = "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)";
const imageClipOpen = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
const placeholderImages = [
  "/images/how/placeholder-1.png",
  "/images/how/placeholder-2.png",
  "/images/how/placeholder-3.png",
  "/images/how/placeholder-4.png",
  "/images/how/placeholder-5.png",
];

export default function How() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const contentRef = useRef(null);
  const imgGroupRef = useRef(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const content = contentRef.current;
    const imgGroup = imgGroupRef.current;
    let cancelled = false;
    let contentSplit;
    let headingSplits = [];
    let headingTrigger;

    const context = gsap.context(() => {
      gsap.set([heading, content, imgGroup], { visibility: "hidden" });
      gsap.set(imgGroup, {
        autoAlpha: 1,
        clipPath: imageClipClosed,
        rotation: -45,
        transformOrigin: "50% 50%",
      });
    }, section);

    async function setupAnimation() {
      await document.fonts.ready;
      if (cancelled) return;

      context.add(() => {
        const reduceMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        const headingPhrases = gsap.utils.toArray(
          "[data-how-heading-phrase]",
          heading,
        );

        headingSplits = headingPhrases.map((phrase) => {
          const phraseSplit = SplitText.create(phrase, {
            type: "chars",
            charsClass: styles.char,
            mask: "chars",
            tag: "span",
          });

          return phraseSplit;
        });
        const headingChars = headingSplits.map((split) => split.chars);
        const firstHeadingChars = headingChars[0] ?? [];
        const hiddenHeadingChars = headingChars.slice(1).flat();
        const headingStagger = {
          each: 0.05,
          from: "start",
        };

        gsap.set(headingPhrases, {
          opacity: 1,
          visibility: "visible",
          xPercent: -50,
          yPercent: -50,
        });
        gsap.set(firstHeadingChars, {
          autoAlpha: reduceMotion ? 1 : 0,
          xPercent: reduceMotion ? 0 : 100,
        });
        gsap.set(hiddenHeadingChars, {
          autoAlpha: 0,
          xPercent: 100,
        });
        gsap.set(heading, { visibility: "visible" });

        contentSplit = SplitText.create(content, {
          type: "lines",
          mask: "lines",
          linesClass: styles.line,
          autoSplit: true,
          onSplit(self) {
            headingTrigger?.kill();
            gsap.set(self.masks, { overflow: "clip" });
            gsap.set(firstHeadingChars, {
              autoAlpha: reduceMotion ? 1 : 0,
              xPercent: reduceMotion ? 0 : 100,
            });
            gsap.set(hiddenHeadingChars, {
              autoAlpha: 0,
              xPercent: 100,
            });
            gsap.set(self.lines, {
              yPercent: reduceMotion ? 0 : 110,
            });
            gsap.set(imgGroup, {
              autoAlpha: 1,
              clipPath: reduceMotion ? imageClipOpen : imageClipClosed,
              rotation: reduceMotion ? 0 : -45,
              visibility: "visible",
            });
            gsap.set(content, { visibility: "visible" });

            const scrollAnimation = gsap.timeline({
              paused: true,
              defaults: {
                duration: reduceMotion ? 0 : 0.8,
                ease: interactionEase,
              },
            });

            const enterPhrase = (chars) => {
              scrollAnimation.to(chars, {
                xPercent: 0,
                autoAlpha: 1,
                duration: reduceMotion ? 0 : 0.4,
                stagger: reduceMotion ? 0 : headingStagger,
              });
            };

            const exitPhrase = (chars) => {
              scrollAnimation.to(chars, {
                xPercent: -100,
                autoAlpha: 0,
                duration: reduceMotion ? 0 : 0.4,
                stagger: reduceMotion ? 0 : headingStagger,
              });
            };

            enterPhrase(firstHeadingChars);

            scrollAnimation.to(imgGroup, {
              clipPath: imageClipOpen,
              rotation: 0,
              duration: reduceMotion ? 0 : 0.6,
            });

            headingChars.slice(0, -1).forEach((currentChars, index) => {
              const nextChars = headingChars[index + 1] ?? [];

              exitPhrase(currentChars);
              enterPhrase(nextChars);
            });

            scrollAnimation.to(self.lines, {
              yPercent: 0,
              duration: reduceMotion ? 0 : 0.8,
              stagger: reduceMotion ? 0 : 0.05,
            });

            headingTrigger = ScrollTrigger.create({
              trigger: section,
              start: "top -3%",
              end: "bottom bottom",
              scrub: reduceMotion ? false : true,
              animation: scrollAnimation,
            });

            return scrollAnimation;
          },
        });
      });
    }

    setupAnimation();

    return () => {
      cancelled = true;
      headingTrigger?.kill();
      headingSplits.forEach((split) => split.revert());
      contentSplit?.revert();
      context.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.how}
      data-navbar-theme="inverse"
    >
      <div className={styles.stage}>
        <div ref={imgGroupRef} className={styles.imgGroup} aria-hidden="true">
          {placeholderImages.map((src) => (
            <div key={src} className={styles.imgBox}>
              <Image
                src={src}
                alt=""
                fill
                sizes="(max-width: 47.9375rem) 40vw, 24vw"
                className={styles.img}
                loading="eager"
              />
            </div>
          ))}
        </div>

        <div
          ref={headingRef}
          className={styles.heading}
          role="heading"
          aria-level="2"
          aria-label="This is where I come in"
        >
          <span data-how-heading-phrase aria-hidden="true">
            This
          </span>
          <span data-how-heading-phrase aria-hidden="true">
            is where
          </span>
          <span data-how-heading-phrase aria-hidden="true">
            I come in
          </span>
        </div>

        <div className={styles.content}>
          <p ref={contentRef}>
            Some clients come with nothing and need to build from scratch.
            Others have a brand but a website that doesn&apos;t do it justice.
            Either way, I handle both sides the strategy and identity that
            define how you show up, and the design and development that make it
            real.
          </p>
        </div>
      </div>
    </section>
  );
}
