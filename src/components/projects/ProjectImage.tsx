"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import type { ProjectImage as ProjectImageData } from "@/types/project";

const fallback = "/images/projects/placeholder.svg";
type Props = Omit<ImageProps, "src" | "alt" | "onError"> & {
  image?: ProjectImageData;
  title: string;
};

export function ProjectImage({ image, title, ...props }: Props) {
  const [failedSrc, setFailedSrc] = useState<string>();
  const src = image?.src || fallback;
  const unavailable = !image || failedSrc === src;
  return <Image {...props} src={unavailable ? fallback : src}
    alt={unavailable ? `${title} preview unavailable` : image.alt}
    onError={() => setFailedSrc(src)} />;
}
