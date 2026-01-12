module.exports = function separateFilesByField(req, res, next) {
  const fileMap = {
    aadharDoc: [],
    panDoc: [],
    // profilePicture: [],
    passbookDoc: [],
    relivingLetter: [],
    experience: [],
    education: [],
  };

  if (!req.files || !Array.isArray(req.files)) {
    req.files = fileMap;
    return next();
  }

  req.files.forEach((file) => {
    const { fieldname, buffer, mimetype, originalname, size } = file;

    const fileObj = { fieldname, buffer, mimetype, originalname, size };

    // Static fields
    if (
      [
        "aadharDoc",
        "panDoc",
        // "profilePicture",
        "passbookDoc",
        "relivingLetter",
      ].includes(fieldname)
    ) {
      fileMap[fieldname].push(fileObj);
      return;
    }

    // Dynamic experience fields: experience[0][experienceLetter]
    if (/^experience\[\d+\]\[experienceLetter\]$/.test(fieldname)) {
      fileMap.experience.push(fileObj);
      return;
    }

    // Dynamic education fields: education[0][doc]
    if (/^education\[\d+\]\[doc\]$/.test(fieldname)) {
      fileMap.education.push(fileObj);
      return;
    }
  });

  req.files = fileMap;
  next();
};
