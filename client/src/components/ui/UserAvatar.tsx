import React from "react";
import { DEFAULT_AVATAR_URL, getAvatarUrl } from "../../utils/avatar";

type UserAvatarProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "alt" | "src" | "onError"> & {
  src?: string | null;
  alt: string;
};

export function UserAvatar({ src, alt, className, ...props }: UserAvatarProps) {
  const [resolvedSrc, setResolvedSrc] = React.useState(() => getAvatarUrl(src));

  React.useEffect(() => {
    setResolvedSrc(getAvatarUrl(src));
  }, [src]);

  const handleError = () => {
    if (resolvedSrc !== DEFAULT_AVATAR_URL) {
      setResolvedSrc(DEFAULT_AVATAR_URL);
    }
  };

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      loading={props.loading ?? "lazy"}
      decoding={props.decoding ?? "async"}
      onError={handleError}
      className={className}
      {...props}
    />
  );
}
