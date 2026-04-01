import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600">
      
      {/* CARD */}
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 p-10 rounded-3xl shadow-2xl text-center w-[350px]">
        
        {/* LOGO / TITLE */}
        <h1 className="text-3xl font-bold text-white mb-2">
          Hellow 💬
        </h1>

        {/* SUBTITLE */}
        <p className="text-white/80 mb-6 text-sm">
          Connect with friends in real-time
        </p>

        {/* BUTTON */}
        <button
          onClick={() => navigate("/login")}
          className="w-full bg-white text-blue-600 font-semibold py-2 rounded-xl hover:scale-105 hover:bg-gray-100 transition-all duration-200 shadow-md"
        >
          Login / Register
        </button>

        {/* FOOTER TEXT */}
        <p className="text-white/60 text-xs mt-4">
          Fast • Secure • Real-time Chat
        </p>
      </div>
    </div>
  );
};

export default Welcome;