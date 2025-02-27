// Chat.tsx

import React, { FormEvent, ChangeEvent } from "react";
import Messages from "./Messages";
import { Message } from "ai/react";
import Image from "next/image";

interface Chat {
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleMessageSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  messages: Message[];
}

const Chat: React.FC<Chat> = ({
  input,
  handleInputChange,
  handleMessageSubmit,
  messages,
}) => {
  return (
    <div id="chat" className="flex flex-col w-full lg:w-4/5 mr-4 mx-5 lg:mx-0 relative">
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
        <Image
          src="/sosig.jpg"
          alt="Chef Gordon"
          width={64}
          height={64}
          className="rounded-full border-2 border-gray-700 outline outline-2 outline-gray-500"
        />
      </div>
      <Messages messages={messages} />
      <form
        onSubmit={handleMessageSubmit}
        className="mt-5 mb-5 relative bg-gray-700 rounded-lg p-4"
      >
        <input
          type="text"
          className="input-glow appearance-none border rounded w-full py-2 px-3 text-gray-200 leading-tight focus:outline-none focus:shadow-outline bg-gray-600 border-gray-600 transition-shadow duration-200"
          value={input}
          onChange={handleInputChange}
        />
        <span className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none text-gray-400">
          Press ⮐ to send
        </span>
      </form>
    </div>
  );
};

export default Chat;
