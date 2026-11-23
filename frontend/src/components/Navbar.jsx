import { useState } from "react";
import {
  Cog6ToothIcon,
  UserGroupIcon,
  FolderIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

import { useOrgSession } from "../context/OrgSessionContext";

const navItems = [
  { name: "Setup", icon: Cog6ToothIcon, href: "#" },
  { name: "Team", icon: UserGroupIcon, href: "#" },
  { name: "Projects", icon: FolderIcon, href: "#" },
  { name: "Calendar", icon: CalendarIcon, href: "#" },
];

function NavigationComponent() {
  const { openConnect } = useOrgSession();
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState("Setup");
  const [expandedMenu, setExpandedMenu] = useState("Setup");

  const subMenuItems = {
    Setup: [],
    Projects: [],
  };

  return (
    <nav
      className={`${collapsed ? "w-20" : "w-64"} min-h-screen relative flex flex-col transition-all duration-300 ease-in-out`}
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #f8fafd 50%, #eef4fb 100%)",
        borderRight: "1px solid rgba(0, 55, 141, 0.08)",
        boxShadow: "4px 0 24px rgba(0, 55, 141, 0.04)",
      }}
    >
      {/* Subtle decorative gradient orb */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #d4e4f4 0%, transparent 70%)" }}
      />

      {/* Header with logo and collapse toggle */}
      <div className="flex items-center justify-between px-4 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src="/logos/GrifolsLogo.png"
              className={`${collapsed ? "hidden w-10 h-10" : "w-12 h-12"} rounded-full object-contain bg-white p-1 shadow-md ring-2 ring-[#00378d]/10`}
              alt="Grifols"
            />
            <div className={`${collapsed ? "hidden" : ""} absolute -bottom-0.5 -right-0.5`}>
              <div className="w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
            </div>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-[#00378d]/50 font-medium">
                Platform
              </span>
              <span className="text-sm font-bold text-[#00378d]">
                Grifols Refresh
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 hover:from-[#d4e4f4] hover:to-[#d4e4f4]/60 border border-gray-200/60 shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
        >
          {collapsed ? (
            <ChevronRightIcon className="w-3.5 h-3.5 text-black justify-self-center self-center" />
          ) : (
            <ChevronLeftIcon className="w-3.5 h-3.5 text-black justify-self-center self-center" />
          )}
        </button>
      </div>

      {/* Divider */}
      <div className="mx-4 mb-2 h-px bg-gradient-to-r from-transparent via-[#00378d]/10 to-transparent" />

      {/* Section label */}
      {!collapsed && (
        <span className="px-6 pt-3 pb-2 text-[10px] uppercase tracking-widest text-[#00378d]/70 font-semibold">
          Main
        </span>
      )}

      {/* Navigation items */}
      <div className="flex flex-col gap-1.5 px-3 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.name;
          const isExpanded = expandedMenu === item.name;
          const hasSub = subMenuItems[item.name];

          return (
            <div key={item.name}>
              <a
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  setActive(item.name);
                  setExpandedMenu(isExpanded ? null : item.name);
                }}
                className={`${collapsed ? "justify-self-center" : ""} flex items-center rounded-xl text-sm font-medium transition-all duration-300 self-center ${
                  isActive
                    ? "px-3 py-2.5 text-white shadow-lg shadow-[#00378d]/25"
                    : "px-2 py-1.5 text-gray-800 hover:text-[#00378d] scale-90"
                }`}
                style={
                  isActive
                    ? { background: "linear-gradient(135deg, #00378d 0%, #004fb3 100%)" }
                    : { background: "linear-gradient(90deg,rgba(111, 177, 199, 1) 0%, rgba(93, 142, 207, 1) 50%, rgba(69, 119, 181, 1) 100%)", border: "1px solid #b8cde3" }
                }
              >
                <div className={`p-1.5 rounded-lg ${isActive ? "bg-white/20" : "bg-[#00378d]/10"}`}>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                </div>
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.name}</span>
                    {hasSub && (
                      <Squares2X2Icon
                        className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? "rotate-45" : ""}`}
                      />
                    )}
                  </>
                )}
              </a>

              {/* Submenu */}
              {hasSub && isExpanded && !collapsed && (
                <div className="ml-10 mt-1.5 flex flex-col gap-0.5 border-l-2 border-[#00378d]/10 pl-3">
                  {subMenuItems[item.name].map((sub) => (
                    <a
                      key={sub}
                      href="#"
                      className="text-xs text-gray-600 hover:text-[#00378d] hover:bg-[#d4e4f4] px-3 py-1.5 rounded-lg transition-all duration-200"
                    >
                      {sub}
                    </a>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom card */}
      {!collapsed && (
        <div
          className="mx-3 mb-6 p-4 rounded-2xl border border-[#00378d]/10 overflow-hidden relative"
          style={{ background: "linear-gradient(145deg, #eef4fb 0%, #d4e4f4 100%)" }}
        >
          <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-[#00378d]/5 blur-xl" />
          <p className="text-[#00378d] text-sm font-bold mb-1 relative">
            Let&apos;s start!
          </p>
          <p className="text-[#00378d]/70 text-xs mb-3 relative">
            Manage your Salesforce sandbox refreshes easily.
          </p>
          <button
            onClick={openConnect}
            className="w-full py-2.5 px-3 rounded-xl text-white text-xs font-bold cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-none relative"
            style={{ background: "linear-gradient(135deg, #00378d 0%, #004fb3 100%)" }}
          >
            + New Refresh
          </button>
        </div>
      )}
    </nav>
  );
}

export default NavigationComponent;
