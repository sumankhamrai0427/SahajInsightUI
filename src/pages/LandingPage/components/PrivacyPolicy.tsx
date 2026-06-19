import { useNavigate } from "react-router-dom";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import MenuIcon from "@mui/icons-material/Menu";
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CookieIcon from '@mui/icons-material/Cookie';
import StorageIcon from '@mui/icons-material/Storage';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import projectIcon from "/src/assets/projectIcon.svg";
import LandingFooter from "./LandingFooter";
export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#f6f7f8] overflow-x-hidden min-h-screen flex flex-col">
      
      {/* --- HEADER --- */}
      <header className="fixed top-0 z-50 w-full border-b border-[#e7edf3] backdrop-blur-md ">
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
                            <a onClick={() => navigate("/Privacy Policy")} className="text-[#137fec] text-sm font-bold transition-colors cursor-pointer">Privacy Policy</a>
               <a onClick={() => navigate("/resources")} className="text-slate-600 text-sm font-medium hover:text-[#137fec] transition-colors cursor-pointer">Resources</a>
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

      <main className="flex-grow mt-10 py-16">
        
        {/* Header Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
           <div className="inline-flex items-center justify-center p-3 bg-[#137fec]/10 rounded-full mb-6">
              <LockIcon className="text-[#137fec]" fontSize="large" />
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
             Privacy Policy
           </h1>
           <p className="text-slate-600 text-lg">
             Last Updated: January 14, 2026
           </p>
           <p className="mt-4 text-slate-500 max-w-2xl mx-auto">
             Your privacy is critically important to us. At Sahajinsight, we have a few fundamental principles:
             We don't ask you for personal information unless we truly need it, and we don't sell your data to anyone.
           </p>
        </div>

        {/* Quick Summary Grid (Modern Touch) */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
                <div className="mt-1 p-2 bg-blue-50 rounded-lg text-[#137fec]"><VisibilityIcon /></div>
                <div>
                    <h3 className="font-bold text-slate-900 mb-2">We respect your data</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        We only process the data you connect (CSVs, Databases) to provide visualizations. We do not use your business data for our own marketing purposes.
                    </p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
                <div className="mt-1 p-2 bg-green-50 rounded-lg text-green-600"><StorageIcon /></div>
                <div>
                    <h3 className="font-bold text-slate-900 mb-2">Encryption is standard</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        All connections are encrypted via TLS 1.3. Your database credentials are salted, hashed, and stored securely using industry-best practices.
                    </p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
                <div className="mt-1 p-2 bg-orange-50 rounded-lg text-orange-600"><CookieIcon /></div>
                <div>
                    <h3 className="font-bold text-slate-900 mb-2">Minimal Cookies</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        We use cookies solely for authentication and keeping you logged in. We do not use intrusive third-party tracking cookies across the web.
                    </p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
                <div className="mt-1 p-2 bg-purple-50 rounded-lg text-purple-600"><ContactMailIcon /></div>
                <div>
                    <h3 className="font-bold text-slate-900 mb-2">You are in control</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        You can export your data or delete your account at any time. When you delete a data source, it is permanently purged from our cache.
                    </p>
                </div>
            </div>
        </div>

        {/* Detailed Content */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 p-8 md:p-12 shadow-sm">
            <div className="prose prose-slate max-w-none">
                
                <h3 className="text-2xl font-bold text-slate-900 mb-4">1. Information We Collect</h3>
                <p className="text-slate-600 mb-6 leading-7">
                    <strong>Account Information:</strong> When you sign up for Sahajinsight, we collect your name, email address, and password. If you sign up via a third-party service (like Google), we collect your account ID from that service.<br/><br/>
                    <strong>Connected Data:</strong> The core of our service involves you uploading files (CSV, Excel) or connecting databases (PostgreSQL, MySQL). We process this data to generate charts. We do not own this data; you retain full ownership. <br/><br/>
                    <strong>Usage Logs:</strong> We collect anonymized data on how you interact with the dashboard (e.g., "User created a bar chart") to help us improve the UX.
                </p>

                <hr className="border-slate-100 my-8" />

                <h3 className="text-2xl font-bold text-slate-900 mb-4">2. How We Use Information</h3>
                <ul className="list-disc pl-5 space-y-2 text-slate-600 mb-6">
                    <li>To provide, operate, and maintain our website.</li>
                    <li>To improve, personalize, and expand our website.</li>
                    <li>To understand and analyze how you use our website.</li>
                    <li>To develop new products, services, features, and functionality.</li>
                    <li>To communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates.</li>
                    <li>To send you emails (e.g., password resets, report summaries).</li>
                    <li>To find and prevent fraud.</li>
                </ul>

                <hr className="border-slate-100 my-8" />

                <h3 className="text-2xl font-bold text-slate-900 mb-4">3. Data Retention</h3>
                <p className="text-slate-600 mb-6 leading-7">
                    We retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your information to the extent necessary to comply with our legal obligations (for example, if we are required to retain your data to comply with applicable laws), resolve disputes, and enforce our legal agreements and policies.
                </p>

                <hr className="border-slate-100 my-8" />

                <h3 className="text-2xl font-bold text-slate-900 mb-4">4. Third-Party Service Providers</h3>
                <p className="text-slate-600 mb-6 leading-7">
                    We employ third-party companies and individuals to facilitate our Service ("Service Providers"). These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
                </p>
                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-slate-50 rounded border border-slate-100">
                        <span className="font-bold text-slate-900 block">AWS (Amazon Web Services)</span>
                        <span className="text-xs text-slate-500">Infrastructure & Hosting</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded border border-slate-100">
                        <span className="font-bold text-slate-900 block">Stripe</span>
                        <span className="text-xs text-slate-500">Payment Processing</span>
                    </div>
                </div> */}

                <hr className="border-slate-100 my-8" />

                <h3 className="text-2xl font-bold text-slate-900 mb-4">5. Contact Us</h3>
                <p className="text-slate-600 leading-7">
                    If you have any questions about this Privacy Policy, please contact us by email: <a href="mailto:support@sahajinsight.com" className="text-[#137fec] font-bold hover:underline">support@sahajinsight.com</a>.
                </p>

            </div>
        </div>

      </main>

      <LandingFooter />
    </div>
  );
}