"use client";

import { useEffect } from "react";

/**
 * Client component to load Bootstrap JavaScript
 * Must be a client component because Bootstrap JS requires browser APIs
 */
export default function BootstrapClient() {
  useEffect(() => {
    // Dynamically import Bootstrap JS only on client side
    // @ts-ignore - Bootstrap JS doesn't have TypeScript definitions
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  return null;
}
