# E-commerce Llantas y Accesorios — Diseño de Base de Datos (MVP)

## Stack
- **Runtime:** Node.js + Express
- **ORM:** Sequelize
- **DB:** PostgreSQL
- **Auth:** JWT + Bcrypt
- **Roles:** Admin, Cliente

---

## Entidades y Modelos

### 1. AUTENTICACIÓN Y USUARIOS

#### `users` — Usuarios del sistema
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID PK | |
| email | STRING UNIQUE | |
| password | STRING | Hash con bcrypt |
| role | ENUM | `admin`, `cliente` |
| status | ENUM | `activo`, `inactivo` |
| created_at | DATE | |
| updated_at | DATE | |

#### `clients` — Datos personales del cliente
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → users | |
| first_name | STRING | |
| last_name | STRING | |
| phone | STRING | |
| dni | STRING | |
| created_at | DATE | |
| updated_at | DATE | |

#### `addresses` — Direcciones del cliente
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID PK | |
| client_id | UUID FK → clients | |
| street | STRING | |
| city | STRING | |
| state | STRING | |
| zip_code | STRING | |
| is_default | BOOLEAN | |
| created_at | DATE | |

---

### 2. VEHÍCULOS

#### `vehicle_brands` — Marcas de vehículos
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID PK | |
| name | STRING | Ej: Toyota, Ford |
| logo | STRING | URL imagen |
| created_at | DATE | |

#### `vehicle_models` — Modelos de vehículos
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID PK | |
| vehicle_brand_id | UUID FK → vehicle_brands | |
| name | STRING | Ej: Corolla, Hilux |
| created_at | DATE | |

#### `vehicles` — Vehículos registrados por cliente
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID PK | |
| client_id | UUID FK → clients | |
| vehicle_brand_id | UUID FK → vehicle_brands | |
| vehicle_model_id | UUID FK → vehicle_models | |
| year | INTEGER | |
| plate | STRING | Placa |
| is_default | BOOLEAN | |
| created_at | DATE | |

---

### 3. PRODUCTOS

#### `brands` — Marcas de productos
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID PK | |
| name | STRING | Ej: Michelin, Bridgestone |
| logo | STRING | URL imagen |
| created_at | DATE | |

#### `categories` — Categorías de productos
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID PK | |
| name | ENUM | `llantas`, `accesorios`, `aceites`, `lubricantes`, `aros` |
| description | TEXT | |
| image | STRING | URL imagen |
| created_at | DATE | |

#### `products` — Productos base (card de producto)
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID PK | |
| category_id | UUID FK → categories | |
| brand_id | UUID FK → brands | |
| name | STRING | Nombre del producto |
| slug | STRING UNIQUE | Para URL amigable |
| description | TEXT | Descripción larga (PDP) |
| short_description | TEXT | Descripción corta (card) |
| price | DECIMAL | |
| discount_price | DECIMAL | Precio con descuento |
| stock | INTEGER | |
| images | ARRAY JSON | URLs de imágenes |
| thumbnail | STRING | Imagen principal (card) |
| status | ENUM | `activo`, `inactivo`, `agotado` |
| created_at | DATE | |
| updated_at | DATE | |

#### `tire_specs` — Especificaciones exclusivas de llantas
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID PK | |
| product_id | UUID FK → products | |
| model_name | STRING | Nombre del modelo de llanta |
| width | INTEGER | Ancho (ej: 205) |
| height | INTEGER | Alto/Perfil (ej: 55) |
| rim | INTEGER | Rin en pulgadas (ej: 16) |
| construction_type | ENUM | `Radial`, `Diagonal` |
| use_type | ENUM | `Verano`, `Invierno`, `AllSeason`, `Offroad`, `Performance` |
| speed_index | STRING | Ej: H, V, W, Y, Z |
| load_index | INTEGER | Ej: 84, 91, 95 |
| traction_type | ENUM | `AA`, `A`, `B`, `C` |
| temperature_type | ENUM | `AA`, `A`, `B`, `C` |
| treadwear | INTEGER | Ej: 400, 500 |
| manufacture_date | DATE | Fecha de fabricación |
| created_at | DATE | |

#### `tire_vehicle_compatibility` — Compatibilidad llanta ↔ vehículo
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID PK | |
| tire_spec_id | UUID FK → tire_specs | |
| vehicle_model_id | UUID FK → vehicle_models | |
| year_from | INTEGER | Año desde |
| year_to | INTEGER | Año hasta |

