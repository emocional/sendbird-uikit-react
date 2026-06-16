# Cambios del fork que NO se han portado a upstream 3.18

Inventario de lo que existía en el fork Emocional **`@emocional/sendbird-uikit-react` 3.26.0** (tag `emo/fork-3.26.0-baseline`) y **no** está en la rama experimental **`experiment/upstream-3.18.0-vanilla`** con el módulo `src/emo/`.

Para lo que **sí** se reimplementó, ver [`src/emo/README.md`](./src/emo/README.md) y [`FORK-FEATURES.md`](./FORK-FEATURES.md).

| Referencia | Valor |
|------------|-------|
| Fork baseline | `emo/fork-3.26.0-baseline` — commit `e422575c` |
| Base upstream del reset | `@sendbird/uikit-react` **3.18.0** (`upstream/v3.18.0`) |
| Rama de trabajo | `experiment/upstream-3.18.0-vanilla` |
| Contrato consumidor | `emo-front` — [`src/emo/product/emo-front-usage.ts`](./src/emo/product/emo-front-usage.ts) |

---

## Resumen ejecutivo

| Categoría | Estado |
|-----------|--------|
| API de producto (`enableAutoChat`, `searcherFilter`, `filterFn`, tags, online, ES) | **Portado** en `src/emo/` |
| Infraestructura (CI, release-it, Renovate) | **Pendiente** — Fase 4 del plan |
| Estilos / UX masivos (mensajes, listas, modales genéricos) | **Mayoría no portada** |
| `isByMe = false` global | **Descartado** a propósito |
| APIs redundantes con 3.18 (`userQuery` por App, `showCreateChannel`, `Modal.setSearcher`) | **No portadas** — sustituidas o innecesarias |
| Traducciones ES completas vs 3.18 | **Parcial** — claves nuevas en inglés |

---

## 1. Infraestructura y publicación (§1–§2 de FORK-FEATURES)

No rehecho en la rama experimental **por diseño** (evitar publicar vanilla por accidente). Corresponde a la **Fase 4** de [`UPSTREAM-RESET-PLAN.md`](./UPSTREAM-RESET-PLAN.md).

| Elemento del fork | Estado |
|-------------------|--------|
| GitHub Actions — CI (`.github/workflows/CI.yml`) | No portado |
| GitHub Actions — publicación (`publish.yml` + `release-it`) | No portado |
| GitHub Actions — auto-approve, PR title | No portado |
| `.release-it.json` y script `release` | No portado |
| Renovate (`.github/renovate.json`) | No portado |
| `build.sh` para enlace local con `emo-front` | No revisado/portado en esta rama |
| README mínimo de Emocional | No sustituido (sigue README upstream en experimental) |

**Nota:** el rename del paquete a `@emocional/sendbird-uikit-react` en `scripts/package.template.json` **sí** está para el artefacto de build; la cadena de release completa no.

---

## 2. API pública — no portada o sustituida

### 2.1 Descartada por redundancia con upstream 3.18

| API del fork | Por qué no se portó | Alternativa en 3.18 |
|--------------|---------------------|---------------------|
| `userQuery` propagado por `App` → layouts → `CreateChannel` | `emo-front` ya pasa `userListQuery` en `SendbirdProvider`; upstream lo propaga hasta el modal | `userListQuery` en provider |
| `showCreateChannel` en `CreateChannelUI` | Upstream monta `CreateChannel` solo cuando el modal está visible (`createChannelVisible`) | Comportamiento nativo 3.18 |
| `Modal.setSearcher` (parche en `Modal`) | Evitar parchear componente upstream | `renderHeader` + `EmocionalModalSearchHeader` en flujo invite Emocional |
| `UserListItem.onSubmit` como API pública | Lógica encapsulada en módulo Emocional | `EmocionalUserListItem` + tap → `handleSubmit` |

### 2.2 Comportamiento revertido (decisión explícita)

| Cambio del fork | Estado | Motivo |
|-----------------|--------|--------|
| **`isByMe = false` hardcoded** en `MessageContent`, bodies de mensaje, `MessageProvider`, `OpenChannelMessage`, reacciones, quotes, etc. | **Descartado** | Upstream 3.18 usa layout estándar: mensajes propios (`outgoing`, derecha) vs ajenos (`incoming`, izquierda). Forzar todo como “recibido” rompe el patrón de chat y no es requisito documentado en `emo-front`. |

`isByMe` indica si el mensaje lo envió el usuario conectado; controla alineación, colores, menús (editar/borrar) y clases `outgoing` / `incoming`. Ver cálculo normal en `src/ui/MessageContent/index.tsx`.

