# 🤝 Guía de Contribución — ectyre-backend

Gracias por tu interés en contribuir a **Ectyre Backend**. Sigue estas pautas para mantener la calidad y consistencia del proyecto.

---

## 🔧 Configuración del entorno

```bash
# 1. Fork y clonar
git clone https://github.com/TU_USUARIO/ectyre-backend.git
cd ectyre-backend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales locales

# 4. Ejecutar migraciones
npx sequelize-cli db:migrate

# 5. Iniciar en modo desarrollo
npm run dev
```

---

## 🌿 Flujo de trabajo con branches

```
main          ← producción estable
└── develop   ← rama de integración
    └── feat/nombre-feature   ← tu trabajo
    └── fix/nombre-del-bug
    └── docs/descripcion
```

1. Crea tu branch desde `develop`:
   ```bash
   git checkout develop
   git checkout -b feat/mi-nueva-feature
   ```

2. Haz tus cambios con commits descriptivos

3. Abre un Pull Request hacia `develop`

---

## 📝 Convención de commits

Usamos **Conventional Commits**:

| Prefijo | Cuándo usarlo |
|---|---|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de un bug |
| `docs:` | Cambios en documentación |
| `refactor:` | Refactorización de código |
| `chore:` | Tareas de mantenimiento |
| `test:` | Agregar o modificar tests |

**Ejemplo:**
```bash
git commit -m "feat: agregar endpoint de búsqueda de productos"
git commit -m "fix: corregir validación de JWT en middleware"
```

---

## ✅ Checklist antes de hacer PR

- [ ] El código funciona localmente sin errores
- [ ] Los endpoints nuevos están documentados
- [ ] Se agregaron validaciones necesarias
- [ ] Los commits siguen la convención
- [ ] No se subieron archivos `.env` ni credenciales
