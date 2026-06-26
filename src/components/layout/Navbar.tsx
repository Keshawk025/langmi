"use client";

import { usePathname } from "next/navigation";
import { Terminal } from "lucide-react";
import PillNav from "@/components/ui/PillNav";

export default function Navbar() {
  const pathname = usePathname();

  const navigation = [
    { label: "Overview", href: "/" },
    { label: "Analysis", href: "/analysis" },
    { label: "Trace", href: "/trace" },
  ];

  const logoNode = (
    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
      <Terminal className="h-4 w-4" />
    </div>
  );

  return (
    <div className="w-full flex justify-center sticky top-0 z-50 pointer-events-none bg-gradient-to-b from-black via-black/80 to-transparent pb-8">
      <div className="pointer-events-auto mt-4">
        <PillNav
          logo={logoNode}
          logoAlt="LangMi Logo"
          items={navigation}
          activeHref={pathname}
          baseColor="#09090b"
          pillColor="#18181b"
          pillTextColor="#a1a1aa"
          hoveredPillTextColor="#ffffff"
          className="border border-border/60 shadow-lg shadow-black/40 backdrop-blur-md rounded-full"
        />
      </div>
    </div>
  );
}
