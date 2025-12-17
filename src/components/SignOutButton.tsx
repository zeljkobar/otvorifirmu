"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
  const handleSignOut = async () => {
    try {
      await signOut({
        callbackUrl: "/",
        redirect: true,
      });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="text-gray-500 hover:text-gray-700 flex items-center space-x-1"
    >
      <LogOut className="w-4 h-4" />
      <span>Odjavi se</span>
    </button>
  );
}
