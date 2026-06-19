import { useNavigate } from "react-router-dom";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import MenuIcon from "@mui/icons-material/Menu";
import BoltIcon from "@mui/icons-material/Bolt";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import TableViewIcon from "@mui/icons-material/TableView";
import DescriptionIcon from "@mui/icons-material/Description";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import LinkIcon from "@mui/icons-material/Link";
import PublicIcon from "@mui/icons-material/Public";
import CreditCardOffIcon from "@mui/icons-material/CreditCardOff";
import projectIcon from "/src/assets/projectIcon.svg";
import LandingFooter from "../LandingPage/components/LandingFooter";
export default function LandingPage() {
  const navigate = useNavigate();


  return (
    <div className="bg-[#f6f7f8] text-slate-900 overflow-x-hidden min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="fixed top-0 z-50 w-full border-b border-[#e7edf3] bg-white/80 backdrop-blur-md">
        <div className="px-4 md:px-10 lg:px-40 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
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
              {/* <a className="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-[#137fec] transition-colors" href="#">Product</a>
              <a className="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-[#137fec] transition-colors" href="#">Solutions</a> */}
              <a
                className="text-slate-600 text-sm font-medium hover:text-[#137fec] transition-colors cursor-pointer"
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
          <button className="md:hidden text-slate-900 ">
            <MenuIcon />
          </button>
        </div>
      </header>


      <main className="flex flex-col min-h-screen pt-10">
        {/* Hero Section */}
        <section className="relative py-16 px-4 md:px-10 lg:px-40 flex justify-center bg-white ">
          <div className="w-full max-w-[960px] flex flex-col items-center text-center gap-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#137fec]/10 text-[#137fec] text-xs font-bold uppercase tracking-wide">
              <BoltIcon className="text-sm" fontSize="small" />
              <span>New Feature: AI Insights</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900  leading-[1.1]">
              Data visualization <br className="hidden md:block" /> made{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#137fec] to-blue-400">
                effortless
              </span>
            </h1>
            <p className="text-lg text-slate-600  max-w-2xl">
              Connect your spreadsheets, clean your data, and build stunning
              interactive dashboards in minutes. No coding required.
            </p>
            <div className="pt-4">
              <img
                alt="Dashboard interface showing charts and graphs"
                className="rounded-xl shadow-2xl border border-slate-200  w-full h-auto object-cover aspect-[16/9]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDff29x-TS0_lYF0CNs0yFtrzRokMY7u05nsCXZXNeuQ14tpBK5qZgeVOEHZh51veUKoCG__c96QtN3AO-L6PzGMAMBVajGgF5Psq41ecqUrLopLvUj2jCSNz0KWpwFYFy_QYHn6cdmaRgA0JJi-uR7y9LfoVB2j25GlD5tYiweXchNSKWEWOc5D3WPzOy-OqbDNMbF0Lp2jjPSli4kT9BoGCtukt6RFrrU_GiWewPlQzw6lh4SdM3M0gHg7x0wma0gBzn61Q9o04U"
              />
            </div>
          </div>
        </section>
        <section className="py-12 bg-[#f6f7f8] ">
          <div className="px-4 md:px-10 lg:px-40 flex justify-center">
            <div className="w-full max-w-[960px] text-center">
              <h2 className="text-slate-900 text-3xl font-bold leading-tight tracking-tight mb-4">
                Turn Data into Insights in 4 Steps
              </h2>
              <p className="text-slate-600 text-lg max-w-xl mx-auto">
                Skip the complex setup. Our streamlined pipeline takes you from
                raw files to publishable reports in minutes.
              </p>
            </div>
          </div>
        </section>


        {/* Timeline Section */}
        <section className="pb-20 bg-[#f6f7f8] ">
          <div className="px-4 md:px-10 lg:px-40 flex justify-center">
            <div className="w-full max-w-[960px]">
              {/* Step 1 */}
              <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center mb-16 group">
                <div className="flex-1 order-2 md:order-1 flex justify-end">
                  <div className="relative w-full max-w-md aspect-[4/3] bg-white rounded-xl shadow-lg border border-slate-200 p-6 flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#137fec]/5 to-transparent"></div>
                    <div className="flex flex-col items-center gap-3 z-10">
                      <CloudUploadIcon
                        className="text-6xl text-[#137fec] animate-bounce"
                        style={{ fontSize: "60px" }}
                      />
                      <div className="flex gap-2 mt-2">
                        <div className="h-8 w-8 rounded bg-green-100 flex items-center justify-center text-green-600">
                          <TableViewIcon fontSize="small" />
                        </div>
                        <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center text-blue-600">
                          <DescriptionIcon fontSize="small" />
                        </div>
                        <div className="h-8 w-8 rounded bg-orange-100 flex items-center justify-center text-orange-600">
                          <ViewModuleIcon fontSize="small" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Timeline Line */}
                <div className="hidden md:flex flex-col items-center self-stretch order-1 md:order-2 w-12 relative">
                  <div className="h-full w-0.5 bg-slate-200absolute top-0 bottom-0 left-1/2 -translate-x-1/2 z-0"></div>
                  <div className="size-10 rounded-full bg-[#137fec] text-white flex items-center justify-center font-bold z-10 mt-8 shadow-[0_0_0_8px_rgba(19,127,236,0.1)]">
                    1
                  </div>
                </div>
                <div className="flex-1 order-3 md:order-3 text-center md:text-left pt-0 md:pt-8">
                  <div className="md:hidden inline-flex size-8 rounded-full bg-[#137fec] text-white items-center justify-center font-bold mb-3">
                    1
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900  mb-3">
                    Connect Your Source
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-lg">
                    Upload your raw CSVs. We automatically detect types and formats.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                    <span className="px-3 py-1 bg-slate-100  text-slate-600  rounded text-xs font-semibold">CSV</span>
                    {/* <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-xs font-semibold">Excel</span>
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-xs font-semibold">JSON</span>
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-xs font-semibold">PostgreSQL</span>*/}
                  </div>
                </div>
              </div>


              {/* Step 2 */}
              <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center mb-16 group">
                <div className="flex-1 order-3 md:order-1 text-center md:text-right pt-0 md:pt-8">
                  <div className="md:hidden inline-flex size-8 rounded-full bg-[#137fec] text-white items-center justify-center font-bold mb-3">2</div>
                  <h3 className="text-2xl font-bold text-slate-900  mb-3">Explore, Clean & Transform</h3>
                  <p className="text-slate-600leading-relaxed text-lg">
                    View your data instantly in a smart table. Filter, sort, and
                    group columns without writing a single line of SQL.
                  </p>
                  <ul className="mt-4 space-y-2 inline-block text-left">
                    <li className="flex items-center gap-2 text-slate-600  text-sm">
                      <CheckCircleIcon
                        className="text-[#137fec] text-base"
                        fontSize="small"
                      />{" "}
                      Auto-detect headers
                    </li>
                    <li className="flex items-center gap-2 text-slate-600 text-sm">
                      <CheckCircleIcon
                        className="text-[#137fec] text-base"
                        fontSize="small"
                      />{" "}
                      One-click filtering
                    </li>
                  </ul>
                </div>
                {/* Timeline Line */}
                <div className="hidden md:flex flex-col items-center self-stretch order-1 md:order-2 w-12 relative">
                  <div className="h-full w-0.5 bg-slate-200  absolute top-0 bottom-0 left-1/2 -translate-x-1/2 z-0"></div>
                  <div className="size-10 rounded-full bg-white  border-2 border-[#137fec] text-[#137fec] flex items-center justify-center font-bold z-10 mt-8">
                    2
                  </div>
                </div>
                <div className="flex-1 order-2 md:order-3">
                  <div className="relative w-full max-w-md aspect-[4/3] bg-white  rounded-xl shadow-lg border border-slate-200  p-4 flex flex-col gap-3 overflow-hidden transition-transform duration-500 group-hover:scale-[1.02]">
                    <div className="flex items-center gap-2 border-b border-slate-100  pb-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="space-y-2 opacity-50">
                      <div className="h-4 bg-slate-100  rounded w-full"></div>
                      <div className="h-4 bg-slate-100  rounded w-5/6"></div>
                      <div className="h-4 bg-slate-100 rounded w-4/6"></div>
                    </div>
                    <div className="absolute inset-x-4 top-1/2 bg-white  p-3 rounded shadow-xl border border-[#137fec]/20 flex gap-3 items-center z-10 transform -translate-y-1/2">
                      <FilterAltIcon className="text-[#137fec]" />
                      <div className="text-xs font-mono text-slate-500 ">
                        WHERE revenue &gt; 5000
                      </div>
                    </div>
                  </div>
                </div>
              </div>


              {/* Step 3 */}
              <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center mb-16 group">
                <div className="flex-1 order-2 md:order-1 flex justify-end">
                  <div className="relative w-full max-w-md aspect-[4/3] bg-white  rounded-xl shadow-lg border border-slate-200  p-6 flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-50 to-transparent"></div>
                    <div className="grid grid-cols-2 gap-4 w-full h-full">
                      <div className="bg-blue-50  rounded-lg flex items-end justify-center p-2 gap-1">
                        <div className="w-2 h-[40%] bg-[#137fec] rounded-t"></div>
                        <div className="w-2 h-[70%] bg-[#137fec] rounded-t"></div>
                        <div className="w-2 h-[50%] bg-[#137fec] rounded-t"></div>
                      </div>
                      <div className="bg-purple-50  rounded-lg flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full border-4 border-purple-400 border-t-transparent"></div>
                      </div>
                      <div className="col-span-2 bg-slate-50  rounded-lg p-3">
                        <div className="w-full h-full border-l border-b border-slate-300  relative">
                          <svg
                            className="absolute bottom-0 left-0 w-full h-full"
                            preserveAspectRatio="none"
                            viewBox="0 0 100 50"
                          >
                            <path
                              className="text-green-500"
                              d="M0,50 L20,30 L40,40 L60,10 L80,25 L100,5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            ></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Timeline Line */}
                <div className="hidden md:flex flex-col items-center self-stretch order-1 md:order-2 w-12 relative">
                  <div className="h-full w-0.5 bg-slate-200 absolute top-0 bottom-0 left-1/2 -translate-x-1/2 z-0"></div>
                  <div className="size-10 rounded-full bg-white border-2 border-[#137fec] text-[#137fec] flex items-center justify-center font-bold z-10 mt-8">
                    3
                  </div>
                </div>
                <div className="flex-1 order-3 md:order-3 text-center md:text-left pt-0 md:pt-8">
                  <div className="md:hidden inline-flex size-8 rounded-full bg-[#137fec] text-white items-center justify-center font-bold mb-3">
                    3
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">
                    Visualize Instantly
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-lg">
                    Choose columns from smart dropdowns to create bar charts, line graphs, and KPIs. Customize colors and labels with ease & chat to analyze, modify, and reshape your graph view in seconds..
                  </p>
                </div>
              </div>


              {/* Step 4 */}
              <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center group">
                <div className="flex-1 order-3 md:order-1 text-center md:text-right pt-0 md:pt-8">
                  <div className="md:hidden inline-flex size-8 rounded-full bg-[#137fec] text-white items-center justify-center font-bold mb-3">4</div>
                  <h3 className="text-2xl font-bold text-slate-900  mb-3">Share with the Team</h3>
                  <p className="text-slate-600 leading-relaxed text-lg">
                    Deliver to: marketing@team.com,
                    sales@team.com etc.
                    Reports will be sent automatically
                    based on your schedule.</p>
                </div>
                {/* Timeline Line */}
                <div className="hidden md:flex flex-col items-center self-stretch order-1 md:order-2 w-12 relative">
                  <div className="h-1/2 w-0.5 bg-gradient-to-b from-slate-200 to-transparent  absolute top-0 left-1/2 -translate-x-1/2 z-0"></div>
                  <div className="size-10 rounded-full bg-white  border-2 border-[#137fec] text-[#137fec] flex items-center justify-center font-bold z-10 mt-8">
                    4
                  </div>
                </div>
                <div className="flex-1 order-2 md:order-3">
                  <div className="relative w-full max-w-md aspect-[4/3] bg-white  rounded-xl shadow-lg border border-slate-200  p-6 flex flex-col items-center justify-center overflow-hidden transition-transform duration-500 group-hover:scale-[1.02]">
                    <div className="absolute top-4 right-4 flex gap-1">
                      <div className="w-8 h-8 rounded-full bg-slate-200  border-white  z-0"></div>
                      <div className="w-8 h-8 rounded-full bg-slate-300  border-2 border-white  -ml-3 z-10"></div>
                      <div className="w-8 h-8 rounded-full bg-[#137fec] border-2 border-white  -ml-3 z-20 flex items-center justify-center text-white text-[10px] font-bold">
                        +5
                      </div>
                    </div>
                    <div className="bg-slate-50  rounded-lg p-4 border border-slate-200  w-full max-w-[240px] shadow-sm mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <LinkIcon
                          className="text-slate-400 text-sm"
                          fontSize="small"
                        />
                        <div className="h-2 bg-slate-200  rounded w-full"></div>
                      </div>
                      <button className="w-full bg-[#137fec] text-white text-xs font-bold py-2 rounded">Schedule to Share</button>
                    </div>
                    <div className="text-slate-400  flex items-center gap-2 text-sm">
                      <PublicIcon className="text-lg" fontSize="small" />
                      <span>Live on Sahajinsight.io/u/josh</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* CTA Section */}
        <section className="py-20 bg-white  border-t border-slate-100 ">
          <div className="px-4 md:px-10 lg:px-40 flex justify-center">
            <div className="w-full max-w-[960px] text-center">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900  tracking-tight mb-4">
                Ready to build your first dashboard?
              </h2>
              <p className="text-slate-600 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of users turning data into decisions today. Start
                your free trial and explore all features.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={() => navigate("/login")}
                  className="flex items-center justify-center rounded-lg h-12 px-8 bg-[#137fec] text-white text-base font-bold shadow-xl shadow-[#137fec]/30 hover:bg-blue-600 transition-all hover:-translate-y-0.5"
                >
                  Start Building Now
                </button>
                <span className="text-sm text-slate-500 flex items-center gap-1">
                  <CreditCardOffIcon className="text-base" fontSize="small" />{" "}
                  No credit card required
                </span>
              </div>
            </div>
          </div>
        </section>


      </main>

      <LandingFooter />
    </div>
  );
}

