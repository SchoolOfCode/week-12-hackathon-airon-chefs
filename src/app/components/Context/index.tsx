import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import { urls } from "./urls";
import UrlButton from "./UrlButton";
import { Card, ICard } from "./Card";
import { clearIndex, crawlDocument } from "./utils";

import { Button } from "./Button";
import { personalities } from "@/utils/personalities";
interface ContextProps {
  className: string;
  selected: string[] | null;
}

export const Context: React.FC<ContextProps> = ({
  className,
  selected,
  /*   personality,
  setPersonality, */
}) => {
  const [entries, setEntries] = useState(urls);
  const [cards, setCards] = useState<ICard[]>([]);

  // function for updating personality type
  const updatePersonality = (e: ChangeEvent<HTMLInputElement>) => {
    /*    setPersonality(e.target.value); */
  };

  // manages the selected splitting method. Do we want to keep this?
  const [splittingMethod, setSplittingMethod] = useState("markdown");
  // More splitting stuff
  const [chunkSize, setChunkSize] = useState(256);
  // More splitting stuff
  const [overlap, setOverlap] = useState(1);

  // Scroll to selected card
  useEffect(() => {
    const element = selected && document.getElementById(selected[0]);
    element?.scrollIntoView({ behavior: "smooth" });
  }, [selected]);

  // Dropdown for the splitting method?
  const DropdownLabel: React.FC<
    React.PropsWithChildren<{ htmlFor: string }>
  > = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="text-white p-2 font-bold">
      {children}
    </label>
  );

  // maps through the array of urls and creates a button for each
  // each button calls crawlDocument from utils.ts, WHAT DOES THIS DO?
  const buttons = entries.map((entry, key) => (
    <div className="" key={`${key}-${entry.loading}`}>
      <UrlButton
        entry={entry}
        onClick={() =>
          crawlDocument(
            entry.url,
            setEntries,
            setCards,
            splittingMethod,
            chunkSize,
            overlap
          )
        }
      />
    </div>
  ));

  return (
    <div
      className={`flex flex-col border-2 overflow-y-auto rounded-lg border-gray-500 w-full ${className}`}
    >
      <div className="flex flex-col items-start sticky top-0 w-full">
        <div className="flex flex-col items-start lg:flex-row w-full lg:flex-wrap p-2">
          {buttons}
        </div>
        <div className="flex-grow w-full px-4">
          <Button
            className="w-full my-2 uppercase active:scale-[98%] transition-transform duration-100"
            style={{
              backgroundColor: "#4f6574",
              color: "white",
            }}
            onClick={() => clearIndex(setEntries, setCards)}
          >
            Clear Index
          </Button>
        </div>

        <div className="flex p-2"></div>
        <div className="text-left w-full flex flex-col rounded-b-lg bg-gray-600 p-3 subpixel-antialiased">
          <div className="text-white font-bold">Choose your personality</div>
          <div className="flex flex-col">
            {Object.keys(personalities).map((p) => (
              <label key={p} className="flex items-center">
                <input
                  type="radio"
                  name="personality"
                  value={p}
                  /*      checked={personality === p}
                  onChange={updatePersonality} */
                />
                <span className="ml-2">{p}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap w-full">
        {cards &&
          cards.map((card, key) => (
            <Card key={key} card={card} selected={selected} />
          ))}
      </div>
    </div>
  );
};
