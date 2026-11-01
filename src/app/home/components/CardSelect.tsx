import React from "react";

export type TCardOption = {
  value: string;
  index: string;
  title: string;
  description: string;
};

const CardSelect = ({
  heading,
  subheading,
  options,
  handleSelect,
  handleBack,
}: {
  heading: string;
  subheading: string;
  options: TCardOption[];
  handleSelect: (value: string) => void;
  handleBack?: () => void;
}) => {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-14 px-6 py-16">
      <div className="text-center">
        <h1 className="font-display text-5xl text-white sm:text-6xl">
          {heading}
          <span className="text-accent">.</span>
        </h1>
        <p className="mt-4 text-xs uppercase tracking-[0.4em] text-neutral-500">
          {subheading}
        </p>
      </div>

      <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
        {options.map(({ value, index, title, description }) => (
          <button
            key={value}
            onClick={() => handleSelect(value)}
            className="group flex h-60 flex-col justify-between rounded-sm border border-neutral-800 bg-neutral-950 p-7 text-left transition-colors duration-200 hover:border-accent hover:bg-neutral-900"
          >
            <div className="flex items-start justify-between">
              <span className="font-display text-sm tracking-[0.2em] text-neutral-600 transition-colors group-hover:text-accent">
                {index}
              </span>
              <span
                className="text-lg text-neutral-700 transition-all duration-200 group-hover:translate-x-1 group-hover:text-accent"
                aria-hidden
              >
                &rarr;
              </span>
            </div>

            <div>
              <h2 className="font-display text-3xl text-white sm:text-4xl">
                {title}
                <span className="text-accent">.</span>
              </h2>
              <p className="mt-3 text-xs uppercase tracking-[0.15em] text-neutral-500">
                {description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {handleBack && (
        <button
          className="text-xs uppercase tracking-[0.25em] text-neutral-500 transition-colors hover:text-white"
          onClick={handleBack}
        >
          &larr; Back
        </button>
      )}
    </div>
  );
};

export default CardSelect;
