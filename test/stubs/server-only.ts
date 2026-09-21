// Next.js remplace le paquet "server-only" par un module vide via la
// condition d'export "react-server" de son bundler. Vitest ne connaît pas
// cette condition : on l'alias donc ici vers un module inoffensif pour que
// les fichiers serveur testés (qui commencent par `import "server-only"`)
// restent importables tels quels, sans modification pour les tests.
export {};
