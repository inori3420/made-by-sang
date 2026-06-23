import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(CustomEase, ScrollTrigger);

export const interactionEase = CustomEase.create(
  "interaction",
  "0.77, 0, 0.175, 1",
);

export { gsap, ScrollTrigger };
