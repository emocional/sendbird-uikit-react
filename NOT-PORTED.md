# Cambios del fork que NO se han portado (o solo en parte)

Inventario respecto al fork **`@emocional/sendbird-uikit-react` 3.26.0** (tag `emo/fork-3.26.0-baseline`) y la línea actual en **`main`** (base upstream **3.18.0** + `src/emo/`).

| Referencia | Valor |
|------------|-------|
| Fork baseline | `emo/fork-3.26.0-baseline` — commit `e422575c` |
| Línea actual | `main` — pendiente publicar tras Fase estilos |
| Contrato consumidor | `emo-front` — [`src/emo/product/emo-front-usage.ts`](./src/emo/product/emo-front-usage.ts) |

Para lo implementado en código, ver [`src/emo/README.md`](./src/emo/README.md) y [`PATCHES.md`](./src/emo/PATCHES.md).

---

## Resumen ejecutivo

| Categoría | Estado |
|-----------|--------|
| API de producto (`enableAutoChat`, `searcherFilter`, `filterFn`, tags, online, ES) | **Portado** |
| Infraestructura (CI, `release-it`, Renovate, GH Packages) | **En `main`** |
| Comportamiento mensajes (`isByMe` → layout entrante) | **Portado** |
| Traducciones ES vs claves 3.18 | **Completas** |
| **Estilos / paridad visual fork §8** | **Casi completo** — validar en staging |
| APIs redundantes con 3.18 | **No portadas** — sustituidas (§2) |

---

## 1. Portado

### Producto, comportamiento, localización

- `enableAutoChat`, `searcherFilter`, `filterFn`, tags, online, invite 1:1, auto-chat
- `resolveEmocionalIsByMe`, traducciones ES (`es-string-set-overrides.ts`)
- Separador de fecha: locale `es`, `EMOCIONAL_BORDER`, `date-separator.ts` + `MessageView`

### Estilos (`src/emo/styles/`)

| Partial | Área |
|---------|------|
| `tokens.scss` | Colores marca, tags invite/lista |
| `_chrome.scss` | Avatar, headers chat/lista, iconos, separador |
| `_channel-list-item.scss` | Item canal: ancho, avatar 32px, hover, activo |
| `_messages.scss` | Layout mensajes, menú flotante |
| `_text-message-body.scss` | Sin burbujas de color |
| `_composer.scss` | Input pill |
| `_conversation.scss` | Contenedor sin borde/padding lateral |
| `_reactions-menu.scss` | Reacciones + menú hover |
| `_modals.scss` | Modal responsive + búsqueda header |

### UX código

- Menú: `EmocionalMessageMenu`, `EmocionalReplyButton`, triggers 24px
- Headers lista/chat, typing morado, modal invite Emocional

---

## 2. No portado a propósito

| Elemento fork | Decisión |
|---------------|----------|
| `userQuery` / `showCreateChannel` / `Modal.setSearcher` | Sustituido por API 3.18 + `src/emo/` |
| Flujo invite multi-select upstream | Con `skipChannelTypeSelection: false` |
| Parche masivo `isByMe` en cada `.tsx` | `resolveEmocionalIsByMe` |

---

## 3. Pendiente menor (baja prioridad)

| Área | Notas |
|------|--------|
| **Open channel** | Solo si se usa (dashboard = group channel) |
| **Validación visual staging** | Comparar lado a lado con fork 3.26.0 |
| **Cadenas upstream futuras** | Añadir a `es-string-set-overrides.ts` al mergear |

Los 13 archivos SCSS del fork con diff neto tienen equivalente en `src/emo/styles/` o enganche; no queda bloque de §3.1–3.2 sin cubrir salvo open channel.

---

## 4. Efectos conocidos

| Efecto | Causa |
|--------|--------|
| Sin editar/borrar mensajes propios (desktop) | `isByMe` forzado — igual que fork |
| Menús editar/borrar ocultos en propios | Mismo motivo |

---

## 5. Documentos relacionados

| Documento | Contenido |
|-----------|-----------|
| [`FORK-FEATURES.md`](./FORK-FEATURES.md) | Inventario histórico fork 3.26.0 |
| [`src/emo/PATCHES.md`](./src/emo/PATCHES.md) | Enganches upstream |
| [`src/emo/styles/overrides.scss`](./src/emo/styles/overrides.scss) | Import único de partials |
