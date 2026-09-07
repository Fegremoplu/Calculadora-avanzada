# Calculadora Científica Avanzada & Trazador 3D WebGL

Una aplicación web progresiva (PWA) moderna, de alta precisión y completa para matemáticas avanzadas, cálculo diferencial e integral, trazado de superficies 3D y análisis de ingeniería.

---

## ✨ Características Principales

- 🧮 **Calculadora Científica:** Motor de alta precisión con soporte para funciones trigonométricas (DEG/RAD/GRAD), hiperbólicas, logaritmos, potencias, constantes matemáticas ($e$, $\pi$, $\phi$, etc.) y formato de visualización (Estándar, Científico, Fracciones).
- 📈 **Graficador 2D:** Representación de múltiples funciones simultáneas con zoom interactivo, paneo y cálculo automático de raíces en el eje X.
- 🧊 **Graficador 3D (WebGL / Three.js):** Renderizado tridimensional en tiempo real para superficies analíticas $z = f(x,y)$, rotación orbital de 360°, inspección interactiva de coordenadas bajo el cursor, paletas de calor térmicas y exportación en alta definición PNG.
- 📐 **Cálculo & Álgebra:** Solucionador de ecuaciones de segundo grado (raíces reales y complejas), derivadas numéricas instantáneas, integrales definidas (regla de Simpson) y método numérico de Newton-Raphson.
- 💻 **Modo Programador:** Conversión simultánea e interactiva entre bases HEX, DEC, OCT y BIN con teclado de manipulación de bits.
- 🔄 **Conversor de Unidades:** Conversión de magnitudes de longitud, masa, temperatura, tiempo, volumen y almacenamiento de datos.
- ☁️ **Sincronización en la Nube (Firebase Firestore & Google Sign-In):**
  - Respaldo automático de historial y preferencias.
  - Acceso seguro con cuentas de Google bajo estrictas garantías de privacidad (cero acceso a correos, archivos ni contactos).
  - Herramientas GDPR de portabilidad (exportar historial en JSON) y derecho al olvido (eliminar cuenta y datos de la nube con un clic).
- 📱 **Modo Offline & PWA:** Compatible con instalación en Android, iOS, Windows y macOS; funciona completamente sin conexión a internet.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide Icons.
- **Gráficos:** Three.js / WebGL para 3D, HTML5 Canvas para 2D.
- **Matemáticas:** Math.js y algoritmos numéricos en punto flotante extendido.
- **Persistencia & Backend:** Google Firebase (Firestore Database & Firebase Authentication).
- **Entorno de Construcción:** Vite + Vite PWA Plugin (Workbox).

---

## 🚀 Instalación y Ejecución Local

1. **Clonar el repositorio:**
   ```bash
   git clone <URL_DE_TU_REPOSITORIO_GITHUB>
   cd <CARPETA_DEL_PROYECTO>
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Ejecutar en modo de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

4. **Compilar para producción:**
   ```bash
   npm run build
   ```
   Los archivos listos para producción se generarán dentro de la carpeta `dist/`.

---

## 🌐 Despliegue en la Web (Hosting Gratuito)

Este proyecto está listo para ser alojado en:
- **Vercel / Netlify:** Solo conecta tu repositorio de GitHub, selecciona el framework Vite y presiona *Deploy*.
- **Firebase Hosting:** Ejecuta `npx firebase deploy` para alojarlo directamente en tu proyecto de Firebase.

> ⚠️ **Nota para Google Sign-In en producción:** Si alojas tu app en un dominio propio o en Vercel (`tudominio.vercel.app`), recuerda añadir tu nuevo dominio en la **Consola de Firebase** > **Authentication** > **Settings** > **Authorized domains** (Dominios autorizados).

---

## 🔒 Política de Privacidad (Google Play Store Compliance)

Google Play exige una URL pública accesible con la política de privacidad. Este proyecto incluye:
- **Página estática directa:** Accesible públicamente en `/privacy.html`.
- **En Google Play Console:** En la sección **Contenido de la aplicación > Política de privacidad**, introduce la URL:
  `https://<TU-DOMINIO-O-URL-DE-PRODUCCIÓN>/privacy.html`
- **Mecanismo de eliminación de datos:** Incluye borrado inmediato de cuenta y datos de Firestore en cumplimiento con la normativa obligatoria de Google Play Data Deletion.

---

## 📄 Licencia

Distribuido bajo la Licencia MIT.
