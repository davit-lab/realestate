import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Square, Minus, Trash2, RotateCcw, Download, Layers, Plus, MousePointer, Move } from 'lucide-react';

type DrawMode = 'room' | 'wall' | 'select' | 'move';

interface Room {
 id: string; x: number; y: number; w: number; h: number;
 label: string; fillColor: string; strokeColor: string;
}

interface Wall { id: string; x1: number; y1: number; x2: number; y2: number; }

interface FloorData { rooms: Room[]; walls: Wall[]; }

interface FloorPlanDrawerProps { onChange?: (floors: FloorData[]) => void; }

const GRID = 20;
const sn = (v: number) => Math.round(v / GRID) * GRID;

const ROOM_PRESETS = [
 { label: 'მისაღები', fill: 'rgba(124,58,237,0.08)', stroke: '#7C3AED' },
 { label: 'საძინებელი', fill: 'rgba(59,130,246,0.08)', stroke: '#3B82F6' },
 { label: 'სამზარეულო', fill: 'rgba(245,158,11,0.08)', stroke: '#D97706' },
 { label: 'სააბაზანო', fill: 'rgba(16,185,129,0.08)', stroke: '#059669' },
 { label: 'დერეფანი', fill: 'rgba(107,114,128,0.07)',stroke: '#6B7280' },
 { label: 'ოთახი',  fill: 'rgba(239,68,68,0.07)', stroke: '#DC2626' },
 { label: 'ტუალეტი',  fill: 'rgba(16,185,129,0.06)', stroke: '#6B7280' },
];

