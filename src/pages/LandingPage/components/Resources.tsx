import { useNavigate } from "react-router-dom";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import MenuIcon from "@mui/icons-material/Menu";
import ArticleIcon from '@mui/icons-material/Article';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import projectIcon from "/src/assets/projectIcon.svg";
import LandingFooter from "./LandingFooter";
export default function Resources() {
  const navigate = useNavigate();


  // Mock data for the resources list
  const resources = [
    {
      category: "Guide",
      title: "The Ultimate Guide to Data Cleaning",
      excerpt: "Raw data is rarely ready for visualization immediately. Learn the industry-standard 5-step process to deduplicate, normalize, and prepare your CSVs for flawless analytics. We cover handling null values, standardizing date formats, and string manipulation techniques that will save you hours of manual work.",
      icon: <ArticleIcon fontSize="large" />,
      color: "text-blue-600 bg-blue-100",
      date: "Oct 12, 2025"
    },
    {
      category: "Video",
      title: "Building Dashboards in Under 5 Minutes",
      excerpt: "Watch how a senior analyst sets up a full KPI board using Sahajinsight. This step-by-step walkthrough demonstrates connecting a data source, configuring widgets, applying global filters, and sharing the final result with stakeholders—all in real-time without writing a single line of code.",
      icon: <PlayCircleOutlineIcon fontSize="large" />,
      color: "text-purple-600 bg-purple-100",
      date: "Nov 03, 2025"
    },
    {
      category: "Whitepaper",
      title: "State of Data Analytics 2026",
      excerpt: "What tools are Fortune 500 companies using this year? We surveyed over 2,000 data professionals to bring you exclusive insights on industry trends, salary benchmarks, AI adoption rates, and the future of self-service business intelligence.",
      icon: <DownloadIcon fontSize="large" />,
      color: "text-green-600 bg-green-100",
      date: "Jan 10, 2026"
    },
    {
      category: "Tutorial",
      title: "Connecting PostgreSQL Databases",
      excerpt: "A technical deep-dive into establishing secure connections between your local or cloud database and our platform. Learn how to whitelist IPs, configure SSL modes, troubleshoot common connection timeout errors, and optimize your SQL queries for performance.",
      icon: <ArticleIcon fontSize="large" />,
      color: "text-orange-600 bg-orange-100",
      date: "Dec 15, 2025"
    },
    {
      category: "Case Study",
      title: "How TechCorp Saved 20h/Week",
      excerpt: "TechCorp's marketing team was spending 4 hours a day manually updating spreadsheets for their weekly sync. See how automating their reporting pipeline with Sahajinsight changed their workflow forever, allowing them to focus on strategy rather than data entry.",
      icon: <ArticleIcon fontSize="large" />,
      color: "text-blue-600 bg-blue-100",
      date: "Nov 22, 2025"
    },
    {
      category: "Template",
      title: "Marketing ROI Dashboard Kit",
      excerpt: "Don't start from scratch. Download this pre-built template designed specifically for marketing teams. It comes with pre-configured formulas for tracking Customer Acquisition Cost (CAC), Lifetime Value (LTV), Return on Ad Spend (ROAS), and churn rates.",
      icon: <DownloadIcon fontSize="large" />,
      color: "text-pink-600 bg-pink-100",
      date: "Jan 05, 2026"
    },
  ];


  return (
    <div className="bg-[#f6f7f8] text-slate-900 overflow-x-hidden min-h-screen flex flex-col">


      {/* --- HEADER (Matches LandingPage) --- */}
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
            <h2 className="text-slate-900  text-xl font-bold leading-tight tracking-tight">
              Sahajinsight
            </h2>
          </div>
          <div className="hidden md:flex flex-1 justify-end gap-8 items-center">
            <nav className="flex items-center gap-8">
              <a
                className="text-[#137fec] text-sm font-bold transition-colors cursor-pointer"
                onClick={() => navigate("/resources")}
              >
                Resources
              </a>
              <a
                className="text-slate-600 text-sm font-medium hover:text-[#137fec] transition-colors cursor-pointer"
                onClick={() => navigate("/pricing")}
              >
                Pricing
              </a>
              <a
                className="text-slate-600 text-sm font-medium hover:text-[#137fec] transition-colors cursor-pointer"
                onClick={() => navigate("/faq")}
              >
                FAQ
              </a>
            </nav>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/login")}
                className="flex items-center justify-center rounded-xl h-10 px-4 bg-slate-100 text-slate-900 text-sm font-bold hover:bg-slate-200 transition-colors"
              >
                Log in
              </button>
              <button
                onClick={() => navigate("/login")}
                className="flex items-center justify-center rounded-xl h-10 px-4 bg-[#137fec] text-white text-sm font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-[#137fec]/20"
              >
                Start for free
              </button>
            </div>
          </div>
          {/* Mobile Menu Icon */}
          <button className="md:hidden text-slate-900">
            <MenuIcon />
          </button>
        </div>
      </header>


      {/* --- MAIN CONTENT --- */}
      <main className="flex-grow pt-24 pb-20 px-4 md:px-10 lg:px-40">
        <div className="w-full max-w-[900px] mx-auto">


          {/* Page Title Section */}
          <div className="mb-16 border-b border-slate-200 pb-8">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
              Resource <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#137fec] to-blue-400">Library</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl">
              Deep dives, step-by-step tutorials, and industry insights to help you master your data journey.
            </p>
          </div>


          {/* List / Paragraph Layout */}
          <div className="flex flex-col gap-10">
            {resources.map((item, idx) => (
              <div
                key={idx}
                onClick={() => console.log(`Clicked ${item.title}`)}
                className="group flex flex-col sm:flex-row gap-6 items-start p-6 -mx-6 rounded-2xl hover:bg-white transition-all duration-300 border border-transparent hover:border-slate-200 hover:shadow-lg cursor-pointer"
              >


                {/* Visual Icon Box */}
                <div className={`shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center ${item.color} shadow-sm`}>
                  {item.icon}
                </div>


                {/* Content */}
                <div className="flex-1">
                  {/* Meta Data */}
                  <div className="flex items-center gap-3 mb-2 text-sm">
                    <span className={`font-bold uppercase tracking-wider px-2 py-0.5 rounded text-[10px] ${item.color}`}>
                      {item.category}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500 font-medium">{item.date}</span>
                  </div>


                  {/* Title */}
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-[#137fec] transition-colors leading-tight">
                    {item.title}
                  </h3>


                  {/* Paragraph Description (The key change) */}
                  <p className="text-slate-600 leading-relaxed mb-4 text-base">
                    {item.excerpt}
                  </p>



                </div>
              </div>
            ))}
          </div>


        </div>
      </main>

      <LandingFooter />
    </div>
  );
}