"use client";

import { useEffect, useState } from "react";

//count down toward a server-set deadline (epoch ms)
export const useCountdown = (deadline: number | null) => {
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    if (!deadline) {
      setRemainingMs(0);
      return;
    }

    const update = () => setRemainingMs(Math.max(deadline - Date.now(), 0));
    update();
    const interval = setInterval(update, 100);
    return () => clearInterval(interval);
  }, [deadline]);

  return remainingMs;
};
