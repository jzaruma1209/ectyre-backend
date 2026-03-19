# Git Workflow Skill

---
name: git-skill
description: >
  Skill para gestionar el flujo de trabajo completo de Git en este proyecto.
  Usar SIEMPRE que el usuario diga: "sube al git", "crea una rama", "haz un commit",
  "push", "crea un pull request", "merge", "revisa las ramas", "cambia de rama",
  "stash", "revert", o cualquier operación relacionada con control de versiones Git/GitHub.
---

## 🎯 OBJETIVO

Este skill estandariza todas las operaciones de Git para el proyecto `ectyre-backend`.
Garantiza consistencia en mensajes de commit, manejo de ramas y resolución de conflictos.

---

## ⚠️ REGLAS CRÍTICAS — LEER SIEMPRE ANTES DE EJECUTAR

1. **NUNCA usar `&&` en PowerShell** — separar cada comando en una llamada independiente.
2. **SIEMPRE verificar el estado del repo con `git status` antes de cualquier operación**.
3. **NUNCA hacer `git push --force` sin autorización explícita del usuario**.
4. **Si hay conflictos de merge, resolver conservando la versión local SALVO que el usuario indique lo contrario**.
5. **El archivo `.env` NUNCA debe subirse** — ya está en `.gitignore`, verificar que siga ahí.
6. **Cuando Vim se abra durante un rebase/merge**, cerrar con `:wq` usando `send_command_input`.
7. **Si el push es rechazado** (remote has changes), hacer `git pull origin <rama> --rebase` primero.

---

## 📁 CONFIGURACIÓN DEL PROYECTO

- **Repositorio remoto:** `https://github.com/jzaruma1209/ectyre-backend.git`
- **Rama principal:** `main`
- **Shell:** PowerShell (Windows)
- **Directorio del proyecto:** `c:\Users\ectyre1\OneDrive\Desktop\ectyre\ectyre.com\backend\apiectyre`

---

## 🌿 FLUJO 1 — Crear y trabajar en una rama nueva

### Paso 1 — Asegurarse de estar en `main` y actualizado
```powershell
git checkout main
git pull origin main
```

### Paso 2 — Crear la rama nueva
```powershell
git checkout -b nombre-de-la-rama
```

**Convención de nombres de ramas:**
| Tipo | Prefijo | Ejemplo |
|------|---------|---------|
| Nueva funcionalidad | `feat/` | `feat/login-oauth` |
| Corrección de bug | `fix/` | `fix/checkout-error` |
| Refactor | `refactor/` | `refactor/services` |
| Documentación | `docs/` | `docs/readme-update` |
| Tests | `test/` | `test/pedido-suite` |
| Hotfix urgente | `hotfix/` | `hotfix/security-patch` |

### Paso 3 — Verificar que estás en la nueva rama
```powershell
git branch
```

---

## 💾 FLUJO 2 — Commit de cambios

### Paso 1 — Ver qué cambió
```powershell
git status
git diff
```

### Paso 2 — Agregar archivos al staging
```powershell
# Todos los archivos
git add .

# O archivos específicos
git add src/services/nuevo.services.js
```

### Paso 3 — Hacer el commit
```powershell
git commit -m "tipo: descripcion corta en imperativo"
```

**Convención de mensajes de commit (Conventional Commits):**
| Tipo | Cuándo usarlo |
|------|---------------|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de bug |
| `refactor:` | Refactor sin cambio funcional |
| `test:` | Agregar o modificar tests |
| `docs:` | Solo documentación |
| `chore:` | Tareas de mantenimiento (deps, config) |
| `style:` | Formato, semicolons, etc. |

**Ejemplos válidos:**
```
feat: agregar endpoint POST /pedidos/checkout
fix: corregir validacion de idCliente en carrito
test: agregar suite de integracion para admin
docs: actualizar README con nuevos endpoints
```

---

## 🚀 FLUJO 3 — Push al repositorio remoto

### Caso A — Primera vez que subes la rama
```powershell
git push -u origin nombre-de-la-rama
```

### Caso B — La rama ya existe en remoto
```powershell
git push origin nombre-de-la-rama
```

### Caso C — El push fue rechazado (remote has changes)
```powershell
git pull origin nombre-de-la-rama --rebase
# Si hay conflictos → resolverlos → git add <archivo> → git rebase --continue
git push origin nombre-de-la-rama
```