export default function FloorPlanDrawer({ onChange }: FloorPlanDrawerProps) {
 const canvasRef = useRef<HTMLCanvasElement>(null);
 const [floors, setFloors] = useState<FloorData[]>([{ rooms: [], walls: [] }]);
 const [activeFloor, setActiveFloor] = useState(0);
 const [mode, setMode] = useState<DrawMode>('room');

 // room drawing
 const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
 const [ghost, setGhost] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

 // wall drawing
 const [wallStart, setWallStart] = useState<{ x: number; y: number } | null>(null);

 // selection & move
 const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
 const [dragOffset, setDragOffset] = useState<{ dx: number; dy: number } | null>(null);
 const [isDragging, setIsDragging] = useState(false);

 // label editor
 const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
 const [labelVal, setLabelVal] = useState('');
 const [labelScreenPos, setLabelScreenPos] = useState({ x: 0, y: 0 });

 // live mouse for wall preview
 const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

 // active preset for new rooms
 const [activePresetIdx, setActivePresetIdx] = useState(0);

 const current = floors[activeFloor];

 // ── canvas coordinate helper ──────────────────────────────────────────
 const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
 const c = canvasRef.current!;
 const r = c.getBoundingClientRect();
 return {
  x: (e.clientX - r.left) * (c.width / r.width),
  y: (e.clientY - r.top) * (c.height / r.height),
 };
 };

 // ── redraw ────────────────────────────────────────────────────────────
 const redraw = useCallback(() => {
 const c = canvasRef.current; if (!c) return;
 const ctx = c.getContext('2d')!;
 ctx.clearRect(0, 0, c.width, c.height);

 // background
 ctx.fillStyle = '#FAFAFA';
 ctx.fillRect(0, 0, c.width, c.height);

 // grid
 ctx.strokeStyle = '#E5E7EB';
 ctx.lineWidth = 0.5;
 for (let x = 0; x <= c.width; x += GRID) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,c.height); ctx.stroke(); }
 for (let y = 0; y <= c.height; y += GRID) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(c.width,y); ctx.stroke(); }

 // rooms
 current.rooms.forEach(room => {
  const sel = room.id === selectedRoomId;

  // room fill
  ctx.fillStyle = room.fillColor;
  ctx.fillRect(room.x, room.y, room.w, room.h);

  // architectural wall border (thick solid)
  ctx.strokeStyle = sel ? room.strokeColor : room.strokeColor + 'CC';
  ctx.lineWidth = sel ? 3 : 2;
  ctx.setLineDash([]);
  ctx.strokeRect(room.x, room.y, room.w, room.h);

  // selection highlight ring
  if (sel) {
  ctx.strokeStyle = room.strokeColor + '40';
  ctx.lineWidth = 6;
  ctx.strokeRect(room.x - 2, room.y - 2, room.w + 4, room.h + 4);
  // corner handles
  const corners: [number,number][] = [[room.x,room.y],[room.x+room.w,room.y],[room.x,room.y+room.h],[room.x+room.w,room.y+room.h]];
  ctx.fillStyle = '#fff';
  ctx.setLineDash([]);
  corners.forEach(([cx,cy]) => {
   ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI*2); ctx.fill();
   ctx.strokeStyle = room.strokeColor; ctx.lineWidth = 2;
   ctx.stroke();
  });
  }

  // dimension labels on sides
  const wm2 = (room.w / GRID).toFixed(0);
  const hm2 = (room.h / GRID).toFixed(0);
  ctx.fillStyle = room.strokeColor + 'BB';
  ctx.font = `500 9px Inter, sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(`${wm2}`, room.x + room.w/2, room.y - 7);
  ctx.save();
  ctx.translate(room.x - 7, room.y + room.h/2);
  ctx.rotate(-Math.PI/2);
  ctx.fillText(`${hm2}`, 0, 0);
  ctx.restore();

  // room label
  const fs = Math.max(10, Math.min(14, Math.min(room.w, room.h) / 5));
  ctx.fillStyle = '#111827';
  ctx.font = `600 ${fs}px Inter, sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (room.h > 30) ctx.fillText(room.label, room.x + room.w/2, room.y + room.h/2 - 7);

  // area
  const m2 = ((room.w * room.h) / (GRID * GRID)).toFixed(1);
  ctx.fillStyle = '#6B7280';
  ctx.font = `${Math.max(9, fs-3)}px Inter, sans-serif`;
  if (room.h > 46) ctx.fillText(`${m2} მ²`, room.x + room.w/2, room.y + room.h/2 + 9);
 });

 // walls (architectural double-line style)
 current.walls.forEach(w => {
  const dx = w.x2-w.x1, dy = w.y2-w.y1;
  const len = Math.sqrt(dx*dx+dy*dy) || 1;
  const nx = (-dy/len)*3, ny = (dx/len)*3;
  ctx.setLineDash([]);
  ctx.lineCap = 'butt';
  // outer line
  ctx.strokeStyle = '#374151'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(w.x1,w.y1); ctx.lineTo(w.x2,w.y2); ctx.stroke();
  // inner light line
  ctx.strokeStyle = '#9CA3AF'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(w.x1+nx,w.y1+ny); ctx.lineTo(w.x2+nx,w.y2+ny); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(w.x1-nx,w.y1-ny); ctx.lineTo(w.x2-nx,w.y2-ny); ctx.stroke();
 });

 // ghost room preview
 if (ghost && mode === 'room' && ghost.w >= GRID && ghost.h >= GRID) {
  const p = ROOM_PRESETS[activePresetIdx];
  ctx.fillStyle = p.fill;
  ctx.fillRect(ghost.x, ghost.y, ghost.w, ghost.h);
  ctx.strokeStyle = p.stroke; ctx.lineWidth = 2; ctx.setLineDash([6,3]);
  ctx.strokeRect(ghost.x, ghost.y, ghost.w, ghost.h);
  ctx.setLineDash([]);
  // dimension overlay
  const gw = (ghost.w/GRID).toFixed(0);
  const gh = (ghost.h/GRID).toFixed(0);
  const area = ((ghost.w*ghost.h)/(GRID*GRID)).toFixed(1);
  ctx.fillStyle = p.stroke;
  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(`${gw} × ${gh} (${area} მ²)`, ghost.x + ghost.w/2, ghost.y + ghost.h/2);
 }

 // wall live preview
 if (wallStart && mousePos && mode === 'wall') {
  ctx.strokeStyle = '#7C3AED'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.setLineDash([8,5]);
  ctx.beginPath(); ctx.moveTo(wallStart.x, wallStart.y);
  ctx.lineTo(mousePos.x, mousePos.y); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#7C3AED';
  ctx.beginPath(); ctx.arc(wallStart.x, wallStart.y, 5, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(wallStart.x, wallStart.y, 2.5, 0, Math.PI*2); ctx.fill();
  // length label
  const dx = mousePos.x-wallStart.x, dy = mousePos.y-wallStart.y;
  const wallLen = (Math.sqrt(dx*dx+dy*dy)/GRID).toFixed(1);
  ctx.fillStyle = '#7C3AED';
  ctx.font = 'bold 10px Inter, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(`${wallLen} ერ.`, (wallStart.x+mousePos.x)/2, (wallStart.y+mousePos.y)/2 - 10);
 }
 }, [current, ghost, wallStart, mousePos, mode, selectedRoomId, activePresetIdx]);

 useEffect(() => { redraw(); }, [redraw]);

 // ── keyboard shortcuts ────────────────────────────────────────────────
 useEffect(() => {
 const onKey = (e: KeyboardEvent) => {
  if ((e.key === 'Delete' || e.key === 'Backspace') && selectedRoomId && !editingRoomId) {
  e.preventDefault();
  setFloors(prev => {
   const updated = prev.map((f,i) => i===activeFloor ? { ...f, rooms: f.rooms.filter(r=>r.id!==selectedRoomId) } : f);
   onChange?.(updated); return updated;
  });
  setSelectedRoomId(null);
  }
  if (e.key === 'Escape') {
  setWallStart(null); setDrawStart(null); setGhost(null); setEditingRoomId(null);
  }
 };
 window.addEventListener('keydown', onKey);
 return () => window.removeEventListener('keydown', onKey);
 }, [selectedRoomId, activeFloor, onChange, editingRoomId]);

 const updateFloors = (updated: FloorData[]) => { setFloors(updated); onChange?.(updated); };

 // ── mouse handlers ────────────────────────────────────────────────────
 const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
 const pos = getPos(e);
 const sx = sn(pos.x), sy = sn(pos.y);

 if (mode === 'room') {
  setDrawStart({ x: sx, y: sy });
 } else if (mode === 'wall') {
  if (!wallStart) {
  setWallStart({ x: sx, y: sy });
  } else {
  const newWall: Wall = { id: `w-${Date.now()}`, x1: wallStart.x, y1: wallStart.y, x2: sx, y2: sy };
  updateFloors(floors.map((f,i) => i===activeFloor ? { ...f, walls: [...f.walls, newWall] } : f));
  setWallStart(null);
  }
 } else if (mode === 'select') {
  const hit = [...current.rooms].reverse().find(r => pos.x>=r.x && pos.x<=r.x+r.w && pos.y>=r.y && pos.y<=r.y+r.h);
  setSelectedRoomId(hit?.id ?? null);
 } else if (mode === 'move') {
  const hit = [...current.rooms].reverse().find(r => pos.x>=r.x && pos.x<=r.x+r.w && pos.y>=r.y && pos.y<=r.y+r.h);
  if (hit) {
  setSelectedRoomId(hit.id);
  setDragOffset({ dx: pos.x - hit.x, dy: pos.y - hit.y });
  setIsDragging(true);
  }
 }
 };

 const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
 const pos = getPos(e);
 setMousePos({ x: sn(pos.x), y: sn(pos.y) });

 if (mode === 'room' && drawStart) {
  const ex = sn(pos.x), ey = sn(pos.y);
  setGhost({ x: Math.min(drawStart.x,ex), y: Math.min(drawStart.y,ey), w: Math.abs(ex-drawStart.x), h: Math.abs(ey-drawStart.y) });
 }

 if (mode === 'move' && isDragging && selectedRoomId && dragOffset) {
  const nx = sn(pos.x - dragOffset.dx), ny = sn(pos.y - dragOffset.dy);
  setFloors(prev => prev.map((f,i) => i===activeFloor
  ? { ...f, rooms: f.rooms.map(r => r.id===selectedRoomId ? { ...r, x: nx, y: ny } : r) } : f));
 }
 };

 const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
 const pos = getPos(e);

 if (mode === 'room' && drawStart) {
  const ex = sn(pos.x), ey = sn(pos.y);
  const w = Math.abs(ex-drawStart.x), h = Math.abs(ey-drawStart.y);
  if (w >= GRID && h >= GRID) {
  const preset = ROOM_PRESETS[activePresetIdx];
  const newRoom: Room = {
   id: `r-${Date.now()}`,
   x: Math.min(drawStart.x,ex), y: Math.min(drawStart.y,ey), w, h,
   label: preset.label, fillColor: preset.fill, strokeColor: preset.stroke,
  };
  updateFloors(floors.map((f,i) => i===activeFloor ? { ...f, rooms: [...f.rooms, newRoom] } : f));
  }
  setDrawStart(null); setGhost(null);
 }

 if (mode === 'move') { setIsDragging(false); setDragOffset(null); onChange?.(floors); }
 };

 const handleDblClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
 const pos = getPos(e);
 const hit = [...current.rooms].reverse().find(r => pos.x>=r.x && pos.x<=r.x+r.w && pos.y>=r.y && pos.y<=r.y+r.h);
 if (hit) {
  setEditingRoomId(hit.id);
  setLabelVal(hit.label);
  const rect = canvasRef.current!.getBoundingClientRect();
  setLabelScreenPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
 }
 };

 const applyLabel = () => {
 if (!editingRoomId) return;
 updateFloors(floors.map((f,i) => i===activeFloor
  ? { ...f, rooms: f.rooms.map(r => r.id===editingRoomId ? { ...r, label: labelVal } : r) } : f));
 setEditingRoomId(null);
 };

 const deleteSelected = () => {
 if (!selectedRoomId) return;
 updateFloors(floors.map((f,i) => i===activeFloor ? { ...f, rooms: f.rooms.filter(r=>r.id!==selectedRoomId) } : f));
 setSelectedRoomId(null);
 };

 const deleteLastWall = () => {
 updateFloors(floors.map((f,i) => i===activeFloor ? { ...f, walls: f.walls.slice(0,-1) } : f));
 };

 const clearFloor = () => { updateFloors(floors.map((f,i) => i===activeFloor ? { rooms:[], walls:[] } : f)); setSelectedRoomId(null); };

 const addFloor = () => {
 const u = [...floors, { rooms:[], walls:[] }]; setFloors(u); setActiveFloor(u.length-1);
 };

 const downloadCanvas = () => {
 const c = canvasRef.current; if (!c) return;
 const a = document.createElement('a');
 a.download = `floor-plan-${activeFloor+1}.png`;
 a.href = c.toDataURL(); a.click();
 };

 const tools: { id: DrawMode; icon: React.ReactNode; label: string; hint: string }[] = [
 { id: 'select', icon: <MousePointer size={14} />, label: 'არჩევა', hint: 'ოთახზე დაჭერით' },
 { id: 'move', icon: <Move size={14} />,   label: 'გადატანა', hint: 'ოთახის გადასაადგილებლად' },
 { id: 'room', icon: <Square size={14} />,  label: 'ოთახი', hint: 'გათრიეთ ოთახის დასახაზად' },
 { id: 'wall', icon: <Minus size={14} />,   label: 'კედელი', hint: wallStart ? '2-ე წერტილი → კლიკი | Esc=გაუქმება' : '1-ლი წერტილი → კლიკი' },
 ];

 const totalArea = current.rooms.reduce((s,r) => s + (r.w*r.h)/(GRID*GRID), 0).toFixed(1);

 return (
 <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm" tabIndex={0}>
  {/* Header */}
  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
  <div className="flex items-center gap-2">
   <Layers size={14} className="text-ss-primary" />
   <span className="font-semibold text-sm text-gray-900">სართულის გეგმა</span>
   <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">ინტერაქტიური</span>
  </div>
  <div className="flex items-center gap-1">
   <button type="button" onClick={deleteLastWall} title="ბოლო კედლის წაშლა"
   className="p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-all cursor-pointer text-xs font-medium px-2">
   ↩ კედელი
   </button>
   <button type="button" onClick={deleteSelected} disabled={!selectedRoomId} title="ოთახის წაშლა"
   className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer disabled:opacity-30">
   <Trash2 size={13} />
   </button>
   <button type="button" onClick={clearFloor} title="სრული გასუფთავება"
   className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer">
   <RotateCcw size={13} />
   </button>
   <button type="button" onClick={downloadCanvas} title="PNG-ად გადმოწერა"
   className="p-1.5 rounded-lg text-gray-400 hover:text-ss-primary hover:bg-ss-primary/5 transition-all cursor-pointer">
   <Download size={13} />
   </button>
  </div>
  </div>

  {/* Floor tabs */}
  <div className="flex items-center gap-0 px-3 pt-2 border-b border-gray-100 overflow-x-auto">
  {floors.map((_, i) => (
   <button key={i} type="button"
   onClick={() => { setActiveFloor(i); setSelectedRoomId(null); setWallStart(null); }}
   className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
    activeFloor === i
    ? 'border-ss-primary text-ss-primary'
    : 'border-transparent text-gray-500 hover:text-gray-800'
   }`}
   >
   {i + 1}. სართული
   </button>
  ))}
  <button type="button" onClick={addFloor}
   className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-gray-400 hover:text-ss-primary transition-all cursor-pointer ml-1">
   <Plus size={12} /> სართული
  </button>
  </div>

  {/* Toolbar */}
  <div className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-50/70 border-b border-gray-100">
  {tools.map(t => (
   <button key={t.id} type="button"
   onClick={() => { setMode(t.id); setWallStart(null); setDrawStart(null); setGhost(null); }}
   title={t.hint}
   className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
    mode === t.id
    ? 'bg-ss-primary text-white shadow-sm'
    : 'bg-white border border-gray-200 text-gray-600 hover:border-ss-primary/40 hover:text-ss-primary'
   }`}
   >
   {t.icon}
   <span className="hidden sm:inline">{t.label}</span>
   </button>
  ))}

  <span className="ml-auto text-xs text-gray-400 hidden sm:block">
   {tools.find(t=>t.id===mode)?.hint}
   {wallStart && mode==='wall' && ' — 🟣 დასაწყისი მითითებულია'}
  </span>
  </div>

  {/* Room type legend */}
  <div className="flex items-center gap-1.5 px-4 py-2 border-b border-gray-100 overflow-x-auto">
  <span className="text-xs text-gray-400 shrink-0 mr-0.5">აკტიური:</span>
  {ROOM_PRESETS.map((p, i) => (
   <button key={i} type="button"
   onClick={() => {
    setActivePresetIdx(i);
    if (selectedRoomId) {
    updateFloors(floors.map((f,fi) => fi===activeFloor
     ? { ...f, rooms: f.rooms.map(r => r.id===selectedRoomId ? { ...r, label: p.label, fillColor: p.fill, strokeColor: p.stroke } : r) }
     : f));
    }
   }}
   title={activePresetIdx === i ? `აქტიური ტიპი` : `არჩევა — ${p.label}`}
   className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border transition-all cursor-pointer shrink-0 ${
    activePresetIdx === i ? 'ring-2 ring-offset-1 opacity-100' : 'opacity-70 hover:opacity-100'
   }`}
   style={{
    background: p.fill,
    borderColor: p.stroke,
    color: p.stroke,
    ...(activePresetIdx === i ? { ringColor: p.stroke } : {})
   }}
   >
   {activePresetIdx === i && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: p.stroke }} />}
   {p.label}
   </button>
  ))}
  </div>

  {/* Canvas */}
  <div className="relative select-none">
  <canvas
   ref={canvasRef}
   width={800}
   height={460}
   className={`w-full block ${mode==='move' ? 'cursor-grab' : 'cursor-crosshair'}`}
   onMouseDown={handleMouseDown}
   onMouseMove={handleMouseMove}
   onMouseUp={handleMouseUp}
   onMouseLeave={() => { setDrawStart(null); setGhost(null); setIsDragging(false); }}
   onDoubleClick={handleDblClick}
  />

  {/* Inline label editor */}
  {editingRoomId && (
   <div
   className="absolute bg-white border border-ss-primary shadow-xl rounded-xl p-2.5 z-20 flex gap-2 items-center"
   style={{ left: Math.min(labelScreenPos.x, 540), top: Math.max(labelScreenPos.y - 50, 8) }}
   >
   <input autoFocus value={labelVal}
    onChange={e => setLabelVal(e.target.value)}
    onKeyDown={e => { if(e.key==='Enter') applyLabel(); if(e.key==='Escape') setEditingRoomId(null); }}
    className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 w-36 focus:outline-none"
    placeholder="ოთახის სახელი"
   />
   <button type="button" onClick={applyLabel}
    className="bg-ss-primary text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer">
    OK
   </button>
   <button type="button" onClick={() => setEditingRoomId(null)}
    className="text-gray-400 hover:text-gray-700 text-base cursor-pointer px-1">✕</button>
   </div>
  )}
  </div>

  {/* Summary */}
  <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
  <div className="flex items-center gap-4 text-xs text-gray-500">
   <span><span className="font-semibold text-gray-800">{current.rooms.length}</span> ოთახი</span>
   <span><span className="font-semibold text-gray-800">{current.walls.length}</span> კედელი</span>
   <span>სულ: <span className="font-semibold text-ss-primary">{totalArea} მ²</span></span>
  </div>
  <div className="text-xs text-gray-400">
   {selectedRoomId
   ? <span className="text-ss-primary font-medium">✓ ოთახი არჩეულია · Delete=წაშლა · 2×კლიკი=სახელი</span>
   : <span>2×კლიკი ოთახზე → სახელის შეცვლა</span>
   }
  </div>
  </div>
 </div>
 );
}
