"use client";

import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import Button from "../../UI/Button/Button";
import DissolveImageStack from "../../UI/DissolveImageStack/DissolveImageStack";
import {
  gsap,
  interactionEase,
  ScrollTrigger,
  SplitText,
} from "../../../lib/animation";
import styles from "./works.module.css";

const projects = [
  {
    title: "Saigonpai",
    description:
      "Website redesign for an Thailand & Vietnamese Cuisine restaurant locate in Canada.",
    metric: "$40k - $60k",
    metricCaption: "Monthly revenue with the new site flow",
    image: "/images/how/placeholder-4.png",
    href: "/works/saigonpai",
  },
  {
    title: "Studio Archive",
    description:
      "Identity system and editorial web experience for an independent creative archive.",
    metric: "2.4x",
    metricCaption: "Increase in qualified project inquiries",
    image: "/images/how/placeholder-1.png",
    href: "/works/studio-archive",
  },
  {
    title: "Northline",
    description:
      "A sharper digital storefront for a product studio scaling its premium offer.",
    metric: "38%",
    metricCaption: "Lift in conversion from service pages",
    image: "/images/how/placeholder-2.png",
    href: "/works/northline",
  },
  {
    title: "Paper Signal",
    description:
      "A tactile portfolio and launch system for a print-led design practice.",
    metric: "5 weeks",
    metricCaption: "From strategy sprint to shipped site",
    image: "/images/how/placeholder-3.png",
    href: "/works/paper-signal",
  },
  {
    title: "SAF School",
    description:
      "A modular campaign site built around lessons, drops, and visual storytelling.",
    metric: "01 → 05",
    metricCaption: "Reusable templates for future releases",
    image: "/images/how/placeholder-5.png",
    href: "/works/saf-school",
  },
];
const projectTransitionHoldRatio = 0.7;
const dissolveSpreadAbove = 0.25;
const dissolveSpreadBelow = 0.25;
const dissolveTravelRange = 1 + dissolveSpreadAbove + dissolveSpreadBelow;
const projectVisualCompleteRatio =
  projectTransitionHoldRatio +
  (1 - projectTransitionHoldRatio) *
    ((1 + dissolveSpreadAbove) / dissolveTravelRange);

