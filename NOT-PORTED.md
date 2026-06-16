# Cambios del fork que NO se han portado (o solo en parte)

Inventario respecto al fork **`@emocional/sendbird-uikit-react` 3.26.0** (tag `emo/fork-3.26.0-baseline`) y la línea actual en **`main`** (base upstream **3.18.0** + `src/emo/`).

| Referencia | Valor |
|------------|-------|
| Fork baseline | `emo/fork-3.26.0-baseline` — commit `e422575c` |
| Línea actual | `main` — publicado p. ej. **3.29.0** |
| Contrato consumidor | `emo-front` — [`src/emo/product/emo-front-usage.ts`](./src/emo/product/emo-front-usage.ts) |
| Validación staging | **Funcional OK** (chat, invite, tags, auto-chat, ES). **Visual: diferencias notables** vs 3.26.0 — ver §5 |

Para lo implementado en código, ver [`src/emo/README.md`](./src/emo/README.md) y [`PATCHES.md`](./src/emo/PATCHES.md).

---

## Resumen ejecutivo

| Categoría | Estado |
|-----------|--------|
| API de producto (`enableAutoChat`, `searcherFilter`, `filterFn`, tags, online, ES) | **Portado** |
| Infraestructura (CI, `release-it`, Renovate, GH Packages) | **En `main`** |
| Comportamiento mensajes (`isByMe` → layout entrante) | **Portado** — `resolveEmocionalIsByMe` |
| Traducciones ES vs claves 3.18 | **Completas** — `es-string-set-overrides.ts` |
| **Estilos / paridad visual con fork §8** | **Parcial** — causa principal de diferencias en staging |
| APIs redundantes con 3.18 | **No portadas** — sustituidas (ver §2) |

---

## 1. Portado (no está en este documento salvo referencia)

### Producto y API

- `enableAutoChat`, `searcherFilter`, `filterFn`, `skipChannelTypeSelection`
- Tags `professional` / `team` / `company` / `company_name`
- Online en avatar, localización ES, invite 1:1 + búsqueda en modal
- Tests: `yarn test:emo` + suite completa tras ajustes `isByMe`

### Estilos y UX ya migrados

| Área fork §8 | Implementación actual |
|--------------|----------------------|
| Icono `+` color marca | `IconColors.EMOCIONAL` + `AddGroupChannel` |
| Token borde `#dee1e580` | `tokens.scss`, bordes header/mensaje en `overrides.scss` |
| Canal seleccionado | `.sendbird-channel-preview--active` |
| Tags en lista / invite | `user-tags.ts`, `tokens.scss` |
| Header chat: badge empresa, sin botón info, radius 16px | `group-channel-header.tsx` + `.scss` |
| Header lista: avatar + nombre, sin userId/onEdit | `group-channel-list-header.tsx` + `overrides.scss` |
| Typing: nickname morado, sin “2 usuarios” | `EmocionalTypingIndicatorText` |
| Avatares 6px | `overrides.scss` |
| Input: borde redondeado y fondo | `_composer.scss` |
| Alineación mensajes a la izquierda | `message-layout.ts` + `_messages.scss` |
| Burbujas sin color / hover fila | `_text-message-body.scss`, `_messages.scss` |
| Contenedor conversación sin borde/padding lateral | `_conversation.scss` |
| Reacciones: radio contenedor | `_messages.scss` |
| Botones primarios morados | `overrides.scss` (selector genérico) |
| Modal invite: `hideFooter`, scroll móvil, búsqueda en header | `EmocionalInviteUsers` + `emocional-modal-search-header.scss` |

---

## 2. API y comportamiento — no portado (a propósito)

| Elemento del fork | Decisión |
|-----------------|----------|
| `userQuery` por `App` | Innecesario: `userListQuery` en `SendbirdProvider` |
| `showCreateChannel` | Innecesario: upstream monta el modal solo si está abierto |
| `Modal.setSearcher` | Sustituido por `renderHeader` + `EmocionalModalSearchHeader` |
| `UserListItem.onSubmit` como API pública | Encapsulado en `EmocionalUserListItem` |
| Flujo invite upstream (multi-select) | Disponible si `skipChannelTypeSelection: false` |

---

## 3. Estilos del fork §8 — pendientes o muy incompletos

**Validación staging:** el chat **funciona**; la UI **no replica** el aspecto del fork 3.26.0. La mayoría del gap está aquí: el fork parcheaba **SCSS upstream archivo a archivo**; en 3.18 solo hay **overrides globales** + pocos enganches.

### 3.1 Prioridad alta (impacto visual en el chat diario)

Referencias de diff: `git diff 742e337b..emo/fork-3.26.0-baseline -- <archivo>`

| Área | Archivos fork con diff | Qué falta respecto al fork |
|------|------------------------|----------------------------|
| **Burbujas y layout de mensajes** | `src/ui/MessageContent/index.scss` (~78 líneas) | **Portado** → `src/emo/styles/_messages.scss` |
| **Cuerpo texto** | `src/ui/TextMessageItemBody/index.scss` | **Portado** → `src/emo/styles/_text-message-body.scss` |
| **Composer** | `src/ui/MessageInput/index.scss` | **Portado** → `src/emo/styles/_composer.scss` |
| **Lista de mensajes / contenedor** | `src/modules/GroupChannel/components/GroupChannelUI/index.scss`, `MessageList/index.scss` | **Portado** → `src/emo/styles/_conversation.scss` |
| **Labels en mensajes** | `src/ui/Label/index.scss`, `Label/types` (`EMOCIONAL_BORDER`) | SCSS listo en `tokens.scss`; **falta** cablear `LabelColors` + `MessageView` (locale `es` en separador) |

