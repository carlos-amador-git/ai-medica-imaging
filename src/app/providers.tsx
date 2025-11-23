"use client";
import { HeroUIProvider } from "@heroui/react";
import React from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <HeroUIProvider>{children}</HeroUIProvider>;
}