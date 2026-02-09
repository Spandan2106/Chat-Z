import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function About() {
  const navigate = useNavigate();
  const [mapUrl, setMapUrl] = useState("https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.15830869428!2d-74.119763973046!3d40.69766374874431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c2588f046ee661%3A0xa0b3281fcecc08c!2sManhattan%2C%20New%20York%2C%20NY!5e0!3m2!1sen!2sus!4v1645564756275!5m2!1sen!2sus");
  const [locationName, setLocationName] = useState("Manhattan, NY");
  const [resume, setResume] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = 1;
          entry.target.style.transform = 'translateX(0)';
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.timeline-item').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResume(file);
      alert(`Resume "${file.name}" uploaded successfully!`);
    }
  };

  const handleLocationClick = (city, url, name) => {
    setMapUrl(url);
    setLocationName(name);
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="app-container" style={{ flexDirection: 'column', height: '100vh', margin: 0, padding: 0 }}>
      <div className="app-header">
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-primary)", fontWeight: "bold", fontSize: "20px" }}>
           <span className="dynamic-logo-text">Chat_Z</span>
        </div>
      </div>

      <div className="page-layout" style={{ flex: 1, height: 'auto', marginTop: '60px', marginBottom: '30px', overflowY: 'auto', alignItems: 'flex-start', paddingTop: '20px' }}>
      <div className="about-container">
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--primary-green)', cursor: 'pointer', marginBottom: '20px', fontSize: '16px' }}>← Back</button>
        <h1 style={{ marginBottom: '20px' }}>About Chat_Z</h1>
        
        <section style={{ marginBottom: '30px' }}>
          <p style={{ fontSize: '18px', lineHeight: '1.6' }}>
            Welcome to Chat_Z, a revolutionary messaging platform created by <strong>Spandan Das</strong> in <strong>2019</strong>. 
            What started as a vision to connect people has grown into a global phenomenon, built on the principles of simplicity, security, and reliability. 
            We believe that communication is a fundamental human right, and our mission is to provide a private and secure way for you to connect with the people who matter most.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2>Our Journey</h2>
          <p style={{ marginBottom: '20px' }}>From a simple idea to a global service, our journey has been driven by passion and innovation.</p>
          
          <div className="timeline" style={{ position: 'relative', paddingLeft: '20px' }}>
            {[
              { year: "2019", title: "The Inception", desc: "The idea for Chat_Z was born. A small team, led by Spandan Das, began building a messaging app focused on speed and simplicity." },
              { year: "2021", title: "1 Million Users", desc: "After a successful beta launch, we celebrated our first major milestone: 1 million active users." },
              { year: "2023", title: "End-to-End Encryption", desc: "We implemented state-of-the-art, end-to-end encryption across our platform, making Chat_Z one of the most secure messaging apps in the world." },
              { year: "2025", title: "Global Expansion", desc: "To better serve our growing international user base, we opened our first global offices in London and Singapore." },
              { year: "2026", title: "300M+ Strong", desc: "Surpassing 300 million users, we continue to innovate, adding new features while staying true to our core mission." }
            ].map((item, index) => (
              <div key={index} className="timeline-item" style={{ 
                position: 'relative', marginBottom: '30px', paddingLeft: '20px', borderLeft: '2px solid var(--primary-green)',
                opacity: 0, transform: 'translateX(-50px)', transition: 'all 0.6s ease-out'
              }}>
                <div style={{ 
                  position: 'absolute', left: '-9px', top: '0', width: '16px', height: '16px', 
                  background: 'var(--primary-green)', borderRadius: '50%', border: '3px solid var(--bg-color)' 
                }}></div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary-green)', lineHeight: '1' }}>{item.year}</div>
                <div style={{ fontSize: '16px', fontWeight: '600', margin: '5px 0', color: 'var(--text-primary)' }}>{item.title}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2>Challenges & Innovations</h2>
          <p>
            Scaling a global platform comes with immense challenges. From handling billions of messages per day to defending against security threats, our engineering team has consistently risen to the occasion. 
            Our biggest innovation remains our proprietary encryption protocol, which ensures that not even we can read your messages. We've also pioneered low-data usage modes to ensure our app is accessible even in areas with poor connectivity, because everyone deserves to stay in touch.
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
          <h2>Join Our Team</h2>
          <p style={{ marginBottom: '15px' }}>
            We are a team of builders, thinkers, and innovators who are passionate about connecting the world. We foster a culture of collaboration, respect, and continuous learning. 
            We believe in empowering our people, offering remote-first flexibility, comprehensive benefits, and opportunities for professional growth. If you want to work on a product that impacts millions of lives, check out our open positions.
          </p>
          <p style={{ marginBottom: '15px' }}>
            <strong>How we treat people:</strong> Our philosophy is simple - treat everyone with respect. We are committed to creating an inclusive environment where diverse perspectives are valued, and everyone has a voice. 
            We invest in our team's well-being and success, knowing that our company's strength comes from our people.
          </p>
          <div style={{ marginBottom: '20px' }}>
            <button onClick={() => navigate("/team")} style={{ background: 'var(--primary-green)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Meet the Team</button>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
             <div style={{ background: 'var(--sidebar-bg)', padding: '15px', borderRadius: '8px', flex: 1, minWidth: '200px' }}>
                <strong>Senior Backend Engineer</strong>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Remote / NY</p>
             </div>
             <div style={{ background: 'var(--sidebar-bg)', padding: '15px', borderRadius: '8px', flex: 1, minWidth: '200px' }}>
                <strong>Product Designer</strong>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>London, UK</p>
             </div>
             <div style={{ background: 'var(--sidebar-bg)', padding: '15px', borderRadius: '8px', flex: 1, minWidth: '200px' }}>
                <strong>Marketing Specialist</strong>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Singapore</p>
             </div>
          </div>
          <div style={{ marginTop: '20px', padding: '20px', background: 'var(--sidebar-bg)', borderRadius: '8px', textAlign: 'center' }}>
            <h3>Join Us!</h3>
            <p style={{ marginBottom: '10px', color: 'var(--text-secondary)' }}>Upload your resume to apply for general consideration.</p>
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} style={{ display: 'none' }} id="resume-upload" />
            <label htmlFor="resume-upload" style={{ background: 'var(--primary-green)', color: 'white', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', display: 'inline-block' }}>
              {resume ? "Resume Selected" : "Upload Resume"}
            </label>
            {resume && <p style={{ marginTop: '10px', fontSize: '14px', color: 'var(--primary-green)' }}>{resume.name}</p>}
          </div>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2>Global Offices</h2>
          <p style={{ marginBottom: '15px' }}>Our presence spans across major cities worldwide. Click a location to view on map.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
             <div onClick={() => handleLocationClick("New York", "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.15830869428!2d-74.119763973046!3d40.69766374874431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c2588f046ee661%3A0xa0b3281fcecc08c!2sManhattan%2C%20New%20York%2C%20NY!5e0!3m2!1sen!2sus!4v1645564756275!5m2!1sen!2sus", "Manhattan, NY")} style={{ textAlign: 'center', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', background: locationName.includes("Manhattan") ? 'var(--sidebar-bg)' : 'transparent' }}>
                <div style={{ fontSize: '24px' }}>🇺🇸</div>
                <strong>New York</strong>
             </div>
             <div onClick={() => handleLocationClick("London", "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d158858.47339870628!2d-0.24168138642433263!3d51.52855824202771!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47d8a00baf21de75%3A0x52963a5addd52a99!2sLondon%2C%20UK!5e0!3m2!1sen!2sus!4v1645564756275!5m2!1sen!2sus", "London, UK")} style={{ textAlign: 'center', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', background: locationName.includes("London") ? 'var(--sidebar-bg)' : 'transparent' }}>
                <div style={{ fontSize: '24px' }}>🇬🇧</div>
                <strong>London</strong>
             </div>
             <div onClick={() => handleLocationClick("Tokyo", "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d207446.97304739156!2d139.60078482496636!3d35.66816252721347!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60188b857628235d%3A0xcdd8aef709a2b520!2sTokyo%2C%20Japan!5e0!3m2!1sen!2sus!4v1645564756275!5m2!1sen!2sus", "Tokyo, Japan")} style={{ textAlign: 'center', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', background: locationName.includes("Tokyo") ? 'var(--sidebar-bg)' : 'transparent' }}>
                <div style={{ fontSize: '24px' }}>🇯🇵</div>
                <strong>Tokyo</strong>
             </div>
             <div onClick={() => handleLocationClick("Singapore", "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d255281.67842484227!2d103.70416557453835!3d1.3143393776514181!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da11238a8b9375%3A0x887869cf52abf5c4!2sSingapore!5e0!3m2!1sen!2sus!4v1645564756275!5m2!1sen!2sus", "Singapore")} style={{ textAlign: 'center', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', background: locationName.includes("Singapore") ? 'var(--sidebar-bg)' : 'transparent' }}>
                <div style={{ fontSize: '24px' }}>🇸🇬</div>
                <strong>Singapore</strong>
             </div>
          </div>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2>Our Locations</h2>
          <p style={{ marginBottom: '15px' }}>{locationName}</p>
          <div style={{ width: '100%', height: '300px', borderRadius: '10px', overflow: 'hidden', background: '#e0e0e0' }}>
            <iframe 
              src={mapUrl}
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy"
              title="Google Map"
            ></iframe>
          </div>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2>Frequently Asked Questions (FAQ)</h2>
          <div className="faq-container">
            {[
              { q: "Is Chat_Z free to use?", a: "Yes, Chat_Z is completely free for personal use. We are committed to providing accessible communication for everyone. We may introduce premium features for business accounts in the future." },
              { q: "How secure is my data?", a: "Your security is our top priority. All messages, calls, and file transfers are secured with end-to-end encryption, meaning only you and the person you're communicating with can read or listen to what is sent." },
              { q: "What platforms is Chat_Z available on?", a: "Chat_Z is available on iOS, Android, Windows, macOS, and through any modern web browser. Our multi-device support allows you to stay connected wherever you are." },
              { q: "How do I apply for a job?", a: "We're thrilled you're interested! You can view our open positions in the 'Join Our Team' section above. For general consideration, you can upload your resume directly on this page." }
            ].map((faq, index) => (
              <div key={index} className="faq-item" style={{ borderBottom: '1px solid var(--border-color)', marginBottom: '10px' }}>
                <div
                  className="faq-question"
                  onClick={() => toggleFaq(index)}
                  style={{ padding: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold' }}
                >
                  {faq.q}
                  <span>{openFaq === index ? '−' : '+'}</span>
                </div>
                {openFaq === index && (
                  <div className="faq-answer" style={{ padding: '0 15px 15px', color: 'var(--text-secondary)' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
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

      <div className="app-footer">
        © 2026 Chat_Z. All rights reserved.
      </div>
    </div>
  );
}