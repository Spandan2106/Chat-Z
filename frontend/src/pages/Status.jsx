import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Status() {
  const { user } = useAuth();
  const [statusGroups, setStatusGroups] = useState([]);

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const { data } = await api.get('/status');
        const others = data.filter(group => group.user._id !== user._id);
        setStatusGroups(others);
      } catch (err) {
        console.error("Failed to fetch statuses", err);
      }
    };
    fetchStatuses();
  }, [user._id]);

  const handleCreateStatus = async () => {
    const content = prompt("Enter your status text:");
    if (content) {
      await api.post('/status', { type: 'text', content, backgroundColor: '#333' });
      // In a real app, you would refetch or update state here
      alert("Status posted!");
    }
  };

  return (
    <div className="page-layout">
      <div style={{ width: '100%', maxWidth: '600px', padding: '20px' }}>
        <div className="status-section">
          <h2 style={{color: 'var(--text-primary)'}}>My Status</h2>
          <div className="user-item" onClick={handleCreateStatus}>
            <div className="avatar default-avatar">+</div>
            <div className="user-info">
              <div className="user-name">Add to my status</div>
            </div>
          </div>
        </div>
        <div className="status-section">
          <h2 style={{color: 'var(--text-primary)'}}>Recent Updates</h2>
          {statusGroups.map(group => (
            <div key={group.user._id} className="user-item">
              <img src={group.user.avatar} className="avatar" alt={group.user.username} style={{border: '2px solid var(--primary-green)'}}/>
              <div className="user-info">
                <div className="user-name">{group.user.username}</div>
                <div className="user-status">{group.statuses.length} updates</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}