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

app.use(cors());
app.use(express.json());


// Configure Multer for temporary storage
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
      cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  }
});

// Create uploads folder if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.post('/api/remove-background', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  const tempFilePath = req.file.path;

  try {
    // Credentials check is handled during server startup in config/cloudinary.js

    // Upload to Cloudinary and request background removal
    // Note: The Cloudinary AI Background Removal add-on must be enabled in your Cloudinary account.
    const result = await cloudinary.uploader.upload(tempFilePath, {
      background_removal: "cloudinary_ai",
      resource_type: 'image'
    });

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
  } finally {
    // Delete the temporary file
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
