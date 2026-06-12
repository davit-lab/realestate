import React, { useState, useEffect, useMemo } from 'react';
import {
 LayoutDashboard, Home, Users, CreditCard, Crown, MessageSquare,
 AlertTriangle, FileText, Settings, Moon, Sun, Shield
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Listing, AdminStats, AdminUserExtended, AdminTransaction, UserPackage, SupportTemplate, SiteSetting, Announcement } from '../../types';
import { defaultSupportTemplates } from '../../data/supportTemplates';
import DashboardTab from './DashboardTab';
import ListingsTab from './ListingsTab';
import UsersTab from './UsersTab';
import TransactionsTab from './TransactionsTab';
import PackagesTab from './PackagesTab';
import SupportTab from './SupportTab';
import TemplatesTab from './TemplatesTab';
import SiteTab from './SiteTab';
import ChatsTab from './ChatsTab';

export const PURPLE = '#7C3AED';
export const PURPLE_LIGHT = '#A78BFA';
export const PURPLE_PALE = '#C4B5FD';
export const PURPLE_FAINT = '#DDD6FE';
export const CHART_COLORS = [PURPLE, PURPLE_LIGHT, PURPLE_PALE, PURPLE_FAINT, '#9CA3AF'];

export interface SupportTicket {
 id: string; user_id: string; subject: string; message: string;
 status: 'open' | 'in_progress' | 'resolved' | 'closed';
 priority: 'low' | 'normal' | 'high' | 'urgent';
 admin_response: string | null; created_at: string; user_name?: string;
}

interface Props { localListings: Listing[]; onDeleteListing: (id: string) => void; }

export const fmtDate = (d: string) => new Date(d).toLocaleDateString('ka-GE', { day: '2-digit', month: 'short' });
export const fmtGEL = (n: number) => `${n.toFixed(2)} GEL`;
export const _flash = (msg: string, s: React.Dispatch<React.SetStateAction<string|null>>) => { s(msg); setTimeout(()=>s(null), 3000); };

