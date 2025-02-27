"use client";

import React, { useEffect, useRef, useState, FormEvent } from "react";
import Context from "@/components/Context";
import Header from "@/components/Header";
import Chat from "@/components/Chat";
import { useChat } from "ai/react";
import InstructionModal from "./components/InstructionModal";
import { AiFillGithub, AiOutlineInfoCircle } from "react-icons/ai";

const Page: React.FC = () => {
  const [gotMessages, setGotMessages] = useState(false);
  const [context, setContext] = useState<string[] | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [personality, setPersonality] = useState("gordonRamsay");

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    onFinish: async () => {
      setGotMessages(true);
    },
  });

  const prevMessagesLengthRef = useRef(messages.length);

  const handleMessageSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit(e);
    setContext(""); // Reset context
    setGotMessages(false);
  };

  useEffect(() => {
    const getContext = async () => {
      const response = await fetch("/api/context", {
        method: "POST",
        body: JSON.stringify({
          messages,
          personality, // Include personality in the request body
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
    <div className="flex flex-col justify-between h-screen bg-gray-800 p-2 mx-auto max-w-full">
      <Header className="my-5" />
      
      <div className="mb-4">
        <h2 className="text-white text-lg">Select AI Personality</h2>
        <label className="text-white mr-4">
          <input 
            type="radio" 
            name="personality" 
            value="gordonRamsay" 
            checked={personality === "gordonRamsay"}
            onChange={(e) => setPersonality(e.target.value)}
          />
          Gordon Ramsay
        </label>
        <label className="text-white">
          <input 
            type="radio" 
            name="personality" 
            value="maryBerry" 
            checked={personality === "maryBerry"}
            onChange={(e) => setPersonality(e.target.value)}
          />
          Mary Berry
        </label>
      </div>
      
      <InstructionModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
      <div className="flex w-full flex-grow overflow-hidden relative">
        <Chat
          input={input}
          handleInputChange={handleInputChange}
          handleMessageSubmit={handleMessageSubmit}
          messages={messages}
        />
        <div className="absolute transform translate-x-full transition-transform duration-500 ease-in-out right-0 w-2/3 h-full bg-gray-700 overflow-y-auto lg:static lg:translate-x-0 lg:w-2/5 lg:mx-2 rounded-lg">
          <Context className="" selected={context} />
        </div>
      </div>
    </div>
  );
};

export default Page;
