const crypto = require("crypto");

exports.decrypt = (text, key) => {
  const [iv, encrypted] = text.split(":");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    key,
    Buffer.from(iv, "hex")
  );
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  return decrypted + decipher.final("utf8");
};
