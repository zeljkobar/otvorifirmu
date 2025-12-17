"use client";

import { Copy } from "lucide-react";
import { useState } from "react";

interface CopyButtonProps {
  text: string;
  title?: string;
}

export function CopyButton({ text, title = "Kopiraj" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <button
      className="ml-2 p-1 text-gray-500 hover:text-gray-700 transition-colors"
      onClick={handleCopy}
      title={copied ? "Kopirano!" : title}
    >
      <Copy className={`w-4 h-4 ${copied ? "text-green-600" : ""}`} />
    </button>
  );
}
