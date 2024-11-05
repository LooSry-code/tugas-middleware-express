import express from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinaryConfig';
import streamifier from 'streamifier';

const router = express.Router();

// Konfigurasi multer untuk menyimpan file di memori
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Endpoint untuk upload file satuan
router.post('/single', upload.single('file'), (req: any, res: any) => {
  // Memeriksa apakah req.file ada
  if (!req.file) {
    return res.status(400).send('No file was uploaded.'); // Mengirimkan respon jika tidak ada file yang di-upload
  }

  const stream = cloudinary.uploader.upload_stream((error, result) => {
    if (error) {
      return res.status(500).send(error); // Mengirimkan respon jika terjadi kesalahan saat upload
    }
    res.status(200).send(result); // Mengirimkan hasil upload jika berhasil
  });

  // Mengubah buffer file menjadi stream dan mengalirkannya ke Cloudinary
  streamifier.createReadStream(req.file.buffer).pipe(stream);
});

// Endpoint untuk upload file multiple
router.post('/multiple', upload.array('files', 10), (req: any, res: any) => {
  // Memeriksa apakah req.files ada
  if (!req.files) {
    return res.status(400).send('No files were uploaded.'); // Mengirimkan respon jika tidak ada file yang di-upload
  }

  const uploads = (req.files as Express.Multer.File[]).map((file) => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream((error, result) => {
        if (error) {
          return reject(error); // Menolak promise jika terjadi kesalahan saat upload
        }
        resolve(result); // Menyelesaikan promise jika upload berhasil
      });

      // Mengubah buffer file menjadi stream dan mengalirkannya ke Cloudinary
      streamifier.createReadStream(file.buffer).pipe(stream);
    });
  });

  // Menunggu semua upload selesai
  Promise.all(uploads)
    .then((results) => res.status(200).send(results)) // Mengirimkan hasil upload jika berhasil
    .catch((error) => res.status(500).send(error)); // Menangani kesalahan jika terjadi
});

export default router;