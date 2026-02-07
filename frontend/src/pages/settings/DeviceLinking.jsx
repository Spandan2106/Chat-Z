import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

export default function DeviceLinking() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [qrCode, setQrCode] = useState(null);

  const handleLinkEmail = async () => {
    try {
      await api.post("/users/link-email", { email });
      alert("Email linked successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to link email");
    }
  };

  const handleLinkMobile = async () => {
    try {
      await api.post("/users/link-mobile", { mobile });
      alert("Mobile linked successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to link mobile");
    }
  };

  const generateQRCode = () => {
    // Generate QR code for device linking
    setQrCode("https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + encodeURIComponent(`link-device:${user._id}`));
  };

  return (
    <div className="settings-page-container">
      <div className="settings-page-content">
        <div className="settings-page-header">
          <h1>Device Linking</h1>
          <p>Link your account to other devices and platforms</p>
        </div>

        <div className="settings-section-box">
          <h3>Email Linking</h3>
          <div className="settings-toggle-item">
            <div className="toggle-info">
              <label>Link Email Address</label>
              <small>Receive notifications and updates via email</small>
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              className="settings-input"
            />
            <button onClick={handleLinkEmail} className="settings-btn primary">Link Email</button>
          </div>
        </div>

        <div className="settings-section-box">
          <h3>Mobile Linking</h3>
          <div className="settings-toggle-item">
            <div className="toggle-info">
              <label>Link Mobile Number</label>
              <small>Receive SMS notifications and secure your account</small>
            </div>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Enter mobile number"
              className="settings-input"
            />
            <button onClick={handleLinkMobile} className="settings-btn primary">Link Mobile</button>
          </div>
        </div>

        <div className="settings-section-box">
          <h3>QR Code Device Linking</h3>
          <div className="settings-toggle-item">
            <div className="toggle-info">
              <label>Generate QR Code</label>
              <small>Scan with another device to link your account</small>
            </div>
            <button onClick={generateQRCode} className="settings-btn primary">Generate QR</button>
          </div>
          {qrCode && (
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <img src={qrCode} alt="QR Code" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
