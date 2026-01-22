export const encryptMessage = async (publicKey, message) => {
  const enc = new TextEncoder();
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    enc.encode(message)
  );
  return btoa(String.fromCharCode(...new Uint8Array(ciphertext)));
};
