"use client";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { socket } from "../../socket";
import Contact from "@/components/Contact";

type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string; // You can use `Date` if you prefer.
  senderMessage: boolean; // `true` for sender's message, `false` for receiver's
};

export default function dashboard() {
  const { data: session, status } = useSession();

  const router = useRouter();

  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const userId = session?.user.id;
  console.log("userid", userId);

  useEffect(() => {
    if (socket.connected) {
      onConnect();
      console.log("socketid", socket.id);
      socket.emit("userId", session?.user.id);
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  const handleSignOut = async () => {
    const data = await signOut({ redirect: false, callbackUrl: "/sign-in" });
    router.push(data.url);
  };
  useEffect(() => {
    socket.on("received-message", (data) => {
      console.log("received message", data);
    });
  }, []);

  const handleSend = (contentMessage: string) => {
    const newMessage: Message = {
      id: new Date().toISOString(),
      senderId: userId,
      receiverId: "",
      content: input,
      timestamp: new Date().toISOString(),
      senderMessage: true,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    socket.emit(`${session?.user.username}`, newMessage);
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
                  <p>{msg.content}</p>
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
          <Contact />
        </div>
      </div>
    </>
  );
}
