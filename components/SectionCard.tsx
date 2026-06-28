"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Section } from "@/app/page";

type Props = {
  section: Section;
  onToggle: (id: string) => void;
  onFieldChange: (id: string, field: string, value: string) => void;
};

const inputClass = "w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-1.5 text-sm text-zinc-100 outline-none focus:border-zinc-500 transition-colors";
const labelClass = "text-xs text-zinc-500 mb-1 block";

function SectionFields({ section, onFieldChange }: { section: Section; onFieldChange: Props["onFieldChange"] }) {
  const f = section.fields;
  const upd = (field: string, val: string) => onFieldChange(section.id, field, val);

  switch (section.type) {
    case "header":
      return (
        <div className="flex flex-col gap-3">
          <div><label className={labelClass}>Project name</label><input className={inputClass} value={f.name} onChange={e => upd("name", e.target.value)} placeholder="My Awesome Project" /></div>
          <div><label className={labelClass}>Description</label><input className={inputClass} value={f.description} onChange={e => upd("description", e.target.value)} placeholder="A short description" /></div>
        </div>
      );
    case "badges":
      return (
        <div className="flex flex-col gap-3">
          <div><label className={labelClass}>License</label><input className={inputClass} value={f.license} onChange={e => upd("license", e.target.value)} placeholder="MIT" /></div>
          <div><label className={labelClass}>npm package (optional)</label><input className={inputClass} value={f.npm} onChange={e => upd("npm", e.target.value)} placeholder="my-package" /></div>
        </div>
      );
    case "installation":
      return (
        <div><label className={labelClass}>Install command</label><input className={inputClass} value={f.command} onChange={e => upd("command", e.target.value)} placeholder="npm install my-package" /></div>
      );
    case "usage":
      return (
        <div className="flex flex-col gap-3">
          <div><label className={labelClass}>Description</label><input className={inputClass} value={f.description} onChange={e => upd("description", e.target.value)} placeholder="How to use it" /></div>
          <div><label className={labelClass}>Code example</label><textarea className={`${inputClass} font-mono resize-none`} rows={3} value={f.code} onChange={e => upd("code", e.target.value)} placeholder="const x = require('my-package')" /></div>
        </div>
      );
    case "features":
      return (
        <div><label className={labelClass}>Features (one per line)</label><textarea className={`${inputClass} resize-none`} rows={4} value={f.items} onChange={e => upd("items", e.target.value)} placeholder={"Fast\nLightweight\nEasy to use"} /></div>
      );
    case "license":
      return (
        <div><label className={labelClass}>License type</label>
          <select className={inputClass} value={f.type} onChange={e => upd("type", e.target.value)}>
            {["MIT", "Apache 2.0", "GPL v3", "BSD 3-Clause", "ISC", "Unlicensed"].map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
      );
    default:
      return <p className="text-xs text-zinc-600 italic">Auto-generated section</p>;
  }
}

export default function SectionCard({ section, onToggle, onFieldChange }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={`rounded-lg border ${section.enabled ? "border-zinc-700 bg-zinc-900" : "border-zinc-800 bg-zinc-900/40"} transition-all`}>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div {...attributes} {...listeners} className="cursor-grab text-zinc-600 hover:text-zinc-400 select-none">⠿</div>
          <span className={`text-sm font-medium ${section.enabled ? "text-zinc-100" : "text-zinc-600"}`}>{section.label}</span>
        </div>
        <button
          onClick={() => onToggle(section.id)}
          className={`w-8 h-4 rounded-full transition-colors ${section.enabled ? "bg-white" : "bg-zinc-700"}`}
        >
          <div className={`w-3 h-3 rounded-full bg-zinc-950 mx-auto transition-transform ${section.enabled ? "translate-x-1.5" : "-translate-x-1.5"}`} />
        </button>
      </div>
      {section.enabled && (
        <div className="px-4 pb-4">
          <SectionFields section={section} onFieldChange={onFieldChange} />
        </div>
      )}
    </div>
  );
}