---

### 4. CARRITO Y ÓRDENES

#### `carts` — Carrito de compras
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID PK | |
| client_id | UUID FK → clients | |
| status | ENUM | `activo`, `abandonado`, `convertido` |
| created_at | DATE | |
| updated_at | DATE | |

#### `cart_items` — Items del carrito
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID PK | |
| cart_id | UUID FK → carts | |
| product_id | UUID FK → products | |
| quantity | INTEGER | |
| unit_price | DECIMAL | Precio al momento de agregar |
| created_at | DATE | |

#### `orders` — Órdenes / Pedidos
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID PK | |
| client_id | UUID FK → clients | |
| address_id | UUID FK → addresses | |
| total | DECIMAL | |
| status | ENUM | `pendiente`, `confirmado`, `preparando`, `enviado`, `entregado`, `cancelado` |
| payment_status | ENUM | `pendiente`, `pagado`, `fallido`, `reembolsado` |
| notes | TEXT | |
| created_at | DATE | |
| updated_at | DATE | |

#### `order_items` — Items de la orden
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID PK | |
| order_id | UUID FK → orders | |
| product_id | UUID FK → products | |
| quantity | INTEGER | |
| unit_price | DECIMAL | |
| subtotal | DECIMAL | |
| created_at | DATE | |

#### `order_tracking` — Seguimiento del pedido (cliente ve esto)
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID PK | |
| order_id | UUID FK → orders | |
| status | ENUM | `confirmado`, `preparando`, `enviado`, `en_camino`, `entregado` |
| description | TEXT | Ej: "Tu pedido salió del almacén" |
| estimated_delivery | DATE | Fecha estimada de entrega |
| shipped_at | DATE | Fecha de envío real |
| delivered_at | DATE | Fecha de entrega real |
| created_at | DATE | |

---

### 5. RECOMENDACIONES

#### `recommendations` — Lógica de recomendaciones
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID PK | |
| client_id | UUID FK → clients | |
| product_id | UUID FK → products | |
| reason | ENUM | `por_vehiculo`, `mas_vendido`, `similar`, `historial` |
| score | FLOAT | Puntuación de relevancia |
| created_at | DATE | |

---

### 6. DASHBOARD (datos para métricas admin)

Los datos del dashboard se obtienen mediante **queries agregadas**, no tablas separadas. Endpoints sugeridos:

```
GET /dashboard/ventas-totales
GET /dashboard/ordenes-recientes
GET /dashboard/productos-mas-vendidos
GET /dashboard/clientes-nuevos
GET /dashboard/stock-bajo
```

---

## Endpoints API sugeridos (MVP)

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

### Productos
```
GET    /api/products                   // listado con filtros
GET    /api/products/:id               // detalle PDP
GET    /api/products/category/:slug
GET    /api/tires?width=&height=&rim=  // filtro por medida
GET    /api/tires/compatible/:vehicle_id
```

### Carrito
```
GET    /api/cart
POST   /api/cart/add
PUT    /api/cart/item/:id
DELETE /api/cart/item/:id
DELETE /api/cart/clear
```

### Órdenes
```
POST   /api/orders/checkout
GET    /api/orders
GET    /api/orders/:id
GET    /api/orders/:id/tracking
```

### Admin
```
GET    /api/admin/dashboard
POST   /api/admin/products
PUT    /api/admin/products/:id
DELETE /api/admin/products/:id
PUT    /api/admin/orders/:id/status
GET    /api/admin/clients
```

### Recomendaciones
```
GET    /api/recommendations            // para el cliente logueado
GET    /api/recommendations/vehicle/:id
```

---

## Notas importantes para el agente de código

1. **Usar UUID** en todos los IDs, no INTEGER autoincrement
2. **Sequelize associations** deben definirse en cada modelo
3. **Middleware JWT** protege todas las rutas excepto login, register y listado público de productos
4. **Rol admin** tiene acceso a rutas `/admin/*`
5. **Bcrypt** con saltRounds: 10 para hashear passwords
6. **tire_specs** se relaciona 1:1 con `products` (solo llantas tienen esta tabla)
7. **order_tracking** se actualiza manualmente por el admin o automáticamente por webhooks del courier
8. La tabla `recommendations` puede poblarse con un cron job o al momento del login del cliente
