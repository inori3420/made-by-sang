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

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const numberStack = numberStackRef.current;
    let cancelled = false;
    let contentSplits = [];
    let cleanupShowcase = () => {};

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

      if (media && showcase) {
        const showShowcase = () => {
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
        const hideShowcase = () => {
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

        media.addEventListener("pointerenter", showShowcase);
        media.addEventListener("pointerleave", hideShowcase);
        media.addEventListener("focusin", showShowcase);
        media.addEventListener("focusout", hideShowcase);

        cleanupShowcase = () => {
          media.removeEventListener("pointerenter", showShowcase);
          media.removeEventListener("pointerleave", hideShowcase);
          media.removeEventListener("focusin", showShowcase);
          media.removeEventListener("focusout", hideShowcase);
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
      gsap.killTweensOf(gsap.utils.toArray("[data-works-project]", section));
      gsap.killTweensOf(gsap.utils.toArray("[data-works-project-link]", section));
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
                  <span className={styles.showcaseTitle}>{project.title}</span>
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

        <div className={styles.footer}>
          <h2 id="works-heading" className={styles.heading}>
            Recent Works
          </h2>
          <Button disabled={true} href="/works" className={styles.button}>
            View all works
          </Button>
        </div>
      </div>
    </section>
  );
}
