import Image, { type ImageProps } from "next/image";
import { isValidImageSrc } from "@/lib/utils";
import React from "react";

type SafeImageProps = ImageProps & {
  fallback?: React.ReactNode;
};

export const SafeImage = ({ src, fallback = null, ...rest }: SafeImageProps) => {
  // If src is a string and valid for next/image, render Image.
  // Otherwise render the provided fallback (or null).
  if (typeof src === "string") {
    if (isValidImageSrc(src)) {
      return <Image src={src} {...rest} />;
    }

    return <>{fallback}</>;
  }

  // If src is the static import object (StaticImageData), forward to Image.
  return <Image src={src as any} {...rest} />;
};

export default SafeImage;
