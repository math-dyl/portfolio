import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/ui/RevealText";
import { motion } from "@/lib/motion";
export default function NotFound() { return <Container className="not-found"><Reveal as="p" className="eyebrow">404 / Page not found</Reveal><RevealText lines={[{ text: "This page took" }, { text: "a different path." }]} /><Reveal as="p" delay={motion.entrance.description}>The project or page you’re looking for isn’t here.</Reveal><Reveal delay={motion.entrance.actions}><Button href="/projects"><ArrowLeft size={17} aria-hidden="true" />Explore projects</Button></Reveal></Container>; }
