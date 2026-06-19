import { useNavigate } from "react-router-dom";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import projectIcon from "/src/assets/projectIcon.svg";
import LandingFooter from "./LandingFooter";
export default function TermsOfServiceVariant2() {
  const navigate = useNavigate();

  const sections = [
    {
      id: "1",
      title: "Acceptance of Terms",
      content: "By accessing or using Sahajinsight ('the Service'), you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the Service."
    },
    {
      id: "2",
      title: "Accounts & Registration",
      content: "You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to disclose your password to any third party."
    },
    {
      id: "3",
      title: "Intellectual Property",
      content: "The Service and its original content (excluding Content provided by users), features and functionality are and will remain the exclusive property ofSahajinsight and its licensors."
    },
    {
      id: "4",
      title: "Termination",
      content: "We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms."
    },
    {
      id: "5",
      title: "Limitation of Liability",
      content: "In no event shallSahajinsight be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses."
    },
    {
      id: "6",
      title: "Governing Law",
      content: "These Terms shall be governed and construed in accordance with the laws of Delaware, United States, without regard to its conflict of law provisions."
    }
  ];

  return (
    <div className="bg-white overflow-x-hidden min-h-screen flex flex-col">
      
  <header className="fixed top-0 z-50 w-full border-b border-[#e7edf3] backdrop-blur-md">
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
              <a onClick={() => navigate("/Terms of Service")} className="text-[#137fec] text-sm font-bold transition-colors cursor-pointer">Terms of Service</a>
              <a onClick={() => navigate("/Resources")} className="text-slate-600 text-sm font-medium hover:text-[#137fec] transition-colors cursor-pointer">Resources</a>
              <a onClick={() => navigate("/pricing")} className="text-slate-600 text-sm font-medium hover:text-[#137fec] transition-colors cursor-pointer">Pricing</a>
              <a onClick={() => navigate("/faq")} className="text-slate-600 text-sm font-medium hover:text-[#137fec] transition-colors cursor-pointer">FAQ</a>
            </nav>
            <div className="flex gap-3">
               <button onClick={() => navigate("/login")} className="rounded-lg h-10 px-4 bg-slate-100 text-slate-900 text-sm font-bold hover:bg-slate-200 transition-colors">Log in</button>
               <button onClick={() => navigate("/signup")} className="rounded-lg h-10 px-4 bg-[#137fec] text-white text-sm font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-[#137fec]/20">Start for free</button>
            </div>
          </div>
          <button className="md:hidden text-slate-900"><MenuIcon /></button>
        </div>
      </header>

      <main className="flex-grow mt-10">
        <div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-20 py-16">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* LEFT COLUMN: Sticky Info & Nav */}
            <div className="lg:col-span-4 relative">
              <div className="lg:sticky lg:top-32 space-y-8">
                <div>
                  <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                    Terms of <br /><span className="text-[#137fec]">Service</span>
                  </h1>
                  <p className="text-slate-500 font-mono text-sm">
                    Effective Date: January 14, 2026
                  </p>
                </div>
                
                <hr className="border-slate-200" />

                <nav className="hidden lg:block">
                  <h3 className="uppercase text-xs font-bold text-slate-400 mb-4 tracking-wider">On this page</h3>
                  <ul className="space-y-3">
                    {sections.map((section, idx) => (
                      <li key={section.id}>
                        <a 
                          href={`#section-${section.id}`} 
                          className="group flex items-center gap-3 text-slate-600 hover:text-[#137fec] transition-colors text-sm font-medium"
                        >
                          <span className="flex items-center justify-center w-6 h-6 rounded bg-slate-100 text-xs group-hover:bg-[#137fec] group-hover:text-white transition-colors">
                            {idx + 1}
                          </span>
                          {section.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </div>

            {/* RIGHT COLUMN: Content */}
            <div className="lg:col-span-8 lg:border-l lg:border-slate-100 lg:pl-12">
              <div className="prose prose-lg max-w-none">
                <p className="text-xl text-slate-600 leading-relaxed mb-12">
                  Welcome to Sahajinsight. Please read these terms carefully. By using our services, you agree to be bound by these terms, which establish a contractual relationship between you andSahajinsight Inc.
                </p>

                <div className="space-y-16">
                  {sections.map((section, idx) => (
                    <div key={section.id} id={`section-${section.id}`} className="scroll-mt-32 group">
                      <div className="flex items-baseline gap-4 mb-4">
                        <span className="text-2xl font-black text-slate-200 group-hover:text-[#137fec]/20 transition-colors">
                          0{idx + 1}
                        </span>
                        <h2 className="text-2xl font-bold text-slate-900 m-0">
                          {section.title}
                        </h2>
                      </div>
                      <p className="text-slate-600 leading-7">
                        {section.content}
                      </p>
                    </div>
                  ))}
                </div>
{/* 
                <div className="mt-20 p-8 bg-slate-50 rounded-2xl border border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Questions regarding legal matters?</h3>
                  <p className="text-slate-600 mb-6 text-sm">
                    We are happy to answer any questions you have regarding our Terms of Service or Privacy Policy.
                  </p>
                
                </div> */}

              </div>
            </div>
          </div>
        </div>
      </main>
 
    <LandingFooter />
    </div>
  );
}