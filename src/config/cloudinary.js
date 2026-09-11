"use strict";

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// ─── Validar credenciales de Cloudinary ───────────────────────────────
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.error("Faltan credenciales de Cloudinary en las variables de entorno.");
}

// ─── Configurar Cloudinary con las credenciales del .env ──────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Forzar uso de HTTPS
});

// ─── Storage: sube directamente a Cloudinary sin pasar por disco ──────
const storageLlantas = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "ectyre/llantas",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    resource_type: "image",
    // Transformación opcional: convierte a webp y optimiza calidad
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  },
});

// ─── Storage para logos de marcas ─────────────────────────────────────
const storageMarcas = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "ectyre/marcas",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "svg"],
    resource_type: "image",
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  },
});

// ─── Filtro de tipos de archivo permitidos ────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/svg+xml",
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Tipo de archivo no permitido. Solo se aceptan: jpg, jpeg, png, webp, svg"
      ),
      false
    );
  }
};

// ─── Middleware de Multer para llantas (una imagen a la vez) ──────────
const uploadLlanta = multer({
  storage: storageLlantas,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // máx 5MB
});

// ─── Middleware de Multer para marcas (logo y banner) ────────────────
const uploadMarca = multer({
  storage: storageMarcas,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // máx 5MB (los banners son imágenes anchas)
});

// ─── Storage para fotos de productos (máx 5 por producto) ─────────────
const storageProductos = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "ectyre/productos",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    resource_type: "image",
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  },
});

const uploadProducto = multer({
  storage: storageProductos,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // máx 5MB por imagen
});

// ─── Storage para íconos de especificaciones técnicas ─────────────────
const storageEspecificaciones = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "ectyre/especificaciones",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "svg"],
    resource_type: "image",
  },
});

const uploadEspecificacion = multer({
  storage: storageEspecificaciones,
  fileFilter,
  limits: { fileSize: 1 * 1024 * 1024 }, // máx 1MB (ícono pequeño)
});

// ─── Storage para Media general (banners, promociones, secciones) ──────
const storageMedia = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "ectyre/media",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif", "svg"],
    resource_type: "image",
  },
});

// ─── Filtro de tipos de archivo permitidos para Media ─────────────────
const mediaFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Tipo de archivo no permitido. Solo se aceptan: jpg, jpeg, png, webp, gif, svg"
      ),
      false
    );
  }
};

// ─── Middleware de Multer para Media ──────────────────────────────────
const uploadMediaSingle = multer({
  storage: storageMedia,
  fileFilter: mediaFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // máx 10MB
}).single("file");

const uploadMediaMultiple = multer({
  storage: storageMedia,
  fileFilter: mediaFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // máx 10MB
}).array("files", 10);

// ─── Función helper para eliminar imagen de Cloudinary ───────────────
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result !== 'ok' && result.result !== 'not found') {
      throw new Error(`Cloudinary no devolvió 'ok': ${result.result}`);
    }
    return result;
  } catch (error) {
    throw new Error(`Error al eliminar imagen de Cloudinary: ${error.message}`);
  }
};

// ─── Limpieza: borra de Cloudinary archivos ya subidos por multer ─────
// Se usa cuando la validación de negocio rechaza la petición después de la subida.
// Acepta req.file, req.files (array) o req.files (objeto de arrays). Nunca lanza.
const eliminarArchivosSubidos = async (archivos) => {
  if (!archivos) return;
  const lista = Array.isArray(archivos)
    ? archivos
    : archivos.filename
      ? [archivos]
      : Object.values(archivos).flat();
  await Promise.all(
    lista
      .filter((archivo) => archivo?.filename)
      .map((archivo) =>
        deleteImage(archivo.filename).catch((error) =>
          console.warn(`[Cloudinary] No se pudo eliminar ${archivo.filename}: ${error.message}`)
        )
      )
  );
};

module.exports = {
  cloudinary,
  uploadLlanta,
  uploadMarca,
  uploadProducto,
  uploadEspecificacion,
  uploadMediaSingle,
  uploadMediaMultiple,
  deleteImage,
  eliminarArchivosSubidos,
};
