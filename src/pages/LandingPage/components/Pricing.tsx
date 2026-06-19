// import { useNavigate } from "react-router-dom";
// import ConstructionIcon from '@mui/icons-material/Construction';

// export default function Pricing() {
//   const navigate = useNavigate();

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-[#f6f7f8] dark:bg-[#101922] text-slate-900 dark:text-white p-4">
//       <ConstructionIcon style={{ fontSize: 80 }} className="text-[#7CA1F3] mb-6" />
//       <h1 className="text-4xl font-bold mb-4 text-center">Under Development</h1>
//       <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 text-center max-w-md">
//         We are working hard to bring you this feature. Please check back later!
//       </p>
//       <button
//         onClick={() => navigate("/")}
//         className="px-6 py-3 bg-[#7CA1F3] text-white rounded-lg font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-[#137fec]/20"
//       >
//         Back to Home
//       </button>
//     </div>
//   );
// }

import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { Toast } from "primereact/toast";

import EmailIcon from "@mui/icons-material/Email";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ForumIcon from "@mui/icons-material/Forum";
import SendIcon from "@mui/icons-material/Send";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import WavingHandIcon from "@mui/icons-material/WavingHand";

import projectIcon from "/src/assets/projectIcon.svg";
import LandingFooter from "./LandingFooter";
import ApiServices from "../../../services/ApiServices";
import { MenuIcon } from "lucide-react";

export default function Pricing() {
  const navigate = useNavigate();

  /* ✅ FIX 1: Toast ref */
  const toast = useRef<Toast>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Pricing Enquiry",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  /* Transition */
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionOrigin, setTransitionOrigin] = useState({ x: 0, y: 0 });
  const [transitionColor, setTransitionColor] = useState("bg-[#137fec]");

  /* ✅ FIX 2: Typed helpers */
  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
  };

  const showSuccess = (message: string) => {
    toast.current?.show({
      severity: "success",
      summary: "Success",
      detail: message,
      life: 3000,
      style: {
        background: "linear-gradient(135deg, #137fec 0%, #10b981 100%)",
        color: "#fff",
        borderRadius: "12px",
        border: "none",
      },
    });
  };

  const showError = (message: string) => {
    toast.current?.show({
      severity: "error",
      summary: "Error",
      detail: message,
      life: 3000,
      style: {
        background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
        color: "#fff",
        borderRadius: "12px",
        border: "none",
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(formData.email)) {
      showError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await ApiServices.contactUs({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      });

      if (res.data?.success) {
        showSuccess(res.data.message || "Email sent successfully!");
        setSubmitted(true);
        setFormData({
          name: "",
          email: "",
          subject: "Pricing Enquiry",
          message: "",
        });
      } else {
        showError(res.data?.message || "Failed to send email");
      }
    } catch (err) {
      console.error(err);
      showError("Server error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Toast ref={toast} position="top-right" />

      <header className="fixed top-0 z-50 w-full border-b border-[#e7edf3] backdrop-blur-md">
        <div className="px-4 md:px-10 lg:px-40 py-3 flex items-center justify-between">
          <div
            className="flex items-center gap-4 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="size-9 text-[#137fec] flex items-center justify-center rounded-lg bg-[#137fec]/90">
              <img src={projectIcon} alt="Project Icon" className="w-6 h-6" />
            </div>
            <h2 className="text-slate-900 text-xl font-bold leading-tight tracking-tight">
              Sahajinsight
            </h2>
          </div>
          <div className="hidden md:flex flex-1 justify-end gap-8 items-center">
            <nav className="flex items-center gap-8">
              <a
                onClick={() => navigate("/resources")}
                className="text-slate-600 text-sm font-medium hover:text-[#137fec] transition-colors cursor-pointer"
              >
                Resources
              </a>
              <a
                onClick={() => navigate("/pricing")}
                className="text-[#137fec] text-sm font-bold transition-colors cursor-pointer"
              >
                Pricing
              </a>
              <a
                onClick={() => navigate("/faq")}
                className="text-slate-600 text-sm font-medium hover:text-[#137fec] transition-colors cursor-pointer"
              >
                FAQ
              </a>
            </nav>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/login")}
                className="rounded-lg h-10 px-4 bg-slate-100 text-slate-900 text-sm font-bold hover:bg-slate-200 transition-colors"
              >
                Log in
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="rounded-lg h-10 px-4 bg-[#137fec] text-white text-sm font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-[#137fec]/20"
              >
                Start for free
              </button>
            </div>
          </div>
          <button className="md:hidden text-slate-900">
            <MenuIcon />
          </button>
        </div>
      </header>
      <section className="py-16 px-4 md:px-10 lg:px-40 text-center mt-10">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-700">
          Please share your query, and we’ll   <br /> get back to you shortly
        
        </h1>
      </section>

      <main className="flex-grow max-w-4xl mx-auto px-4 md:px-10 lg:px-40 mb-20 w-full">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#137fec] focus:ring-2 focus:ring-[#137fec]/10 transition-all"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#137fec] focus:ring-2 focus:ring-[#137fec]/10 transition-all"
                placeholder="Enter your email"
              />
            </div>
            {/* <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Subject
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#137fec] focus:ring-2 focus:ring-[#137fec]/10 transition-all"
                    >
                
                      <option value="billing">Billing Question</option>
                  
                    </select>
                  </div> */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Your Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                // required
                rows={5}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#137fec] focus:ring-2 focus:ring-[#137fec]/10 transition-all resize-none"
                placeholder="How can we help you?"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-[#137fec] text-white font-bold hover:bg-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <span>Send Message</span>
                  <SendIcon fontSize="small" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
