"use client";

import React from "react";
import { signIn } from "next-auth/react";

const page = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-12 px-6">
      <div className="text-center">
        <h1 className="font-display text-7xl text-white sm:text-8xl">
          DEZAVU<span className="text-accent">.</span>
        </h1>
        <p className="mt-5 text-xs uppercase tracking-[0.4em] text-neutral-500">
          Hear it &middot; Name it &middot; Score
        </p>
      </div>

      <button
        className="h-14 w-72 rounded-sm bg-accent text-sm font-bold uppercase tracking-[0.2em] text-black transition-colors hover:bg-accent-dark"
        onClick={() => signIn("spotify", { callbackUrl: "/home" })}
      >
        Log in with Spotify
      </button>

      <p className="text-xs text-neutral-600">
        Requires a Spotify Premium account
      </p>
    </main>
  );
};

export default page;
