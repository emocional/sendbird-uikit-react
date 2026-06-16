# Características añadidas al fork de Sendbird UIKit React

Inventario de cambios propios de Emocional respecto al repositorio original
[`sendbird/sendbird-uikit-react`](https://github.com/sendbird/sendbird-uikit-react).

## Referencia de comparación

| | Commit | Fecha | Notas |
|---|--------|-------|-------|
| **Punto del fork** | `742e337b` | 2024-04-18 | Último ancestro común con `upstream/main` — Sendbird `3.14.1` |
| **Estado actual** | `e422575c` | 2025-05-16 | `@emocional/sendbird-uikit-react` `3.26.0` |

Comando de comparación: `git diff 742e337b..e422575c`

**Alcance del diff:** 76 archivos, +23.636 / −2.184 líneas (la mayor parte del volumen es `pnpm-lock.yaml`; código ~5.200 líneas netas).

**Commits humanos del fork:** 35 (sin contar ~196 commits automáticos de release del bot `emo-action`).

---

## 1. Empaquetado y distribución

| Característica | Detalle |
|----------------|---------|
| Renombrado del paquete | `@sendbird/uikit-react` → `@emocional/sendbird-uikit-react` |
| Versión publicada | `3.14.1` → `3.26.0` |
| Registry de publicación | GitHub Packages (`publishConfig.registry`: `https://npm.pkg.github.com/`) |
| `.npmrc` | Configuración para consumir/publicar en GitHub Packages |
| Repositorio | URL apuntando a `emocional/sendbird-uikit-react` |
| README | Sustituido por documentación mínima de Emocional (`pnpm i @emocional/sendbird-uikit-react`) |
| `build.sh` | Script auxiliar para build local y enlace con `emo-front` vía `file://` |
| `scripts/package.template.json` | Plantilla de `package.json` del artefacto publicado en `dist/` |

---

## 2. CI/CD, releases y mantenimiento

| Característica | Detalle |
|----------------|---------|
| GitHub Actions — CI | `.github/workflows/CI.yml` |
| GitHub Actions — publicación | `.github/workflows/publish.yml` — build + `release-it` en push a `main` |
| GitHub Actions — auto-approve | `.github/workflows/auto-approve.yml` |
| GitHub Actions — PR title | `.github/workflows/pr-title.yml` |
| **release-it** | `.release-it.json` — versionado semver, tag, GitHub Release y publish a npm registry |
| Script `release` | `yarn test && dotenv release-it` en `package.json` |
| **Renovate** | `.github/renovate.json` — actualización automática de dependencias con automerge |
| Gestor de paquetes | Migración a **yarn** (con `pnpm-lock.yaml` también presente en el repo) |
| Dependencias de release | `release-it`, `@release-it/conventional-changelog` añadidas como dependencias |

---

## 3. API pública — nuevas props y tipos

### `SendbirdProvider` / `App`

| Prop / tipo | Tipo | Descripción |
|-------------|------|-------------|
| `enableAutoChat` | `boolean` (default: `false`) | Crea conversaciones automáticamente al cargar la lista de usuarios del modal de invitación |
| `searcherFilter` | `(v: string) => void` | Callback para filtrar usuarios desde un input de búsqueda en el modal |
| `userQuery` | `() => UserListQuery` | Query personalizada de usuarios propagada por `App` → layouts → listas de canales (sin sobrescribir el SDK global) |

### `UserListQuery` (extendido)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `filterFn` | `(user: User) => boolean` | Filtro aplicado a los resultados de `next()` al listar usuarios invitables |

Definido en `src/types.ts`, `src/lib/Sendbird.tsx` y `CreateChannelProvider`.

### `CreateChannelUI` / `InviteUsers`

| Prop | Tipo | Descripción |
|------|------|-------------|
| `showCreateChannel` | `boolean` | Controla si el modal de creación de canal se muestra (antes siempre visible al montar) |

### `UserListItem`

| Prop | Tipo | Descripción |
|------|------|-------------|
| `onSubmit` | `(userId: string) => void` | Click en la fila crea canal directamente con ese usuario (flujo simplificado, sin checkbox multi-selección) |

### `Modal`

| Prop | Tipo | Descripción |
|------|------|-------------|
| `setSearcher` | `Dispatch<SetStateAction<string>>` | Si se pasa, el header del modal muestra un `<input placeholder="Buscar">` en lugar del título |
| `hideFooter` | `boolean` | Oculta botones Cancelar/Crear del pie del modal |

---

## 4. Creación de canales y selección de usuarios

### Flujo de invitación rediseñado (`InviteUsers`)

- Eliminada la selección múltiple con checkboxes y botón "Crear".
- Cada `UserListItem` es clickable y dispara `handleSubmit(userId)` al instante.
- Canal creado como **distinct** (`isDistinct: true`) con el usuario clicado como invitado.
- Soporte de `userListQuery` personalizada sin pisar la query global del SDK.
- `filterFn` aplicado en la carga inicial y en scroll infinito (paginación con `BUFFER = 50`).
- Scroll con altura dinámica en móvil (`window.innerHeight - 200px`) para evitar roturas de layout.
- Modal condicional: solo se renderiza si `showCreateChannel === true`.

### Creación automática de chats (`enableAutoChat`)

Cuando `enableAutoChat` está activo, al cargar la lista de usuarios se itera y se llama a `handleSubmit` para **cada usuario**, creando conversaciones automáticamente sin interacción del usuario.

### Búsqueda en modal (`searcherFilter`)

Input de búsqueda integrado en el header del modal; el valor se delega al consumidor vía `searcherFilter` para filtrar la lista externamente.

### Propagación de `userQuery`

La query personalizada se pasa desde:

- `App` → `AppLayout` → `DesktopLayout` / `MobileLayout`
- `ChannelList` → `AddChannel`
- `GroupChannelList` → `AddGroupChannel` → `AddGroupChannelView` → `CreateChannel`

Permite inyectar usuarios sin modificar la configuración global del SDK Sendbird.

---

## 5. Metadatos de usuario y etiquetas (tags)

El fork lee metadatos Sendbird (`user.metaData`) para mostrar información de negocio.

### Tag de profesional (`professional`)

| Ubicación | Comportamiento |
|-----------|----------------|
| `UserListItem` | Badge con rol del profesional en el modal de invitación |
| `GroupChannelListItem` | Tag bajo el nombre del canal en la lista |

**Mapeo** (`getGlobalUserTag`):

| Valor en `metaData.professional` | Texto mostrado |
|----------------------------------|----------------|
| `coach` | Coach Emocional |
| `psychologist` | Psicólogo/a |
| otro | valor literal |

### Tag de equipo (`team` / `company`)

En la lista de canales (`getUserTeam`):

- Si el interlocutor tiene `metaData.company`, se muestra:
  - tag de `professional` (vía `getGlobalUserTag`) si existe, o
  - `metaData.team` en caso contrario.

### Tag de empresa en cabecera del chat (`company_name`)

En `GroupChannelHeader`:

- `getUserCompany(channel, userId)` lee `metaData.company_name` del **usuario actual**.
- Se muestra un badge junto al título del canal si el valor existe.

---

## 6. Estado de conexión (online/offline)

### Indicador en avatar del canal (`ChannelAvatar`)

- Nueva utilidad `getMemberStatus(channel, userId)` — devuelve `connectionStatus` de los miembros.
- Punto verde (`#4ADE80`) en la esquina inferior derecha del avatar cuando el interlocutor está `online`.

---

## 7. Localización

| Cambio | Detalle |
|--------|---------|
| Idioma por defecto | `en` → **`es`** en `LocalizationContext` y `SendbirdProvider` |
| Locale de fechas | `date-fns/locale/en-US` → `date-fns/locale/es` |
| `stringSet` español | Bloque completo `es: { ... }` añadido en `src/ui/Label/stringSet.ts` (~200+ claves traducidas) |

---

## 8. Personalización visual (UX / estilos)

### Paleta y tokens de color Emocional

| Token | Uso |
|-------|-----|
| `IconColors.EMOCIONAL` | Icono "+" de crear canal, iconos de acción |
| `LabelColors.EMOCIONAL_BORDER` | Bordes y separadores de mensajes |
| `Colors.EMOCIONAL_BORDER` | Clase SCSS `sendbird-color--emocional_border` (`#dee1e580`) |

### Cabecera del canal de grupo (`GroupChannelHeader`)

- Bordes superiores redondeados (`borderTopRadius: 16`).
- Layout del título + badge de empresa en fila.
- Eliminado `onChatHeaderActionClick` del header.

### Cabecera de lista de canales (`GroupChannelListHeader`)

- Layout simplificado: avatar + nombre en una sola fila.
- Eliminado el `userId` visible debajo del nickname.
- Eliminado el handler `onEdit` del título.

### Lista de canales (`GroupChannelListItem`)

- Fondo del canal seleccionado personalizado (`sendbird-channel-preview--active`).
- Tag de equipo/profesional bajo el nombre del canal.
- Avatar con indicador online.

### Indicador de escritura (`TypingIndicator`)

- Nickname del usuario que escribe en color `#4a1ca6` y `fontWeight: 600`.
- Eliminado el caso de dos usuarios escribiendo (solo 1 o múltiples genérico).

### Mensajes — alineación forzada

**Cambio de comportamiento importante:** en múltiples componentes se ha fijado `isByMe = false` (hardcoded), de modo que **todos los mensajes se renderizan como si fueran del interlocutor** (alineación y estilos de "mensaje recibido"):

- `MessageContent`
- `TextMessageItemBody`, `FileMessageItemBody`, `VoiceMessageItemBody`
- `OGMessageItemBody`, `ThumbnailMessageItemBody`, `UnknownMessageItemBody`
- `QuoteMessage`, `EmojiReactions`, `TemplateMessageItemBody`
- `MessageProvider` (contexto)
- `OpenChannelMessage`

### Otros ajustes visuales (commits de estilo)

| Área | Cambio |
|------|--------|
| Botones | Color de botones primarios adaptado a marca Emocional |
| Modal de crear chat | Diseño responsive para móvil |
| Modal | Footer oculto en flujo de invitación; input de búsqueda en header |
| Canal seleccionado | Background del item activo en lista |
| Input de mensajes | Estilos de borde y padding |
| Avatares | `borderRadius: 6px` |
| Reacciones emoji | Estilos de contenedor y botones |
| Separador de fechas | Formato y estilo |
| Menú contextual de mensajes | Layout y botón de reply (`ReplyButton` exportado) |
| Iconos | Nuevos mapeos de color en `Icon/utils.ts` y `Icon/index.scss` |
| Labels | Tipografía y colores en componentes de texto |
| Modal | Bordes, padding y comportamiento responsive |
| Typing indicator | Color del nickname |
| Cabecera del chat | Evitar solapamiento entre botón cerrar y búsqueda |

---

## 9. Archivos de código modificados (61 en `src/`)

### Core / lib

- `src/lib/Sendbird.tsx` — props `enableAutoChat`, `searcherFilter`, `filterFn`
- `src/lib/types.ts` — tipos de configuración extendidos
- `src/lib/LocalizationContext.tsx` — español por defecto

### Módulos App

- `src/modules/App/index.tsx` — propagación de `userQuery`, `enableAutoChat`, `searcherFilter`
- `src/modules/App/AppLayout.tsx`, `DesktopLayout.tsx`, `MobileLayout.tsx`, `types.ts`

### Creación de canales

- `src/modules/CreateChannel/components/InviteUsers/index.tsx` — flujo completo rediseñado
- `src/modules/CreateChannel/components/CreateChannelUI/index.tsx` — `showCreateChannel`
- `src/modules/CreateChannel/context/CreateChannelProvider.tsx` — `filterFn` en query

### Lista de canales

- `src/modules/ChannelList/components/AddChannel/index.tsx`
- `src/modules/ChannelList/components/ChannelListUI/index.tsx`
- `src/modules/GroupChannelList/components/AddGroupChannel/*`
- `src/modules/GroupChannelList/components/GroupChannelListHeader/*`
- `src/modules/GroupChannelList/components/GroupChannelListItem/*`
- `src/modules/GroupChannelList/components/GroupChannelListUI/index.tsx`

### Canal de grupo (vista activa)

- `src/modules/GroupChannel/components/GroupChannelHeader/*` — tag empresa, layout
- `src/modules/GroupChannel/components/GroupChannelUI/index.scss`
- `src/modules/GroupChannel/components/Message/MessageView.tsx`
- `src/modules/GroupChannel/components/MessageList/index.scss`
- `src/modules/GroupChannel/components/TypingIndicator.tsx`

### UI components

- `src/ui/Avatar/*`, `src/ui/ChannelAvatar/*`
- `src/ui/DateSeparator`, `src/ui/EmojiReactions`
- `src/ui/FileMessageItemBody`, `src/ui/VoiceMessageItemBody`
- `src/ui/Icon/*` — color `EMOCIONAL`
- `src/ui/Label/*` — strings en español
- `src/ui/MessageContent/*` — layout y `isByMe`
- `src/ui/MessageInput/index.scss`
- `src/ui/MessageItemMenu`, `src/ui/MessageItemReactionMenu`
- `src/ui/Modal/*` — búsqueda y `hideFooter`
- `src/ui/TextMessageItemBody/*`
- `src/ui/UserListItem/*` — tag profesional, `onSubmit`
- `src/utils/color.ts`, `src/utils/color.scss`
- `src/types.ts`

---

## 10. Commits humanos (cronología)

| Commit | Autor | Descripción |
|--------|-------|-------------|
| `24661450` | Daniel Guerrero | `userQuery` para añadir usuarios sin sobrescribir el SDK |
| `9f1838c4` | Daniel Guerrero | GitHub Actions y pnpm |
| `fb4c9ae0` | Maxi Vitelli | Script de release |
| `f2e9dd35` | Maxi Vitelli | Migración a yarn |
| `505a3b56` | Daniel Guerrero | Build para desarrollo local |
| `68406d5a`–`f84e1e5d` | MVitelli | Fixes de CI/publicación y release 3.14.4 / 3.15.0 |
| `4c7aebd9` | Esteve-Mas | Estilos de librería (v1) |
| `3f1efd62` | Esteve-Mas | Estilos de librería (v2) |
| `c99822d7` | Daniel Guerrero | Filtro de profesionales |
| `9d63ff54` | esteve | Estado de conexión en avatar |
| `6bba0585` | Esteve-Mas | Fix crear canal + `showCreateChannel` |
| `5c88818a` | Esteve-Mas | Crear conversaciones automáticamente |
| `91944821` | Esteve-Mas | Fix bug online/offline |
| `d6113730` | Esteve-Mas | Tag para profesionales |
| `e489ae26` | Esteve-Mas | Crear chats auto |
| `76ccd6d3` | Maxi Vitelli | Scope global de profesionales |
| `9dd81cc0` | MVitelli | Filtro en scroll de invitación |
| `6e9241fa` | Esteve-Mas | Background canal seleccionado |
| `1c256347` | Esteve-Mas | Modal crear chat responsive |
| `5d00ffec` | Esteve-Mas | Fix solapamiento cerrar/búsqueda |
| `aa1c82c1` | Esteve-Mas | Estilos chat S2884 |
| `b6274975` | Esteve-Mas | Color de botones |
| `450d17bb` | Esteve-Mas | Color del typing indicator |
| `2b2aea32` | Esteve-Mas | Cambios UX generales |
| `ed2b0459` | Esteve-Mas | Tag de empresa en cabecera del canal |

---

## 11. Metadatos Sendbird esperados por el consumidor

Para que las features de tags funcionen, los usuarios en Sendbird deben tener en `metaData`:

| Clave | Usado en | Descripción |
|-------|----------|-------------|
| `professional` | Lista de usuarios, lista de canales | Rol: `coach`, `psychologist`, u otro texto |
| `company` | Lista de canales | Flag para activar lógica de tag de equipo |
| `team` | Lista de canales | Nombre del equipo (fallback si no hay `professional`) |
| `company_name` | Cabecera del chat activo | Nombre de empresa del usuario actual |

---

## 12. Lo que no incluye este fork (respecto a upstream actual)

`upstream/main` tiene **402 commits** posteriores al punto de divergencia que **no están** en el fork de Emocional (Sendbird siguió evolucionando hasta al menos junio 2026). Este documento describe solo lo añadido por Emocional, no lo que falta por integrar del original.

**Reset a upstream 3.18:** lo del fork que **no** se reimplementó o quedó **a medias** (sobre todo estilos §8) está en [`NOT-PORTED.md`](./NOT-PORTED.md). Staging validó funcionalidad; paridad visual con 3.26.0 sigue pendiente.
