import {redirect} from 'next/navigation';
import Link from 'next/link';
import {getIdentity} from '../../lib/supabase';
import MomentForm from './moment-form';
export const dynamic='force-dynamic';
export default async function Momentos(){
 const {db,user,profile}=await getIdentity();if(!user)redirect('/login');if(!profile||profile.role==='pending')redirect('/pendiente');
 const {data:moments,error}=await db.from('moments').select('id,title,description,media_type,media_url,created_at,author_id').eq('organization_id',profile.organization_id).eq('status','visible').order('created_at',{ascending:false}).limit(60);
 const authors=[...new Set((moments||[]).map(m=>m.author_id))];
 const {data:people}=authors.length?await db.from('profiles').select('id,display_name').in('id',authors):{data:[]};
 const names=new Map((people||[]).map(p=>[p.id,p.display_name]));
 return <main className="layout"><header className="nav"><span className="brand">LA 04 / MOMENTOS</span><Link href="/portal">Mi portal</Link></header><h1>Momentos de la familia 🎬</h1><p className="muted">Clips y fotografías que compartimos en la sede.</p><MomentForm/><h2>Galería</h2>{error?<p role="alert">No se pudo cargar la galería.</p>:!moments?.length?<p className="muted">Todavía no hay momentos. ¡Publicá el primero!</p>:<div className="grid">{moments.map(m=><article className="card" key={m.id}><span className="pill">{m.media_type==='clip'?'🎬 Clip':'📸 Foto'}</span><h2>{m.title}</h2>{m.description&&<p>{m.description}</p>}<p className="muted">Por {names.get(m.author_id)||'Miembro de LA 04'} · {new Date(m.created_at).toLocaleDateString('es-AR')}</p><a className="btn" href={m.media_url} target="_blank" rel="noopener noreferrer nofollow">Ver {m.media_type==='clip'?'clip':'foto'} ↗</a></article>)}</div>}</main>
}
