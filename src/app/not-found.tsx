import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
export default function NotFound() { return <Container className="not-found"><p className="eyebrow">404 / Page not found</p><h1>This page took<br />a different path.</h1><p>The project or page you’re looking for isn’t here.</p><Button href="/projects"><ArrowLeft size={17} aria-hidden="true" />Explore projects</Button></Container>; }
