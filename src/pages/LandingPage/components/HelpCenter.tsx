import { useNavigate } from "react-router-dom";
import ConstructionIcon from '@mui/icons-material/Construction';

export default function HelpCenter() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f6f7f8] dark:bg-[#101922] text-slate-900 dark:text-white p-4">
      <ConstructionIcon style={{ fontSize: 80 }} className="text-[#7CA1F3] mb-6" />
      <h1 className="text-4xl font-bold mb-4 text-center">Help Center</h1>
      <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 text-center max-w-md">
        Find answers to your questions. This page is under development.
      </p>
      <button onClick={() => navigate("/")} className="px-6 py-3 bg-[#7CA1F3] text-white rounded-lg font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-[#137fec]/20">
        Back to Home
      </button>
    </div>
  );
}