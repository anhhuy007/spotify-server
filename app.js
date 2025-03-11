import express from "express";
import cors from "cors";
import multer from "multer";

const app = express();

app.use(cors());

// Use memory storage to ensure file is available
const upload = multer({ storage: multer.memoryStorage() }).single("file");

app.post("/upload", upload, (req, res) => {
  // Check if file exists
  if (!req.file) {
    console.log("No file uploaded");
    return res.status(400).json({ message: "No file uploaded" });
  }

  // Log file details
  console.log("File details:", {
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
  });

  // Log request body if needed
  console.log("Request body:", req.body);

  return res.status(200).json({
    message: "File uploaded successfully",
    fileDetails: {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    },
  });
});

app.listen(3000, () => console.log("Server listening on port 3000"));
