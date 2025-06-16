import express from 'express';
import multer from 'multer';
import path from 'path';
import { supabase } from '../../../supabase/supabaseClient';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

router.post('/talent/signup', upload.single('resume'), async (req, res) => {
  try {
    const { fullName, email, skills, bio } = req.body;
    const resume = req.file;

    if (!fullName || !email || !skills || !bio || !resume) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const fileName = `${Date.now()}-${email}${path.extname(resume.originalname)}`;

    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(fileName, resume.buffer, {
        contentType: resume.mimetype,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return res.status(500).json({ message: 'Failed to upload resume' });
    }

    const resumeUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/resumes/${fileName}`;

    const { error: dbError } = await supabase.from('TalentUsers').insert({
      full_name: fullName,
      email,
      skills,
      bio,
      resume_url: resumeUrl,
      created_at: new Date().toISOString(),
    });

    if (dbError) {
      console.error('DB Insert error:', dbError);
      return res.status(500).json({ message: 'Failed to save user' });
    }

    return res.status(200).json({ message: 'Signup complete' });
  } catch (error) {
    console.error('Unhandled error:', error);
    return res.status(500).json({ message: 'Unexpected server error' });
  }
});

export default router;