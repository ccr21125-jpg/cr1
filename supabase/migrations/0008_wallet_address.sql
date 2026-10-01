-- ============================================================================
-- Indirizzo del portafoglio di ogni cliente.
--
-- Da eseguire una volta sola in Supabase → SQL Editor → New query → Run,
-- DOPO 0006_deposit_details.sql.
--
-- È un dato diverso dall'indirizzo di deposito della 0006 (`btc_address`):
-- quello è dove il cliente versa denaro, questo è l'indirizzo del portafoglio
-- creato per lui, che vede nella pagina "Portafogli" della sua area riservata.
-- L'amministratore lo imposta cliente per cliente. Resta NULL finché non lo
-- fa: l'interfaccia lo dice apertamente invece di inventare un indirizzo.
--
-- Nessun saldo si muove da qui: è solo un'informazione da mostrare.
-- ============================================================================


do $$
begin
  if not exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'profiles' and column_name = 'btc_address'
  ) then
    raise exception 'Manca un passaggio precedente: esegui prima 0006_deposit_details.sql (e le precedenti). Esegui STATO.sql per l''elenco completo, in ordine.'
      using errcode = '55000';
  end if;
end
$$;

-- ─────────────────────────── Colonna ───────────────────────────

alter table public.profiles
  add column if not exists wallet_address text;

-- Le policy di select su `profiles` esistono già dalla 0001 (proprietario e
-- amministratore): la colonna non ha bisogno di RLS propria.

-- ──────────────────── Impostazione dell'amministratore ────────────────────

/**
 * Imposta l'indirizzo del portafoglio di un cliente.
 *
 * `profiles` non ha scrittura diretta per chi usa l'app (revocata dalla
 * 0001): questa è l'unica via, e verifica da sé chi chiama, come tutte le
 * altre funzioni che toccano `profiles`.
 *
 * Una stringa vuota o NULL svuota il campo: serve a revocare un indirizzo
 * senza doverne mettere subito uno nuovo.
 */
create or replace function public.admin_set_wallet_address(
  target_user uuid,
  new_wallet_address text default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  clean_address text := nullif(btrim(coalesce(new_wallet_address, '')), '');
begin
  if not public.is_admin() then
    raise exception 'non autorizzato' using errcode = '42501';
  end if;

  if clean_address is not null and length(clean_address) > 128 then
    raise exception 'indirizzo troppo lungo' using errcode = '22023';
  end if;

  update public.profiles
     set wallet_address = clean_address
   where id = target_user;

  if not found then
    raise exception 'utente inesistente' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.admin_set_wallet_address(uuid, text) from public, anon;
grant execute on function public.admin_set_wallet_address(uuid, text) to authenticated;
