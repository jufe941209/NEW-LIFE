# 🚀 NEW LIFE - React + Vite

## 📋 Estructura del Proyecto con Atomic Design

```
src/
├── components/
│   ├── atoms/              # Componentes básicos (Button, Input, Icon)
│   │   ├── Button/
│   │   ├── Input/
│   │   └── Icon/
│   ├── molecules/          # Combinaciones simples (SearchBar, ProductCard)
│   │   ├── SearchBar/
│   │   ├── ProductCard/
│   │   └── NewsletterForm/
│   └── organisms/          # Componentes complejos (Navbar, Footer, Layout)
│       ├── Navbar/
│       ├── Footer/
│       └── Layout/
├── pages/                   # Páginas completas
│   ├── Home.jsx
│   ├── AboutUs.jsx
│   ├── Shop.jsx
│   ├── Cart.jsx
│   └── ...
├── styles/                  # Estilos globales
│   └── index.css
├── App.jsx                  # Componente principal con rutas
└── main.jsx                 # Punto de entrada
```

## 🎯 Atomic Design - Explicación

### 1. **Atoms (Átomos)** - Componentes Básicos
Son los componentes más pequeños y no pueden dividirse más:
- **Button**: Botón reutilizable
- **Input**: Campo de entrada
- **Icon**: Ícono simple

**Ejemplo:**
```jsx
import { Button } from '@/components/atoms'

<Button variant="success" size="lg">Click me</Button>
```

### 2. **Molecules (Moléculas)** - Combinaciones Simples
Combinan átomos para crear componentes más complejos:
- **SearchBar**: Input + Button + Icon
- **ProductCard**: Imagen + Título + Descripción + Button
- **NewsletterForm**: Input + Button

**Ejemplo:**
```jsx
import { SearchBar } from '@/components/molecules'

<SearchBar onSearch={(term) => console.log(term)} />
```

### 3. **Organisms (Organismos)** - Componentes Complejos
Combinan moléculas y átomos para crear secciones completas:
- **Navbar**: Logo + Menú + Búsqueda + Carrito
- **Footer**: Links + NewsletterForm + Redes Sociales
- **Layout**: Navbar + Contenido + Footer

**Ejemplo:**
```jsx
import { Layout } from '@/components/organisms'

<Layout>
  {/* Tu contenido aquí */}
</Layout>
```

### 4. **Pages (Páginas)** - Páginas Completas
Son las páginas finales que usan organismos:
- **Home**: Layout + Hero + Productos
- **Shop**: Layout + Lista de Productos
- **Cart**: Layout + Carrito

## 🚀 Comandos Disponibles

### Desarrollo
```bash
npm run dev
```
Inicia el servidor de desarrollo en `http://localhost:3000`

### Producción
```bash
npm run build
```
Crea la versión optimizada en la carpeta `dist`

### Preview
```bash
npm run preview
```
Previsualiza la versión de producción

## 📦 Dependencias Instaladas

### Producción
- **react**: ^18.2.0 - Librería principal
- **react-dom**: ^18.2.0 - Renderizado en el DOM
- **react-router-dom**: ^6.20.0 - Enrutamiento
- **axios**: ^1.6.2 - Cliente HTTP para APIs

### Desarrollo
- **vite**: ^5.0.8 - Herramienta de desarrollo rápida
- **@vitejs/plugin-react**: Plugin de React para Vite
- **eslint**: Linter para código

## 🎨 Estilos

Los estilos están organizados en:
- **Bootstrap CSS**: `/css/bootstrap.min.css`
- **Estilos personalizados**: `/css/style.css`
- **Estilos de componentes**: Cada componente tiene su propio archivo `.css`

## 📂 Recursos Estáticos

Las imágenes y recursos deben ir en:
- **Imágenes**: `/public/img/` (accesibles como `/img/...`)
- **Librerías**: `/lib/` (mantener estructura actual)

## 🔄 Rutas Configuradas

- `/` - Home
- `/about` - Quienes Somos
- `/shop` - Productos
- `/shop/:id` - Detalle de Producto
- `/cart` - Carrito
- `/checkout` - Finalizar Compra
- `/contact` - Contacto
- `/testimonials` - Testimonios
- `*` - 404 (Not Found)

## 🛠️ Próximos Pasos

1. ✅ Estructura base creada
2. ✅ Componentes básicos (Atoms, Molecules, Organisms)
3. ✅ Páginas base creadas
4. ⏳ Migrar contenido completo de HTML a React
5. ⏳ Agregar funcionalidad de carrito
6. ⏳ Integrar con API backend
7. ⏳ Agregar estados globales (Context API o Redux)

## 💡 Tips

- **Reutilización**: Los componentes atoms pueden usarse en cualquier lugar
- **Composición**: Construye componentes complejos combinando simples
- **Mantenimiento**: Cambia un átomo y se actualiza en todos lados
- **Escalabilidad**: Agregar nuevas páginas es fácil usando los organismos existentes

## 📝 Notas Importantes

- Las imágenes deben estar en `/public/img/` para que Vite las sirva
- Los estilos de Bootstrap se mantienen como están
- Cada componente tiene su propio CSS para facilitar el mantenimiento
- Usa `@/` para imports absolutos (configurado en `vite.config.js`)

