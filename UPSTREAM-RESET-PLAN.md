# Plan: reset a upstream vanilla + reintroducción gradual de cambios Emocional

Estrategia para traer **Sendbird UIKit 3.18.0** (última publicada) sin perder el fork actual, evaluar la UI, y reaplicar después lo documentado en [`FORK-FEATURES.md`](./FORK-FEATURES.md).

## Principios

1. **Nunca tocar `main` del fork actual** hasta tener claro el resultado del experimento.
2. **Tag + rama de preservación** inmutables como punto de retorno.
3. **Fase 1 = upstream puro** (sin parches Emocional).
4. **Fase 2 = evaluación visual** (con adaptación mínima del front).
5. **Fase 3 = reaplicar cambios** uno a uno desde `FORK-FEATURES.md`, con commits pequeños.

---

## Estado de referencia (antes de empezar)

| Concepto | Valor |
|----------|-------|
| Fork actual (`main`) | `@emocional/sendbird-uikit-react` **3.26.0** — commit `e422575c` |
| Base original al forkear | Sendbird **3.14.1** — commit `742e337b` |
| Upstream actual | `@sendbird/uikit-react` **3.18.0** — tag `v3.18.0` |
| Front consumidor | `emo-front` → `^3.25.2`, props fork: `enableAutoChat`, `searcherFilter`, `userListQuery` + `filterFn` |

---

## Fase 0 — Red de seguridad (hacer primero, una sola vez)

Ejecutar desde `sendbird-uikit-react` con `main` limpio y actualizado con `origin`:

```bash
# 1. Asegurar que el inventario de features está versionado
git add FORK-FEATURES.md UPSTREAM-RESET-PLAN.md
git commit -m "docs: document fork features and upstream reset plan"

# 2. Rama de preservación (no se reutiliza para desarrollo)
git branch preserve/emo-fork-3.26.0

# 3. Tag anotado (punto de retorno exacto)
git tag -a emo/fork-3.26.0-baseline -m "Emocional fork baseline before upstream 3.18.0 experiment"

# 4. Subir a origin (rama + tag + docs)
git push origin preserve/emo-fork-3.26.0
git push origin emo/fork-3.26.0-baseline
git push origin main
```

**Volver atrás en cualquier momento:**

```bash
git checkout main
# o directamente al tag:
git checkout emo/fork-3.26.0-baseline
```

---

## Fase 1 — Rama experimental upstream vanilla

Crear rama desde **upstream**, no desde nuestro `main`:

```bash
git fetch upstream
git checkout -b experiment/upstream-3.18.0-vanilla upstream/v3.18.0
```

### Qué hacer en esta rama

| Tarea | Acción |
|-------|--------|
| Código fuente | **Upstream tal cual** — no mergear `main` |
| `package.json` → `name` | Mantener `@emocional/sendbird-uikit-react` (para no romper imports del front) **o** usar `@sendbird/uikit-react` solo si se cambia también el front |
| `package.json` → `version` | `3.18.0-emo-vanilla.0` (pre-release semver, distinto del 3.26.0 del fork) |
| CI / release-it / Renovate | **Desactivar o no usar** en esta rama (evitar publicar por accidente) |
| `.npmrc` / `publishConfig` | Opcional en fase experimental; solo hace falta si se publica a GH Packages |

### Build local

```bash
yarn install --immutable   # upstream usa yarn
yarn build
```

### Enlazar con emo-front (preview local)

En `emo-front/package.json`, temporalmente:

```json
"@emocional/sendbird-uikit-react": "file:../sendbird-uikit-react/dist"
```

O usar el script existente `build.sh` (revisar rutas antes de ejecutar).

```bash
cd ../emo-front && pnpm install
```

---

## Fase 2 — Evaluar la interfaz

### ⚠️ El front no compilará sin cambios temporales

`emo-chat.tsx` usa APIs que **no existen en upstream 3.18.0**:

| Prop / API del fork | Usado en |
|---------------------|----------|
| `enableAutoChat` | `emo-chat.tsx` |
| `searcherFilter` | `emo-chat.tsx` |
| `userListQuery` con `filterFn` | `emo-chat.utils.ts` + `SendbirdProvider` |

Para ver la UI vanilla hay dos caminos:

### Opción A — Adaptación mínima del front (recomendada para ver el chat real)

Rama en `emo-front`: `experiment/sendbird-upstream-vanilla`.

Cambios **temporales** (no mergear a `develop`):

1. Quitar `enableAutoChat`, `searcherFilter` del `SendbirdProvider`.
2. Sustituir `userListQuery` custom por la query estándar del SDK (o comentar filtro de profesionales).
3. Aceptar que **no habrá** auto-creación de chats, tags de empresa, estilos Emocional, etc.

Con eso el chat arranca con look & feel **Sendbird stock** (inglés por defecto, flujo de invitación original, mensajes alineados estándar).

### Opción B — Preview solo en el repo del uikit

Usar Storybook o samples de Sendbird sin tocar `emo-front`:

```bash
yarn storybook   # si arranca en esta versión
```

Útil para ver componentes aislados, pero **no** sustituye probar el dashboard.

### Checklist de evaluación visual

