import { useEffect, useState } from "react";

export const usePreloadImage = (imgUrl: string | undefined) => {
  const [preloadImage, setPreloadImage] = useState("");

  //load image in advance
  useEffect(() => {
    // if (playerState.currentTrack) {
    const img = new Image();
    if (imgUrl) {
      img.src = imgUrl;
    }
    img.onload = () => setPreloadImage(img.src);
    // }
  }, [imgUrl]);

  return { preloadImage };
};