export default function Works() {
  const sectionRef = useRef(null);
  const numberStackRef = useRef(null);
  const numberIndexRef = useRef(0);
  const contentIndexRef = useRef(0);
  const showcaseIndexRef = useRef(0);
  const canShowcaseRef = useRef(true);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const numberStack = numberStackRef.current;
    let cancelled = false;
    let contentSplits = [];
    let cleanupShowcase = () => {};
    let shaderResetCall;

    if (!section || !numberStack) return undefined;

    const context = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const numberStep = 100 / projects.length;
      const contentItems = gsap.utils.toArray("[data-works-project]", section);
      const projectLinks = gsap.utils.toArray(
        "[data-works-project-link]",
        section,
      );
      const media = section.querySelector("[data-works-media]");
      const mediaOverlay = section.querySelector("[data-works-media-overlay]");
      const showcase = section.querySelector("[data-works-showcase]");
      const showcaseItems = gsap.utils.toArray(
        "[data-works-showcase-panel]",
        showcase,
      );
      const isTouchLayout = window.matchMedia(
        "(hover: none), (pointer: coarse)",
      ).matches;
      let showShowcase = () => {};
      let hideShowcase = () => {};

      gsap.set(numberStack, { yPercent: 0 });
      gsap.set(contentItems, { autoAlpha: 0, pointerEvents: "none" });
      gsap.set(contentItems[0], { autoAlpha: 1, pointerEvents: "auto" });
      gsap.set(projectLinks, { pointerEvents: "none" });
      gsap.set(projectLinks[0], { pointerEvents: "auto" });
      gsap.set(showcase, {
        xPercent: -50,
        yPercent: 110,
        rotateX: 60,
        autoAlpha: 0,
        transformOrigin: "50% 100%",
      });
      gsap.set(mediaOverlay, { autoAlpha: 0 });
      gsap.set(showcaseItems, { autoAlpha: 0 });
      gsap.set(showcaseItems[0], { autoAlpha: 1 });
      numberIndexRef.current = 0;
      contentIndexRef.current = 0;
      showcaseIndexRef.current = 0;
      canShowcaseRef.current = true;

      contentItems.forEach((item, index) => {
        item.setAttribute("aria-hidden", index === 0 ? "false" : "true");
      });
      projectLinks.forEach((link, index) => {
        link.setAttribute("aria-hidden", index === 0 ? "false" : "true");
        link.setAttribute("tabindex", index === 0 ? "0" : "-1");
      });
      showcaseItems.forEach((item, index) => {
        item.setAttribute("aria-hidden", index === 0 ? "false" : "true");
      });

      if (media) {
        const setShaderStrength = gsap.quickTo(
          media,
          "--works-shader-strength",
          {
            duration: prefersReducedMotion ? 0 : 0.3,
            ease: "power3.out",
          },
        );
        const setShaderY = gsap.quickTo(media, "--works-shader-y", {
          duration: prefersReducedMotion ? 0 : 0.34,
          ease: "power3.out",
        });
        const setShaderSkew = gsap.quickTo(media, "--works-shader-skew", {
          duration: prefersReducedMotion ? 0 : 0.34,
          ease: "power3.out",
        });
        const setShaderBlur = gsap.quickTo(media, "--works-shader-blur", {
          duration: prefersReducedMotion ? 0 : 0.3,
          ease: "power3.out",
        });
        const setShaderScale = gsap.quickTo(media, "--works-shader-scale", {
          duration: prefersReducedMotion ? 0 : 0.34,
          ease: "power3.out",
        });
        const setShaderSaturate = gsap.quickTo(
          media,
          "--works-shader-saturate",
          {
            duration: prefersReducedMotion ? 0 : 0.3,
            ease: "power3.out",
          },
        );
        const setShaderContrast = gsap.quickTo(
          media,
          "--works-shader-contrast",
          {
            duration: prefersReducedMotion ? 0 : 0.3,
            ease: "power3.out",
          },
        );
        const setShaderOverlayY = gsap.quickTo(
          media,
          "--works-shader-overlay-y",
          {
            duration: prefersReducedMotion ? 0 : 0.34,
            ease: "power3.out",
          },
        );
        const setShaderOverlaySkew = gsap.quickTo(
          media,
          "--works-shader-overlay-skew",
          {
            duration: prefersReducedMotion ? 0 : 0.34,
            ease: "power3.out",
          },
        );
        const setShaderOverlayScale = gsap.quickTo(
          media,
          "--works-shader-overlay-scale",
          {
            duration: prefersReducedMotion ? 0 : 0.34,
            ease: "power3.out",
          },
        );

        const resetShader = () => {
          setShaderStrength(0);
          setShaderY("0px");
          setShaderSkew("0deg");
          setShaderBlur("0px");
          setShaderScale(1);
          setShaderSaturate(1);
          setShaderContrast(1);
          setShaderOverlayY("0px");
          setShaderOverlaySkew("0deg");
          setShaderOverlayScale(1);
        };

        gsap.set(media, {
          "--works-shader-strength": 0,
          "--works-shader-y": "0px",
          "--works-shader-skew": "0deg",
          "--works-shader-blur": "0px",
          "--works-shader-scale": 1,
          "--works-shader-saturate": 1,
          "--works-shader-contrast": 1,
          "--works-shader-overlay-y": "0px",
          "--works-shader-overlay-skew": "0deg",
          "--works-shader-overlay-scale": 1,
        });

        if (!prefersReducedMotion) {
          ScrollTrigger.create({
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            onUpdate: (self) => {
              const velocity = self.getVelocity();
              const strength = gsap.utils.clamp(0, 1, Math.abs(velocity) / 3600);
              const y = gsap.utils.clamp(-18, 18, velocity * -0.006);
              const skew = gsap.utils.clamp(-4, 4, velocity * -0.0015);

              setShaderStrength(strength);
              setShaderY(`${y}px`);
              setShaderSkew(`${skew}deg`);
              setShaderBlur(`${strength * 1.15}px`);
              setShaderScale(1 + strength * 0.045);
              setShaderSaturate(1 + strength);
              setShaderContrast(1 + strength * 0.16);
              setShaderOverlayY(`${y * -0.65}px`);
              setShaderOverlaySkew(`${skew * -0.7}deg`);
              setShaderOverlayScale(1 + strength * 0.08);

              shaderResetCall?.kill();
              shaderResetCall = gsap.delayedCall(0.13, resetShader);
            },
            onLeave: resetShader,
            onLeaveBack: resetShader,
          });
        }
      }

      const setProjectLink = (index) => {
        projectLinks.forEach((link, linkIndex) => {
          const isActive = linkIndex === index;

          link.setAttribute("aria-hidden", isActive ? "false" : "true");
          link.setAttribute("tabindex", isActive ? "0" : "-1");
          gsap.set(link, { pointerEvents: isActive ? "auto" : "none" });
        });
      };

      const setShowcasePanel = (index) => {
        if (!showcaseItems.length || index === showcaseIndexRef.current) return;

        showcaseIndexRef.current = index;

        showcaseItems.forEach((item, itemIndex) => {
          item.setAttribute(
            "aria-hidden",
            itemIndex === index ? "false" : "true",
          );
        });

        gsap.killTweensOf(showcaseItems);
        gsap.set(showcaseItems, { autoAlpha: 0 });
        gsap.set(showcaseItems[index], { autoAlpha: 1 });
      };
      let setShowcaseAvailability = (isAvailable) => {
        canShowcaseRef.current = isAvailable;
      };

      if (media && showcase) {
        showShowcase = () => {
          if (!canShowcaseRef.current) return;

          gsap.to(mediaOverlay, {
            autoAlpha: 1,
            duration: prefersReducedMotion ? 0 : 0.35,
            ease: interactionEase,
            overwrite: "auto",
          });
          gsap.to(showcase, {
            xPercent: -50,
            yPercent: -50,
            rotateX: 0,
            autoAlpha: 1,
            duration: prefersReducedMotion ? 0 : 0.55,
            ease: interactionEase,
            overwrite: "auto",
          });
        };
        hideShowcase = () => {
          gsap.to(mediaOverlay, {
            autoAlpha: 0,
            duration: prefersReducedMotion ? 0 : 0.3,
            ease: interactionEase,
            overwrite: "auto",
          });
          gsap.to(showcase, {
            xPercent: -50,
            yPercent: 110,
            rotateX: 60,
            autoAlpha: 0,
            duration: prefersReducedMotion ? 0 : 0.3,
            ease: interactionEase,
            overwrite: "auto",
          });
        };

        setShowcaseAvailability = (isAvailable) => {
          if (canShowcaseRef.current === isAvailable) return;

          canShowcaseRef.current = isAvailable;

          if (!isAvailable) {
            hideShowcase();
          }
        };

        if (!isTouchLayout) {
          media.addEventListener("pointerenter", showShowcase);
          media.addEventListener("pointerleave", hideShowcase);
          media.addEventListener("focusin", showShowcase);
          media.addEventListener("focusout", hideShowcase);
        } else {
          requestAnimationFrame(showShowcase);
        }

        cleanupShowcase = () => {
          if (!isTouchLayout) {
            media.removeEventListener("pointerenter", showShowcase);
            media.removeEventListener("pointerleave", hideShowcase);
            media.removeEventListener("focusin", showShowcase);
            media.removeEventListener("focusout", hideShowcase);
          }
        };
      }

      async function setupContentAnimation() {
        await document.fonts.ready;
        if (cancelled) return;

        context.add(() => {
          const splitTargets = contentItems.flatMap((item) =>
            gsap.utils.toArray("[data-works-line-mask]", item),
          );

          contentSplits = splitTargets.map((target) => ({
            target,
            split: SplitText.create(target, {
              type: "lines",
              mask: "lines",
              linesClass: styles.line,
              autoSplit: true,
              onSplit(self) {
                gsap.set(self.masks, { overflow: "clip" });
                return gsap.set(self.lines, { yPercent: 0 });
              },
            }),
          }));

          const getProjectParts = (index) => {
            const item = contentItems[index];

            return {
              item,
              title: item?.querySelector("[data-works-title]"),
              metric: item?.querySelector("[data-works-metric]"),
              lines: contentSplits
                .filter(({ target }) => item?.contains(target))
                .flatMap(({ split }) => split.lines),
            };
          };

          const setContentPanel = (index, { immediate = false } = {}) => {
            const previousIndex = contentIndexRef.current;
            const direction = index >= previousIndex ? 1 : -1;

            if (index === previousIndex && !immediate) return;

            const previous = getProjectParts(previousIndex);
            const next = getProjectParts(index);
            const inactiveItems = contentItems.filter(
              (item) => item !== previous.item && item !== next.item,
            );

            contentItems.forEach((item, itemIndex) => {
              item.setAttribute(
                "aria-hidden",
                itemIndex === index ? "false" : "true",
              );
            });

            gsap.killTweensOf([
              previous.item,
              previous.title,
              previous.metric,
              previous.lines,
              next.item,
              next.title,
              next.metric,
              next.lines,
            ]);
            gsap.set(inactiveItems, {
              autoAlpha: 0,
              pointerEvents: "none",
            });

            if (immediate || prefersReducedMotion) {
              gsap.set(contentItems, {
                autoAlpha: 0,
                pointerEvents: "none",
              });
              gsap.set(next.item, {
                autoAlpha: 1,
                pointerEvents: "auto",
              });
              gsap.set([next.title, next.metric, next.lines], {
                yPercent: 0,
                autoAlpha: 1,
              });
              contentIndexRef.current = index;
              return;
            }

            gsap.set(next.item, {
              autoAlpha: 1,
              pointerEvents: "auto",
            });
            gsap.set([next.title, next.metric], {
              yPercent: 100 * direction,
              autoAlpha: 0,
            });
            gsap.set(next.lines, {
              yPercent: 110 * direction,
              autoAlpha: 1,
            });

            gsap
              .timeline({
                defaults: {
                  duration: 0.45,
                  ease: interactionEase,
                  overwrite: "auto",
                },
              })
              .to(
                [previous.title, previous.metric],
                {
                  yPercent: -100 * direction,
                  autoAlpha: 0,
                },
                0,
              )
              .to(
                previous.lines,
                {
                  yPercent: -110 * direction,
                  autoAlpha: 0,
                  stagger: 0.1,
                },
                0,
              )
              .to(
                [next.title, next.metric],
                {
                  yPercent: 0,
                  autoAlpha: 1,
                },
                0.12,
              )
              .to(
                next.lines,
                {
                  yPercent: 0,
                  autoAlpha: 1,
                  stagger: 0.1,
                },
                0.18,
              )
              .set(previous.item, {
                autoAlpha: 0,
                pointerEvents: "none",
              });

            contentIndexRef.current = index;
          };

          setContentPanel(0, { immediate: true });

          ScrollTrigger.create({
            trigger: section,
            start: "top top",
            end: () => `+=${(projects.length - 1) * window.innerHeight}`,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const totalTransitions = projects.length - 1;
              const rawPosition = self.progress * totalTransitions;
              const activeSegment = Math.min(
                totalTransitions - 1,
                Math.floor(rawPosition),
              );
              const segmentProgress = rawPosition - activeSegment;
              const completedIndex =
                segmentProgress >= projectVisualCompleteRatio
                  ? activeSegment + 1
                  : activeSegment;
              const isTransitioning =
                segmentProgress > projectTransitionHoldRatio &&
                segmentProgress < projectVisualCompleteRatio;

              setShowcaseAvailability(!isTransitioning);

              if (completedIndex === numberIndexRef.current) return;

              numberIndexRef.current = completedIndex;

              gsap.to(numberStack, {
                yPercent: -numberStep * completedIndex,
                duration: prefersReducedMotion ? 0 : 0.35,
                ease: interactionEase,
                overwrite: "auto",
              });

              setContentPanel(completedIndex);
              setShowcasePanel(completedIndex);
              setProjectLink(completedIndex);

              if (isTouchLayout) {
                showShowcase();
              }
            },
          });
        });
      }

      setupContentAnimation();
    }, section);

    return () => {
      cancelled = true;
      cleanupShowcase();
      contentSplits.forEach(({ split }) => split.revert());
      gsap.killTweensOf(numberStack);
      gsap.killTweensOf(section.querySelector("[data-works-media-overlay]"));
      gsap.killTweensOf(section.querySelector("[data-works-showcase]"));
      gsap.killTweensOf(section.querySelector("[data-works-media]"));
      shaderResetCall?.kill();
      gsap.killTweensOf(gsap.utils.toArray("[data-works-project]", section));
      gsap.killTweensOf(
        gsap.utils.toArray("[data-works-project-link]", section),
      );
      context.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.works}
      aria-labelledby="works-heading"
      data-works
      style={{ "--works-scroll-height": `${projects.length * 100}svh` }}
    >
      <div className={styles.stage}>
        <div className={styles.feature}>
          <div className={styles.indexColumn}>
            <h2 id="works-heading" className={styles.kicker}>
              <span className={styles.kickerDot} aria-hidden="true" />
              <span>Recent works</span>
            </h2>
            <p className={styles.count} aria-label="Project 1 of 5">
              <span className={styles.countViewport}>
                <span ref={numberStackRef} className={styles.countStack}>
                  {projects.map((project, index) => (
                    <span key={project.title}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  ))}
                </span>
              </span>
              <span className={styles.countMuted}>
                /{String(projects.length).padStart(2, "0")}
              </span>
            </p>
            <Button
              disabled={true}
              href="/works"
              className={`${styles.button} ${styles.indexButton}`}
            >
              View all works
            </Button>
          </div>

          <div className={styles.workGroup}>
            <figure
              className={styles.media}
              data-works-media
              tabIndex={0}
              aria-label="Reveal project showcase preview"
            >
              <DissolveImageStack
                as="div"
                className={styles.projectImageStack}
                images={projects.map((project) => project.image)}
                imageSizes="(max-width: 767px) 100vw, 42vw"
                navbarTheme={null}
                pin={false}
                segmentHoldRatio={projectTransitionHoldRatio}
                trigger="[data-works]"
                start="top top"
                end={() => `+=${(projects.length - 1) * window.innerHeight}`}
                height="100%"
                minHeight="0"
              />
              <div className={styles.shaderLayer} aria-hidden="true" />
              {projects.map((project, index) => (
                <Link
                  key={project.href}
                  href={project.href}
                  className={styles.projectLink}
                  data-works-project-link
                  aria-label={`Open ${project.title} project`}
                  aria-hidden={index === 0 ? "false" : "true"}
                  tabIndex={index === 0 ? 0 : -1}
                />
              ))}
              <div
                className={styles.mediaOverlay}
                data-works-media-overlay
                aria-hidden="true"
              />
              <div
                className={styles.showcase}
                data-works-showcase
                aria-hidden="true"
              >
                {projects.map((project, index) => (
                  <div
                    key={project.title}
                    className={styles.showcasePanel}
                    data-works-showcase-panel
                    aria-hidden={index === 0 ? "false" : "true"}
                  >
                    <span className={styles.showcaseEyebrow}>
                      Project showcase
                    </span>
                    <span className={styles.showcaseTitle}>
                      {project.title}
                    </span>
                    <span className={styles.showcaseMeta}>
                      Video / motion preview
                    </span>
                  </div>
                ))}
              </div>
            </figure>

            <article className={styles.caseStudy} aria-live="polite">
              {projects.map((project, index) => (
                <div
                  key={project.title}
                  className={styles.projectContent}
                  data-works-project
                  aria-hidden={index === 0 ? "false" : "true"}
                >
                  <div className={styles.titleMask}>
                    <h3 className={styles.title} data-works-title>
                      {project.title}
                    </h3>
                  </div>
                  <p className={styles.description} data-works-line-mask>
                    {project.description}
                  </p>

                  <div className={styles.metricGroup}>
                    <div className={styles.metricMask}>
                      <p className={styles.metric} data-works-metric>
                        {project.metric}
                      </p>
                    </div>
                    <p className={styles.metricCaption} data-works-line-mask>
                      {project.metricCaption}
                    </p>
                  </div>
                </div>
              ))}
            </article>
          </div>
        </div>

        <div className={styles.footer}>
          <Button
            disabled={true}
            href="/works"
            className={`${styles.button} ${styles.mobileButton}`}
          >
            View all works
          </Button>
        </div>
      </div>
    </section>
  );
}
