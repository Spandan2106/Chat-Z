import { useNavigate } from "react-router-dom";

export default function About() {
  const navigate = useNavigate();
  return (
    <div className="page-layout">
      <div className="about-container">
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--primary-green)', cursor: 'pointer', marginBottom: '20px', fontSize: '16px' }}>← Back</button>
        <h1 style={{ marginBottom: '20px' }}>About Chat_Z</h1>
        
        <section style={{ marginBottom: '30px' }}>
          <p style={{ fontSize: '18px', lineHeight: '1.6' }}>
            Welcome to Chat_Z, a revolutionary messaging platform created by <strong>Spandan Das</strong> in <strong>2019</strong>.
            What started as a vision to connect people has grown into a global phenomenon.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2>Our Impact</h2>
          <ul style={{ listStyle: 'none', padding: 0, marginTop: '15px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <li style={{ background: 'var(--sidebar-bg)', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
              <strong style={{ fontSize: '24px', color: 'var(--primary-green)', display: 'block' }}>50M+</strong>
              Daily Active Users
            </li>
            <li style={{ background: 'var(--sidebar-bg)', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
              <strong style={{ fontSize: '24px', color: 'var(--primary-green)', display: 'block' }}>300M+</strong>
              Downloads
            </li>
            <li style={{ background: 'var(--sidebar-bg)', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
              <strong style={{ fontSize: '24px', color: 'var(--primary-green)', display: 'block' }}>$2B+</strong>
              Market Cap
            </li>
            <li style={{ background: 'var(--sidebar-bg)', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
              <strong style={{ fontSize: '24px', color: 'var(--primary-green)', display: 'block' }}>74+</strong>
              Countries
            </li>
            <li style={{ background: 'var(--sidebar-bg)', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
              <strong style={{ fontSize: '24px', color: 'var(--primary-green)', display: 'block' }}>100+</strong>
              Software Engineers
            </li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2>Headquarters</h2>
          <p style={{ marginBottom: '15px' }}>Manhattan, NY</p>
          <div style={{ width: '100%', height: '300px', borderRadius: '10px', overflow: 'hidden' }}>
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.15830869428!2d-74.119763973046!3d40.69766374874431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c2588f046ee661%3A0xa0b3281fcecc08c!2sManhattan%2C%20New%20York%2C%20NY!5e0!3m2!1sen!2sus!4v1645564756275!5m2!1sen!2sus" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy"
              title="Google Map"
            ></iframe>
          </div>
        </section>

        <section>
          <h2>Contact & Support</h2>
          <p style={{ marginTop: '10px' }}>
            <strong>Email:</strong> <a href="mailto:sendemailChat_Z@gmail.com" style={{ color: 'var(--primary-green)' }}>sendemailChat_Z@gmail.com</a>
          </p>
          <div style={{ marginTop: '15px' }}>
            <strong>24/7 Help Center:</strong>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '5px' }}>
              <li>📞 +1 (555) 123-4567</li>
              <li>📞 +1 (555) 987-6543</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}