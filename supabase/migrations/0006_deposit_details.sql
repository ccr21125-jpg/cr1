-- ============================================================================
-- Dati di deposito: indirizzo BTC e coordinate bancarie, per singolo utente.
--
-- Da eseguire una volta sola in Supabase → SQL Editor → New query → Run,
-- DOPO 0005_harden_functions.sql.
--
-- Ogni utente può avere un indirizzo bitcoin e/o coordinate bancarie diversi:
-- non è un'unica configurazione globale. Restano NULL finché l'amministratore
-- non li imposta dal pannello — l'interfaccia lo dice apertamente invece di
-- inventare un indirizzo o un IBAN.
--
-- Sono solo informazioni da mostrare: nessun saldo si muove da qui. Il
-- credito avviene come già accade oggi, a mano, con admin_adjust_balance
-- quando l'amministratore vede arrivare il bonifico o il bitcoin.
-- ============================================================================


do $$
begin
  if not exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public' and p.proname = 'check_btc_rate'
       and array_to_string(p.proconfig, ',') like '%search_path%'
  ) then
    raise exception 'Manca un passaggio precedente: esegui prima 0005_harden_functions.sql (e le precedenti). Esegui STATO.sql per l''elenco completo, in ordine.'
      using errcode = '55000';
  end if;
end
$$;

-- ─────────────────────────── Colonne ───────────────────────────

alter table public.profiles
  add column if not exists btc_address text,
  add column if not exists bank_name text,
  add column if not exists bank_iban text,
  add column if not exists bank_bic text,
  add column if not exists bank_account_holder text;

-- Le policy di select su `profiles` esistono già dalla 0001 (proprietario e
-- amministratore): queste colonne non hanno bisogno di RLS proprie.

-- ──────────────────── Impostazione dell'amministratore ────────────────────

/**
 * Imposta indirizzo BTC e/o coordinate bancarie per un utente.
 *
 * `profiles` non ha scrittura diretta per chi usa l'app (revocata dalla
 * 0001): questa è l'unica via, e verifica da sé chi chiama, come tutte le
 * altre funzioni che toccano `profiles`.
 *
 * Una stringa vuota diventa NULL: così "non impostato" resta un solo valore
 * invece di due che vorrebbero dire la stessa cosa. Passare NULL a un campo
 * lo svuota deliberatamente — utile per revocare un indirizzo senza doverne
 * mettere subito uno nuovo.
 */
create or replace function public.admin_set_deposit_details(
  target_user uuid,
  btc_address text default null,
  bank_name text default null,
  bank_iban text default null,
  bank_bic text default null,
  bank_account_holder text default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  clean_btc text := nullif(btrim(coalesce(btc_address, '')), '');
  clean_bank_name text := nullif(btrim(coalesce(bank_name, '')), '');
  clean_iban text := nullif(btrim(coalesce(bank_iban, '')), '');
  clean_bic text := nullif(btrim(coalesce(bank_bic, '')), '');
  clean_holder text := nullif(btrim(coalesce(bank_account_holder, '')), '');
begin
  if not public.is_admin() then
    raise exception 'non autorizzato' using errcode = '42501';
  end if;

  if clean_btc is not null and length(clean_btc) > 128 then
    raise exception 'indirizzo troppo lungo' using errcode = '22023';
  end if;

  if clean_bank_name is not null and length(clean_bank_name) > 200 then
    raise exception 'nome banca troppo lungo' using errcode = '22023';
  end if;

  if clean_iban is not null and length(clean_iban) > 50 then
    raise exception 'IBAN troppo lungo' using errcode = '22023';
  end if;

  if clean_bic is not null and length(clean_bic) > 20 then
    raise exception 'BIC troppo lungo' using errcode = '22023';
  end if;

  if clean_holder is not null and length(clean_holder) > 200 then
    raise exception 'intestatario troppo lungo' using errcode = '22023';
  end if;

  update public.profiles
     set btc_address = clean_btc,
         bank_name = clean_bank_name,
         bank_iban = clean_iban,
         bank_bic = clean_bic,
         bank_account_holder = clean_holder
   where id = target_user;

  if not found then
    raise exception 'utente inesistente' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.admin_set_deposit_details(uuid, text, text, text, text, text) from public, anon;
grant execute on function public.admin_set_deposit_details(uuid, text, text, text, text, text) to authenticated;
