import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600">
      
      {/* CARD */}
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 p-10 rounded-3xl shadow-2xl text-center w-[350px]
        transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_50px_rgba(0,0,0,0.25)] hover:bg-white/20">
        
        {/* ICON */}
        <div className="text-5xl mb-3">💬</div>

        {/* TITLE */}
        <h1 className="text-3xl font-bold text-white mb-2">
          Hello 👋
        </h1>

        {/* SUBTITLE */}
        <p className="text-white/80 mb-6 text-sm leading-relaxed">
          Connect with your friends instantly <br />
          with fast and secure messaging
        </p>

        {/* BUTTON */}
        <button
          onClick={() => navigate("/login")}
          className="w-full bg-white text-blue-600 font-semibold py-2.5 rounded-xl hover:scale-105 hover:bg-gray-100 transition-all duration-200 shadow-md"
        >
          Get Started →
        </button>

        {/* FOOTER */}
        <p className="text-white/60 text-xs mt-5 tracking-wide">
          ⚡ Fast • 🔒 Secure • 💬 Real-time
        </p>
      </div>
    </div>
  );
};

export default Welcome;