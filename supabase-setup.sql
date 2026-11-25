-- ============================================================================
--  GLÜCKSPALAST – gemeinsame Online-Bestenliste
--  Einmal einrichten, dann sehen alle Besucher dieselbe Liste.
-- ============================================================================
--
--  SO GEHT ES:
--
--  1. Auf supabase.com ein kostenloses Konto anlegen und ein neues Projekt
--     erstellen. Name und Region sind egal, das Passwort für die Datenbank
--     brauchst du hier nicht weiter.
--
--  2. Links im Menü auf "SQL Editor", dann "New query". Den kompletten
--     Inhalt dieser Datei hineinkopieren und auf "Run" klicken.
--
--  3. Links auf "Project Settings" -> "API". Dort stehen zwei Werte:
--
--       Project URL        z. B.  https://abcdefgh.supabase.co
--       anon public key    ein langer Text, der mit  eyJ...  beginnt
--
--  4. Diese zwei Werte in glueckspalast.js ganz oben bei GP_ONLINE eintragen:
--
--       var GP_ONLINE = {
--         url: 'https://abcdefgh.supabase.co',
--         key: 'eyJhbGciOi...'
--       };
--
--  5. Datei hochladen, fertig. Der Reiter "Online" in der Bestenliste zeigt
--     ab jetzt die gemeinsamen Einträge.
--
--  WICHTIG ZUM SCHLÜSSEL:
--  Nimm NUR den "anon public" Schlüssel. Der ist genau dafür gemacht, in einer
--  Webseite zu stehen, und kann nur das, was die Regeln unten erlauben.
--  Den Schlüssel "service_role" darfst du nirgends in die Seite schreiben –
--  der hat vollen Zugriff auf die Datenbank, und der Quelltext deiner Seite
--  ist für jeden lesbar.
--
--  WAS DIESE REGELN ERLAUBEN:
--  Jeder Besucher darf die Bestenliste lesen und eigene Einträge schreiben.
--  Niemand darf Einträge ändern oder löschen. Das heißt aber auch: Wer sich
--  auskennt, kann erfundene Gewinne eintragen. Für eine Spielgeld-Bestenliste
--  unter Kommilitonen ist das in Ordnung – schreib dort nichts Persönliches
--  hinein und verlass dich nicht darauf, dass jede Zahl echt ist.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- Tabelle 1: einzelne Gewinne
-- ---------------------------------------------------------------------------
create table if not exists public.gp_bestenliste (
  id       bigint generated always as identity primary key,
  spieler  text        not null,
  spiel    text        not null,
  gewinn   bigint      not null,
  mult     numeric     not null default 0,
  art      text        not null default 'Gewinn',
  datum    timestamptz not null default now(),

  -- Grenzen, damit niemand Unsinn oder riesige Texte hineinschreibt
  constraint gp_spieler_laenge check (char_length(spieler) between 1 and 24),
  constraint gp_spiel_laenge   check (char_length(spiel)   between 1 and 24),
  constraint gp_art_laenge     check (char_length(art)     between 1 and 24),
  constraint gp_gewinn_bereich check (gewinn >= 0 and gewinn <= 100000000),
  constraint gp_mult_bereich   check (mult   >= 0 and mult   <= 1000000)
);

-- Sortieren geht damit auch bei vielen Zeilen schnell
create index if not exists gp_bestenliste_gewinn_idx on public.gp_bestenliste (gewinn desc);
create index if not exists gp_bestenliste_mult_idx   on public.gp_bestenliste (mult   desc);
create index if not exists gp_bestenliste_spiel_idx  on public.gp_bestenliste (spiel);


-- ---------------------------------------------------------------------------
-- Tabelle 2: Chipstand je Spieler (für "Reichste Spieler")
-- ---------------------------------------------------------------------------
create table if not exists public.gp_spieler (
  spieler  text        primary key,
  chips    bigint      not null default 0,
  datum    timestamptz not null default now(),

  constraint gp_sp_laenge  check (char_length(spieler) between 1 and 24),
  constraint gp_sp_bereich check (chips >= 0 and chips <= 100000000)
);

create index if not exists gp_spieler_chips_idx on public.gp_spieler (chips desc);


-- ---------------------------------------------------------------------------
-- Zugriffsregeln (Row Level Security)
-- Ohne diese Regeln wäre die Tabelle für den anon-Schlüssel komplett gesperrt.
-- ---------------------------------------------------------------------------
alter table public.gp_bestenliste enable row level security;
alter table public.gp_spieler     enable row level security;

-- Alte Regeln entfernen, damit dieses Skript mehrfach laufen darf
drop policy if exists gp_bl_lesen     on public.gp_bestenliste;
drop policy if exists gp_bl_schreiben on public.gp_bestenliste;
drop policy if exists gp_sp_lesen     on public.gp_spieler;
drop policy if exists gp_sp_schreiben on public.gp_spieler;
drop policy if exists gp_sp_aendern   on public.gp_spieler;

-- Jeder darf lesen
create policy gp_bl_lesen on public.gp_bestenliste
  for select to anon, authenticated using (true);

-- Jeder darf neue Einträge anlegen (aber nichts ändern oder löschen)
create policy gp_bl_schreiben on public.gp_bestenliste
  for insert to anon, authenticated with check (true);

-- Chipstände: lesen, anlegen und den eigenen Namen auffrischen
create policy gp_sp_lesen on public.gp_spieler
  for select to anon, authenticated using (true);

create policy gp_sp_schreiben on public.gp_spieler
  for insert to anon, authenticated with check (true);

create policy gp_sp_aendern on public.gp_spieler
  for update to anon, authenticated using (true) with check (true);


-- ---------------------------------------------------------------------------
-- Aufräumen: nur die besten 500 Einträge behalten.
-- Läuft automatisch nach jedem neuen Eintrag mit.
-- ---------------------------------------------------------------------------
create or replace function public.gp_aufraeumen() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.gp_bestenliste) > 500 then
    delete from public.gp_bestenliste
     where id in (
       select id from public.gp_bestenliste
        order by gewinn desc
        offset 500
     );
  end if;
  return null;
end;
$$;

drop trigger if exists gp_aufraeumen_trigger on public.gp_bestenliste;
create trigger gp_aufraeumen_trigger
  after insert on public.gp_bestenliste
  for each statement execute function public.gp_aufraeumen();


-- ============================================================================
-- Fertig. Zum Prüfen:
--   select count(*) from public.gp_bestenliste;
-- Zum Leeren der Liste:
--   delete from public.gp_bestenliste;
--   delete from public.gp_spieler;
-- ============================================================================
