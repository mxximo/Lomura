# Lumora en Render gratuito + Supabase

## Crear la base de datos

En https://supabase.com/dashboard crea un proyecto del plan Free. Guarda su contraseña de base de datos. En **Connect**, selecciona **Session pooler** y copia la URI PostgreSQL de puerto **5432**. Es compatible con IPv4 y adecuada para esta API.

Sustituye `[YOUR-PASSWORD]` por la contraseña de esa base de datos. Si contiene caracteres reservados de una URL, deben codificarse (por ejemplo `@` como `%40`). La dirección del proyecto `https://…supabase.co` y las claves anon/service_role no son la URI PostgreSQL.

La API creará automáticamente las tablas `responses`, `sessions` y `login_limits` en el esquema **lumora**, separado de `public`. No hace falta crear políticas públicas ni dar acceso desde el navegador. No expongas ese esquema mediante la Data API de Supabase.

## Configurar Render

| Campo | Valor |
|---|---|
| Repositorio | mxximo/Lomura |
| Rama | deploy/render-free |
| Language | Docker |
| Root Directory | Vacío |
| Dockerfile Path | ./Dockerfile |
| Instance Type | Free |
| Health Check Path | /api/health |

En Environment Variables:

| Variable | Valor |
|---|---|
| ADMIN_PASSWORD | Contraseña propia de al menos 12 caracteres |
| PORT | 8000 |
| DATABASE_URL | URI privada de Session pooler de Supabase |

La conexión remota exige TLS. Render proporciona `RENDER=true`; sin DATABASE_URL los envíos y el health check devuelven 503, evitando aceptar datos en almacenamiento efímero. Los secretos nunca se incluyen en el frontend, GitHub ni capturas.

## Comprobar después de publicar

1. `/api/health` debe responder 200 y `{"status":"ok"}`. Si falla, comprueba la URI, la contraseña, el estado del proyecto Supabase y los logs de Render sin compartir secretos.
2. Envía una encuesta con datos ficticios y abre `/admin` con ADMIN_PASSWORD. Comprueba la respuesta y descarga su CSV.
3. Reinicia o vuelve a desplegar Render. La encuesta debe seguir apareciendo. En Supabase Table Editor selecciona el esquema `lumora` para inspeccionar las tablas si necesitas hacerlo.

El quiz completo también se guarda; los repasos y avances locales mantienen su comportamiento anterior. Los reintentos no duplican una respuesta. La contraseña del panel y la de PostgreSQL son distintas.

## Límites y copias

Render Free puede dormir tras 15 minutos sin visitas. Supabase Free puede pausar proyectos con poca actividad durante siete días; restáuralos en su panel cuando sea necesario. Ambos planes tienen cuotas. Exporta y protege copias periódicas; los CSV no son un respaldo completo de PostgreSQL. `scripts/data_backup.py` sirve únicamente para SQLite local: para PostgreSQL usa `pg_dump` y prueba la restauración en otra base.

Si ya tienes encuestas en SQLite, no se transfieren automáticamente. Conserva una copia antes de cambiar DATABASE_URL y realiza una migración explícita. Nunca uses una base real como TEST_POSTGRES_URL: las pruebas vacían sus tablas.

Fuentes: https://supabase.com/docs/guides/database/connecting-to-postgres y https://render.com/docs/free.
