"use client";
import { useCallback, useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { api, download, type WorkOrder } from "@/lib/resources";

export default function WorkOrdersPage() {
  const { pumps, stationName, openPump, showToast, can } = useAppContext();
  const [items, setItems] = useState<WorkOrder[]>([]);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(() => api<WorkOrder[]>("/work-orders").then(setItems).catch((e: Error) => setError(e.message)), []);
  useEffect(() => { void load(); }, [load]);
  async function setStatus(id: string, status: string) { await api(`/work-orders/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }); showToast("Work order updated"); await load(); }
  async function exportCsv() { try { await download("/exports/work-orders.csv", "flowgard-work-orders.csv"); showToast("CSV downloaded"); } catch (e) { showToast((e as Error).message); } }
  return <div className="animate-fade-in-up">
    <header className="mb-6 flex items-start justify-between gap-4"><div><h1>Work orders</h1><p className="mt-1 text-sm text-muted-foreground">Backend work orders generated from predictive risk.</p></div><Button onClick={exportCsv}><Icon name="download" className="mr-2 h-4 w-4"/>Export CSV</Button></header>
    {error && <p className="mb-3 text-sm text-red">{error}</p>}
    <Card padded={false}><div className="overflow-x-auto p-5"><table className="w-full min-w-[820px] border-collapse"><thead><tr>{["Reference","Pump","Station","Issue","Priority","Due","Status","Action"].map(h=><th key={h} className="border-b border-border px-2 py-2 text-left text-muted-foreground">{h}</th>)}</tr></thead><tbody>{items.map(item=>{const pump=pumps.find(p=>p.id===item.pump_id); return <tr key={item.id} className="hover:bg-muted/50"><td className="border-b border-border px-2 py-3 font-mono text-xs">{item.id.slice(0,8)}</td><td className="border-b border-border px-2 py-3 font-semibold"><button onClick={()=>pump&&openPump(pump.pump_id)}>{pump?.pump_id??item.pump_id.slice(0,8)}</button></td><td className="border-b border-border px-2 py-3">{pump?stationName(pump.station_code):"—"}</td><td className="max-w-xs border-b border-border px-2 py-3">{item.title}</td><td className="border-b border-border px-2 py-3"><Badge tone={item.priority==="high"?"critical":"watch"}>{item.priority}</Badge></td><td className="border-b border-border px-2 py-3">{item.due_at?new Date(item.due_at).toLocaleDateString():"Unscheduled"}</td><td className="border-b border-border px-2 py-3"><Badge tone={item.status==="closed"?"healthy":"info"}>{item.status}</Badge></td><td className="border-b border-border px-2 py-3">{item.status!=="closed"&&can("manage_work_orders")?<Button size="sm" variant="ghost" onClick={()=>setStatus(item.id,"closed")}>Close</Button>:"—"}</td></tr>})}</tbody></table>{items.length===0&&<p className="py-10 text-center text-sm text-muted-foreground">No work orders.</p>}</div></Card>
  </div>;
}
