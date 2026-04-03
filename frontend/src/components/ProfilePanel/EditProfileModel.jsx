import { useState } from "react";
import { apiFetch } from "../../api/api";

const EditProfileModal = ({ user, onClose, setUser }) => {
  const [fullName, setFullName] = useState(user.fullName);
  const [bio, setBio] = useState(user.bio || "");
  const [gender, setGender] = useState(user.gender || "Other");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (loading) return;

    setLoading(true);

    const res = await apiFetch("/api/user/update-profile", {
      method: "PUT",
      body: JSON.stringify({ fullName, bio, gender }),
    });

    setLoading(false);

    if (res.success) {
      setUser(res.data); // ✅ INSTANT UI UPDATE
      onClose();
    } else {
      alert(res.message || "Error updating profile");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">

      <div className="bg-white p-6 rounded-xl w-96 flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Edit Profile</h2>

        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="border p-2 rounded"
        />

        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="border p-2 rounded"
        />

        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <div className="flex justify-end gap-2 mt-3">
          <button onClick={onClose}>Cancel</button>

          <button
            onClick={handleSave}
            disabled={loading}
            className={`px-4 py-1 rounded text-white ${
              loading
                ? "bg-gray-400"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;