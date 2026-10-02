import { site } from "@/config/site";
export function Brand() {
  return <><span className="brand-glyph" aria-hidden="true">M</span><span className="brand-name">{site.name}</span></>;
}
