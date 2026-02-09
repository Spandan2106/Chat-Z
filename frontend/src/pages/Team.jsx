import React from 'react';
import { useNavigate } from 'react-router-dom';

const teamMembers = [
  { name: "Spandan Das", role: "Founder & CEO", image: "https://via.placeholder.com/150", bio: "Visionary leader passionate about connecting the world." },
  { name: "Jane Doe", role: "CTO", image: "https://via.placeholder.com/150", bio: "Tech enthusiast ensuring our platform is secure and scalable." },
  { name: "John Smith", role: "Head of Design", image: "https://via.placeholder.com/150", bio: "Creative mind behind the intuitive user experience." },
  { name: "Alice Johnson", role: "Lead Developer", image: "https://via.placeholder.com/150", bio: "Coding wizard turning ideas into reality." },
  { name: "Michael Brown", role: "Product Manager", image: "https://via.placeholder.com/150", bio: "Bridging the gap between user needs and technical feasibility." },
  { name: "Sarah Lee", role: "Marketing Lead", image: "https://via.placeholder.com/150", bio: "Spreading the word and building our global community." },
];

export default function Team() {
  const navigate = useNavigate();

  return (
    <div className="app-container" style={{ flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
      <div className="app-header">
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-primary)", fontWeight: "bold", fontSize: "20px" }}>
           <span className="dynamic-logo-text">Chat_Z Team</span>
        </div>
      </div>
      <div style={{ padding: '40px', maxWidth: '1200px', margin: '60px auto 0 auto', width: '90%' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--primary-green)', cursor: 'pointer', marginBottom: '20px', fontSize: '16px' }}>← Back</button>
        <h1 style={{ textAlign: 'center', marginBottom: '40px', color: 'var(--text-primary)' }}>Meet Our Team</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
          {teamMembers.map((member, index) => (
            <div key={index} style={{ background: 'var(--sidebar-bg)', borderRadius: '15px', padding: '20px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', transition: 'transform 0.3s', cursor: 'default' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <img src={member.image} alt={member.name} style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', marginBottom: '15px', border: '3px solid var(--primary-green)' }} />
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '5px' }}>{member.name}</h3>
              <p style={{ color: 'var(--primary-green)', fontWeight: 'bold', marginBottom: '10px' }}>{member.role}</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{member.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}