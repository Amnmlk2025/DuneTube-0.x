import React, { useEffect, useMemo, useRef, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000/api";
const PAGE_SIZE = 16;
const USE_MOCK_ON_ERROR = true;
const BRAND = { deepBlue: "#0A355C", sand: "#E8DCC8" };

// ارتفاع‌ها
const HEADER_PX = 64;
const FILTERS_PX = 56;
const TOP_OFFSET_PX = HEADER_PX + FILTERS_PX; // 120px
const Z_HEADER = 60;
const Z_FILTERS = 55;
const Z_PANEL = 52;

type CourseCardView = {
  id: number;
  title: string;
  thumbnail?: string;
  teacher?: string;
  rating_avg?: number;
  students_count?: number;
  published_at?: string;
};

// 🧠 تابع محاسبه‌ی عرض ریسپانسیو پنل چپ
const getPanelWidth = () => (window.innerWidth < 1400 ? 300 : 360);

const timeSince = (iso?: string) => {
  if (!iso) return "";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  const u: [string, number][] = [["y",31536000],["mo",2592000],["w",604800],["d",86400],["h",3600],["m",60]];
  for (const [l,s] of u){ const v=Math.floor(diff/s); if(v>=1) return `${v}${l} ago`; }
  return "now";
};

const makeMockPage = (page:number): CourseCardView[] =>
  Array.from({length: PAGE_SIZE}).map((_,i)=>({
    id:(page-1)*PAGE_SIZE+i+1,
    title:`Sample Course #${i+1}`,
    teacher:["Sara","Michael","Emily","James"][i%4],
    rating_avg:4+(i%10)/10,
    students_count:1000*((i%7)+1),
    published_at:new Date(Date.now()-i*86400000).toISOString()
  }));

const cx = (...xs:(string|false|null|undefined)[]) => xs.filter(Boolean).join(" ");

const Icon = {
  Logo: () => (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <rect x="3" y="5" width="18" height="14" rx="4" fill={BRAND.deepBlue}/>
      <polygon points="10,9 16,12 10,15" fill="white"/>
    </svg>
  ),
  Search: (p:any)=>(<svg viewBox="0 0 24 24" width="20" height="20" {...p}><path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 10-1.06 1.06l.27.28v.79L20 19.5 19.5 20l-3.99-4zM10.5 14A3.5 3.5 0 1114 10.5 3.5 3.5 0 0110.5 14z"/></svg>),
  Globe:(p:any)=>(<svg viewBox="0 0 24 24" width="20" height="20" {...p}><path fill="currentColor" d="M12 2a10 10 0 100 20 10 10 0 000-20Zm0 18a8 8 0 110-16 8 8 0 010 16Zm0-14c-1.66 0-3 2.69-3 6s1.34 6 3 6 3-2.69 3-6-1.34-6-3-6Zm-7 6c0-.7.08-1.36.22-2h3.16A18 18 0 008 12c0 .7.08 1.36.22 2H5.22A8 8 0 015 12Zm12.78 2h-3.16c.14-.64.22-1.3.22-2s-.08-1.36-.22-2h3.16c.14.64.22 1.3.22 2s-.08 1.36-.22 2Z"/></svg>),
  User:(p:any)=>(<svg viewBox="0 0 24 24" width="20" height="20" {...p}><path fill="currentColor" d="M12 12a5 5 0 100-10 5 5 0 000 10Zm0 2c-4.4 0-8 2.24-8 5v1h16v-1c0-2.76-3.6-5-8-5Z"/></svg>),
  Hamburger:(p:any)=>(<svg viewBox="0 0 24 24" width="22" height="22" {...p}><path fill="currentColor" d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z"/></svg>)
};

function SectionTitle({children}:{children:React.ReactNode}) {
  return <h2 className="text-lg font-semibold mb-3" style={{color:BRAND.deepBlue}}>{children}</h2>;
}
function Chip({label,active,onClick}:{label:string;active?:boolean;onClick?:()=>void}) {
  return (
    <button
      onClick={onClick}
      className={cx("px-3 py-1 rounded-full text-sm mr-2 mb-2", active ? "text-white" : "text-gray-700")}
      style={{background:active?BRAND.deepBlue:BRAND.sand}}
    >
      {label}
    </button>
  );
}

function CourseCard({item}:{item:CourseCardView}) {
  return (
    <div className="rounded-xl bg-transparent">
      <div className="relative overflow-hidden rounded-xl aspect-video bg-gray-100 flex items-center justify-center text-gray-400">
        <svg width="42" height="42" viewBox="0 0 24 24" className="opacity-60"><path d="M10 8l6 4-6 4V8z" fill="currentColor"/></svg>
      </div>
      <div className="pt-2">
        <div className="font-medium line-clamp-2 text-[clamp(.9rem,1.8vw,1rem)]">{item.title}</div>
        <div className="text-[13px] md:text-sm text-gray-500">{item.teacher}</div>
        <div className="text-[12px] md:text-xs text-gray-500 flex items-center gap-2 mt-1">
          <span>★ {item.rating_avg?.toFixed(1)}</span><span>•</span>
          <span>{(item.students_count??0).toLocaleString()} students</span><span>•</span>
          <span>{timeSince(item.published_at)}</span>
        </div>
      </div>
    </div>
  );
}

function ShortsRail({title}:{title:string}) {
  const items = Array.from({length:10},(_,i)=>i+1);
  return (
    <div className="mb-6">
      <SectionTitle>{title}</SectionTitle>
      <div className="flex max-w-full overflow-x-auto overscroll-x-contain gap-3 pb-1">
        {items.map(n=>(
          <div key={n} className="shrink-0 min-w-[120px] sm:min-w-[140px] md:min-w-[150px] rounded-xl bg-transparent">
            <div className="relative overflow-hidden rounded-xl" style={{aspectRatio:"9 / 16"}}>
              <div className="absolute inset-0 bg-gray-100"/>
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                <svg width="28" height="28" viewBox="0 0 24 24" className="opacity-70"><path d="M10 8l6 4-6 4V8z" fill="currentColor"/></svg>
              </div>
            </div>
            <div className="pt-2 text-sm font-medium line-clamp-2">Short #{n}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
function TestsRail({title}:{title:string}) {
  const items = Array.from({length:10},(_,i)=>i+1);
  return (
    <div className="mb-6">
      <SectionTitle>{title}</SectionTitle>
      <div className="flex max-w-full overflow-x-auto overscroll-x-contain gap-3 pb-1">
        {items.map(n=>(
          <div key={n} className="shrink-0 min-w-[180px] sm:min-w-[200px] md:min-w-[220px] rounded-xl bg-transparent">
            <div className="relative overflow-hidden rounded-xl aspect-video bg-gray-100"/>
            <div className="pt-2 text-sm font-medium line-clamp-2">Quick Test #{n}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsPanelLeft({width}:{width:number}) {
  return (
    <aside
      className="fixed left-0 z-[52] border-r bg-white overflow-y-auto"
      style={{
        top: TOP_OFFSET_PX,
        height: `calc(100vh - ${TOP_OFFSET_PX}px)`,
        width: width
      }}
      aria-label="Settings"
    >
      <div className="p-4">
        <h3 className="text-base font-semibold mb-3" style={{color:BRAND.deepBlue}}>Settings</h3>
        <div className="text-sm space-y-4">
          <div>
            <div className="font-medium mb-1">Theme</div>
            <div className="flex gap-2">
              <button className="px-3 py-2 rounded border">Light</button>
              <button className="px-3 py-2 rounded border">Dark</button>
              <button className="px-3 py-2 rounded border">System</button>
            </div>
          </div>
          <div>
            <div className="font-medium mb-1">Language</div>
            <div className="flex gap-2">
              <button className="px-3 py-2 rounded border">FA</button>
              <button className="px-3 py-2 rounded border">EN</button>
              <button className="px-3 py-2 rounded border">AR</button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default function Home(){
  const [pages,setPages]=useState<CourseCardView[][]>([]);
  const [page,setPage]=useState(1);
  const [hasMore,setHasMore]=useState(true);
  const [loading,setLoading]=useState(false);
  const [settingsOpen,setSettingsOpen]=useState(false);
  const [activeTag,setActiveTag]=useState("All");
  const [panelWidth,setPanelWidth]=useState(getPanelWidth());

  const sentinelRef=useRef<HTMLDivElement|null>(null);

  // وقتی تغییر اندازه‌ی صفحه اتفاق می‌افتد
  useEffect(()=>{
    const resize=()=>setPanelWidth(getPanelWidth());
    window.addEventListener("resize",resize);
    return ()=>window.removeEventListener("resize",resize);
  },[]);

  async function fetchPage(p:number){
    setLoading(true);
    try{
      const url=new URL(`${API_BASE.replace(/\/$/,"")}/courses/`);
      url.searchParams.set("page",String(p));
      url.searchParams.set("page_size",String(PAGE_SIZE));
      const r=await fetch(url.toString());
      if(!r.ok) throw new Error("http");
      const j=await r.json();
      const results = Array.isArray(j.results)?j.results:j;
      setPages(prev=>[...prev,results]);
      setHasMore(results.length===PAGE_SIZE);
      setPage(prev=>prev+1);
    }catch{
      if(USE_MOCK_ON_ERROR){
        const mock=makeMockPage(p);
        setPages(prev=>[...prev,mock]);
        setHasMore(p<5);
        setPage(prev=>prev+1);
      }else setHasMore(false);
    }finally{ setLoading(false); }
  }

  useEffect(()=>{ if(pages.length===0 && hasMore && !loading) fetchPage(1); },[pages.length,hasMore,loading]);

  const topics = ["All","AI","Business","Psychology","Tech","Design","Marketing"];

  const feed = useMemo(()=>{
    const blocks:React.ReactNode[]=[];
    pages.forEach((chunk,idx)=>{
      const p=idx+1;
      if(p===1) blocks.push(<ShortsRail key="shorts" title="Shorts" />);
      blocks.push(
        <div
          key={`grid-${p}`}
          className="grid gap-4 sm:gap-5 lg:gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 mb-8"
        >
          {chunk.map(c=><CourseCard key={c.id} item={c}/>)}
        </div>
      );
      if(p===1) blocks.push(<TestsRail key="tests" title="Quick Tests" />);
    });
    return blocks;
  },[pages]);

  const panelOffset = settingsOpen ? panelWidth : 0;

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-[60] bg-white border-b">
        <div className="max-w-screen-xl w-full mx-auto flex items-center gap-3 px-3 sm:px-6 h-16">
          <button onClick={()=>setSettingsOpen(v=>!v)} className="p-2 rounded hover:bg-gray-100">
            <Icon.Hamburger/>
          </button>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white" style={{background:BRAND.deepBlue}}>
            <Icon.Logo/>
          </div>
          <span className="hidden sm:block font-semibold" style={{color:BRAND.deepBlue}}>Dunetube</span>
          <div className="flex-1"/>
          <div className="hidden md:block w-full max-w-xl">
            <div className="relative">
              <input className="pl-10 pr-10 py-2 rounded-lg border w-full" placeholder="Search courses..."/>
              <span className="absolute left-3 top-2.5 text-gray-500"><Icon.Search/></span>
            </div>
          </div>
          <button className="p-2 rounded hover:bg-gray-100"><Icon.Globe/></button>
          <button className="p-2 rounded hover:bg-gray-100"><Icon.User/></button>
        </div>
      </header>

      {/* FILTERS */}
      <div
        className="fixed left-0 right-0 z-[55] bg-white border-b flex items-center"
        style={{ top: HEADER_PX, height: FILTERS_PX, paddingLeft: panelOffset }}
      >
        <div className="max-w-screen-xl w-full mx-auto h-full flex items-center px-3 sm:px-6 overflow-x-auto gap-2">
          {topics.map(t=>(
            <Chip key={t} label={t} active={t===activeTag} onClick={()=>setActiveTag(t)} />
          ))}
        </div>
      </div>

      {/* PANEL */}
      {settingsOpen && <SettingsPanelLeft width={panelWidth} />}

      {/* CONTENT */}
      <div className="pt-[120px]" style={{ paddingLeft: panelOffset }}>
        <main className="max-w-screen-xl w-full mx-auto px-3 sm:px-5">
          {feed}
          <div className="h-10"/>
          {loading && <div className="py-6 text-center text-gray-500">Loading…</div>}
          {!loading && !hasMore && pages.length>0 && <div className="py-10 text-center text-gray-400">End of feed</div>}
        </main>
      </div>
    </div>
  );
}
