import Hero from "./Components/Sections/Hero/Hero";
import About from "./Components/Sections/About/About";
import How from "./Components/Sections/How/How";
import Works from "./Components/Sections/Works/Works";

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
      <How />
      <Works />
      <section className="h-screen bg-black"></section>
    </>
  );
}
