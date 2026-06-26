import Hero from "./Components/Sections/Hero/Hero";
import About from "./Components/Sections/About/About";
import How from "./Components/Sections/How/How";
import Works from "./Components/Sections/Works/Works";
import Footer from "./Components/Sections/Footer/Footer";

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
      <Footer />
    </>
  );
}
