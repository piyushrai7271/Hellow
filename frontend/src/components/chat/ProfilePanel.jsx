import { useState } from "react";
import ChangePasswordModal from "../ProfilePanel/ChangePasswordModal.jsx";
import EditProfileModal from "../ProfilePanel/EditProfileModel.jsx";
import AvatarActions from "../ProfilePanel/AvatarActions.jsx";

const ProfilePanel = ({ user, setUser, closeProfile }) => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAvatarActions, setShowAvatarActions] = useState(false);

  if (!user) return null;

  return (
    <div className="flex flex-col h-full bg-white relative">

      {/* HEADER */}
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="font-semibold text-2xl">Profile</h2>
        <button onClick={closeProfile}>✕</button>
      </div>

      <div className="flex flex-col items-center p-6 gap-4">

        {/* AVATAR */}
        <div
          className="relative cursor-pointer"
          onClick={() => setShowAvatarActions(true)}
        >
          {user.avatar?.url ? (
            <img
              src={user.avatar.url}
              className="w-30 h-30 rounded-full object-cover"
            />
          ) : (
            <div className="w-30 h-30 rounded-full bg-indigo-500 flex items-center justify-center text-2xl text-white">
              {user.fullName?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="absolute bottom-0 right-0 bg-black text-white text-xs px-2 py-1 rounded-full">
            ✏️
          </div>
        </div>

        <h3 className="text-2xl font-semibold">{user.fullName}</h3>

        <p className="text-lg font-semibold text-gray-700">
          {user.gender || "Gender not set"}
        </p>

        <p className="text-sm text-gray-900 text-center">
          {user.bio || "No bio added"}
        </p>

        {/* ACTION BUTTONS */}
        <div className="w-full mt-4 flex flex-col gap-3">

          {/* ❌ NO TOAST HERE */}
          <button
            onClick={() => setShowPasswordModal(true)}
            className="p-2 border rounded-lg hover:bg-pink-100"
          >
            Change Password
          </button>

          {/* ❌ NO TOAST HERE */}
          <button
            onClick={() => setShowEditModal(true)}
            className="p-2 border rounded-lg hover:bg-pink-100"
          >
            Edit Profile
          </button>

        </div>
      </div>

      {/* MODALS */}

      {showAvatarActions && (
        <AvatarActions
          onClose={() => setShowAvatarActions(false)}
          setUser={setUser}
        />
      )}

      {showPasswordModal && (
        <ChangePasswordModal
          onClose={() => setShowPasswordModal(false)}
        />
      )}

      {showEditModal && (
        <EditProfileModal
          user={user}
          setUser={setUser}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

export default ProfilePanel;