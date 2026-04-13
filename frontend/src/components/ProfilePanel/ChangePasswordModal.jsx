import { useState } from "react";
import { apiFetch } from "../../api/api";
import toast from "react-hot-toast";

const ChangePasswordModal = ({ onClose }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ NEW STATES
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const res = await apiFetch("/api/user/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      if (res.success) {
        toast.success("Password changed successfully 🎉");
        onClose();
      } else {
        toast.error(res.message || "Error changing password ❌");
      }
    } catch (error) {
      toast.error("Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">

      <div className="bg-white p-6 rounded-xl w-96 flex flex-col gap-3">

        <h2 className="text-lg font-semibold">Change Password</h2>

        {/* CURRENT PASSWORD */}
        <div className="relative">
          <input
            type={showCurrent ? "text" : "password"}
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="border p-2 rounded w-full pr-10"
          />
          <span
            onClick={() => setShowCurrent((prev) => !prev)}
            className="absolute right-3 top-2 cursor-pointer text-sm text-gray-500"
          >
            {showCurrent ? "Hide" : "Show"}
          </span>
        </div>

        {/* NEW PASSWORD */}
        <div className="relative">
          <input
            type={showNew ? "text" : "password"}
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="border p-2 rounded w-full pr-10"
          />
          <span
            onClick={() => setShowNew((prev) => !prev)}
            className="absolute right-3 top-2 cursor-pointer text-sm text-gray-500"
          >
            {showNew ? "Hide" : "Show"}
          </span>
        </div>

        {/* CONFIRM PASSWORD */}
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="border p-2 rounded w-full pr-10"
          />
          <span
            onClick={() => setShowConfirm((prev) => !prev)}
            className="absolute right-3 top-2 cursor-pointer text-sm text-gray-500"
          >
            {showConfirm ? "Hide" : "Show"}
          </span>
        </div>

        <div className="flex justify-end gap-2 mt-3">
          <button onClick={onClose} disabled={loading}>
            Cancel
          </button>

          <button
            onClick={handleChangePassword}
            disabled={loading}
            className={`px-4 py-1 rounded text-white ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;