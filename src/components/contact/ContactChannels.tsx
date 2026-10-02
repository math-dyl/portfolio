import { ArrowUpRight, Code2, BriefcaseBusiness, Mail } from "lucide-react";
import { site } from "@/config/site";
export function ContactChannels() {
  const channels = [
    { label: "Email", description: "For projects and collaborations", value: site.email || "Address coming soon", href: site.email ? "mailto:" + site.email : null, icon: Mail },
    { label: "GitHub", description: "Code, experiments, and projects", value: site.github ? "Explore my GitHub" : "Profile coming soon", href: site.github, icon: Code2 },
    { label: "LinkedIn", description: "Connect professionally", value: site.linkedin ? "Connect on LinkedIn" : "Profile coming soon", href: site.linkedin, icon: BriefcaseBusiness },
  ];
  return <div className="contact-channels">{channels.map(channel => { const Icon = channel.icon; const content = <><span className="channel-icon"><Icon size={21} strokeWidth={1.6} aria-hidden="true" /></span><span className="channel-info"><span className="channel-label">{channel.label}</span><span className="channel-description">{channel.description}</span></span><span className={channel.href ? "channel-value" : "channel-value unavailable"}>{channel.value}{channel.href && <ArrowUpRight size={17} aria-hidden="true" />}</span></>; return channel.href ? <a className="contact-channel" key={channel.label} href={channel.href} {...(channel.label !== "Email" ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{content}</a> : <div className="contact-channel" key={channel.label}>{content}</div>; })}</div>;
}
