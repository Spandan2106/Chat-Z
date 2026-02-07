import { useState } from "react";
import api from "../api/axios";

export default function GroupCreate() {
  const [name, setName] = useState("");
  const [members, setMembers] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const createGroup = async () => {
    if (!name.trim() || !members.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Parse and clean member IDs
      const memberIds = members
        .split(",")
        .map(id => id.trim())
        .filter(id => id.length > 0);

      if (memberIds.length === 0) {
        setError("Please enter at least one member ID");
        setLoading(false);
        return;
      }

      console.log("Creating group with members:", memberIds);

      const response = await api.post("/messages/group", {
        name: name.trim(),
        users: memberIds  // Send as array of IDs
      });

      console.log("Group created successfully:", response.data);

      // Reset form
      setName("");
      setMembers("");
      alert("Group created successfully!");
    } catch (error) {
      console.error("Failed to create group:", error);
      const errorMessage = error.response?.data?.message || error.message;
      setError(`Failed to create group: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group-create">
      <h4>Create Group</h4>
      <input
        placeholder="Group Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={loading}
      />
      <input
        placeholder="Member IDs (comma separated)"
        value={members}
        onChange={(e) => setMembers(e.target.value)}
        disabled={loading}
      />
      {error && <p style={{ color: "red", fontSize: "12px", margin: "5px 0" }}>{error}</p>}
      <button onClick={createGroup} disabled={loading}>
        {loading ? "Creating..." : "Create Group"}
      </button>
    </div>
  );
}