export default function AdminPanel({ localListings, onDeleteListing }: Props) {
 const { user } = useAuth();
 const [sub, setSub] = useState('dashboard');
 const [isDark, setIsDark] = useState(false);
 const [feedback, setFeedback] = useState<string|null>(null);
 const [search, setSearch] = useState('');

 const [users, setUsers] = useState<AdminUserExtended[]>([]);
 const [dbListings, setDbListings] = useState<any[]>([]);
 const [tickets, setTickets] = useState<SupportTicket[]>([]);
 const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
 const [packages, setPackages] = useState<UserPackage[]>([]);
 const [templates, setTemplates] = useState<SupportTemplate[]>([]);
 const [settings, setSettings] = useState<SiteSetting[]>([]);
 const [announcements, setAnnouncements] = useState<Announcement[]>([]);
 const [stats, setStats] = useState<AdminStats>({ totalListings:0,totalUsers:0,totalBalance:0,recentListings:0,totalRevenue:0,totalTransactions:0,openTickets:0,activePackages:0 });
 const [loading, setLoading] = useState<Record<string,boolean>>({});

 // ── Data loaders ──
 const loadUsers = async () => { if(!isSupabaseConfigured)return; setLoading(l=>({...l,users:true})); const {data:prof}=await supabase.from('profiles').select('*').order('created_at',{ascending:false}); const {data:em}=await supabase.from('admin_user_emails').select('*'); const emMap=new Map((em||[]).map((e:any)=>[e.id,e])); setUsers((prof||[]).map((p:any)=>({...p,email:emMap.get(p.id)?.email||'—',user_created_at:emMap.get(p.id)?.user_created_at||p.created_at,last_sign_in_at:emMap.get(p.id)?.last_sign_in_at}))); setLoading(l=>({...l,users:false})); };
 const loadDbListings = async () => { if(!isSupabaseConfigured)return; setLoading(l=>({...l,listings:true})); const {data}=await supabase.from('properties').select('*').order('created_at',{ascending:false}).limit(200); setDbListings(data||[]); setLoading(l=>({...l,listings:false})); };
 const loadTickets = async () => { if(!isSupabaseConfigured)return; setLoading(l=>({...l,tickets:true})); const {data}=await supabase.from('support_tickets').select('*, profiles(name)').order('created_at',{ascending:false}).limit(100); setTickets((data||[]).map((t:any)=>({...t,user_name:t.profiles?.name||'უცნობი'}))); setLoading(l=>({...l,tickets:false})); };
 const loadTransactions = async () => { if(!isSupabaseConfigured)return; setLoading(l=>({...l,transactions:true})); const {data}=await supabase.from('transactions').select('*, profiles(name)').order('created_at',{ascending:false}).limit(200); setTransactions((data||[]).map((t:any)=>({...t,user_name:t.profiles?.name||'უცნობი'}))); setLoading(l=>({...l,transactions:false})); };
 const loadPackages = async () => { if(!isSupabaseConfigured)return; setLoading(l=>({...l,packages:true})); const {data}=await supabase.from('user_packages').select('*, profiles(name)').order('created_at',{ascending:false}).limit(200); setPackages((data||[]).map((p:any)=>({...p,user_name:p.profiles?.name||'უცნობი'}))); setLoading(l=>({...l,packages:false})); };
 const loadStats = async () => { if(!isSupabaseConfigured)return; const [{count:lc},{data:ud},{data:td},{data:pkg},{count:tc}]=await Promise.all([supabase.from('properties').select('*',{count:'exact',head:true}),supabase.from('profiles').select('balance'),supabase.from('transactions').select('amount,type'),supabase.from('user_packages').select('id'),supabase.from('support_tickets').select('*',{count:'exact',head:true}).eq('status','open')]); const totalBalance=(ud||[]).reduce((s:number,r:any)=>s+(r.balance||0),0); const totalRevenue=(td||[]).filter((t:any)=>t.type==='refill'||t.type==='package_purchase').reduce((s:number,r:any)=>s+(r.amount||0),0); setStats({totalListings:(lc??0)+localListings.length,totalUsers:ud?.length??0,totalBalance,recentListings:localListings.length,totalRevenue,totalTransactions:td?.length??0,openTickets:tc??0,activePackages:pkg?.length??0}); };
 const loadSettings = async () => { if(!isSupabaseConfigured)return; const {data}=await supabase.from('site_settings').select('*').order('key'); setSettings(data||[]); const {data:ann}=await supabase.from('announcements').select('*').order('created_at',{ascending:false}); setAnnouncements(ann||[]); };
 const loadTemplates = async () => { if(!isSupabaseConfigured){setTemplates(defaultSupportTemplates.map(t=>({...t,usage_count:0,is_active:true,created_at:new Date().toISOString(),updated_at:new Date().toISOString()}))); return;} const {data}=await supabase.from('support_templates').select('*').order('usage_count',{ascending:false}); if(data&&data.length>0)setTemplates(data); else setTemplates(defaultSupportTemplates.map(t=>({...t,usage_count:0,is_active:true,created_at:new Date().toISOString(),updated_at:new Date().toISOString()}))); };

 useEffect(()=>{loadStats();},[localListings]);
 useEffect(()=>{ if(sub==='users')loadUsers(); if(sub==='listings')loadDbListings(); if(sub==='support')loadTickets(); if(sub==='transactions')loadTransactions(); if(sub==='packages')loadPackages(); if(sub==='site')loadSettings(); if(sub==='templates')loadTemplates(); },[sub]);

 // ── Actions ──
 const adjustBal = async (uid:string,mode:'add'|'deduct',amount:number,reason:string)=>{ if(!isSupabaseConfigured||amount<=0)return; const {data:cur}=await supabase.from('profiles').select('balance').eq('id',uid).single(); const newBal=mode==='add'?(cur?.balance||0)+amount:Math.max(0,(cur?.balance||0)-amount); await supabase.from('profiles').update({balance:newBal}).eq('id',uid); await supabase.from('transactions').insert({user_id:uid,amount:mode==='add'?amount:-amount,type:mode==='add'?'refill':'deduct',description:reason||`Admin ${mode==='add'?'refill':'deduct'}`,admin_id:user?.id}); setUsers(p=>p.map(u=>u.id===uid?{...u,balance:newBal}:u)); _flash(`${amount} GEL ${mode==='add'?'ჩარიცხულია':'ჩამოჭრილია'}`,setFeedback); loadStats(); };
 const toggleAdmin = async (uid:string,cur:boolean)=>{ if(!isSupabaseConfigured)return; await supabase.from('profiles').update({is_admin:!cur}).eq('id',uid); setUsers(p=>p.map(u=>u.id===uid?{...u,is_admin:!cur}:u)); _flash(`Admin ${!cur?'მიენიჭა':'გაუქმდა'}`,setFeedback); };
 const toggleAgent = async (uid:string,cur:boolean)=>{ if(!isSupabaseConfigured)return; await supabase.from('profiles').update({is_agent:!cur}).eq('id',uid); setUsers(p=>p.map(u=>u.id===uid?{...u,is_agent:!cur}:u)); _flash(`აგენტი ${!cur?'მიენიჭა':'გაუქმდა'}`,setFeedback); };
 const delDbListing = async (id:string)=>{ if(!isSupabaseConfigured)return; await supabase.from('properties').delete().eq('id',id); setDbListings(p=>p.filter(l=>l.id!==id)); _flash('განცხადება წაიშალა',setFeedback); };
 const updTicket = async (id:string,status:string,response?:string)=>{ if(!isSupabaseConfigured)return; const up:any={status}; if(response!==undefined)up.admin_response=response; await supabase.from('support_tickets').update(up).eq('id',id); setTickets(p=>p.map(t=>t.id===id?{...t,status,admin_response:response||t.admin_response}:t)); _flash('ბილეთი განახლდა',setFeedback); };
 const assignPkg = async (uid:string,ptype:'vip'|'vip_plus'|'super_vip',listings:number,days:number)=>{ if(!isSupabaseConfigured)return; const ex=new Date();ex.setDate(ex.getDate()+days); await supabase.from('user_packages').insert({user_id:uid,package_type:ptype,listings_remaining:listings,total_listings:listings,assigned_by:user?.id,expires_at:ex.toISOString()}); await supabase.from('transactions').insert({user_id:uid,amount:0,type:'package_purchase',description:`Admin assigned ${ptype}`,admin_id:user?.id}); _flash('პაკეტი მინიჭებულია',setFeedback); loadPackages();loadStats(); };
 const revokePkg = async (pid:string)=>{ if(!isSupabaseConfigured)return; await supabase.from('user_packages').delete().eq('id',pid); setPackages(p=>p.filter(p=>p.id!==pid)); _flash('პაკეტი გაუქმებულია',setFeedback); loadStats(); };
 const saveSetting = async (key:string,value:string)=>{ if(!isSupabaseConfigured)return; await supabase.from('site_settings').update({value,updated_at:new Date().toISOString()}).eq('key',key); setSettings(p=>p.map(s=>s.key===key?{...s,value}:s)); _flash('პარამეტრი შენახულია',setFeedback); };
 const saveAnn = async (id:string|null,content:string,isActive:boolean)=>{ if(!isSupabaseConfigured)return; if(id){await supabase.from('announcements').update({content,is_active:isActive}).eq('id',id); setAnnouncements(p=>p.map(a=>a.id===id?{...a,content,is_active:isActive}:a));} else {const {data}=await supabase.from('announcements').insert({content,is_active:isActive}).select().single(); if(data)setAnnouncements(p=>[data,...p]);} _flash('განცხადება შენახულია',setFeedback); };
 const delAnn = async (id:string)=>{ if(!isSupabaseConfigured)return; await supabase.from('announcements').delete().eq('id',id); setAnnouncements(p=>p.filter(a=>a.id!==id)); _flash('განცხადება წაიშალა',setFeedback); };

 const nav=[{id:'dashboard',label:'Dashboard',icon:LayoutDashboard},{id:'listings',label:'განცხადებები',icon:Home},{id:'users',label:'მომხმარებლები',icon:Users},{id:'transactions',label:'ტრანზაქციები',icon:CreditCard},{id:'packages',label:'VIP პაკეტები',icon:Crown},{id:'chats',label:'ჩატები',icon:MessageSquare},{id:'support',label:'საპორტი',icon:AlertTriangle},{id:'templates',label:'შაბლონები',icon:FileText},{id:'site',label:'საიტის პარამეტრები',icon:Settings}];
 const txtMain=isDark?'text-white':'text-gray-900'; const txtSub=isDark?'text-gray-400':'text-gray-500'; const bgCard=isDark?'bg-[#1A1A1E]':'bg-white'; const brdCard=isDark?'border-[#2A2A32]':'border-gray-200'; const bgPage=isDark?'bg-[#0F0F11]':'bg-gray-50';

 const commonProps = { isDark, txtMain, txtSub, bgCard, brdCard, bgPage, feedback, setFeedback, search, setSearch };

 return (
 <div className={`min-h-screen w-full font-sans ${bgPage}`}>
  <div className="max-w-[1400px] mx-auto flex">
  <aside className={`w-60 shrink-0 sticky top-0 h-screen border-r p-4 flex flex-col gap-0.5 ${isDark?'border-[#2A2A32] bg-[#0F0F11]':'border-gray-200 bg-white'}`}>
   <div className="flex items-center gap-2 mb-6 px-2">
   <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:PURPLE}}><Shield size={16} className="text-white"/></div>
   <div><h1 className={`text-sm font-black ${txtMain}`}>ადმინი</h1><p className={`text-[10px] ${txtSub}`}>სრული კონტროლი</p></div>
   </div>
   {nav.map(({id,label,icon:Icon})=>(
   <button key={id} onClick={()=>setSub(id)} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all cursor-pointer ${sub===id?'text-white shadow-md':isDark?'text-gray-400 hover:text-white hover:bg-[#1A1A1E]':'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`} style={sub===id?{background:PURPLE}:{}}>
    <Icon size={15}/>{label}
   </button>
   ))}
   <div className="mt-auto pt-3 border-t" style={{borderColor:isDark?'#2A2A32':'#E5E7EB'}}>
   <button onClick={()=>setIsDark(d=>!d)} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-semibold w-full transition-colors cursor-pointer ${isDark?'text-gray-400 hover:text-white hover:bg-[#1A1A1E]':'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
    {isDark?<Sun size={15}/>:<Moon size={15}/>}{isDark?'ნათელი რეჟიმი':'ბნელი რეჟიმი'}
   </button>
   </div>
  </aside>

  <main className="flex-1 p-5 overflow-auto">
   <div className="flex items-center justify-between mb-5">
   <div>
    <h2 className={`text-xl font-black ${txtMain}`}>{nav.find(n=>n.id===sub)?.label}</h2>
    <p className={`text-xs ${txtSub} mt-0.5`}>
    {sub==='dashboard'&&'პლატფორმის მიმოხილვა და ანალიტიკა'}
    {sub==='listings'&&'ყველა განცხადების მართვა'}
    {sub==='users'&&'მომხმარებლების დირექტორია'}
    {sub==='transactions'&&'ფინანსური ოპერაციების ჟურნალი'}
    {sub==='packages'&&'VIP პაკეტების მინიჭება და მართვა'}
    {sub==='chats'&&'ყველა საუბრის მონიტორინგი'}
    {sub==='support'&&'მხარდაჭერის ბილეთები'}
    {sub==='templates'&&'შაბლონების ბიბლიოთეკა'}
    {sub==='site'&&'საიტის გლობალური პარამეტრები'}
    </p>
   </div>
   </div>

   {sub==='dashboard'&&<DashboardTab stats={stats} localListings={localListings} dbListings={dbListings} onDeleteLocal={onDeleteListing} {...commonProps} />}
   {sub==='listings'&&<ListingsTab listings={[...dbListings,...localListings.filter(l=>!dbListings.find(d=>d.id===l.id))]} loading={loading.listings||false} onRefresh={loadDbListings} onDelete={delDbListing} onDeleteLocal={onDeleteListing} {...commonProps} />}
   {sub==='users'&&<UsersTab users={users} loading={loading.users||false} onRefresh={loadUsers} onToggleAdmin={toggleAdmin} onToggleAgent={toggleAgent} onAdjustBalance={adjustBal} {...commonProps} />}
   {sub==='transactions'&&<TransactionsTab transactions={transactions} loading={loading.transactions||false} onRefresh={loadTransactions} {...commonProps} />}
   {sub==='packages'&&<PackagesTab packages={packages} users={users} loading={loading.packages||false} onRefresh={loadPackages} onAssign={assignPkg} onRevoke={revokePkg} {...commonProps} />}
   {sub==='chats'&&<ChatsTab {...commonProps} />}
   {sub==='support'&&<SupportTab tickets={tickets} templates={templates} loading={loading.tickets||false} onRefresh={loadTickets} onUpdate={updTicket} {...commonProps} />}
   {sub==='templates'&&<TemplatesTab templates={templates} onRefresh={loadTemplates} {...commonProps} />}
   {sub==='site'&&<SiteTab settings={settings} announcements={announcements} onSaveSetting={saveSetting} onSaveAnn={saveAnn} onDeleteAnn={delAnn} {...commonProps} />}
  </main>
  </div>
 </div>
 );
}
