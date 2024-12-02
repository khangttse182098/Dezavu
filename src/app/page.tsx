"use client";

import React from "react";
import { signIn } from "next-auth/react";

const page = () => {
  return (
    <div className="h-screen w-screen flex flex-col gap-5 justify-center items-center">
      <div className="bg-yellow-100 text-yellow-800 text-md font-medium me-2 px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">
        Please use a premium Spotify account to login in order to play the game
      </div>
      <button
        className="bg-green-600 w-56 h-20 font-bold text-slate-300 text-lg border-none rounded-md scale-100 hover:scale-95 transition-all"
        onClick={() =>
          signIn("spotify", { callbackUrl: "http://localhost:3000/home" })
        }
      >
        Login with Spotify
      </button>
    </div>
  );
};

export default page;