### 2.3 Flujo upstream que el fork sustituyó (sigue disponible)

Si `skipChannelTypeSelection` es `false`, se mantiene el flujo Sendbird original:

- Selección de tipo de canal (`SelectChannelType`)
- Invitación multi-usuario con checkboxes
- `isDistinct: false` en creación grupal

El fork forzaba siempre invite 1:1 distinct; en 3.18 eso es el **default** Emocional (`skipChannelTypeSelection: true`), no un parche global.

---

## 3. Personalización visual (§8) — no portada o solo parcial

### 3.1 Lo que SÍ hay (referencia para no duplicar trabajo)

Implementación mínima en `src/emo/styles/` e integración:

- Token / color `EMOCIONAL` en icono `+` (`AddGroupChannel`)
- SCSS `emocional_border` (`#dee1e580`) en header y bordes de mensaje
- Fondo del canal seleccionado (`sendbird-channel-preview--active`)
- `hideFooter` + scroll móvil `calc(innerHeight - 200px)` en **modal de invite Emocional** (no en todos los modales)
- Badge empresa en header y tags en lista (lógica, no rediseño completo del header)

### 3.2 Cabecera del canal (`GroupChannelHeader`)

| Cambio del fork | Estado |
|-----------------|--------|
| `borderTopRadius: 16` en cabecera | No portado |
| Eliminar `onChatHeaderActionClick` (botón info del header) | **No portado** — se mantiene header 3.18 con búsqueda/info |
| Evitar solapamiento cerrar / búsqueda (commit `5d00ffec`) | No portado como parche explícito |
| Layout título + badge empresa en fila | Parcial — badge vía `renderMiddle` Emocional, sin rediseño completo del header upstream |

### 3.3 Cabecera de lista (`GroupChannelListHeader`)

| Cambio del fork | Estado |
|-----------------|--------|
| Layout simplificado (avatar + nombre en una fila) | No portado |
| Quitar `userId` visible bajo el nickname | No portado |
| Quitar handler `onEdit` del título | No portado |

### 3.4 Mensajes y composer

| Área | Cambio del fork | Estado |
|------|-----------------|--------|
| Alineación global | `isByMe = false` en todos los componentes de mensaje | **Descartado** (ver §2.2) |
| `MessageContent` | Parches de layout, clases, menús | No portado |
| `TextMessageItemBody`, `FileMessageItemBody`, `VoiceMessageItemBody`, `OGMessageItemBody`, `ThumbnailMessageItemBody`, `UnknownMessageItemBody` | Estilos y `isByMe` forzado | No portado |
| `QuoteMessage`, `EmojiReactions` | Estilos + `isByMe` | No portado |
| `MessageInput` | Bordes y padding custom (`index.scss`) | No portado |
| `DateSeparator` | Formato y estilo | No portado |
| `MessageItemMenu`, `MessageItemReactionMenu` | Layout y menú contextual | No portado |
| `ReplyButton` exportado / estilos reply | No portado |
| `LabelColors.EMOCIONAL_BORDER` en componentes Label | Solo token SCSS en overrides; no cableado en bodies |

### 3.5 Listas, avatares e indicadores

| Área | Cambio del fork | Estado |
|------|-----------------|--------|
| `Avatar` / `ChannelAvatar` | `borderRadius: 6px` global | No portado (online sí, vía wrapper Emocional) |
| `TypingIndicator` | Nickname `#4a1ca6`, `fontWeight: 600` | No portado |
| `TypingIndicator` | Eliminar caso “2 usuarios escribiendo” | No portado |
| `GroupChannelListItem` SCSS masivo | Más allá de active background + tags | No portado |
| `GroupChannelUI` / `MessageList` SCSS | Commits de estilo S2884 (`aa1c82c1`, etc.) | No portado |

### 3.6 Modales y botones (genéricos)

| Área | Cambio del fork | Estado |
|------|-----------------|--------|
| `Modal` — bordes, padding, responsive global | No portado (solo invite Emocional) |
| Botones primarios — color de marca en toda la UI | No portado |
| `Icon/index.scss` — mapeos de color ampliados | Solo color `EMOCIONAL` mínimo |
| `utils/color.ts` / `color.scss` del fork | Sustituido por `src/emo/styles/tokens.scss` parcial |

### 3.7 Archivos upstream del fork §9 no tocados en el reset

Estos archivos tenían diff en 3.26.0 y **no** tienen equivalente Emocional (salvo enganches listados en [`PATCHES.md`](./src/emo/PATCHES.md)):