### 3.2 Prioridad media

| Área | Archivos fork | Qué falta |
|------|---------------|-----------|
| **Reacciones emoji** | `src/ui/EmojiReactions/index.scss` (si existía diff), contenedor en `MessageContent` | Estilos de badges y botones; solo `border-radius` del contenedor |
| **Menú contextual** | `src/ui/MessageItemMenu`, `MessageItemReactionMenu` | Layout flotante, reply — en fork ligado a `MessageContent` SCSS |
| **Item de canal** | `src/modules/GroupChannelList/components/GroupChannelListItem/index.scss` | Tipografía, padding, estados hover más allá de `--active` |
| **Modales genéricos** | `src/ui/Modal/index.scss` | Bordes, padding, responsive — solo cubierto el modal invite Emocional |
| **Iconos** | `src/ui/Icon/index.scss` | Mapeos de color adicionales |
| **Utilidades color** | `src/utils/color.scss` | Variables SCSS del fork no replicadas todas en `tokens.scss` |

### 3.3 Prioridad baja

| Área | Notas |
|------|--------|
| **DateSeparator** | Formato/estilo del separador de fecha |
| **Cabecera chat** | Fix solapamiento cerrar/búsqueda (`5d00ffec`) — no verificado en 3.18 |
| **Open channel** | Estilos si se usa open channel (dashboard usa group channel) |

### 3.4 Enfoque recomendado para cerrar el gap (Fase estilos)

1. **No** volver a parchear decenas de `.tsx` upstream como en 3.26.0.
2. Portar reglas del fork **archivo SCSS → `src/emo/styles/`** (nuevos partials: `_messages.scss`, `_composer.scss`, `_modals.scss`) usando selectores `.sendbird-*` del DOM 3.18.
3. Comparar en staging **lado a lado** con capturas del fork o checklist por pantalla.
4. Commits pequeños por área (mensajes → input → modales).

Commits de referencia del fork (evitar cherry-pick ciego): `aa1c82c1`, `3f1efd62`, `4c7aebd9`, `6e9241fa`, `1c256347`, `b6274975`, `450d17bb`.

---

## 4. Archivos upstream con diff de estilos en 3.26.0 sin equivalente Emocional

Lista para auditar al portar estilos (13 archivos SCSS con diff neto fork vs `742e337b`):

```
src/modules/GroupChannel/components/GroupChannelHeader/index.scss
src/modules/GroupChannel/components/GroupChannelUI/index.scss
src/modules/GroupChannel/components/MessageList/index.scss
src/modules/GroupChannelList/components/GroupChannelListHeader/index.scss
src/modules/GroupChannelList/components/GroupChannelListItem/index.scss
src/ui/Avatar/index.scss
src/ui/Icon/index.scss
src/ui/Label/index.scss
src/ui/MessageContent/index.scss      ← mayor volumen
src/ui/MessageInput/index.scss
src/ui/Modal/index.scss
src/ui/TextMessageItemBody/index.scss
src/utils/color.scss
```

Enganches de código (no estilo) ya listados en [`PATCHES.md`](./src/emo/PATCHES.md).

---

## 5. Validación staging (jun 2026)

| Aspecto | Resultado |
|---------|-----------|
| Conexión Sendbird, listas, mensajes, invite, auto-chat | OK |
| Tags, online, ES | OK |
| Paridad visual con fork 3.26.0 | **No** — demasiadas diferencias; coherente con §3 |
| Menús editar/borrar en mensajes propios | Ausentes (efecto de `isByMe` forzado; igual que fork) |

---

## 6. Localización

| Aspecto | Estado |
|---------|--------|
| `defaultLocale: 'es'`, `date-fns` español | Portado |
| Bloque ES legacy + claves nuevas 3.18 | Portado — paridad de claves con `en` |
| Cadenas solo en upstream post-3.18 futuras | Añadir a `es-string-set-overrides.ts` al mergear upstream |

---

## 7. Infraestructura y plan de reset

| Ítem | Estado |
|------|--------|
| Fase 4 ( `main`, publicación GH Packages ) | **Hecha** |
| Fase 2 preview vanilla local | Saltada |
| **Fase estilos** (paridad §8) | **En curso** — staging confirma gap |
| Rama `experiment/upstream-3.18.0-vanilla` | Obsoleta; puede archivarse |
| `preserve/emo-fork-3.26.0` + tag baseline | Mantener como referencia visual/diff |

---

## 8. Qué no recuperar

| Ítem | Motivo |
|------|--------|
| `userQuery` / `showCreateChannel` / `Modal.setSearcher` | Sustituidos por API 3.18 + `src/emo/` |
| Parche masivo de `isByMe` en cada `.tsx` | Sustituido por `resolveEmocionalIsByMe` |
| README / workflows Sendbird upstream en push a `main` | No aplican al fork Emocional |

---

## 9. Documentos relacionados

| Documento | Contenido |
|-----------|-----------|
| [`FORK-FEATURES.md`](./FORK-FEATURES.md) | Inventario histórico del fork 3.26.0 |
| [`UPSTREAM-RESET-PLAN.md`](./UPSTREAM-RESET-PLAN.md) | Plan de reset (Fase 4 cerrada) |
| [`src/emo/PATCHES.md`](./src/emo/PATCHES.md) | Enganches upstream |
| [`src/emo/README.md`](./src/emo/README.md) | Features implementadas |
| [`src/emo/styles/overrides.scss`](./src/emo/styles/overrides.scss) | Overrides actuales |

**Comando útil por archivo de estilo:**

```bash
MB=742e337b
git diff $MB..emo/fork-3.26.0-baseline -- src/ui/MessageContent/index.scss
```
