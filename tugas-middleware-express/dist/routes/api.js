"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const cloudinaryConfig_1 = __importDefault(require("../config/cloudinaryConfig"));
const streamifier_1 = __importDefault(require("streamifier"));
const router = express_1.default.Router();
// Konfigurasi multer untuk menyimpan file di memori
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage });
// Endpoint untuk upload file satuan
router.post('/single', upload.single('file'), (req, res) => {
    // Memeriksa apakah req.file ada
    if (!req.file) {
        return res.status(400).send('No file was uploaded.'); // Mengirimkan respon jika tidak ada file yang di-upload
    }
    const stream = cloudinaryConfig_1.default.uploader.upload_stream((error, result) => {
        if (error) {
            return res.status(500).send(error); // Mengirimkan respon jika terjadi kesalahan saat upload
        }
        res.status(200).send(result); // Mengirimkan hasil upload jika berhasil
    });
    // Mengubah buffer file menjadi stream dan mengalirkannya ke Cloudinary
    streamifier_1.default.createReadStream(req.file.buffer).pipe(stream);
});
// Endpoint untuk upload file multiple
router.post('/multiple', upload.array('files', 10), (req, res) => {
    // Memeriksa apakah req.files ada
    if (!req.files) {
        return res.status(400).send('No files were uploaded.'); // Mengirimkan respon jika tidak ada file yang di-upload
    }
    const uploads = req.files.map((file) => {
        return new Promise((resolve, reject) => {
            const stream = cloudinaryConfig_1.default.uploader.upload_stream((error, result) => {
                if (error) {
                    return reject(error); // Menolak promise jika terjadi kesalahan saat upload
                }
                resolve(result); // Menyelesaikan promise jika upload berhasil
            });
            // Mengubah buffer file menjadi stream dan mengalirkannya ke Cloudinary
            streamifier_1.default.createReadStream(file.buffer).pipe(stream);
        });
    });
    // Menunggu semua upload selesai
    Promise.all(uploads)
        .then((results) => res.status(200).send(results)) // Mengirimkan hasil upload jika berhasil
        .catch((error) => res.status(500).send(error)); // Menangani kesalahan jika terjadi
});
exports.default = router;
