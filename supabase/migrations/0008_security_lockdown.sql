-- Growthis — verrouillage final des privilèges sur les fonctions sensibles.
--
-- Constat fait pendant le déploiement initial : Supabase réapplique
-- automatiquement `GRANT EXECUTE ... TO anon, authenticated` sur les
-- fonctions du schéma `public` à chaque nouvelle migration (pas seulement à
-- la création), ce qui annule silencieusement un `revoke` fait dans une
-- migration précédente (0006) dès qu'une migration suivante (0007) est
-- appliquée. Cette migration doit donc rester la DERNIÈRE du projet, ou être
-- ré-appliquée (elle est idempotente) après toute nouvelle migration qui
-- ajouterait une fonction sensible réservée à service_role.

revoke execute on function public.post_targets_due_for_sync() from public, anon, authenticated;
grant execute on function public.post_targets_due_for_sync() to service_role;

revoke execute on function public.organizations_with_expired_trial() from public, anon, authenticated;
grant execute on function public.organizations_with_expired_trial() to service_role;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

revoke execute on function public.is_member_of(uuid) from anon;

-- search_path explicite (cohérence avec les autres fonctions du projet).
create or replace function public.generate_referral_code()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.referral_code is null then
    new.referral_code := upper(substring(md5(new.id::text) from 1 for 6));
  end if;
  return new;
end;
$$;
