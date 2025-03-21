// page.tsx

"use client";
import React, { useEffect, useRef, useState, FormEvent } from "react";
import { Context } from "@/components/Context";
import Header from "@/components/Header";
import Chat from "@/components/Chat";
import { useChat } from "ai/react";

const Page: React.FC = () => {
  const [gotMessages, setGotMessages] = useState(false);
  const [context, setContext] = useState<string[] | null>(null);

  const [isModalOpen, setModalOpen] = useState(false);
  const [personality, setPersonality] = useState<"ramsay" | "berry">("ramsay"); // Default personality

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    onFinish: async () => {
      setGotMessages(true);
    },
  });

  const prevMessagesLengthRef = useRef(messages.length);

  const handleMessageSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit(e);
    setContext(null);
    setGotMessages(false);
  };

  useEffect(() => {
    const getContext = async () => {
      const response = await fetch("/api/context", {
        method: "POST",
        body: JSON.stringify({
          messages,
        }),
      });
      const { context } = await response.json();
      setContext(context.map((c: any) => c.id));
    };
    if (gotMessages && messages.length >= prevMessagesLengthRef.current) {
      getContext();
    }

    prevMessagesLengthRef.current = messages.length;
  }, [messages, gotMessages]);

  return (
    <div className="flex flex-col justify-between h-screen bg-[#1B1B1B] p-2 mx-auto max-w-full">
      <Header className="my-5" />

      {/* Personality Selection */}
      <div className="flex justify-center gap-4 my-4">
        <button
          onClick={() => setPersonality("ramsay")}
          className={`px-4 py-2 rounded ${
            personality === "ramsay" ? "bg-red-600" : "bg-gray-600"
          } text-white`}
        >
          🔥 Gordon Ramsay
        </button>
        <button
          onClick={() => setPersonality("berry")}
          className={`px-4 py-2 rounded ${
            personality === "berry" ? "bg-blue-600" : "bg-gray-600"
          } text-white`}
        >
          🍰 Mary Berry
        </button>
      </div>

      {/* Chat Interface */}
      <div className="flex w-full flex-grow overflow-hidden relative">
        <div className="absolute transform -translate-x-full transition-transform duration-500 ease-in-out left-0 w-2/3 h-full bg-[#b4bdc7] overflow-y-auto lg:static lg:translate-x-0 lg:w-1/5 lg:mx-2 rounded-lg">
          <Context className="" selected={context} />
        </div>
        <button
          type="button"
          className="absolute right-20 transform translate-x-12 bg-[gray-800] text-white rounded-r py-2 px-4 lg:hidden"
          onClick={(e) => {
            e.currentTarget.parentElement
              ?.querySelector(".transform")
              ?.classList.toggle("translate-x-full");
          }}
        >
          ☰
        </button>
        <Chat
          input={input}
          handleInputChange={handleInputChange}
          handleMessageSubmit={handleMessageSubmit}
          messages={messages}
        />
      </div>
    </div>
  );
};

export default Page;
