# LA 04 Command Center — MVP 0.2

Proyecto independiente de la calculadora. Next.js + Supabase.

## Registro jerárquico
- Registro autónomo en `/registro`, con email, contraseña, nombre RP, ID y rango solicitado.
- Perfil nuevo siempre `pending`; nunca se confía en metadatos del usuario para asignar permisos.
- Gerente aprueba miembro/reclutador; líder también gerente; owner también líder.
- Un solicitante no puede aprobarse a sí mismo.
- Aprobación mediante función SQL transaccional; no hay UPDATE directo de roles por clientes.

## Instalación
1. `npm install` y `npm run dev`.
2. Crear un archivo `.env.local` con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` del proyecto nuevo.
3. La migración `initial_hierarchical_registration` ya fue aplicada al proyecto nuevo de Supabase. NO ejecutar sobre la calculadora.
4. En Supabase Authentication configurar confirmación de email y Site URL / Redirect URLs para el dominio real.
5. **Bootstrap del primer owner:** registrarse con su correo y verificarlo; luego, desde el SQL Editor del proyecto nuevo, un administrador de la base debe ejecutar manualmente `update public.profiles set role='owner' where id='UUID_DEL_USUARIO';` tras verificar el UUID y la identidad. No hay autorregistro de owner.
6. Acceder a `/mando/solicitudes` para aprobar las siguientes cuentas.

## Seguridad y límites
- RLS protege lectura de solicitudes y escritura de registros; la aprobación valida jerarquía en SQL.
- No habilitar acceso a `private` como esquema expuesto de la API.
- Los registros rechazados quedan sin rango; no se permite volver a solicitar desde la interfaz actual (pendiente de siguiente versión).
- El ID de personaje debe ser estable y único; una colisión requiere revisión administrativa.
- Para producción, configurar límites anti-spam/CAPTCHA en el registro y políticas de correo de Supabase.
- El panel no está desplegado ni se ha probado el flujo completo con usuarios reales.
