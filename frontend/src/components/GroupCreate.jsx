import { useState } from "react";
import api from "../api/axios";

export default function GroupCreate() {
  const [name,setName] = useState("");
  const [members,setMembers] = useState("");

  const createGroup = async () => {
    if(!name || !members) return;
    await api.post("/groups",{name, members: members.split(",")});
    setName(""); setMembers("");
    alert("Group created!");
  }

  return (
    <div className="group-create">
      <h4>Create Group</h4>
      <input placeholder="Group Name" value={name} onChange={e=>setName(e.target.value)} />
      <input placeholder="Members IDs comma separated" value={members} onChange={e=>setMembers(e.target.value)} />
      <button onClick={createGroup}>Create</button>
    </div>
  )
}
