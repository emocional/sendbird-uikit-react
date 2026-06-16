# Archivos upstream con enganches Emocional

Al mergear una nueva versión de `@sendbird/uikit-react`, revisar **solo estos archivos**.
El resto del código Emocional está en `src/emo/`.

| Archivo | Qué hace Emocional | Buscar |
|---------|-------------------|--------|
| `src/lib/Sendbird/types.ts` | `SendbirdProviderProps` y `SendbirdStateConfig` extienden tipos de `src/emo/types` | `@emo-integration` |
| `src/lib/Sendbird/context/initialState.ts` | Spread de `emocionalConfigDefaults` en `config` | `@emo-integration` |
| `src/lib/Sendbird/context/SendbirdProvider.tsx` | Config Emocional + localización ES + estilos | `@emo-integration` |
| `src/modules/GroupChannelList/components/GroupChannelListUI/index.tsx` | `<EmocionalGroupChannelListAddons />` | `@emo-integration` |
| `src/modules/CreateChannel/components/CreateChannelUI/index.tsx` | Flujo invite directo 1:1 | `@emo-integration` |
| `src/modules/GroupChannelList/components/AddGroupChannel/AddGroupChannelView.tsx` | Icono `+` de marca | `@emo-integration` |
| `src/modules/GroupChannel/components/GroupChannelHeader/GroupChannelHeaderView.tsx` | Avatar online + badge empresa | `@emo-integration` |
| `src/modules/GroupChannelList/components/GroupChannelListItem/index.tsx` | Tag de canal | `@emo-integration` |
| `src/modules/GroupChannelList/components/GroupChannelListItem/GroupChannelListItemView.tsx` | Render tag + avatar online | `@emo-integration` |
| `src/ui/Icon/colors.ts` + `src/ui/Icon/utils.ts` | Color `EMOCIONAL` | `@emo-integration` |
| `src/types.ts` | Re-export de `EmocionalUserListQuery` | `@emo-integration` |
| `scripts/package.template.json` | Nombre del paquete `@emocional/...` (empaquetado) | `@emocional` |

## Tipos públicos

`SendbirdProviderProps` exportado por el paquete incluye `EmocionalProviderProps` vía `extends`.
Los consumidores (`emo-front`) pueden seguir usando `enableAutoChat`, `searcherFilter`, etc. sin imports desde `src/emo/`.

## No reimplementado a propósito

Inventario completo: [`NOT-PORTED.md`](../../NOT-PORTED.md) (raíz del repo).

| Feature fork | Decisión en 3.18 |
|--------------|------------------|
| `userQuery` propagado por `App` | **No necesario**: `emo-front` usa `userListQuery` en `SendbirdProvider` (upstream ya lo propaga) |
| `showCreateChannel` | **No necesario**: upstream monta `CreateChannel` solo cuando el modal está visible |
| `isByMe = false` global | **Descartado**: upstream 3.18 tiene layout estándar entrante/saliente; forzar todo a la izquierda rompe UX de chat |
| Parche masivo `MessageContent` / modales | **Reducido**: solo overrides SCSS en `src/emo/styles/` |
| `Modal.setSearcher` | **Evitado**: búsqueda vía `renderHeader` + `EmocionalModalSearchHeader` (sin parchear `Modal`) |

## Qué no tocar en upstream salvo enganche

- `InviteUsers`, `MessageContent`, estilos SCSS upstream, etc. → lógica en `src/emo/features/`.