- `src/modules/App/*` — propagación `userQuery` / props (innecesario)
- `src/modules/ChannelList/components/*`
- `src/modules/GroupChannel/components/Message/MessageView.tsx`
- `src/modules/GroupChannel/components/MessageList/index.scss`
- `src/modules/GroupChannel/components/TypingIndicator.tsx`
- `src/modules/GroupChannel/components/GroupChannelUI/index.scss`
- `src/modules/GroupChannelList/components/GroupChannelListHeader/*`
- `src/ui/MessageContent/*` (salvo estilos globales vía SCSS Emocional)
- `src/ui/MessageInput/index.scss`
- `src/ui/DateSeparator`, `src/ui/EmojiReactions`
- `src/ui/MessageItemMenu`, `src/ui/MessageItemReactionMenu`
- `src/ui/TextMessageItemBody/*`, `src/ui/FileMessageItemBody`, etc.
- `src/ui/Modal/*` (sin parche `setSearcher`; invite usa `renderHeader`)
- `src/ui/Avatar/*` (parches de border-radius)
- `src/lib/LocalizationContext.tsx` — hardcode `es` (sustituido por `src/emo/locales/`)
- `src/ui/Label/stringSet.ts` — bloque `es` inline (sustituido por overrides en `emo/locales/`)

---

## 4. Localización — huecos respecto al fork y a 3.18

| Aspecto | Estado |
|---------|--------|
| `defaultLocale: 'es'` y `date-fns` español | **Portado** |
| Bloque `es` del fork (~200+ claves en `stringSet.ts`) | **Portado** como `ES_STRING_SET_OVERRIDES` |
| Claves **nuevas** en upstream 3.18 (feedback, forms, plantillas, etc.) | **No traducidas** — fallback a inglés vía `getEmocionalStringSet` |
| Hardcode `es` en `LocalizationContext` upstream | **No replicado** — enfoque en provider Emocional |

Para completar paridad lingüística con el fork sobre 3.18, habría que auditar diff de `stringSet` entre `v3.18.0` y el bloque ES legacy y añadir claves a `es-string-set-overrides.ts`.

---

## 5. Fases del plan no ejecutadas

| Fase | Descripción | Estado |
|------|-------------|--------|
| Fase 2 | Preview front con upstream vanilla (rama `emo-front` temporal) | Saltada por decisión de equipo |
| Fase 4 | Sustituir `main`, semver, publicar GH Packages, bump en `emo-front` | Pendiente |

---

## 6. Cómo recuperar un ítem si vuelve a ser requisito

| Prioridad sugerida | Ítem | Enfoque recomendado |
|--------------------|------|---------------------|
| Baja (salvo petición UX) | Estilos mensajes / `isByMe` | Decisión de producto; si aplica, preferir SCSS en `src/emo/styles/` antes que parchear `MessageContent` |
| Media | `TypingIndicator`, avatares 6px, `GroupChannelListHeader` | Overrides SCSS o wrappers en `src/emo/integration/` |
| Media | Traducciones ES claves 3.18 | Ampliar `es-string-set-overrides.ts` |
| Alta (release) | CI / release-it / publish | Fase 4 — copiar/adaptar desde `preserve/emo-fork-3.26.0` |
| — | `userQuery` / `showCreateChannel` / `Modal.setSearcher` | **No recuperar** salvo nuevo consumidor que no use `SendbirdProvider` |

**Referencia de diff histórico** (fork vs punto de divergencia Sendbird):

```bash
MB=742e337b
git diff $MB..emo/fork-3.26.0-baseline -- <ruta/archivo>
```

Commits humanos más conflictivos (evitar cherry-pick directo): `aa1c82c1`, `3f1efd62`, `4c7aebd9` (estilos), cambios masivos en `MessageContent` / `isByMe`. Ver tabla en `FORK-FEATURES.md` §10.

---

## 7. Documentos relacionados

| Documento | Contenido |
|-----------|-----------|
| [`FORK-FEATURES.md`](./FORK-FEATURES.md) | Inventario completo del fork 3.26.0 |
| [`UPSTREAM-RESET-PLAN.md`](./UPSTREAM-RESET-PLAN.md) | Estrategia de reset y fases |
| [`src/emo/PATCHES.md`](./src/emo/PATCHES.md) | Enganches mínimos en upstream + tabla “no reimplementado” |
| [`src/emo/README.md`](./src/emo/README.md) | Features **sí** implementadas |
| [`src/emo/product/emo-front-usage.ts`](./src/emo/product/emo-front-usage.ts) | Contrato mínimo con `emo-front` |
