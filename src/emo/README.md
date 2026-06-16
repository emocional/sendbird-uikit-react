# Módulo Emocional (`src/emo/`)

Código propio del fork, **separado del upstream de Sendbird**, para facilitar merges futuros.

## Estructura

```
src/emo/
  README.md              ← este archivo
  PATCHES.md             ← archivos upstream tocados (checklist al mergear)
  types/                 ← props y tipos solo de Emocional
  features/              ← una carpeta por feature de producto
    auto-create-channels/
  integration/           ← enganches mínimos en componentes upstream
```

## Reglas al añadir features

1. **Implementación en `features/`** — lógica, UI y tests viven bajo `src/emo/features/<nombre>/`.
2. **Tipos en `types/`** — nuevas props (`EmocionalProviderProps`) y extensiones (`EmocionalUserListQuery`).
3. **Un enganche en `integration/`** — un componente o helper por zona del UIKit (p. ej. `group-channel-list.tsx`).
4. **Mínimo diff en upstream** — solo lo listado en `PATCHES.md`; marcar bloques con `// @emo-integration`.
5. **No editar upstream “de paso”** — si hace falta un fix de Sendbird, valorar upstream primero o aislarlo en `emo/`.

## Flujo al actualizar upstream

1. Mergear o rebasar `upstream/main` (o tag) sobre la rama experimental.
2. Resolver conflictos en los archivos de `PATCHES.md` (suelen ser pocos).
3. Revisar que los enganches `// @emo-integration` siguen siendo válidos.
4. Ejecutar tests de `src/emo/` y build.
5. Reaplicar features que aún no estén portadas (ver `FORK-FEATURES.md`).

## Features implementadas

| Feature | Carpeta | Props / API |
|---------|---------|-------------|
| Auto-create channels | `features/auto-create-channels/` | `enableAutoChat` en `SendbirdProvider` |
