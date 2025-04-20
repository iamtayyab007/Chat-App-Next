"use client";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { socket } from "../../socket";
import Contact from "@/components/Contact";

import { User } from "../../../types/user";
type Message = {
  senderId: string;
  receiverId: string;
  content: string;
  senderMessage: boolean;
};

export default function dashboard() {
  const { data: session, status } = useSession();
  console.log("session", session);

  const router = useRouter();

  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  console.log("selectedid", selectedUser?._id);
  console.log("messages", messages);

  const userId = session?.user._id;
  console.log("userid", userId);

  useEffect(() => {
    if (socket.connected) {
      onConnect();

      console.log("socketid", socket.id);
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);
      if (userId) {
        socket.emit("add-user", userId);
      }

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    socket.emit("get-online-users");
    socket.on("onlineusers", (data) => {
      console.log("OnlineUsers", data);
    });

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    socket.on("receive-message", (message) => {
      const { senderId, receiverId, content } = message;
      setMessages((prev) => [
        ...prev,
        { senderId, receiverId, content, senderMessage: false },
      ]);
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("receive-message");
    };
  }, [userId, messages]);

  const handleSignOut = async () => {
    const data = await signOut({ redirect: false, callbackUrl: "/sign-in" });
    router.push(data.url);
  };

  const handleSend = (contentMessage: string) => {
    if (!selectedUser || !input.trim()) return;

    const newMessage: Message = {
      senderId: userId,
      receiverId: selectedUser._id,
      content: contentMessage,
      senderMessage: true, // Mark it as your own message
    };

    socket.emit("send-message", newMessage);

    // ✅ Add the message to your UI immediately
    setMessages((prev) => [...prev, newMessage]);

    setInput("");
  };

  return (
    <>
      <div className="flex h-screen bg-gray-100 p-4 gap-4">
        {/* Left Side: Main Chat */}
        <div className="flex flex-col flex-1 items-center">
          {/* Header */}
          <div className="w-full max-w-2xl bg-white shadow rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold text-gray-800">
                Welcome, {session?.user.username}
              </h1>
              <button
                onClick={handleSignOut}
                className="bg-amber-400 hover:bg-amber-500 transition text-white px-4 py-2 rounded-2xl"
              >
                Sign Out
              </button>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <p>
                Status:{" "}
                <span
                  className={isConnected ? "text-green-600" : "text-red-600"}
                >
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
                <span className="ml-2">{socket.id}</span>
              </p>
              <p>Transport: {transport}</p>
            </div>
          </div>

          {/* Chat Window */}
          <div className="w-full max-w-2xl flex flex-col bg-white shadow rounded-xl h-[500px]">
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.map((msg, index) => (
                <div key={index}>
                  <p
                    className={`max-w-[70%] p-3 my-2 rounded-lg text-sm break-words ${
                      msg.senderMessage
                        ? "bg-green-300 self-end text-right rounded-br-none"
                        : "bg-red-300 self-start text-left rounded-bl-none"
                    }`}
                  >
                    {msg.content}
                    <div className="text-xs text-gray-500">
                      {new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </p>
                </div>
              ))}
            </div>

            {/* Input area */}
            <div className="border-t p-4 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-2xl"
                onClick={() => handleSend(input)}
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Contact List */}
        <div className="w-[300px]">
          <Contact userSelected={setSelectedUser} />
        </div>
      </div>
    </>
  );
}
