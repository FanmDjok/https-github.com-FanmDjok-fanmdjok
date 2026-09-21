-- Growthis — corrections de sécurité relevées par les advisories Supabase
-- après déploiement initial du schéma (project uzbkluwxgmlvbklfjbor).

-- current_post_metrics doit respecter le RLS de post_metrics pour la
-- personne qui interroge la vue, pas pour son créateur.
alter view public.current_post_metrics set (security_invoker = true);

-- post_targets_due_for_sync ne doit être appelable que par le job planifié
-- (service_role) : sans ce revoke, PUBLIC (donc anon/authenticated) hérite
-- du EXECUTE accordé par défaut à la création de la fonction, ce qui
-- exposait les tâches de publication à synchroniser de TOUTES les
-- organisations à n'importe quel utilisateur connecté.
revoke execute on function public.post_targets_due_for_sync() from public;
grant execute on function public.post_targets_due_for_sync() to service_role;

-- Hygiène : ces fonctions ne sont utiles qu'en interne (déclencheur ou
-- appelées par d'autres fonctions security definer) et n'ont pas besoin
-- d'être exposées via l'API REST publique.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.is_member_of(uuid) from anon;
