import InfiniteCanvas from "../Components/UI/InfiniteCanvas/InfiniteCanvas";

const placeholderWorks = [
  {
    title: "Saigonpai",
    src: "/images/how/placeholder-4.png",
    href: "/works",
  },
  {
    title: "Studio Archive",
    src: "/images/how/placeholder-1.png",
    href: "/works",
  },
  {
    title: "SAF School",
    src: "/images/how/placeholder-5.png",
    href: "/works",
  },
  {
    title: "Editorial System",
    src: "/images/how/placeholder-3.png",
    href: "/works",
  },
  {
    title: "Campaign Objects",
    src: "/images/how/placeholder-2.png",
    href: "/works",
  },
];

export const metadata = {
  title: "Works — Made by Sang",
  description:
    "An infinite canvas of selected Made by Sang projects and visual experiments.",
};

export default function WorksPage() {
  return (
    <InfiniteCanvas
      images={placeholderWorks}
      eyebrow="Recent works"
      title="Works without edges"
      description="A draggable project field built from finite Prismic-ready data, repeated through deterministic chunks."
    />
  );
}
