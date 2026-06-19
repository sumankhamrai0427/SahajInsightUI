import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Toast } from "primereact/toast";
import ApiServices from "../../../services/ApiServices";
// import POST_APIS from "../../../../connection";

// Icons (Matching Sahajinsight Design System)
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AnalyticsIcon from "@mui/icons-material/Analytics";
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
const ContactPage = () => {
  const navigate = useNavigate();
  const toast = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Transition States
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionOrigin, setTransitionOrigin] = useState({ x: 0, y: 0 });
  const [transitionColor, setTransitionColor] = useState("bg-[#137fec]");

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const showSuccess = (message) => {
    toast.current.show({
      severity: "success",
      summary: "Success",
      detail: message,
      life: 3000,
      // Updated to Sahajinsight Blue/Green gradient
      style: {
        background: "linear-gradient(135deg, #137fec 0%, #10b981 100%)",
        color: "#fff",
        borderRadius: "12px",
        border: "none",
      },
      contentStyle: { background: "transparent" },
    });
  };

  const showError = (message) => {
    toast.current.show({
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
      contentStyle: { background: "transparent" },
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
          subject: "",
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const contactMethods = [
    {
      icon: <EmailIcon fontSize="large" />,
      title: "Email Us",
      description: "For general inquiries and support",
      value: "support@sahajinsight.com",
      action: "mailto:support@sahajinsight.com",
    },
    {
      icon: <AccessTimeIcon fontSize="large" />,
      title: "Response Time",
      description: "We typically respond within",
      value: "24-48 hours",
      action: null,
    },
    {
      icon: <ForumIcon fontSize="large" />,
      title: "Community",
      description: "Join our mindful community",
      value: "Community Forum",
      action: "#",
    },
  ];

  const faqs = [
    {
      question: "How do I reset my password?",
      answer:
        "Go to the login page and click 'Forgot Password'. Follow the instructions sent to your email.",
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer:
        "Yes, you can cancel at any time. Your access continues until the end of your billing period.",
    },
    {
      question: "Is my data private?",
      answer:
        "Absolutely. We never sell your data and use industry-standard encryption to protect your information.",
    },
  ];

  const handleNavigateWithTransition = (e, path, color = "bg-[#137fec]") => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTransitionOrigin({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
    setTransitionColor(color);
    setIsTransitioning(true);

    setTimeout(() => {
      navigate(path);
    }, 800);
  };

  const handleGoBack = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTransitionOrigin({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
    setTransitionColor("bg-[#f6f7f8]");
    setIsTransitioning(true);

    setTimeout(() => {
      navigate(-1);
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Page Transition Overlay */}
      {isTransitioning && (
        <div
          className={`fixed inset-0 z-[100] pointer-events-none ${transitionColor}`}
          style={{
            clipPath: `circle(150% at ${transitionOrigin.x}px ${transitionOrigin.y}px)`,
            animation:
              "expandFromButton 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards",
          }}
        />
      )}
      <style>{`
                @keyframes expandFromButton {
                    from { clip-path: circle(0% at ${transitionOrigin.x}px ${transitionOrigin.y}px); }
                    to { clip-path: circle(150% at ${transitionOrigin.x}px ${transitionOrigin.y}px); }
                }
            `}</style>

      <Toast ref={toast} position="top-right" className="custom-toast" />
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
                onClick={() => navigate("/Contact us")}
                className="text-[#137fec] text-sm font-bold transition-colors cursor-pointer"
              >
                Contact us
              </a>
              <a
                onClick={() => navigate("/resources")}
                className="text-slate-600 text-sm font-medium hover:text-[#137fec] transition-colors cursor-pointer"
              >
                Resources
              </a>
              <a
                onClick={() => navigate("/pricing")}
                className="text-slate-600 text-sm font-medium hover:text-[#137fec] transition-colors cursor-pointer"
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
        </div>
      </header>

      <main className="flex-grow mt-10">
        {/* Hero Section */}
        <section className="relative py-16 px-6 md:px-12 bg-white border-b border-slate-100">
          <div className="max-w-[900px] mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#137fec]/10 text-[#137fec] mb-6">
              <WavingHandIcon fontSize="small" />
              <span className="text-sm font-bold uppercase tracking-wider">
                We're Here For You
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-slate-900 mb-6">
              Contact{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#137fec] to-blue-400">
                Us
              </span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Have questions, feedback, or just want to say hello? We'd love to
              hear from you.
            </p>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-12 px-6 md:px-12 bg-[#f6f7f8]">
          <div className="max-w-[1100px] mx-auto">
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {contactMethods.map((method, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-[#137fec] transition-all duration-300 text-center shadow-sm hover:shadow-lg"
                >
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4 text-[#137fec]">
                    {method.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    {method.title}
                  </h3>
                  <p className="text-slate-500 text-sm mb-2">
                    {method.description}
                  </p>
                  {method.action ? (
                    <a
                      href={method.action}
                      className="text-[#137fec] hover:underline font-bold transition-colors"
                    >
                      {method.value}
                    </a>
                  ) : (
                    <span className="text-slate-900 font-bold">
                      {method.value}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  Send Us a Message
                </h2>
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
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#137fec] focus:ring-2 focus:ring-[#137fec]/10 transition-all"
                    >
                      <option value="">Select a topic</option>
                      <option value="General Enquiry">General Enquiry</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="Billing Question">Billing Question</option>
                      <option value="Feedback">Feedback</option>
                      <option value="Partnership">Partnership</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Your Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
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

              {/* FAQ Section */}
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  Frequently Asked
                </h2>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-2xl p-6 border border-slate-200"
                    >
                      <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-start gap-3">
                        <HelpOutlineIcon
                          className="text-[#137fec] mt-0.5"
                          fontSize="small"
                        />
                        {faq.question}
                      </h3>
                      <p className="text-slate-600 leading-relaxed pl-9 text-sm">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Additional Help */}
                <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                  <div className="flex items-start gap-4">
                    <LightbulbIcon
                      className="text-[#137fec]"
                      fontSize="large"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">
                        Looking for more answers?
                      </h3>
                      <p className="text-slate-600 text-sm mb-4">
                        Check out our comprehensive help center for guides,
                        tutorials, and troubleshooting tips.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
};

export default ContactPage;
