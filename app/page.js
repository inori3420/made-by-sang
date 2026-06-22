import { Metadata } from "next";
import Hero from "./Components/Sections/Hero/Hero";

export const metadata = {
  title: "Made by Sang",
  description:
    "Sang is a creative studio that specializes in design, development, and digital experiences.",
};

export default function Home() {
  return (
    <>
      <Hero />
    </>
  );
}
