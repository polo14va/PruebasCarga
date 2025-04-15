// bundle.js
// Script para empaquetar todo el frontend en un solo archivo HTML
// Uso: node bundle.js

const fs = require('fs');
const path = require('path');

// Carpetas a ignorar
const IGNORE_DIRS = ['node_modules', '.git', '.vscode', 'dist', 'build'];

// Busca el index.html principal
function findIndexHtml(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!IGNORE_DIRS.includes(file)) {
                const found = findIndexHtml(fullPath);
                if (found) return found;
            }
        } else if (file.toLowerCase() === 'index.html') {
            return fullPath;
        }
    }
    return null;
}

// Busca todos los archivos con una extensión dada, ignorando carpetas
function findAllFiles(dir, ext) {
    let results = [];
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!IGNORE_DIRS.includes(file)) {
                results = results.concat(findAllFiles(fullPath, ext));
            }
        } else if (file.endsWith(ext)) {
            results.push(fullPath);
        }
    }
    return results;
}

// Lee y concatena todos los archivos
function concatFiles(files) {
    return files.map(f => fs.readFileSync(f, 'utf8')).join('\n\n');
}

function main() {
    const root = process.cwd();
    const indexHtmlPath = findIndexHtml(root);
    if (!indexHtmlPath) {
        console.error('No se encontró index.html');
        process.exit(1);
    }
    let html = fs.readFileSync(indexHtmlPath, 'utf8');

    // Encuentra y concatena CSS y JS
    const cssFiles = findAllFiles(root, '.css');
    const jsFiles = findAllFiles(root, '.js');
    const cssContent = concatFiles(cssFiles);
    const jsContent = concatFiles(jsFiles);

    // Inserta CSS en <head>
    html = html.replace(/<head[^>]*>/i, match => `${match}\n<style>\n${cssContent}\n</style>`);
    // Inserta JS antes de </body>
    html = html.replace(/<\/body>/i, match => `<script>\n${jsContent}\n</script>\n${match}`);

    // Opcional: elimina referencias externas a .css y .js
    html = html.replace(/<link[^>]*href="[^"]+\.css"[^>]*>/gi, '');
    html = html.replace(/<script[^>]*src="[^"]+\.js"[^>]*><\/script>/gi, '');

    fs.writeFileSync(path.join(root, 'PruebasCarga.html'), html, 'utf8');
    console.log('PruebasCarga.html creado con éxito.');
}

main();
