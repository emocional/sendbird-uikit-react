# Módulo Emocional (`src/emo/`)

Código propio del fork, **separado del upstream de Sendbird**, para facilitar merges futuros.

## Estructura

```
src/emo/
  README.md              ← este archivo
  PATCHES.md             ← archivos upstream tocados (checklist al mergear)
  locales/               ← stringSet ES y resolución de locale
  types/                 ← props y tipos solo de Emocional
  features/              ← una carpeta por feature de producto
    auto-create-channels/
    connection-status/
    invite-users/
    metadata/
  integration/           ← enganches mínimos en componentes upstream
  styles/                ← tokens y overrides SCSS
```

## Reglas al añadir features

1. **Implementación en `features/`** — lógica, UI y tests viven bajo `src/emo/features/<nombre>/`.
2. **Tipos en `types/`** — nuevas props (`EmocionalProviderProps`) y extensiones (`EmocionalUserListQuery`).
3. **Un enganche en `integration/`** — un componente o helper por zona del UIKit.
4. **Mínimo diff en upstream** — solo lo listado en `PATCHES.md`; marcar bloques con `// @emo-integration`.
5. **No editar upstream “de paso”** — si hace falta un fix de Sendbird, valorar upstream primero o aislarlo en `emo/`.

## Flujo al actualizar upstream

1. Mergear o rebasar `upstream/main` sobre la rama experimental.
2. Resolver conflictos en los archivos de `PATCHES.md` (suelen ser pocos).
3. Revisar que los enganches `// @emo-integration` siguen siendo válidos.
4. Ejecutar **`yarn test:emo`** (suite de producto Emocional) y, si hace falta, `yarn jest src/emo`.
5. Revisar `FORK-FEATURES.md` por features nuevas de upstream que sustituyan las nuestras.
6. Consultar [`NOT-PORTED.md`](../../NOT-PORTED.md) antes de re-portar estilos o APIs descartadas.

## Test de producto (`yarn test:emo`)

Suite única en `src/emo/__tests__/emo-product.spec.tsx`. Valida **solo** customizaciones Emocional según el contrato de **emo-front** (`emo-chat.tsx`, `emo-chat.utils.ts`):

- Props de `SendbirdProvider` (`enableAutoChat`, `searcherFilter`, `userListQuery` + `filterFn`)
- Onboarding / `?msgto=` (`enableAutoChat` + canales distinct)
- Búsqueda en modal de invitación
- Tags `metaData` (`company`, `professional`, `company_name`, `team`)
- Online en avatar, localización ES, icono `+`, enganches `@emo-integration`

Contrato documentado en `src/emo/product/emo-front-usage.ts`.

## Features implementadas

| Feature | Carpeta | Props / API |
|---------|---------|-------------|
| Auto-create channels | `features/auto-create-channels/` | `enableAutoChat` |
| Localización ES | `locales/` | `defaultLocale` (default `'es'`) |
| Invite directo 1:1 + búsqueda | `features/invite-users/` | `searcherFilter`, `skipChannelTypeSelection` |
| Tags metadata | `features/metadata/` | `metaData.professional`, `team`, `company_name` |
| Online en avatar | `features/connection-status/` | automático en header y lista |
| Layout mensajes entrantes | `integration/message-layout.ts` | todos los mensajes alineados como recibidos |
| Typing indicator / cabecera lista | `features/typing-indicator/`, `integration/group-channel-list-header.tsx` | estilo fork §8 |
| Tokens / estilos | `styles/` | icono `EMOCIONAL`, overrides SCSS |
