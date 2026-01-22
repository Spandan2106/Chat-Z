export const decryptMessage = async (privateKey, ciphertext) => {
  const data = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
  const decrypted = await window.crypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, data);
  return new TextDecoder().decode(decrypted);
};
