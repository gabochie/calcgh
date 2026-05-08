const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'index.html');
const dist = path.join(__dirname, '..', 'dist');
const out = path.join(dist, 'index.html');

fs.mkdirSync(dist, { recursive: true });

let html = fs.readFileSync(src, 'utf-8');

html = html.replace(
  /FLWPUBK_TEST_REPLACE_WITH_YOUR_FLUTTERWAVE_PUBLIC_KEY/g,
  process.env.FLUTTERWAVE_PUBLIC_KEY || 'FLWPUBK_TEST_REPLACE_WITH_YOUR_FLUTTERWAVE_PUBLIC_KEY'
);

if (process.env.GA_ID) {
  const ga = `
<script async src="https://www.googletagmanager.com/gtag/js?id=${process.env.GA_ID}"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${process.env.GA_ID}');
</script>
`;
  html = html.replace('</head>', ga + '</head>');
}

fs.writeFileSync(out, html, 'utf-8');
console.log('✓ Built dist/index.html');
