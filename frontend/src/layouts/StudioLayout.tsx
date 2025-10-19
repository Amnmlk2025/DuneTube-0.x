import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { ToastProvider } from "../components/ui/Toast";
import { ConfirmProvider } from "../components/ui/Confirm";

const BRAND = { deepBlue: "#0A355C", sand: "#E8DCC8" };
const PANEL_W = 260;

const Icon = {
  Logo: () => (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <rect x="3" y="5" width="18" height="14" rx="4" fill={BRAND.deepBlue} />
      <polygon points="10,9 16,12 10,15" fill="white" />
    </svg>
  ),
  Hamburger: (p:any)=>(<svg viewBox="0 0 24 24" width="22" height="22" {...p}><path fill="currentColor" d="M3 6h18v2H3v-2Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z"/></svg>),
  Search: (p:any)=>(<svg viewBox="0 0 24 24" width="18" height="18" {...p}><path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 10-1.06 1.06l.27.28v.79L20 19.5 19.5 20l-3.99-4zM10.5 14A3.5 3.5 0 1114 10.5 3.5 3.5 0 0110.5 14z"/></svg>),
  Plus: (p:any)=>(<svg viewBox="0 0 24 24" width="18" height="18" {...p}><path fill="currentColor" d="M11 5h2v14h-2zM5 11h14v2H5z"/></svg>),
};

export default function StudioLayout() {
  const [open, setOpen] = useState(false);
  const [shadowHeader, setShadowHeader] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 1024);
  const nav = useNavigate();

  useEffect(() => {
    const onScroll = () => setShadowHeader(window.scrollY > 2);
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const onNew = () => nav("/studio/course/0/edit");

  const LinkItem = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "block px-3 py-2 rounded-md text-sm hover:bg-gray-50",
          isActive ? "bg-gray-50 font-medium text-gray-900" : "text-gray-700",
        ].join(" ")
      }
      onClick={() => setOpen(false)}
    >
      {children}
    </NavLink>
  );

  const leftPadding = !isMobile && open ? PANEL_W : 0;

  return (
    <ToastProvider>
      <ConfirmProvider>
        <div className="min-h-screen bg-gray-50 overflow-x-hidden">
          {/* Header */}
          <header className={`fixed top-0 left-0 right-0 z-[60] bg-white border-b ${shadowHeader ? "shadow-[0_1px_0_rgba(0,0,0,0.04)]" : ""}`}>
            <div className="max-w-screen-2xl mx-auto h-16 px-3 sm:px-6 flex items-center gap-3">
              <button className="p-2 rounded hover:bg-gray-100" onClick={() => setOpen(v=>!v)} aria-label="Toggle menu">
                <Icon.Hamburger/>
              </button>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white" style={{background:BRAND.deepBlue}}>
                <Icon.Logo/>
              </div>
              <div className="font-semibold text-[clamp(1rem,2vw,1.125rem)]" style={{color:BRAND.deepBlue}}>
                Teacher Studio
              </div>
              <div className="flex-1"/>
              <div className="hidden md:block w-full max-w-md">
                <div className="relative">
                  <input className="w-full rounded-lg border pl-10 pr-3 py-2" placeholder="Search my courses…"/>
                  <span className="absolute left-3 top-2.5 text-gray-500"><Icon.Search/></span>
                </div>
              </div>
              <button onClick={onNew} className="ml-2 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-white" style={{background:BRAND.deepBlue}}>
                <Icon.Plus/> New course
              </button>
            </div>
          </header>

          {/* Sidebar */}
          {open && (
            <>
              {isMobile && <div className="fixed inset-0 z-[55] bg-black/30" onClick={() => setOpen(false)} />}
              <aside className="fixed z-[56] top-16 bottom-0 left-0 border-r bg-white overflow-y-auto" style={{ width: PANEL_W }}>
                <nav className="p-3">
                  <div className="text-xs uppercase text-gray-400 mb-2">Studio</div>
                  <LinkItem to="/studio">Courses</LinkItem>
                  <LinkItem to="/studio/lessons">Lessons</LinkItem>
                  <LinkItem to="/studio/files">Files</LinkItem>
                  <LinkItem to="/studio/assistants">Assistants</LinkItem>
                  <LinkItem to="/studio/reports">Reports</LinkItem>
                  <LinkItem to="/studio/settings">Settings</LinkItem>
                </nav>
              </aside>
            </>
          )}

          {/* Content */}
          <div className="pt-16" style={{ paddingLeft: leftPadding }}>
            <main className="max-w-screen-2xl mx-auto px-3 sm:px-6 py-5">
              <Outlet/>
            </main>
          </div>
        </div>
      </ConfirmProvider>
    </ToastProvider>
  );
}