- [ ] Lista de canales (layout, selección, unread)
- [ ] Cabecera del canal (sin tag empresa)
- [ ] Modal crear canal / invitar usuarios (flujo original multi-select)
- [ ] Composer de mensajes (**nuevo en 3.18**: DnD, paste, preview de archivos)
- [ ] Mensajes (alineación izquierda/derecha estándar — distinto a nuestro `isByMe = false`)
- [ ] Indicador de escritura
- [ ] Móvil vs desktop
- [ ] Idioma por defecto (`en`, no `es`)

Documentar capturas o notas en un issue / doc antes de pasar a Fase 3.

---

## Fase 3 — Reintroducir cambios Emocional (desde `FORK-FEATURES.md`)

Base: rama `experiment/upstream-3.18.0-vanilla` (no `preserve/emo-fork-3.26.0`).

### Orden sugerido (de menos a más conflictivo)

Cada bloque = **1 PR / 1 commit** (o pocos commits) + prueba en front.

| Orden | Bloque | Secciones FORK-FEATURES | Riesgo de conflicto |
|-------|--------|-------------------------|---------------------|
| 1 | Localización ES por defecto | §7 | Bajo |
| 2 | Tokens de color / icono EMOCIONAL | §8 (paleta) | Bajo–medio |
| 3 | `userQuery` + `filterFn` (sin auto-chat) | §3, §4 (parcial) | Medio |
| 4 | `searcherFilter` + búsqueda en modal | §3, §4 | Medio |
| 5 | Tags profesional / equipo / empresa | §5 | Medio |
| 6 | Estado online en avatar | §6 | Medio |
| 7 | `showCreateChannel` + flujo InviteUsers | §4 | **Alto** (upstream tocó invite/list) |
| 8 | `enableAutoChat` | §4 | Alto |
| 9 | Estilos UX masivos (MessageContent, listas, modales…) | §8 | **Muy alto** |
| 10 | `isByMe = false` global | §8 | **Muy alto** — decidir si sigue siendo requisito |
| 11 | Empaquetado / CI / release-it | §1, §2 | Independiente del código UI |

### Cómo reaplicar cada bloque

1. Leer la sección en `FORK-FEATURES.md`.
2. `git diff emo/fork-3.26.0-baseline..emo/fork-3.26.0-baseline -- <archivos>` no aplica entre tag y upstream — usar:

```bash
# Ver qué cambiamos nosotros en un archivo concreto (fork vs punto de divergencia)
MB=742e337b
git diff $MB..emo/fork-3.26.0-baseline -- src/modules/CreateChannel/components/InviteUsers/index.tsx
```

3. **Reimplementar a mano** encima de upstream (preferible a cherry-pick masivo).
4. Cherry-pick solo de commits humanos concretos si el archivo no ha cambiado en upstream:

```bash
git cherry-pick -n <commit-hash>   # sin commit, revisar conflictos
```

5. Probar en `emo-front` tras cada bloque.

### Commits humanos de referencia (del fork)

Ver tabla completa en `FORK-FEATURES.md` §10. Los más aislados para empezar:

- `c99822d7` — filter professionals
- `9d63ff54` — connection status avatar
- `ed2b0459` — company tag header
- `d6113730` — professional tag
- `24661450` — userQuery

Los más conflictivos (evitar cherry-pick directo):

- `aa1c82c1`, `3f1efd62`, `4c7aebd9` — estilos masivos
- `6bba0585`, `e489ae26` — InviteUsers / auto-chat
- Todo lo que toca `MessageContent` e `isByMe`

---

## Fase 4 — Cierre (solo si el experimento convence)

1. Renombrar o sustituir `experiment/upstream-3.18.0-vanilla` → `main` (vía PR, **no** force-push sin acuerdo).
2. Versión del paquete: alinear semver (p. ej. `3.18.0-emo.1` o saltar a `4.0.0-emo` si se quiere dejar claro el corte).
3. Publicar a GitHub Packages y actualizar `emo-front` (mantenedor).
4. Mantener `preserve/emo-fork-3.26.0` y tag `emo/fork-3.26.0-baseline` **indefinidamente**.

---

## Riesgos a tener en cuenta

| Riesgo | Mitigación |
|--------|------------|
| Perder el fork actual | Tag + rama `preserve/*` en origin |
| Publicar vanilla por error | No configurar release-it / publish en rama experimental |
| Merge imposible fork → upstream | No intentar merge de `main`; reaplicar desde doc |
| Front roto en Fase 2 | Rama experimental en `emo-front`, cambios temporales |
| Dependencia SDK (`@sendbird/chat` 4.12 → 4.21) | Probar conexión, tokens, queries en dev |
| Perder decisión de diseño (`isByMe = false`) | Reevaluar en Fase 3 si aún hace falta con layout upstream |

---

## Resumen ejecutivo

```
main (3.26.0 emo) ──tag──► emo/fork-3.26.0-baseline  ◄── RETORNO
         │
         └── preserve/emo-fork-3.26.0 (congelada)

upstream/v3.18.0 ──► experiment/upstream-3.18.0-vanilla
                              │
                              ├── Fase 2: preview UI (front adaptado temp.)
                              └── Fase 3: + FORK-FEATURES.md bloque a bloque
```

**No ejecutar reset sobre `main`.** Todo el experimento vive en ramas hasta validar UI y plan de reaplicación.
