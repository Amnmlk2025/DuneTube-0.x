import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  type Course,
  type Status,
  listCourses,
  publishCourse,
  pauseCourse,
  resumeCourse,
} from "./_studioStore";
import { useToast } from "../../components/ui/Toast";
import { useConfirm } from "../../components/ui/Confirm";

const BRAND = { deepBlue: "#0A355C", sand: "#E8DCC8" };
const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(" ");

const timeSince = (iso: string) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  const u: [string, number][] = [["y",31536000],["mo",2592000],["w",604800],["d",86400],["h",3600],["m",60]];
  for (const [l, s] of u) { const v = Math.floor(diff / s); if (v >= 1) return `${v}${l} ago`; }
  return "now";
};

function StatusBadge({ s }: { s: Status }) {
  const map: Record<Status, string> = {
    draft: "bg-gray-100 text-gray-700",
    published: "bg-green-100 text-green-700",
    paused: "bg-amber-100 text-amber-800",
  };
  const label: Record<Status, string> = { draft:"Draft", published:"Published", paused:"Paused" };
  return <span className={cx("px-2 py-0.5 rounded text-xs font-medium", map[s])}>{label[s]}</span>;
}

function Card({
  item, onEdit, onView, onPublish, onPause, onResume, onOfferMigration
}:{
  item: Course;
  onEdit:(uid:string)=>void; onView:(uid:string)=>void;
  onPublish:(uid:string)=>void; onPause:(uid:string)=>void; onResume:(uid:string)=>void;
  onOfferMigration:(uid:string)=>void;
}) {
  const showMetrics = item.status !== "draft";
  const editable = item.status === "draft";

  return (
    <div className="rounded-xl bg-white border hover:shadow-sm transition">
      <div className="rounded-t-xl overflow-hidden">
        <div className="aspect-video bg-gray-100 flex items-center justify-center text-gray-400">
          <svg width="42" height="42" viewBox="0 0 24 24" className="opacity-60"><path d="M10 8l6 4-6 4V8z" fill="currentColor"/></svg>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between gap-2">
          <StatusBadge s={item.status} />
          <div className="text-[12px] text-gray-500">{timeSince(item.updated_at)}</div>
        </div>

        <div className="mt-1 font-semibold line-clamp-2">{item.title}</div>

        <div className="mt-1 text-sm text-gray-500">
          {item.lessons.length} lessons
          {showMetrics && (
            <>
              <span className="mx-1 text-gray-300">•</span>
              {(item.students ?? 0).toLocaleString()} students
              {item.rating && (<><span className="mx-1 text-gray-300">•</span>★ {item.rating.toFixed(1)}</>)}
            </>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {editable ? (
            <button className="px-2.5 py-1.5 rounded-md border text-sm hover:bg-gray-50" onClick={()=>onEdit(item.uid)}>Edit</button>
          ) : (
            <button className="px-2.5 py-1.5 rounded-md border text-sm hover:bg-gray-50" onClick={()=>onView(item.uid)} title="View (read-only)">View</button>
          )}

          {item.status === "draft" && (
            <button className="px-2.5 py-1.5 rounded-md text-sm text-white" style={{background:BRAND.deepBlue}} onClick={()=>onPublish(item.uid)}>Publish</button>
          )}

          {item.status === "published" && (
            <button className="px-2.5 py-1.5 rounded-md text-sm border hover:bg-gray-50" onClick={()=>onPause(item.uid)}>Pause</button>
          )}

          {item.status === "paused" && (
            <>
              <button className="px-2.5 py-1.5 rounded-md text-sm text-white" style={{background:BRAND.deepBlue}} onClick={()=>onResume(item.uid)}>Resume</button>
              <button className="px-2.5 py-1.5 rounded-md text-sm border hover:bg-gray-50" onClick={()=>onOfferMigration(item.uid)}>Offer migration</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StudioCourses(){
  const nav = useNavigate();
  const { push } = useToast();
  const { confirm } = useConfirm();

  const [items,setItems]=useState<Course[]>(listCourses());
  const [q,setQ]=useState(""); const [status,setStatus]=useState<"all"|Status>("all");

  const [migrationOpen,setMigrationOpen]=useState(false);
  const [fromUid,setFromUid]=useState<string|null>(null);
  const [toUid,setToUid]=useState<string|null>(null);

  const refresh = () => setItems(listCourses());

  const list = useMemo(()=>{
    const kw=q.trim().toLowerCase();
    return items.filter(c=>{
      const okS=status==="all"||c.status===status;
      const okQ=!kw||c.title.toLowerCase().includes(kw);
      return okS && okQ;
    });
  },[items,q,status]);

  const draftTargets = useMemo(()=>{
    const all=listCourses();
    return all.filter(c=>c.status==="draft" && c.uid!==fromUid);
  },[fromUid,items]);

  const onEdit   =(uid:string)=> nav(`/studio/course/${uid}/edit`);
  const onView   =(uid:string)=> nav(`/studio/course/${uid}`);

  const onPublish= async (uid:string)=>{
    const ok=await confirm({
      title:"Publish course?",
      message:"After publishing, editing is disabled. You can pause later and duplicate to edit a new version.",
      confirmText:"Publish", cancelText:"Cancel"
    });
    if(!ok) return;
    publishCourse(uid); refresh();
    push({ type:"success", title:"Course published" });
  };

  const onPause  = async (uid:string)=>{
    const ok=await confirm({
      title:"Pause publishing?",
      message:"New enrollments stop. Existing students keep access. You can offer migration to a new course.",
      confirmText:"Pause", cancelText:"Cancel"
    });
    if(!ok) return;
    pauseCourse(uid); refresh();
    push({ type:"info", title:"Course paused" });
  };

  const onResume = async (uid:string)=>{
    const ok=await confirm({
      title:"Resume publishing?",
      message:"Course will be available for new enrollments again.",
      confirmText:"Resume", cancelText:"Cancel"
    });
    if(!ok) return;
    resumeCourse(uid); refresh();
    push({ type:"success", title:"Course resumed" });
  };

  const onOfferMigration=(uid:string)=>{
    setFromUid(uid); setToUid(null); setMigrationOpen(true);
  };

  const confirmMigration=()=>{
    if(!fromUid||!toUid){ push({ type:"error", title:"Select a draft course" }); return; }
    // TODO: call API
    setMigrationOpen(false);
    push({ type:"success", title:"Migration offer sent", desc:`From ${fromUid} → ${toUid}` });
  };

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(["all","draft","published","paused"] as const).map(k=>(
          <button key={k}
            className={`px-3 py-1.5 rounded-full text-sm ${status===k?"text-white":"text-gray-700 hover:bg-gray-100"}`}
            style={{ background: status===k ? BRAND.deepBlue : BRAND.sand }}
            onClick={()=>setStatus(k)}
          >{k[0].toUpperCase()+k.slice(1)}</button>
        ))}
        <div className="ml-auto">
          <input className="rounded-lg border px-3 py-2 w-[240px] max-w-full" placeholder="Search…" value={q} onChange={e=>setQ(e.target.value)}/>
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map(c=>(
          <Card key={c.uid} item={c}
            onEdit={onEdit} onView={onView}
            onPublish={onPublish} onPause={onPause} onResume={onResume}
            onOfferMigration={onOfferMigration}
          />
        ))}
      </div>

      {list.length===0 && <div className="text-center text-gray-500 py-16">No courses found.</div>}

      {/* Modal: Offer Migration */}
      {migrationOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={()=>setMigrationOpen(false)} />
          <div className="relative z-[71] w-[min(92vw,520px)] rounded-xl bg-white shadow-lg border p-4">
            <h2 className="text-base font-semibold mb-2">Offer migration to a new course</h2>
            <p className="text-sm text-gray-600 mb-3">
              Select a <b>draft</b> course to offer as the new version. Enrolled students keep access if they decline.
            </p>
            <div className="mb-3">
              <div className="text-sm text-gray-600 mb-1">Target draft course</div>
              <select className="w-full border rounded px-3 py-2" value={toUid ?? ""} onChange={(e)=>setToUid(e.target.value || null)}>
                <option value="">— Select a draft —</option>
                {draftTargets.map(d=>(
                  <option key={d.uid} value={d.uid}>{d.title} — {d.uid}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button className="px-3 py-2 rounded border" onClick={()=>setMigrationOpen(false)}>Cancel</button>
              <button className="px-3 py-2 rounded text-white" style={{background:BRAND.deepBlue}} onClick={confirmMigration}>Send offer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
