// Origine assoluta del sito, unica fonte di verità.
//
// Vive in un modulo a parte, senza dipendenze npm, perché
// scripts/indexnow.mjs gira nel workflow dopo la rimozione di node_modules:
// importare build.mjs (che carica `marked`) lo farebbe fallire.
//
// Ogni link e asset interno delle pagine generate è relativo, quindi il sito
// funziona a qualunque punto di mount. Servono URL assoluti solo dove è
// obbligatorio (canonical, og:*, JSON-LD, <loc> della sitemap, Sitemap: in
// robots.txt, id e link del feed Atom), risolti in quest'ordine:
//   1. variabile d'ambiente SITE_BASE, presa alla lettera (deve finire con "/");
//   2. GITHUB_REPOSITORY, impostata da GitHub Actions:
//        "<owner>/<owner>.github.io" -> "https://<owner>.github.io/"
//        "<owner>/<repo>"            -> "https://<owner>.github.io/<repo>/"
//   3. fallback: l'URL GitHub Pages attuale di questo repo. Se il repo viene
//      rinominato in meshcore-ita.github.io, il caso 2 lo risolve alla radice
//      da solo, senza modifiche al codice.
function resolveSiteBase() {
  const envBase = process.env.SITE_BASE;
  if (envBase) return envBase;
  const repo = process.env.GITHUB_REPOSITORY;
  if (repo) {
    const [owner, repoName] = repo.split('/');
    if (owner && repoName) {
      const host = `${owner}.github.io`;
      return repoName.toLowerCase() === host.toLowerCase()
        ? `https://${host}/`
        : `https://${host}/${repoName}/`;
    }
  }
  return 'https://meshcore-ita.github.io/';
}

export const SITE_BASE = resolveSiteBase();

if (!SITE_BASE.endsWith('/')) {
  throw new Error(`SITE_BASE deve terminare con "/": ${SITE_BASE}`);
}
