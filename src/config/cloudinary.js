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

// ─── Middleware de Multer para marcas (logo) ──────────────────────────
const uploadMarca = multer({
  storage: storageMarcas,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // máx 2MB
});

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

module.exports = {
  cloudinary,
  uploadLlanta,
  uploadMarca,
  deleteImage,
};
