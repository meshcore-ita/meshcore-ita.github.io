// Boot dei widget interattivi. Un solo modulo leggero su tutte le pagine:
// importa dinamicamente solo i widget presenti nel DOM (`data-widget="nome"`
// → ./widgets/<nome>.js, export default mount(root)). Pagine senza widget
// non scaricano nulla oltre questo file.
const roots = document.querySelectorAll('[data-widget]');
for (const root of roots) {
  const name = root.dataset.widget;
  import(`./widgets/${name}.js`)
    .then((m) => m.default(root))
    .catch((err) => {
      root.classList.add('widget--failed');
      console.error(`widget ${name}:`, err);
    });
}
