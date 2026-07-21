"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, History, User, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Scan", href: "/scan", icon: Camera },
  { name: "History", href: "/history", icon: History },
  { name: "About Sam", href: "/about-sam", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-zinc-900 text-white">
      <div className="flex h-16 items-center px-6">
        <h1 className="text-xl font-bold">Label Scanner Demo</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                  isActive ? "text-white" : "text-zinc-400 group-hover:text-white"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
