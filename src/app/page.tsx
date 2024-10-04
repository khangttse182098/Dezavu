"use client";

import React from "react";
import { signIn } from "next-auth/react";

const page = () => {
  return (
    <div className="h-screen w-screen flex justify-center items-center">
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
