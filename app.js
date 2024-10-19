const express = require("express");
const AWS = require("aws-sdk");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const s3 = new AWS.S3({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_KEY_ACCESS,
  region: process.env.S3_REGION,
});

const downloadFromS3 = async (bucket, key, downloadPath) => {
  const params = { Bucket: bucket, Key: key };
  const file = fs.createWriteStream(downloadPath);
  return new Promise((resolve, reject) => {
    s3.getObject(params)
      .createReadStream()
      .pipe(file)
      .on("close", () => resolve(downloadPath))
      .on("error", reject);
  });
};

const convertPptToPdf = (pptPath, outputDir) => {
  return new Promise((resolve, reject) => {
    // For Linux
    const command = `libreoffice --headless --convert-to pdf --outdir ${outputDir} ${pptPath}`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Conversion error: ${stderr}`);
      } else {
        const outputPdf = pptPath.replace(/\.(pptx|ppt)$/, ".pdf");
        resolve(outputPdf);
      }
    });
  });
};

const uploadToS3 = async (bucket, key, filePath) => {
  const fileContent = fs.readFileSync(filePath);
  const params = {
    Bucket: bucket,
    Key: key,
    Body: fileContent,
    ContentType: "application/pdf",
  };
  return s3.upload(params).promise();
};

const app = express();
app.use(express.json());

app.post("/convert-ppt-to-pdf", async (req, res) => {
  const { bucket, pptKey } = req.body;

  const downloadPath = path.join(__dirname, "temp", path.basename(pptKey)); // Temp file path
  const outputDir = path.join(__dirname, "temp"); // Temp output directory
  let pdfPath = ""; // Path to the converted PDF

  try {
    await downloadFromS3(bucket, pptKey, downloadPath);
    pdfPath = await convertPptToPdf(downloadPath, outputDir);
    const pdfKey = pptKey.replace(/\.(pptx|ppt)$/, ".pdf");
    const s3Upload = await uploadToS3(bucket, pdfKey, pdfPath);

    return res.json({
      message: "Conversion successful",
      pdfUrl: s3Upload.Location,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Conversion failed");
  } finally {
    // Cleanup temp files
    fs.unlinkSync(downloadPath);
    if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
  }
});

// Start the server
app.listen(3000, () => console.log("Server running on port 3000"));
