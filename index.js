// index.js
// App: pasar archivos de proyectos de código Javascript a un .txt

const fs = require("fs");
const path = require("path");

// Extensiones de archivos que querés incluir en el TXT
const EXTENSIONES_PERMITIDAS = [
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".json",
  ".html",
  ".css"
];

/**
 * Recorre un directorio de forma recursiva y devuelve
 * una lista con las rutas absolutas de los archivos encontrados.
 */
function obtenerArchivosRecursivo(directorio) {
  let resultados = [];

  const items = fs.readdirSync(directorio, { withFileTypes: true });

  for (const item of items) {
    const rutaCompleta = path.join(directorio, item.name);

    // Ignorar node_modules y carpetas típicas que no nos interesan
    if (item.isDirectory()) {
      if (item.name === "node_modules" || item.name === ".git" || item.name === ".next") {
        continue;
      }
      resultados = resultados.concat(obtenerArchivosRecursivo(rutaCompleta));
    } else {
      resultados.push(rutaCompleta);
    }
  }

  return resultados;
}

/**
 * Filtra archivos por extensión
 */
function filtrarArchivosPorExtension(archivos, extensiones) {
  return archivos.filter((archivo) =>
    extensiones.includes(path.extname(archivo))
  );
}

/**
 * Genera el contenido del TXT combinando el código de todos los archivos.
 */
function generarContenidoTXT(archivos, rutaBaseProyecto) {
  let contenido = "";

  archivos.forEach((archivo, index) => {
    const codigo = fs.readFileSync(archivo, "utf8");
    const rutaRelativa = path.relative(rutaBaseProyecto, archivo);

    contenido += "=====================================\n";
    contenido += `Archivo: ${rutaRelativa}\n`;
    contenido += "=====================================\n\n";
    contenido += codigo + "\n\n\n";
  });

  return contenido;
}

/**
 * Ejecución principal
 */
function main() {
  // Leer argumentos: ruta del proyecto y nombre de salida
  const rutaProyecto = process.argv[2];
  const archivoSalida = process.argv[3] || "proyecto-codigo.txt";

  if (!rutaProyecto) {
    console.error("⚠️  Uso: node index.js <ruta-del-proyecto> [salida.txt]");
    console.error("Ejemplo: node index.js ../mi-proyecto salida.txt");
    process.exit(1);
  }

  const rutaAbsolutaProyecto = path.resolve(rutaProyecto);

  if (!fs.existsSync(rutaAbsolutaProyecto)) {
    console.error("❌ La ruta del proyecto no existe:", rutaAbsolutaProyecto);
    process.exit(1);
  }

  console.log("📁 Leyendo proyecto en:", rutaAbsolutaProyecto);

  // 1. Obtener todos los archivos del proyecto
  const todosLosArchivos = obtenerArchivosRecursivo(rutaAbsolutaProyecto);

  // 2. Filtrar solo extensiones que nos interesan
  const archivosCodigo = filtrarArchivosPorExtension(
    todosLosArchivos,
    EXTENSIONES_PERMITIDAS
  );

  if (archivosCodigo.length === 0) {
    console.warn("⚠️ No se encontraron archivos de código con las extensiones definidas.");
    process.exit(0);
  }

  console.log(`✅ Se encontraron ${archivosCodigo.length} archivos de código.`);

  // 3. Generar el contenido del TXT
  const contenidoTXT = generarContenidoTXT(archivosCodigo, rutaAbsolutaProyecto);

  // 4. Escribir archivo de salida
  const rutaSalida = path.resolve(archivoSalida);
  fs.writeFileSync(rutaSalida, contenidoTXT, "utf8");

  console.log("📝 Archivo TXT generado en:", rutaSalida);
  console.log("🎉 Listo. Todo tu proyecto está consolidado en un solo .txt");
}

main();
