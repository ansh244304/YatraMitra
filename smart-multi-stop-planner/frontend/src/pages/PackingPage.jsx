import { useEffect, useState } from 'react';
import { packingApi } from '../api/client';
import '../Pages.css';

export default function PackingPage() {
  const [lists,setLists]=useState([]); const [destination,setDestination]=useState(''); const [category,setCategory]=useState('general'); const [weather,setWeather]=useState(''); const [days,setDays]=useState(3); const [msg,setMsg]=useState('');
  const load=async()=>{ try{ const d=await packingApi.list(); setLists(d.items||[]);}catch(e){setMsg(e.message);} };
  useEffect(()=>{load();},[]);
  async function generate(e){ e.preventDefault(); setMsg(''); try{ await packingApi.generate({ destination, category, days:Number(days)||1, weather }); setMsg('Packing list generated and saved.'); load(); }catch(e){setMsg(e.message);} }
  async function toggle(list){ const items=list.items.map(i=>({...i, packed: !i.packed && i === undefined ? i.packed : i.packed})); /* handled per item below */ }
  async function toggleItem(list, idx){ const items=list.items.map((it,i)=> i===idx?{...it, packed:!it.packed}:it); try{ const d=await packingApi.update(list._id,{ items }); setLists(ls=>ls.map(l=>l._id===list._id?d.item:l)); }catch(e){setMsg(e.message);} }
  async function remove(id){ try{ await packingApi.remove(id); setLists(ls=>ls.filter(l=>l._id!==id)); }catch(e){setMsg(e.message);} }
  return (<main className="main-content"><div className="page-heading"><div><p className="section-kicker">Smart packing</p><h1>Packing recommendations</h1><p>Generate checklists based on destination, weather, and category.</p></div></div>
    <section className="planner-card"><h2>Generate packing list</h2>
      <form onSubmit={generate} className="ai-brief-form">
        <div className="form-group"><label>Destination</label><input value={destination} onChange={e=>setDestination(e.target.value)} /></div>
        <div className="form-group"><label>Category</label><select value={category} onChange={e=>setCategory(e.target.value)}><option value="general">General</option><option value="mountain">Mountain</option><option value="beach">Beach</option><option value="cold">Cold</option><option value="adventure">Adventure</option><option value="religious">Religious</option></select></div>
        <div className="form-group"><label>Weather hint</label><input value={weather} onChange={e=>setWeather(e.target.value)} placeholder="e.g. rainy, hot, cold" /></div>
        <div className="form-group"><label>Trip days</label><input type="number" min="1" value={days} onChange={e=>setDays(e.target.value)} /></div>
        <button className="plan-button" type="submit">Generate & save</button>
      </form>{msg && <p className="ai-status">{msg}</p>}
    </section>
    {lists.map(list=>(<section className="planner-card" key={list._id}><div className="card-heading"><div><h2>{list.destination||'Packing list'}</h2><p>{new Date(list.updatedAt||list.createdAt).toLocaleString()}</p></div><button className="remove-button" onClick={()=>remove(list._id)}>Delete</button></div>
      <ul className="notes-list">{(list.items||[]).map((it,idx)=>(<li key={idx}><label style={{display:'flex',gap:8,alignItems:'center'}}><input type="checkbox" checked={!!it.packed} onChange={()=>toggleItem(list,idx)} /> <span style={{textDecoration: it.packed?'line-through':'none'}}>{it.name}</span> <small>({it.category||'general'})</small></label></li>))}</ul>
    </section>))}
  </main>);
}
