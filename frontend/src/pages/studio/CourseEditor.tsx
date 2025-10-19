import React, { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  getCourse,
  upsertCourse,
  duplicateCourse,
  createDraftLike,
  type Course,
  addLesson,
  removeLesson,
  moveLesson,
  renameLesson,
  attachToLesson,
} from "./_studioStore";
import { useToast } from "../../components/ui/Toast";

const BRAND = { deepBlue: "#0A355C" };

export default function CourseEditor() {
  const { id } = useParams(); // uid | "0"
  const nav = useNavigate();
  const { push } = useToast();
  const location = useLocation();
  const isEditPath = location.pathname.endsWith("/edit");
  const isNew = id === "0";

  if (isNew) {
    const draft = createDraftLike();
    nav(`/studio/course/${draft.uid}/edit`, { replace: true });
    return null;
  }

  const existing = id ? getCourse(id) : undefined;
  if (!existing) return <div className="rounded-md border bg-white p-4">Course not found.</div>;

  const [course, setCourse] = useState<Course>(existing);
  const editable = isEditPath && course && course.status === "draft";

  const setField = <K extends keyof Course>(k: K, v: Course[K]) => {
    const next = { ...course, [k]: v, updated_at: new Date().toISOString() };
    setCourse(next);
    if (editable) upsertCourse(next);
  };

  const DisabledBanner = useMemo(
    () =>
      !editable ? (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 text-amber-800 px-3 py-2 text-sm">
          Viewing a <b>{course.status}</b> course. Editing is disabled.
        </div>
      ) : null,
    [editable, course.status]
  );

  const onDuplicate = () => {
    const draft = duplicateCourse(course.uid);
    if (draft) {
      push({ type: "success", title: "Duplicated", desc: `New draft: ${draft.uid}` });
      nav(`/studio/course/${draft.uid}/edit`);
    }
  };

  // LESSONS ops
  const onAddLesson = () => {
    if (!editable) return;
    const updated = addLesson(course.uid, "New lesson");
    if (updated) { setCourse(updated); push({ type:"success", title:"Lesson added" }); }
  };
  const onDeleteLesson = (lid: string) => {
    if (!editable) return;
    const updated = removeLesson(course.uid, lid);
    if (updated) { setCourse(updated); push({ type:"info", title:"Lesson removed" }); }
  };
  const onMoveLesson = (from: number, to: number) => {
    if (!editable) return;
    if (to < 0 || to >= course.lessons.length) return;
    const updated = moveLesson(course.uid, from, to);
    if (updated) { setCourse(updated); push({ type:"success", title:"Order updated" }); }
  };
  const onRenameLesson = (lid: string, title: string) => {
    if (!editable) return;
    const updated = renameLesson(course.uid, lid, title);
    if (updated) setCourse(updated);
  };
  const onAttach = (lid: string, type: "video" | "pdf" | "slide" | "exercise" | "other", files: FileList | null) => {
    if (!editable || !files || files.length === 0) return;
    attachToLesson(course.uid, lid, Array.from(files).map((f) => ({ type, file: f })));
    setCourse({ ...getCourse(course.uid)! });
    push({ type:"success", title:"File attached" });
  };

  const [dragIndex, setDragIndex] = useState<number | null>(null);

  return (
    <div>
      <h1 className="text-lg font-semibold mb-2">
        {editable ? `Edit Course` : `View Course`} —{" "}
        <span className="text-gray-500 text-sm">{course.uid}</span>
      </h1>
      {DisabledBanner}

      <Tabs>
        <Tab title="Details">
          <div className="rounded-xl border bg-white p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <div className="text-sm text-gray-600 mb-1">Title</div>
                <input className="w-full rounded border px-3 py-2"
                  value={course.title} onChange={(e)=>setField("title", e.target.value)}
                  disabled={!editable} placeholder="Course title"/>
              </label>
              <label className="block">
                <div className="text-sm text-gray-600 mb-1">Status</div>
                <input className="w-full rounded border px-3 py-2" value={course.status} disabled />
              </label>
              <label className="block sm:col-span-2">
                <div className="text-sm text-gray-600 mb-1">Description</div>
                <textarea className="w-full rounded border px-3 py-2 h-28" disabled={!editable} placeholder="Course description"/>
              </label>
            </div>
          </div>
        </Tab>

        <Tab title={`Lessons (${course.lessons.length})`}>
          <div className="rounded-xl border bg-white p-4">
            <div className="text-sm text-gray-600 mb-3">
              {editable ? "Add / remove / reorder lessons. Numbering updates automatically based on order." : "Read-only."}
            </div>
            <div className="space-y-3">
              {course.lessons.map((ls, idx) => (
                <div key={ls.lid}
                  className="rounded-lg border p-3 bg-gray-50"
                  draggable={editable}
                  onDragStart={() => setDragIndex(idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => { if (dragIndex!==null && dragIndex!==idx) onMoveLesson(dragIndex, idx); setDragIndex(null); }}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-8 text-gray-500 select-none">#{idx + 1}</span>
                    <input className="flex-1 rounded border px-2 py-1 bg-white"
                      value={ls.title} onChange={(e)=>onRenameLesson(ls.lid, e.target.value)} disabled={!editable}/>
                    {editable && (
                      <>
                        <button className="px-2 py-1 rounded border text-sm" onClick={()=>onMoveLesson(idx, idx-1)}>↑</button>
                        <button className="px-2 py-1 rounded border text-sm" onClick={()=>onMoveLesson(idx, idx+1)}>↓</button>
                        <button className="px-2 py-1 rounded border text-sm" onClick={()=>onDeleteLesson(ls.lid)}>Delete</button>
                      </>
                    )}
                  </div>

                  {/* Uploads */}
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Video file</div>
                      <input type="file" accept="video/*" disabled={!editable} onChange={(e)=>onAttach(ls.lid,"video",e.target.files)} />
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">PDF (book/handout)</div>
                      <input type="file" accept="application/pdf" disabled={!editable} onChange={(e)=>onAttach(ls.lid,"pdf",e.target.files)} />
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Slides (PPT/PDF)</div>
                      <input type="file" accept=".ppt,.pptx,application/pdf" disabled={!editable} onChange={(e)=>onAttach(ls.lid,"slide",e.target.files)} />
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Exercises / Others</div>
                      <input type="file" multiple disabled={!editable} onChange={(e)=>onAttach(ls.lid,"exercise",e.target.files)} />
                    </div>
                  </div>

                  {ls.attachments.length>0 && (
                    <div className="mt-2 text-sm text-gray-700">
                      <div className="mb-1 text-xs text-gray-500">Attachments:</div>
                      <ul className="list-disc pl-5">
                        {ls.attachments.map(a=>(
                          <li key={a.id}>
                            <span className="uppercase text-[11px] px-1 py-0.5 rounded bg-gray-200 mr-1">{a.type}</span>
                            {a.tempUrl ? <a href={a.tempUrl} target="_blank" rel="noreferrer" className="underline">{a.name}</a> : a.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {editable && (
              <button className="mt-3 px-3 py-2 rounded text-white" style={{ background: BRAND.deepBlue }} onClick={onAddLesson}>
                + Add lesson
              </button>
            )}
          </div>
        </Tab>

        <Tab title="Resources">
          <div className="rounded-xl border bg-white p-4">
            <div className="text-sm text-gray-600 mb-3">
              {editable ? "Upload and manage supplementary materials." : "Read-only."}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <div className="mb-1 text-sm">Books / PDFs</div>
                <input type="file" multiple className="block w-full text-sm" disabled={!editable} />
              </label>
              <label className="block">
                <div className="mb-1 text-sm">Slides (PPT/PDF)</div>
                <input type="file" multiple className="block w-full text-sm" disabled={!editable} />
              </label>
              <label className="block">
                <div className="mb-1 text-sm">Exercises</div>
                <input type="file" multiple className="block w-full text-sm" disabled={!editable} />
              </label>
              <label className="block">
                <div className="mb-1 text-sm">Tests / Question banks</div>
                <input type="file" multiple className="block w-full text-sm" disabled={!editable} />
              </label>
            </div>
          </div>
        </Tab>
      </Tabs>

      {!editable && (
        <div className="mt-6 flex justify-end">
          <button className="px-4 py-2 rounded text-white" style={{ background: BRAND.deepBlue }} onClick={onDuplicate}>
            Duplicate and edit
          </button>
        </div>
      )}
    </div>
  );
}

/* --- Tabs --- */
function Tabs({ children }: { children: React.ReactNode }) {
  const [i, setI] = useState(0);
  return (
    <div>
      <div className="flex gap-2 mb-3">
        {React.Children.map(children as any, (c: any, idx: number) => (
          <button className={`px-3 py-2 rounded-md text-sm border ${i===idx?"bg-white":"bg-gray-50"}`} onClick={()=>setI(idx)}>
            {c.props.title}
          </button>
        ))}
      </div>
      <div>{(React.Children.toArray(children) as any[])[i]}</div>
    </div>
  );
}
function Tab({ children }: { title: string; children: React.ReactNode }) { return <>{children}</>; }
