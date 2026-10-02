import { Code2, Cpu, Sparkles } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { services } from "@/data/services";
const icons = { code: Code2, cpu: Cpu, sparkles: Sparkles };
export function Services() {
  return <section className="section services-section"><Container>
    <SectionTitle eyebrow="03 / System capabilities" title="Built across disciplines." description="The right tools, connected by a clear understanding of the problem." />
    <div className="services-grid">{services.map(service => {
      const Icon = icons[service.icon];
      return <article key={service.title} className="service">
        <div className="service-index"><span>{service.number}</span><Icon size={23} strokeWidth={1.5} aria-hidden="true" /></div>
        <div className="service-copy"><h3>{service.title}</h3><p>{service.description}</p></div>
        <ul>{service.capabilities.map(item => <li key={item}>{item}</li>)}</ul>
      </article>;
    })}</div>
  </Container></section>;
}
