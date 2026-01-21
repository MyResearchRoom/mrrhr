// const crypto = require("crypto");
// const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET;
// const ALGORITHM = "aes-256-cbc";

// exports.encryptSensitiveData = (data) => {
//   const iv = crypto.randomBytes(16); // Initialization vector
//   const cipher = crypto.createCipheriv(
//     ALGORITHM,
//     Buffer.from(ENCRYPTION_SECRET, "hex"),
//     iv
//   );
//   let encrypted = cipher.update(data, "utf-8");
//   encrypted = Buffer.concat([encrypted, cipher.final()]);
//   return iv.toString("hex") + ":" + encrypted.toString("hex");
// };

// exports.decryptSensitiveData = (encryptedData) => {
//   if (!encryptedData || typeof encryptedData !== "string") {
//     return null; // Return null if no data or invalid data type
//   }

//   const [ivHex, encryptedHex] = encryptedData.split(":"); // Split the IV and the encrypted data
//   const decipher = crypto.createDecipheriv(
//     ALGORITHM,
//     Buffer.from(ENCRYPTION_SECRET, "hex"),
//     Buffer.from(ivHex, "hex")
//   );

//   let decrypted = decipher.update(
//     Buffer.from(encryptedHex, "hex"),
//     "hex",
//     "utf-8"
//   );
//   decrypted += decipher.final("utf-8");

//   // Decrypted data is base64 encoded at this point
//   return decrypted; // Return the base64 string directly
// };

// exports.getDecryptedDocumentAsBase64 = (bufferData) => {
//   if (!bufferData) return null;

//   // Step 1: Convert Buffer (BLOB) to a string
//   const encryptedData = bufferData.toString("utf-8");

//   // Step 2: Decrypt the data
//   const decryptedData = exports.decryptSensitiveData(encryptedData);

//   // Step 3: Return decrypted data (already base64 from encryption process)
//   return decryptedData;
// };


// utils/cryptography.js
const crypto = require("crypto");
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET;
const ALGORITHM = "aes-256-cbc";

// For strings
exports.encryptSensitiveData = (data) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_SECRET, "hex"), iv);
  const encrypted = Buffer.concat([cipher.update(data, "utf-8"), cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
};

exports.decryptSensitiveData = (encryptedData) => {
  if (!encryptedData || typeof encryptedData !== "string") return null;
  const [ivHex, encryptedHex] = encryptedData.split(":");
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_SECRET, "hex"),
    Buffer.from(ivHex, "hex")
  );
  let decrypted = decipher.update(Buffer.from(encryptedHex, "hex"));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString("utf-8"); // string value
};

// For files / BLOBs
exports.encryptFileBuffer = (bufferData) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_SECRET, "hex"), iv);
  const encrypted = Buffer.concat([cipher.update(bufferData), cipher.final()]);
  return Buffer.concat([iv, encrypted]); // raw buffer to store in DB
};

exports.decryptFileBuffer = (bufferData) => {
  if (!bufferData) return null;
  const iv = bufferData.slice(0, 16);
  const encrypted = bufferData.slice(16);
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_SECRET, "hex"), iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("base64"); // for frontend
};

