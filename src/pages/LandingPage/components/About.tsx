import { useNavigate } from "react-router-dom";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import MenuIcon from "@mui/icons-material/Menu";
import GroupsIcon from '@mui/icons-material/Groups';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PublicIcon from '@mui/icons-material/Public';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';

export default function About() {
  const navigate = useNavigate();

  const stats = [
    { label: "Active Users", value: "10,000+" },
    { label: "Data Sources Processed", value: "50TB+" },
    { label: "Charts Created", value: "2.5M" },
    { label: "Uptime", value: "99.99%" },
  ];

  const values = [
    {
      icon: <SpeedIcon fontSize="large" />,
      title: "Velocity Matters",
      desc: "We believe insights should be instant. We optimize every pixel and query to ensure you aren't waiting on loading screens."
    },
    {
      icon: <GroupsIcon fontSize="large" />,
      title: "Democratization",
      desc: "Data shouldn't be gated by SQL knowledge. We build tools that empower everyone, from interns to CEOs, to answer their own questions."
    },
    {
      icon: <SecurityIcon fontSize="large" />,
      title: "Uncompromising Security",
      desc: "Your data is your most valuable asset. We are SOC2 Type II compliant and employ bank-grade encryption for all connections."
    },
    {
      icon: <AutoGraphIcon fontSize="large" />,
      title: "Clarity over Complexity",
      desc: "We strip away the noise. Our design philosophy prioritizes clean, readable visualizations that tell a story at a glance."
    }
  ];

  const team = [
    { name: "Syed Arsad Ali", role: "CEO & Co-Founder", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDff29x-TS0_lYF0CNs0yFtrzRokMY7u05nsCXZXNeuQ14tpBK5qZgeVOEHZh51veUKoCG__c96QtN3AO-L6PzGMAMBVajGgF5Psq41ecqUrLopLvUj2jCSNz0KWpwFYFy_QYHn6cdmaRgA0JJi-uR7y9LfoVB2j25GlD5tYiweXchNSKWEWOc5D3WPzOy-OqbDNMbF0Lp2jjPSli4kT9BoGCtukt6RFrrU_GiWewPlQzw6lh4SdM3M0gHg7x0wma0gBzn61Q9o04U" },
    { name: "Omar Feroz", role: "CTO", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDff29x-TS0_lYF0CNs0yFtrzRokMY7u05nsCXZXNeuQ14tpBK5qZgeVOEHZh51veUKoCG__c96QtN3AO-L6PzGMAMBVajGgF5Psq41ecqUrLopLvUj2jCSNz0KWpwFYFy_QYHn6cdmaRgA0JJi-uR7y9LfoVB2j25GlD5tYiweXchNSKWEWOc5D3WPzOy-OqbDNMbF0Lp2jjPSli4kT9BoGCtukt6RFrrU_GiWewPlQzw6lh4SdM3M0gHg7x0wma0gBzn61Q9o04U" },
    { name: "Syed Arsad Ali", role: "Head of Product", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDff29x-TS0_lYF0CNs0yFtrzRokMY7u05nsCXZXNeuQ14tpBK5qZgeVOEHZh51veUKoCG__c96QtN3AO-L6PzGMAMBVajGgF5Psq41ecqUrLopLvUj2jCSNz0KWpwFYFy_QYHn6cdmaRgA0JJi-uR7y9LfoVB2j25GlD5tYiweXchNSKWEWOc5D3WPzOy-OqbDNMbF0Lp2jjPSli4kT9BoGCtukt6RFrrU_GiWewPlQzw6lh4SdM3M0gHg7x0wma0gBzn61Q9o04U" },
    { name: "Arendu Chanda", role: "Lead Designer", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDff29x-TS0_lYF0CNs0yFtrzRokMY7u05nsCXZXNeuQ14tpBK5qZgeVOEHZh51veUKoCG__c96QtN3AO-L6PzGMAMBVajGgF5Psq41ecqUrLopLvUj2jCSNz0KWpwFYFy_QYHn6cdmaRgA0JJi-uR7y9LfoVB2j25GlD5tYiweXchNSKWEWOc5D3WPzOy-OqbDNMbF0Lp2jjPSli4kT9BoGCtukt6RFrrU_GiWewPlQzw6lh4SdM3M0gHg7x0wma0gBzn61Q9o04U" },
  ];

  return (
    <div className="bg-[#f6f7f8] overflow-x-hidden min-h-screen flex flex-col">
      
      {/* --- HEADER --- */}
       <header className="fixed top-0 z-50 w-full border-b border-[#e7edf3] backdrop-blur-md">
             <div className="px-4 md:px-10 lg:px-40 flex items-center justify-between"></div>
        <div className="px-4 md:px-10 lg:px-40 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate("/")}>
            <div className="size-8 text-[#137fec] flex items-center justify-center rounded-lg bg-[#137fec]/10">
              <AnalyticsIcon className="text-2xl" />
            </div>
            <h2 className="text-slate-900 text-xl font-bold leading-tight tracking-tight">Sahajinsight</h2>
          </div>
          <div className="hidden md:flex flex-1 justify-end gap-8 items-center">
            <nav className="flex items-center gap-8">
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

      <main className="flex-grow mt-10">
        
        {/* Hero Section */}
        <section className="py-20 px-4 md:px-10 lg:px-40 bg-white border-b border-slate-100">
          <div className="max-w-[960px] mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#137fec]/10 text-[#137fec] text-xs font-bold uppercase tracking-wide mb-6">
              <EmojiEventsIcon fontSize="small" />
              <span>Our Mission</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 leading-tight">
              We make data <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#137fec] to-blue-400">accessible to everyone.</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Sahajinsight was born from a simple frustration: Data analysis was too hard, too slow, and too expensive. We're here to change that.
            </p>
          </div>
        </section>

        {/* Story & Stats Grid */}
        <section className="py-20 px-4 md:px-10 lg:px-40 bg-[#f6f7f8]">
          <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-16 items-center">
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl font-bold text-slate-900">Our Story</h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                Founded in 2024, Sahajinsight started as an internal tool for a marketing agency. The team was tired of waiting days for engineering to run SQL queries just to answer simple questions about campaign performance.
              </p>
              <p className="text-slate-600 text-lg leading-relaxed">
                We realized that if we could build a drag-and-drop interface that sat on top of raw data, we could unlock the potential of the entire team. Today, we help thousands of companies visualize their future.
              </p>
            </div>
            <div className="flex-1 w-full">
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center hover:-translate-y-1 transition-transform duration-300">
                    <div className="text-3xl md:text-4xl font-black text-[#137fec] mb-2">{stat.value}</div>
                    <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 px-4 md:px-10 lg:px-40 bg-white">
           <div className="max-w-[1200px] mx-auto">
             <div className="text-center mb-16">
               <h2 className="text-3xl font-bold text-slate-900 mb-4">What Drives Us</h2>
               <p className="text-slate-600">The core principles that guide every feature we build.</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {values.map((val, idx) => (
                 <div key={idx} className="flex gap-6 items-start p-8 rounded-2xl bg-slate-50 hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-xl transition-all duration-300 group">
                   <div className="text-slate-400 group-hover:text-[#137fec] transition-colors bg-white p-3 rounded-xl shadow-sm">
                     {val.icon}
                   </div>
                   <div>
                     <h3 className="text-xl font-bold text-slate-900 mb-3">{val.title}</h3>
                     <p className="text-slate-600 leading-relaxed">{val.desc}</p>
                   </div>
                 </div>
               ))}
             </div>
           </div>
        </section>

        {/* Team Section */}
        <section className="py-20 px-4 md:px-10 lg:px-40 bg-[#f6f7f8]">
          <div className="max-w-[1200px] mx-auto">
             <div className="text-center mb-16">
               <h2 className="text-3xl font-bold text-slate-900 mb-4">Meet the Builders</h2>
               <p className="text-slate-600">A remote-first team distributed across 12 timezones.</p>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
               {team.map((member, idx) => (
                 <div key={idx} className="flex flex-col items-center bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-shadow">
                   <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-[#137fec] p-1">
                     <img src={member.img} alt={member.name} className="w-full h-full rounded-full object-cover bg-slate-200" />
                   </div>
                   <h3 className="text-lg font-bold text-slate-900">{member.name}</h3>
                   <p className="text-[#137fec] text-sm font-medium mb-4">{member.role}</p>
                   <div className="flex gap-3">
                     <button className="text-slate-400 hover:text-[#0077b5] transition-colors"><LinkedInIcon /></button>
                     <button className="text-slate-400 hover:text-[#1da1f2] transition-colors"><TwitterIcon /></button>
                     <button className="text-slate-400 hover:text-slate-600 transition-colors"><PublicIcon /></button>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </section>

        {/* Global CTA */}
        <section className="py-20 bg-[#137fec] text-white">
          <div className="px-4 md:px-10 lg:px-40 text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black mb-6">Ready to see your data differently?</h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Join the thousands of teams who have switched to Sahajinsight. 
              Start your free 14-day trial today.
            </p>
            <button 
              onClick={() => navigate("/login")}
              className="bg-white text-[#137fec] px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-xl"
            >
              Get Started for Free
            </button>
          </div>
        </section>

      </main>
 <footer className="py-12 bg-slate-50 border-t border-slate-200">
          <div className="px-4 md:px-10 lg:px-40 flex justify-center">
            <div className="w-full max-w-[960px] flex flex-col md:flex-row justify-between gap-8">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-slate-900">
                  <AnalyticsIcon className="text-[#137fec]" />
                  <span className="font-bold text-lg">Sahajinsight</span>
                </div>
                <p className="text-slate-500 text-sm max-w-xs">
                  Empowering teams to make data-driven decisions without the
                  technical overhead.
                </p>
                <p className="text-slate-400 text-sm mt-4">© 2026 Sahajinsight Inc.</p>
              </div>
              <div className="flex flex-wrap gap-12 md:gap-20">
                <div className="flex flex-col gap-3">
                  <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                    Company
                  </h4>
                  <a
                    className="text-slate-500 hover:text-[#137fec] text-sm cursor-pointer"
                    onClick={() => navigate("/about")}
                  >
                    About
                  </a>
                  <a
                    className="text-slate-500 hover:text-[#137fec] text-sm cursor-pointer"
                    onClick={() => navigate("/contact")}
                  >
                    Contact us
                  </a>
                </div>
                <div className="flex flex-col gap-3">
                  <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                    Support
                  </h4>
                  <a
                    className="text-slate-500 hover:text-[#137fec] text-sm cursor-pointer"
                    onClick={() => navigate("/privacy-policy")}
                  >
                    Privacy Policy
                  </a>
                  <a
                    className="text-slate-500 hover:text-[#137fec] text-sm cursor-pointer"
                    onClick={() => navigate("/terms-of-service")}
                  >
                    Terms of Service
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
    </div>
  );
}