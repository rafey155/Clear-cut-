import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import cloudinary from './config/cloudinary.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['https://clear-cut-frontend.vercel.app', 'http://localhost:5173'],
  methods: ['GET', 'POST']
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: "Clear Cut API is running" });
});

// Configure Multer for memory storage (required for Vercel Serverless)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
      cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  }
});

app.post('/api/remove-background', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  try {
    const apiKey = process.env.REMOVE_BG_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Remove.bg API key is missing. Check server configuration.' });
    }

    // Step 1: Remove Background using Remove.bg API
    const formData = new FormData();
    formData.append('size', 'auto');
    formData.append('image_file', req.file.buffer, {
      filename: req.file.originalname || 'image.png',
      contentType: req.file.mimetype
    });

    let removeBgResponse;
    try {
      removeBgResponse = await axios.post('https://api.remove.bg/v1.0/removebg', formData, {
        headers: {
          ...formData.getHeaders(),
          'X-Api-Key': apiKey,
        },
        responseType: 'arraybuffer', // Receive binary data
      });
    } catch (apiError) {
      console.error('Remove.bg API error:', apiError.response?.data?.toString() || apiError.message);
      return res.status(502).json({ error: 'Failed to process image with Remove.bg API.' });
    }

    const processedBuffer = Buffer.from(removeBgResponse.data);

    // Step 2: Upload Processed Image to Cloudinary for storage
    const uploadStream = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "clear-cut",
            format: "png",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(processedBuffer);
      });
    };

    let result;
    try {
      result = await uploadStream();
    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError);
      return res.status(502).json({ error: 'Cloudinary failed to store processed image. Please try again.' });
    }

    // Step 3: Return the Cloudinary URL to the frontend
    res.json({
      imageUrl: result.secure_url
    });

  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: error.message || 'Failed to process image' });
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
