import { Hero } from "@/components/sections/Hero";
import { Intro } from "@/components/sections/Intro";
import { Work } from "@/components/sections/Work";
import { BuildLog } from "@/components/sections/BuildLog";
import { Stack } from "@/components/sections/Stack";
import { About } from "@/components/sections/About";
import { ResumeCta, Contact } from "@/components/sections/ResumeContact";

export default function Home() {
  return (
    <>
      <Hero />
      <Intro />
      <Work />
      <BuildLog />
      <Stack />
      <About />
      <ResumeCta />
      <Contact />
    </>
  );
}
