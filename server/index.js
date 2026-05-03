import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
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
    // Credentials check is handled during server startup in config/cloudinary.js

    // Upload to Cloudinary directly from memory buffer
    // Note: The Cloudinary AI Background Removal add-on must be enabled in your Cloudinary account.
    const uploadStream = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            background_removal: "cloudinary_ai",
            resource_type: 'image'
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
    };

    const result = await uploadStream();

    // We must wait for the background removal to complete since it's processed asynchronously by Cloudinary in some cases.
    // However, for immediate response, using remove.bg API or similar might be more direct if Cloudinary's async processing takes too long.
    // Assuming synchronous response for the sake of the example:
    
    // Cloudinary returns the original image URL immediately, and a notification when background removal is done. 
    // To get the transparent image URL immediately, we can use the `e_background_removal` transformation.
    const processedImageUrl = cloudinary.url(result.public_id, {
      secure: true,
      effect: "background_removal",
      format: "png"
    });

    res.json({
      originalUrl: result.secure_url,
      processedUrl: processedImageUrl,
      message: 'Background removal initiated. It might take a few seconds to process completely on Cloudinary.'
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
