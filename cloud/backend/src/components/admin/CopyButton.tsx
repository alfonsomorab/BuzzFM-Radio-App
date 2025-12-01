"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/Toast";

interface CopyButtonProps {
  text: string;
  label?: string;
}

export function CopyButton({ text, label = "Copied!" }: CopyButtonProps) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast(label, "success");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      showToast("Failed to copy to clipboard", "error");
    }
  };

  return (
    <button
      className="btn btn-sm btn-outline-secondary ms-2"
      onClick={handleCopy}
      title="Copy to clipboard"
    >
      <i className={`bi ${copied ? "bi-check-lg" : "bi-clipboard"}`}></i>
    </button>
  );
}
