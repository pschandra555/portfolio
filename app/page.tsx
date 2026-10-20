import { Handshake } from "@/components/preloader/Handshake";
import { PageTransition } from "@/components/transitions/PageTransition";
import { SectionTracker } from "@/components/providers/SectionTracker";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Operations } from "@/components/sections/Operations";
import { AttackSurface } from "@/components/sections/AttackSurface";
import { Timeline } from "@/components/sections/Timeline";
import { Interrogate } from "@/components/sections/Interrogate";
import { SecureChannel } from "@/components/sections/SecureChannel";

export default function Dossier() {
  return (
    <PageTransition>
      <Handshake />
      <SectionTracker />
      <Hero />
      <About />
      <Operations />
      <AttackSurface />
      <Timeline />
      <Interrogate />
      <SecureChannel />
    </PageTransition>
  );
}
