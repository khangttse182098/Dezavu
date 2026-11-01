import React from "react";

const PlayerAvatar = ({
  name,
  image,
  dimmed,
}: {
  name: string;
  image: string | null;
  dimmed?: boolean;
}) => {
  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-neutral-800 bg-neutral-900 ${
        dimmed ? "opacity-40" : ""
      }`}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span className="text-sm font-bold text-neutral-400">
          {name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
};

export default PlayerAvatar;
