import { Metadata } from "next";
import Hero from "./Components/Sections/Hero/Hero";
import About from "./Components/Sections/About/About";

export const metadata = {
  title: "Made by Sang",
  description:
    "Sang is a creative studio that specializes in design, development, and digital experiences.",
};

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <section className="bg-black text-white py-20 px-4 h-screen"></section>
    </>
  );
}
