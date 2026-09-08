"use client";
import { useId, useState } from "react";
import { saveSettings } from "../crud-actions";
import { heroMediaSchema, type HeroMediaConfig } from "@/lib/hero-media-config";
import { Button } from "@/components/ui/button";
export function HeroMediaEditor({initial}: {initial: HeroMediaConfig}) {
  const id = useId();
  const [config, setConfig] = useState(initial);
  const [path, setPath] = useState("/");
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [type, setType] = useState<"image"|"video">("image");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const key = path.trim().replace(/\/$/, "") || "/";
  const items = config[key] ?? [];
  const update = (next: typeof items) => setConfig({...config, [key]:next});
  async function upload(files: FileList | null) {
    if (!files?.length) return;
    if (!/^\/(?:[a-z0-9-]+\/?)*$/.test(key)) {setMessage("Enter a page path first.");return;}
    if (!alt.trim()) {setMessage("Add a description before uploading. You can edit each description below.");return;}
    if (items.length + files.length > 12) {setMessage("Use up to 12 items per page.");return;}
    setBusy(true);setMessage("");
    const added: typeof items = [];
    try {
      for (const file of Array.from(files)) {
        if (!['image/jpeg','image/png','image/webp','image/gif','image/avif','video/mp4','video/webm'].includes(file.type)) throw Error("Use JPG, PNG, WebP, GIF, AVIF, MP4 or WebM files.");
        if (file.size > 4 * 1024 * 1024) throw Error("Each upload must be under 4 MB. Use a direct HTTPS link for larger videos.");
        const form = new FormData();form.append('file',file);
        const response = await fetch('/api/upload',{method:'POST',body:form});
        const data = await response.json();
        if (!response.ok || !data.url) throw Error(data.error || 'Upload failed');
        added.push({url:data.url,type:file.type.startsWith('video/')?'video':'image',alt:alt.trim()});
      }
      setMessage("Uploaded. Review the list, then save hero media.");
    } catch(error) {setMessage(error instanceof Error ? error.message : "Upload failed");}
    finally {if(added.length) update([...items,...added]);setBusy(false);}
  }
  const input = "rounded-lg border border-border bg-background p-3 text-sm";
  return <section className="flex flex-col gap-4 rounded-xl border border-border p-5">
    <h2 className="text-xl font-semibold">Hero images and videos</h2>
    <p className="text-sm text-muted-foreground">Choose any public page path, including project/article pages. Images rotate every 5.5 seconds; videos advance when finished. Leave the list empty to keep the current hero. Uploads go to R2; direct links stay at their original host.</p>
    <label htmlFor={`${id}-path`}>Page path</label>
    <input id={`${id}-path`} list={`${id}-pages`} value={path} disabled={busy} onChange={e=>{setPath(e.target.value);setMessage("");}} placeholder="/about or /projects/project-slug" className={input} />
    <datalist id={`${id}-pages`}>{[...new Set(['/', '/about','/projects','/solutions','/blog','/research','/contact','/careers','/pricing','/industries','/tools',...Object.keys(config)])].map(p=><option key={p} value={p}/>)}</datalist>
    <label htmlFor={`${id}-alt`}>Image description / video title</label>
    <input id={`${id}-alt`} value={alt} disabled={busy} onChange={e=>setAlt(e.target.value)} className={input}/>
    <label htmlFor={`${id}-upload`}>Upload one or more images or videos (4 MB per file)</label>
    <input id={`${id}-upload`} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/webm" disabled={busy} onChange={e=>{void upload(e.target.files);e.target.value='';}} />
    <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
      <div className="flex flex-col gap-2"><label htmlFor={`${id}-url`}>Or paste a direct HTTPS media link</label><input id={`${id}-url`} type="url" value={url} onChange={e=>setUrl(e.target.value)} className={input}/></div>
      <div className="flex flex-col gap-2"><label htmlFor={`${id}-type`}>Media type</label><select id={`${id}-type`} value={type} onChange={e=>setType(e.target.value as typeof type)} className={input}><option value="image">Image</option><option value="video">Video (MP4/WebM)</option></select></div>
      <Button type="button" disabled={busy} className="self-end" onClick={()=>{const next=[...items,{url:url.trim(),alt:alt.trim(),type}];const parsed=heroMediaSchema.safeParse({[key]:next});if(!parsed.success){setMessage("Enter a valid page path, HTTPS URL and description; maximum 12 items.");return;}update(next);setUrl('');setMessage('Added. Save hero media to publish.');}}>Add link</Button>
    </div>
    <ol className="flex flex-col gap-3">{items.map((item,index)=><li key={index} className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3">
      <span className="text-sm">{index+1}. {item.type}</span>
      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline">Preview media {index+1}</a>
      <input aria-label={`Description for media ${index+1}`} disabled={busy} value={item.alt} onChange={e=>update(items.map((entry,i)=>i===index?{...entry,alt:e.target.value}:entry))} className={`${input} min-w-0 flex-1`} />
      <Button type="button" disabled={busy||index===0} variant="outline" aria-label={`Move media ${index+1} earlier`} onClick={()=>{const next=[...items];[next[index-1],next[index]]=[next[index],next[index-1]];update(next);}}>Move earlier</Button>
      <Button type="button" disabled={busy} variant="outline" aria-label={`Remove media ${index+1}`} onClick={()=>update(items.filter((_,i)=>i!==index))}>Remove</Button>
    </li>)}</ol>
    <Button type="button" disabled={busy} className="w-fit" onClick={async()=>{setBusy(true);try {const result=await saveSettings({hero_media_config:JSON.stringify(config)});setMessage(result.error||'Hero media saved.');}catch{setMessage('Could not save. Please retry.');}finally{setBusy(false);}}}>{busy?'Working…':'Save hero media'}</Button>
    <p role="status" className="text-sm">{message}</p>
  </section>;
}
