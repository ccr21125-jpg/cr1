-- ============================================================================
-- Testi della homepage, modificabili dall'amministratore.
--
-- Da eseguire una volta sola in Supabase → SQL Editor → New query → Run,
-- DOPO 0006_deposit_details.sql.
--
-- Una riga per sezione (hero, come-funziona, footer legale, ...): la colonna
-- `data` è un oggetto JSON piatto {chiave: testo}, le cui chiavi sono decise
-- dall'applicazione (src/data/siteContentSchema.ts), non da un vincolo qui.
--
-- A differenza di ogni altra tabella di questo progetto, qui la lettura è
-- pubblica: la homepage la vede anche chi non ha fatto l'accesso, quindi
-- anche `anon` deve poter leggere. Nessun dato personale vive in questa
-- tabella — solo testo promozionale — quindi non c'è nulla da proteggere in
-- lettura, solo in scrittura.
-- ============================================================================


do $$
begin
  if not exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'profiles'
       and column_name = 'btc_address'
  ) then
    raise exception 'Manca un passaggio precedente: esegui prima 0006_deposit_details.sql (e le precedenti). Esegui STATO.sql per l''elenco completo, in ordine.'
      using errcode = '55000';
  end if;
end
$$;

-- ─────────────────────────── Tabella ───────────────────────────

create table if not exists public.site_content (
  section_key text primary key,
  data jsonb not null,
  updated_by uuid references auth.users (id),
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

revoke all on public.site_content from anon, authenticated;
grant select on public.site_content to anon, authenticated;

drop policy if exists site_content_select_all on public.site_content;
create policy site_content_select_all on public.site_content
  for select using (true);

-- ──────────────────── Impostazione dell'amministratore ────────────────────

/**
 * Salva il testo di una sezione della homepage.
 *
 * `site_content` non ha scrittura diretta per chi usa l'app: questa è
 * l'unica via, e verifica da sé chi chiama, come tutte le altre funzioni
 * amministrative del progetto.
 *
 * Il contenuto sostituisce quello salvato in precedenza per intero: chi
 * scrive manda sempre l'intero oggetto della sezione, non un campo alla
 * volta, quindi un `update` parziale lascerebbe campi vecchi mescolati a
 * quelli nuovi senza che nessuno se ne accorga.
 */
create or replace function public.admin_set_site_content(
  target_section text,
  content_data jsonb
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  clean_section text := nullif(btrim(coalesce(target_section, '')), '');
begin
  if not public.is_admin() then
    raise exception 'non autorizzato' using errcode = '42501';
  end if;

  if clean_section is null or length(clean_section) > 50 then
    raise exception 'sezione non valida' using errcode = '22023';
  end if;

  if content_data is null or jsonb_typeof(content_data) <> 'object' then
    raise exception 'contenuto non valido' using errcode = '22023';
  end if;

  -- Un blocco così grande non è più testo di homepage: limite di sanità.
  if length(content_data::text) > 20000 then
    raise exception 'contenuto troppo grande' using errcode = '22023';
  end if;

  insert into public.site_content (section_key, data, updated_by, updated_at)
  values (clean_section, content_data, auth.uid(), now())
  on conflict (section_key) do update
    set data = excluded.data,
        updated_by = excluded.updated_by,
        updated_at = excluded.updated_at;
end;
$$;

revoke all on function public.admin_set_site_content(text, jsonb) from public, anon;
grant execute on function public.admin_set_site_content(text, jsonb) to authenticated;
