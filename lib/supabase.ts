import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
export function browserDb(){return createBrowserClient(url,key)}
export async function serverDb(){const store=await cookies();return createServerClient(url,key,{cookies:{getAll(){return store.getAll()},setAll(items){try{items.forEach(({name,value,options})=>store.set(name,value,options))}catch{}}}})}
export async function getIdentity(){const db=await serverDb();const {data:{user}}=await db.auth.getUser();if(!user)return {db,user:null,profile:null};const {data:profile}=await db.from('profiles').select('id,display_name,role,organization_id,server_id').eq('id',user.id).maybeSingle();return {db,user,profile}}
