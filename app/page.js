import Hero from "./Components/Sections/Hero/Hero";
import Navbar from "./Components/UI/Navbar/Navbar";

export const metadata = {
  title: "Made by Sang",
  description:
    "Sang is a creative studio that specializes in design, development, and digital experiences.",
};

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
    </>
  );
}
