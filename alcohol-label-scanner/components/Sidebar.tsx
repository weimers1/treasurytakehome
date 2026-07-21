"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  History, 
  User, 
  Camera, 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Scan", href: "/scan", icon: Camera },
  { name: "History", href: "/history", icon: History },
  { name: "About Sam", href: "/about-sam", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <>
      {/* Mobile Top Navigation */}
      <div className="flex w-full flex-col md:hidden">
        <div className="flex h-16 items-center justify-between bg-zinc-900 px-6 text-white shadow-md">
          <h1 className="text-xl font-bold">Scanner</h1>
          <button
            onClick={toggleMobileMenu}
            className="rounded-md p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white focus:outline-none"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Dropdown Menu (Comes from top) */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out bg-zinc-900",
            isMobileMenuOpen ? "max-h-64" : "max-h-0"
          )}
        >
          <nav className="space-y-1 px-4 pb-4 pt-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center rounded-md px-3 py-3 text-base font-medium transition-colors",
                    isActive
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-4 h-6 w-6 flex-shrink-0 transition-colors",
                      isActive ? "text-white" : "text-zinc-400"
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden h-full flex-col bg-zinc-900 text-white transition-all duration-300 ease-in-out md:flex",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="flex h-16 items-center justify-between px-6">
          {!isCollapsed && <h1 className="text-xl font-bold truncate">Scanner</h1>}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white focus:outline-none",
              isCollapsed && "mx-auto"
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
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
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white",
                  isCollapsed && "justify-center"
                )}
                title={isCollapsed ? item.name : ""}
              >
                <item.icon
                  className={cn(
                    "flex-shrink-0 transition-colors",
                    isCollapsed ? "h-6 w-6" : "mr-3 h-5 w-5",
                    isActive ? "text-white" : "text-zinc-400 group-hover:text-white"
                  )}
                  aria-hidden="true"
                />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
