# 🚀 Guía de Despliegue - NEW LIFE

Esta guía te ayudará a desplegar tu proyecto React + Vite en diferentes plataformas.

## 📋 Opciones de Despliegue Recomendadas

### 1. ✅ Vercel (Recomendado)
**Ventajas:**
- ✅ Gratis para proyectos personales
- ✅ Despliegue automático desde GitHub
- ✅ HTTPS automático
- ✅ CDN global (muy rápido)
- ✅ Configuración automática de Vite
- ✅ Deploy previews para cada PR

### 2. Netlify
**Ventajas:**
- ✅ Gratis para proyectos personales
- ✅ Despliegue automático desde GitHub
- ✅ HTTPS automático
- ✅ CDN global

### 3. Render
**Ventajas:**
- ✅ Gratis (con algunas limitaciones)
- ✅ Muy fácil de configurar

---

## 🎯 DESPLIEGUE EN VERCEL (Paso a Paso)

### Paso 1: Asegúrate de que todo está en GitHub

```bash
# Verifica que tu código esté en GitHub
git status
git add .
git commit -m "Preparar para despliegue en Vercel"
git push origin main
```

### Paso 2: Crear cuenta en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en "Sign Up"
3. Inicia sesión con tu cuenta de **GitHub** (es la opción más fácil)

### Paso 3: Importar Proyecto

1. En el dashboard de Vercel, haz clic en **"Add New Project"**
2. Selecciona tu repositorio de GitHub (`NEW-LIFE`)
3. Vercel detectará automáticamente que es un proyecto Vite

### Paso 4: Configuración (Vercel lo hace automáticamente)

Vercel debería detectar automáticamente:
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

Si no lo detecta automáticamente, configura manualmente:
- **Framework Preset:** Vite
- **Root Directory:** `./` (raíz del proyecto)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### Paso 5: Variables de Entorno (Si las necesitas)

Si en el futuro necesitas variables de entorno:
1. En la configuración del proyecto → **Settings → Environment Variables**
2. Agrega tus variables (ej: `VITE_API_URL`)

### Paso 6: Deploy

1. Haz clic en **"Deploy"**
2. Espera 2-5 minutos mientras Vercel construye tu proyecto
3. ¡Listo! Tu proyecto estará en línea en una URL como: `new-life.vercel.app`

### Paso 7: Dominio Personalizado (Opcional)

1. En la configuración del proyecto → **Settings → Domains**
2. Agrega tu dominio personalizado (ej: `www.newlife.com`)

---

## 🔄 Despliegues Automáticos

Una vez configurado, Vercel desplegará automáticamente:
- ✅ **Cada push a `main`** → Producción
- ✅ **Cada Pull Request** → Preview deployment

---

## 🌐 DESPLIEGUE EN NETLIFY (Alternativa)

### Paso 1: Crear cuenta en Netlify

1. Ve a [netlify.com](https://www.netlify.com)
2. Haz clic en "Sign up" y usa tu cuenta de GitHub

### Paso 2: Desplegar desde GitHub

1. Haz clic en **"Add new site" → "Import an existing project"**
2. Selecciona tu repositorio de GitHub
3. Configura:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Haz clic en **"Deploy site"**

### Paso 3: Configurar Redirects (Para React Router)

Crea un archivo `public/_redirects`:

```
/*    /index.html   200
```

O crea `netlify.toml` en la raíz:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 📝 Verificar el Build Localmente

Antes de desplegar, asegúrate de que el build funciona:

```bash
# Construir el proyecto
npm run build

# Previsualizar el build
npm run preview
```

Si hay errores, corrígelos antes de desplegar.

---

## ⚠️ Problemas Comunes y Soluciones

### Problema: Las rutas no funcionan (404)

**Solución:** Ya está configurado el `vercel.json` con rewrites. Si usas Netlify, asegúrate de tener el archivo `_redirects` o `netlify.toml`.

### Problema: Las imágenes no se cargan

**Solución:** Asegúrate de que todas las imágenes estén en `public/img/` y se referencien como `/img/nombre.png`.

### Problema: Error en el build

**Solución:** 
1. Verifica que todas las dependencias estén en `package.json`
2. Elimina `node_modules` y `package-lock.json`
3. Ejecuta `npm install` de nuevo
4. Prueba `npm run build` localmente

### Problema: Build muy lento

**Solución:** Normal en el primer deploy. Los siguientes serán más rápidos porque Vercel cachea las dependencias.

---

## 🎉 ¡Listo!

Después del despliegue, tu proyecto estará disponible públicamente en una URL como:
- **Vercel:** `tu-proyecto.vercel.app`
- **Netlify:** `tu-proyecto.netlify.app`

Y se actualizará automáticamente cada vez que hagas push a GitHub.

---

## 📚 Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Netlify](https://docs.netlify.com/)
- [Documentación de Vite](https://vitejs.dev/guide/static-deploy.html)



