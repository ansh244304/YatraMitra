import { useEffect, useState } from 'react';
import { historyApi } from '../api/client';
import '../Pages.css';

const empty = { destination:'', country:'', startDate:'', endDate:'', expenses:'', transportation:'', hotel:'', notes:'', rating:'' };
export default function TravelHistoryPage() {
  const [items,setItems]=useState([]); const [form,setForm]=useState(empty); const [msg,setMsg]=useState('');
  const load=async()=>{ try{ const d=await historyApi.list(); setItems(d.items||[]);}catch(e){setMsg(e.message);} };
  useEffect(()=>{load();},[]);
  async function add(e){ e.preventDefault(); try{ await historyApi.add({...form, expenses:Number(form.expenses)||0, rating:Number(form.rating)||0}); setForm(empty); setMsg('Trip history saved.'); load(); }catch(e){setMsg(e.message);} }
  async function del(id){ try{ await historyApi.remove(id); setItems(i=>i.filter(x=>x._id!==id)); }catch(e){setMsg(e.message);} }
  const set=k=>e=>setForm(f=>({...f,[k]:e.target.value}));
  return (<main className="main-content"><div className="page-heading"><div><p className="section-kicker">Your journeys</p><h1>Travel history</h1><p>Keep track of your completed trips.</p></div></div>
    <section className="planner-card"><h2>Add completed trip</h2>
      <form onSubmit={add} className="ai-brief-form">
        <div className="form-group"><label>Destination</label><input value={form.destination} onChange={set('destination')} required /></div>
        <div className="form-group"><label>Country</label><input value={form.country} onChange={set('country')} /></div>
        <div className="form-group"><label>Start date</label><input type="date" value={form.startDate} onChange={set('startDate')} /></div>
        <div className="form-group"><label>End date</label><input type="date" value={form.endDate} onChange={set('endDate')} /></div>
        <div className="form-group"><label>Expenses</label><input type="number" value={form.expenses} onChange={set('expenses')} /></div>
        <div className="form-group"><label>Transportation</label><input value={form.transportation} onChange={set('transportation')} /></div>
        <div className="form-group"><label>Hotel</label><input value={form.hotel} onChange={set('hotel')} /></div>
        <div className="form-group"><label>Rating (1-5)</label><input type="number" min="0" max="5" value={form.rating} onChange={set('rating')} /></div>
        <div className="form-group"><label>Notes</label><textarea value={form.notes} onChange={set('notes')} /></div>
        <button className="plan-button" type="submit">Save to history</button>
      </form>{msg && <p className="ai-status">{msg}</p>}
    </section>
    <section className="planner-card"><h2>History</h2>
      {items.length===0?<p className="empty-note">No trips recorded yet.</p>:<div className="table-list">{items.map(i=>(<article className="alert-row" key={i._id}><div className="alert-body"><strong>{i.destination}</strong><p>{i.country} {i.transportation?`• ${i.transportation}`:''} {i.expenses?`• ₹${i.expenses}`:''}</p><span className="alert-meta">{i.startDate?new Date(i.startDate).toLocaleDateString():''} {i.notes||''}</span></div><button className="remove-button" onClick={()=>del(i._id)}>Delete</button></article>))}</div>}
    </section></main>);
}
