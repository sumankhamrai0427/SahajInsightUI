// import { useNavigate } from "react-router-dom";
// import ConstructionIcon from '@mui/icons-material/Construction';

// export default function Faq() {
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

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import MenuIcon from "@mui/icons-material/Menu";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SearchIcon from '@mui/icons-material/Search';
import projectIcon from "/src/assets/projectIcon.svg";
import LandingFooter from "./LandingFooter";
export default function FAQ() {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Can I connect to my local SQL database?",
      a: "Yes! Sahajinsight supports secure tunneling to local PostgreSQL, MySQL, and SQL Server databases. You can also upload static exports (CSV) if you prefer not to open a connection."
    },
    {
      q: "Is my data secure?",
      a: "Absolutely. We are SOC2 Type II compliant. Your data is encrypted at rest and in transit. We never sell your data, and you retain full ownership of all analytics generated on the platform."
    },
    {
      q: "Can I share dashboards with people who don't have an account?",
      a: "Yes. You can generate a public read-only link for any dashboard. For secure sharing, you can invite 'Viewer' users to your organization, which costs significantly less than a Creator license."
    },
    {
      q: "What happens after my free trial ends?",
      a: "At the end of your 14-day Pro trial, you will automatically be moved to the Free tier unless you choose to upgrade. We will not charge your card without your explicit permission."
    },
    {
      q: "Do you offer discounts for non-profits?",
      a: "Yes, we offer a 50% lifetime discount for registered non-profit organizations and educational institutions. Contact our support team with your credentials to apply."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className=" text-slate-900 overflow-x-hidden min-h-screen flex flex-col">
       {/* --- HEADER --- */}
       <header className="fixed top-0 z-50 w-full border-b border-[#e7edf3] bg-white/80 backdrop-blur-md">
        <div className="px-4 md:px-10 lg:px-40 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate("/")}>
            <div className="size-9 text-[#137fec] flex items-center justify-center rounded-lg bg-[#137fec]/90">
          <img
  src={projectIcon}
  alt="Project Icon"
  className="w-6 h-6"
/>
            </div>
            <h2 className="text-slate-900 text-xl font-bold leading-tight tracking-tight">Sahajinsight</h2>
          </div>
          <div className="hidden md:flex flex-1 justify-end gap-8 items-center">
            <nav className="flex items-center gap-8">
              <a onClick={() => navigate("/resources")} className="text-slate-600 text-sm font-medium hover:text-[#137fec] transition-colors cursor-pointer">Resources</a>
              <a onClick={() => navigate("/pricing")} className="text-slate-600 text-sm font-medium hover:text-[#137fec] transition-colors cursor-pointer">Pricing</a>
              <a onClick={() => navigate("/faq")} className="text-[#137fec] text-sm font-bold transition-colors cursor-pointer">FAQ</a>
            </nav>
            <div className="flex gap-3">
               <button onClick={() => navigate("/login")} className="rounded-lg h-10 px-4 bg-slate-100 text-slate-900 text-sm font-bold hover:bg-slate-200 transition-colors">Log in</button>
               <button onClick={() => navigate("/signup")} className="rounded-lg h-10 px-4 bg-[#137fec] text-white text-sm font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-[#137fec]/20">Start for free</button>
            </div>
          </div>
          <button className="md:hidden text-slate-900"><MenuIcon /></button>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center py-16 px-4 mt-10">
        {/* Header Section */}
        <div className="text-center max-w-2xl mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
                Frequently Asked <span className="text-[#137fec]">Questions</span>
            </h1>
            <p className="text-lg text-slate-600 mb-8">
                Everything you need to know about the product and billing.
            </p>
        </div>

        {/* Accordion */}
        <div className="w-full max-w-[800px] space-y-4">
            {faqs.map((item, index) => (
                <div 
                    key={index} 
                    className={`bg-white rounded-xl border transition-all duration-300 ${openIndex === index ? "border-[#137fec] shadow-lg" : "border-slate-200"}`}
                >
                    <button 
                        onClick={() => toggleFAQ(index)}
                        className="w-full flex items-center justify-between p-6 text-left"
                    >
                        <span className="font-bold text-lg text-slate-900">{item.q}</span>
                        <KeyboardArrowDownIcon 
                            className={`text-slate-400 transition-transform duration-300 ${openIndex === index ? "rotate-180 text-[#137fec]" : ""}`} 
                        />
                    </button>
                    <div 
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}
                    >
                        <p className="px-6 pb-6 text-slate-600 leading-relaxed">
                            {item.a}
                        </p>
                    </div>
                </div>
            ))}
        </div>

      
      </main>

          
              <LandingFooter />
    </div>
  );
}