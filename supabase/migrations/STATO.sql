-- ============================================================================
-- Quali migrazioni mancano.
--
-- Da incollare nell'SQL Editor di Supabase PRIMA di eseguire qualunque altra
-- cosa. Non modifica nulla: guarda soltanto com'è fatto il database e dice
-- quali file servono ancora.
-- ============================================================================

select
  m.file,
  case when m.applicata then 'già fatta' else '➜ DA ESEGUIRE' end as stato
from (
  values
    (1, '0001_profiles_and_ledger.sql', to_regclass('public.profiles') is not null),

    (2, '0002_withdrawals.sql',         to_regclass('public.withdrawals') is not null),

    -- La 0003 rende facoltativa la destinazione: si riconosce dal fatto che
    -- la colonna ha smesso di essere obbligatoria.
    (3, '0003_optional_destination.sql',
        exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'withdrawals'
                   and column_name = 'destination' and is_nullable = 'YES')),

    -- La 0004 porta il saldo in satoshi: si riconosce dalla nuova colonna.
    (4, '0004_satoshi_balances.sql',
        exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'profiles'
                   and column_name = 'balance_sats')),

    -- La 0005 fissa il search_path delle due funzioni di conversione.
    (5, '0005_harden_functions.sql',
        exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
                 where n.nspname = 'public' and p.proname = 'check_btc_rate'
                   and array_to_string(p.proconfig, ',') like '%search_path%')),

    -- La 0006 aggiunge indirizzo BTC e coordinate bancarie per utente.
    (6, '0006_deposit_details.sql',
        exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'profiles'
                   and column_name = 'btc_address'))
) as m(ordine, file, applicata)
order by m.ordine;
