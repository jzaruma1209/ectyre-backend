🛞 Database Design — E-commerce de Llantas
🎯 Objetivo

Diseñar una base de datos escalable para una tienda online de neumáticos que permita:

Mostrar cards de producto completas
Manejar promociones y precios variables
Separar ficha técnica vs producto comercial
Escalar a miles de productos sin duplicar datos
🧠 Filosofía del diseño

Separar SIEMPRE:

Tipo	Qué representa
Ficha técnica	Lo físico de la llanta
Producto	Lo que vendes
Precio	Lo que cambia constantemente
Stock	Inventario
Etiquetas	Datos de marketing / legales
Promos	Banners y descuentos

Una llanta NO es lo mismo que un producto.

Ejemplo:
La misma llanta puede venderse:

con distinto precio
en promoción
en packs
en distintos países
📊 TABLAS DEL SISTEMA

Total tablas principales: 8
Total tablas relacionales: 1
👉 Total general: 9 tablas

1️⃣ Tabla: brands

Marcas de llantas.

brands
------
id PK
name
logo_url
country_flag
created_at

Ej: Michelin, Bridgestone, Davanti.

2️⃣ Tabla: tire_specs

Ficha técnica pura del neumático.

NO contiene datos comerciales.

tire_specs
----------
id PK
width           INT     -- 215
profile         INT     -- 55
rim             INT     -- 18
load_index      INT     -- 99
speed_index     VARCHAR -- V
tire_type       VARCHAR -- HT / AT / MT
season          VARCHAR -- summer / winter / all-season
max_psi         INT
created_at

Ejemplo representado:
215/55R18 99V

Esta tabla evita duplicar miles de medidas.

3️⃣ Tabla: products

Producto que se vende en la tienda.

products
--------
id PK
name
brand_id FK → brands.id
tire_spec_id FK → tire_specs.id
image_url
active BOOLEAN
created_at

Un producto = una card del ecommerce.

4️⃣ Tabla: product_prices

Historial de precios y promociones.

Nunca guardar precios en products.

product_prices
--------------
id PK
product_id FK → products.id
price_current DECIMAL(10,2)
price_old DECIMAL(10,2)
currency VARCHAR(5)
tax_included BOOLEAN
start_date DATE
end_date DATE
created_at

Permite:

Ofertas automáticas
Historial de precios
Cambios sin modificar producto
5️⃣ Tabla: tire_labels

Etiqueta europea del neumático (iconos).

tire_labels
-----------
id PK
product_id FK → products.id
fuel_efficiency CHAR(1)   -- A–E
wet_grip CHAR(1)          -- A–E
noise_db INT              -- 75
noise_class CHAR(1)       -- A/B/C
created_at

Se muestra en la card del producto.

6️⃣ Tabla: product_stock

Inventario.

product_stock
-------------
id PK
product_id FK → products.id
quantity INT
warehouse VARCHAR
updated_at

Separado del producto para permitir múltiples bodegas.

7️⃣ Tabla: promo_tags

Banners promocionales reutilizables.

promo_tags
----------
id PK
name            -- "50% OFF"
color           -- "#FF6B00"
text_color      -- "#FFFFFF"
icon_url
created_at
8️⃣ Tabla relacional: product_promo

Relación muchos a muchos.

Un producto puede tener varias promos.

product_promo
-------------
product_id FK → products.id
promo_id FK → promo_tags.id
PRIMARY KEY (product_id, promo_id)
🔗 RELACIONES ENTRE TABLAS
brands (1) ─── (N) products (1) ─── (1) tire_specs
                      │
                      ├── product_prices (1:N)
                      ├── tire_labels (1:1)
                      ├── product_stock (1:N)
                      └── product_promo (N:M) promo_tags
🧾 DATOS NECESARIOS PARA RENDERIZAR UNA CARD

Para construir la card del ecommerce se debe hacer JOIN de:

products
+ brands
+ tire_specs
+ product_prices (precio vigente)
+ tire_labels
+ promo_tags
+ product_stock
🚀 Ventajas del diseño