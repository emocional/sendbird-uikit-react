# Archivos upstream con enganches Emocional

Al mergear una nueva versión de `@sendbird/uikit-react`, revisar **solo estos archivos**.
El resto del código Emocional está en `src/emo/`.

| Archivo | Qué hace Emocional | Buscar |
|---------|-------------------|--------|
| `src/lib/Sendbird/types.ts` | `SendbirdProviderProps` y `SendbirdStateConfig` extienden tipos de `src/emo/types` | `@emo-integration` |
| `src/lib/Sendbird/context/initialState.ts` | Spread de `emocionalConfigDefaults` en `config` | `@emo-integration` |
| `src/lib/Sendbird/context/SendbirdProvider.tsx` | `resolveEmocionalProviderProps` + `toEmocionalConfigState` | `@emo-integration` |
| `src/modules/GroupChannelList/components/GroupChannelListUI/index.tsx` | Render de `<EmocionalGroupChannelListAddons />` | `@emo-integration` |
| `src/types.ts` | Re-export de `EmocionalUserListQuery` para consumidores | `@emo-integration` |
| `scripts/package.template.json` | Nombre del paquete `@emocional/...` (empaquetado, no feature) | `@emocional` |

## Tipos públicos
Los consumidores (`emo-front`) pueden seguir usando `enableAutoChat` sin imports desde `src/emo/`.

## Qué no tocar en upstream salvo enganche

- `InviteUsers`, `MessageContent`, estilos SCSS, etc. → deben migrarse a `src/emo/features/` cuando se porten, no parchear inline.
