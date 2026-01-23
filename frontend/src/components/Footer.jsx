import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-logo">Chat_Z</div>
        <div className="footer-links">
          <span onClick={() => navigate("/about")}>About & History</span>
        </div>
      </div>
      <div className="footer-copy">
        &copy; 2026 Chat_Z. All rights reserved.
      </div>
    </footer>
  );
}