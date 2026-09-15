const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

// --dev flag builds an unminified development bundle where dev-only
// tooling (e.g. the Agentation annotation overlay) is enabled.
const isDev = process.argv.includes('--dev');
const nodeEnv = isDev ? 'development' : (process.env.NODE_ENV || 'production');

const outDir = path.resolve(__dirname, '../backend/public/js');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

esbuild.build({
  entryPoints: [path.resolve(__dirname, '../frontend/src/index.jsx')],
  bundle: true,
  minify: nodeEnv === 'production',
  sourcemap: true,
  outfile: path.join(outDir, 'bundle.js'),
  loader: { '.jsx': 'jsx', '.js': 'jsx' },
  define: {
    'process.env.NODE_ENV': JSON.stringify(nodeEnv)
  }
}).then(() => {
  const rootPublicJs = path.resolve(__dirname, '../public/js');
  if (!fs.existsSync(rootPublicJs)) fs.mkdirSync(rootPublicJs, { recursive: true });
  fs.copyFileSync(path.join(outDir, 'bundle.js'), path.join(rootPublicJs, 'bundle.js'));
  if (fs.existsSync(path.join(outDir, 'bundle.js.map'))) {
    fs.copyFileSync(path.join(outDir, 'bundle.js.map'), path.join(rootPublicJs, 'bundle.js.map'));
  }
  console.log(`Client React bundle built (${nodeEnv}) in backend/public/js/bundle.js and public/js/bundle.js`);
}).catch((err) => {
  console.error('Failed to build client bundle:', err);
  process.exit(1);
});
