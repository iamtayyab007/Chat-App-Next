"use client";
import axios from "axios";
import { useState, useEffect } from "react";

type User = {
  status: string;
  id: string;
  username: string;
  email: string;
};

export default function Contact() {
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const res = await axios.get("/api/users/get-users");
        if (res?.data?.user) {
          setAllUsers(res.data.user);
          console.log("Fetched users:", res.data.user);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    }
    fetchUserData();
  }, []);

  // filtering out the online user
  const filteredOnlineUser = allUsers.filter((user) => user.status !== "false");

  console.log("filter", filteredOnlineUser);

  return (
    <div className="w-full max-w-2xl bg-white shadow rounded-xl p-4 mb-4">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Contacts</h2>
      {allUsers.length > 0 ? (
        <ul className="space-y-3">
          {allUsers.map((user) => (
            <li
              key={user.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-white font-bold uppercase">
                  {user.username.charAt(0)}
                </div>
                <div>
                  <p className="text-gray-800 font-medium">{user.username}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <span
                className={`${
                  user.status === "true"
                    ? "text-green-500 text-sm font-semibold"
                    : "text-red-500 text-sm font-semibold"
                }`}
              >
                {user.status === "true" ? "🟢 Online" : "🔴 Offline"}
              </span>

              {/* You can conditionally show online/offline status here if you track it */}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">No users found.</p>
      )}
    </div>
  );
}
