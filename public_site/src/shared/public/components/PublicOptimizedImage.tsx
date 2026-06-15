/**
 * =====================================================
 * PublicOptimizedImage
 * غلاف مركزي لـ next/image مع دعم روابط صور الباكند.
 * =====================================================
 */

import Image from "next/image";

import { buildBackendAssetUrl } from "@/shared/api/api-client";
import { cn } from "@/shared/design-system/utils/cn";

type PublicOptimizedImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  className?: string;
  fill?: boolean;
};

export function PublicOptimizedImage({
  src,
  alt,
  width = 960,
  height = 540,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
  className,
  fill = false
}: PublicOptimizedImageProps) {
  const normalizedSrc = buildBackendAssetUrl(src);

  if (!normalizedSrc) {
    return null;
  }

  const imageClassName = cn(
    "rounded-appXl border border-app-border object-cover shadow-appCard",
    className
  );

  if (fill) {
    return (
      <Image
        src={normalizedSrc}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={imageClassName}
      />
    );
  }

  return (
    <Image
      src={normalizedSrc}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      sizes={sizes}
      className={imageClassName}
    />
  );
}
