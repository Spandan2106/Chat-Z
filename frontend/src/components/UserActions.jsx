import api from "../api/axios";

export default function UserActions({ userId }) {

  const blockUser = async ()=>{
    await api.post(`/users/${userId}/block`);
    alert("User blocked!");
  }

  const deleteUser = async ()=>{
    await api.delete(`/users/${userId}`);
    alert("User deleted!");
  }

  return (
    <div className="user-actions">
      <button onClick={blockUser}>Block</button>
      <button onClick={deleteUser}>Delete</button>
    </div>
  )
}