### Caso D — Subir a `main` directamente
```powershell
git push origin main
# Si rechazado:
git pull origin main --rebase
git push origin main
```

---

## 🔀 FLUJO 4 — Merge de rama a main

### Opción A — Merge local
```powershell
git checkout main
git pull origin main
git merge nombre-de-la-rama
git push origin main
```

### Opción B — Pull Request via GitHub MCP (RECOMENDADO)
Usar la herramienta `mcp_github-mcp-server_create_pull_request`:
- `owner`: `jzaruma1209`
- `repo`: `ectyre-backend`
- `head`: `nombre-de-la-rama`
- `base`: `main`
- `title`: descripción del PR
- `body`: resumen de los cambios

---

## 🗂️ FLUJO 5 — Listar y cambiar ramas

### Ver todas las ramas (locales y remotas)
```powershell
git branch -a
```

### Cambiar a una rama existente
```powershell
git checkout nombre-de-la-rama
```

### Eliminar rama local (después de merge)
```powershell
git branch -d nombre-de-la-rama
```

### Eliminar rama en remoto
```powershell
git push origin --delete nombre-de-la-rama
```

---

## 💊 FLUJO 6 — Stash (guardar cambios temporalmente)

```powershell
# Guardar cambios sin commitear
git stash push -m "descripcion de lo que guardo"

# Ver stashes guardados
git stash list

# Recuperar el último stash
git stash pop

# Recuperar un stash específico
git stash apply stash@{0}
```

---

## ↩️ FLUJO 7 — Revertir cambios

### Descartar cambios locales (sin commitear)
```powershell
# Un archivo específico
git restore nombre-del-archivo.js

# Todos los archivos
git restore .
```

### Revertir el último commit (mantener cambios en staging)
```powershell
git reset --soft HEAD~1
```

### Revertir un commit ya pusheado (crea un commit inverso, seguro)
```powershell
git revert <SHA-del-commit>
git push origin nombre-de-la-rama
```

---

## 🔧 RESOLUCIÓN DE CONFLICTOS

### Cuando hay conflicto en merge/rebase:

1. Ver qué archivos tienen conflicto:
   ```powershell
   git status
   ```

2. Resolver el conflicto:
   - **Mantener versión local (nuestra):**
     ```powershell
     git checkout --ours nombre-del-archivo.js
     ```
   - **Mantener versión remota (la del servidor):**
     ```powershell
     git checkout --theirs nombre-del-archivo.js
     ```
   - **Editar manualmente** si se necesita mezclar ambas versiones.

3. Marcar como resuelto y continuar:
   ```powershell
   git add nombre-del-archivo.js
   git rebase --continue   # si estabas en rebase
   # o
   git merge --continue    # si estabas en merge
   ```

4. Si Vim se abre pidiendo el mensaje de commit:
   - Usar `send_command_input` con `:wq\n` para guardarlo y salir.

---

## 🔍 COMANDOS DE INSPECCIÓN ÚTILES

```powershell
# Ver historial de commits (últimos 10)
git log --oneline -10

# Ver diferencia entre rama local y remota
git diff main origin/main

# Ver quién hizo qué cambio en un archivo
git blame src/services/llanta.services.js

# Ver los commits de una rama específica
git log feat/nueva-feature --oneline

# Ver el contenido de un commit específico
git show <SHA>
```

---

## 🤖 USO CON GITHUB MCP

Además de los comandos git locales, se puede usar el servidor MCP de GitHub para:

| Acción | Herramienta MCP |
|--------|----------------|
| Crear Pull Request | `mcp_github-mcp-server_create_pull_request` |
| Listar PRs | `mcp_github-mcp-server_list_pull_requests` |
| Listar ramas | `mcp_github-mcp-server_list_branches` |
| Ver commits | `mcp_github-mcp-server_list_commits` |
| Crear rama remota | `mcp_github-mcp-server_create_branch` |
| Ver archivo en remoto | `mcp_github-mcp-server_get_file_contents` |
| Crear/actualizar archivo remoto | `mcp_github-mcp-server_create_or_update_file` |

**Parámetros estándar para MCP en este proyecto:**
- `owner`: `jzaruma1209`
- `repo`: `ectyre-backend`
