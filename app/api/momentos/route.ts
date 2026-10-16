import {NextResponse} from 'next/server';
import {getIdentity} from '../../../lib/supabase';
export async function POST(request:Request){
 const {db,user,profile}=await getIdentity();
 if(!user||!profile||!['member','recruiter','manager','leader','owner'].includes(profile.role))return NextResponse.json({error:'Cuenta no autorizada'},{status:403});
 let data:Record<string,unknown>;try{data=await request.json()}catch{return NextResponse.json({error:'Datos inválidos'},{status:400})}
 const {media_type,title,media_url,description}=data;
 if(!['clip','photo'].includes(String(media_type))||typeof title!=='string'||!title.trim()||title.length>120||typeof description!=='string'||description.length>2000||typeof media_url!=='string'||media_url.length>2048)return NextResponse.json({error:'Revisá los campos de la publicación'},{status:400});
 let parsed:URL;try{parsed=new URL(media_url)}catch{return NextResponse.json({error:'Enlace inválido'},{status:400})}
 if(parsed.protocol!=='https:'||!parsed.hostname.includes('.')||parsed.username||parsed.password||['localhost','127.0.0.1'].includes(parsed.hostname))return NextResponse.json({error:'Usá un enlace público HTTPS válido'},{status:400});
 const {error}=await db.from('moments').insert({organization_id:profile.organization_id,author_id:user.id,media_type,title:title.trim(),description:description.trim(),media_url:parsed.toString()});
 if(error)return NextResponse.json({error:'No se pudo guardar la publicación'},{status:400});
 return NextResponse.json({ok:true},{status:201});
}
