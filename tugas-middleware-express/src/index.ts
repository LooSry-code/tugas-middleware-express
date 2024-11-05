import express from 'express';
import uploadRoutes from './routes/api';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Menggunakan rute upload
app.use('/api/upload', uploadRoutes);

// Menjalankan server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`); console
});