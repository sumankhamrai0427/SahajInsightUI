import { useNavigate } from "react-router-dom";
import projectIcon from "/src/assets/projectIcon.svg";

export default function LandingFooter() {
  const navigate = useNavigate();

  return (
    <footer className="py-12 bg-slate-50  border-t border-slate-200 ">
      <div className="px-4 md:px-10 lg:px-40 flex justify-center">
        <div className="w-full max-w-[960px] flex flex-col md:flex-row justify-between gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-slate-900 ">
              <div className="size-9 text-[#137fec] flex items-center justify-center rounded-lg bg-[#137fec]/90">
                <img
                  src={projectIcon}
                  alt="Project Icon"
                  className="w-6 h-6"
                />
              </div>
              <span className="font-bold text-lg">Sahajinsight</span>
            </div>
            <p className="text-slate-500  text-sm max-w-xs">
              Empowering teams to make data-driven decisions without the
              technical overhead.
            </p>
            <p className="text-slate-400 text-sm mt-4">© 2026 Sahajinsight Inc.</p>
          </div>
          <div className="flex flex-wrap gap-12 md:gap-20">
            <div className="flex flex-col gap-3">
              <h4 className="font-bold text-slate-900  text-sm tracking-wider">
                Support
              </h4>
              <a
                className="text-slate-500  hover:text-[#137fec] text-sm cursor-pointer"
                onClick={() => navigate("/privacy-policy")}
              >
                Privacy Policy
              </a>
              <a
                className="text-slate-500  hover:text-[#137fec] text-sm cursor-pointer"
                onClick={() => navigate("/terms-of-service")}
              >
                Terms of Service
              </a>
              <a
                className="text-slate-500  hover:text-[#137fec] text-sm cursor-pointer"
                onClick={() => navigate("/contact")}
              >
                Contact Us
              </a>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4">
            <h3 className="font-semibold text-slate-900 text-sm tracking-wide">
              Connect with us
            </h3>

            <div className="flex items-center gap-4">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/sahajinsight"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-[#1877F2]/10 transition"
              >
                <svg
                  className="w-5 h-5 text-[#1877F2]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22 12a10 10 0 10-11.5 9.9v-7h-2v-3h2V9.5c0-2 1.2-3.1 3-3.1.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2V11h2.2l-.4 3h-1.8v7A10 10 0 0022 12z" />
                </svg>
              </a>

              {/* Instagram */}
              {/* <a
                  href="#"
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-pink-500/10 transition"
                >
                  <svg
                    className="w-5 h-5 text-pink-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7zm10 2c1.7 0 3 1.3 3 3v10c0 1.7-1.3 3-3 3H7c-1.7 0-3-1.3-3-3V7c0-1.7 1.3-3 3-3h10z" />
                    <path d="M12 7a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6z" />
                  </svg>
                </a> */}

              {/* X / Twitter */}
              {/* <a
                  href="#"
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-black/10 transition"
                >
                  <svg
                    className="w-5 h-5 text-slate-900"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.9 2H22l-7.5 8.6L23 22h-6.8l-5.3-6.7L5.7 22H2.6l8-9.2L1 2h7l4.8 6.1L18.9 2z" />
                  </svg>
                </a> */}

              {/* LinkedIn */}
              {/* <a
                  href="#"
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-[#0A66C2]/10 transition "
                >
                  <svg
                    className="w-5 h-5 text-[#0A66C2]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M4.98 3.5a2.5 2.5 0 11-.01 5.01 2.5 2.5 0 01.01-5.01zM3 8.98h4v12H3zM9 8.98h3.8v1.64h.05c.53-1 1.82-2.05 3.75-2.05 4 0 4.74 2.63 4.74 6.05v6.36h-4v-5.64c0-1.35-.03-3.09-1.88-3.09-1.88 0-2.17 1.47-2.17 3v5.73H9z" />
                  </svg>
                </a> */}
              <a
                className="w-9 h-9 flex items-center justify-center rounded-lg 
             bg-slate-100 opacity-50 cursor-not-allowed 
             pointer-events-none"
              >
                <svg
                  className="w-5 h-5 text-[#0A66C2]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M4.98 3.5a2.5 2.5 0 11-.01 5.01 2.5 2.5 0 01.01-5.01zM3 8.98h4v12H3zM9 8.98h3.8v1.64h.05c.53-1 1.82-2.05 3.75-2.05 4 0 4.74 2.63 4.74 6.05v6.36h-4v-5.64c0-1.35-.03-3.09-1.88-3.09-1.88 0-2.17 1.47-2.17 3v5.73H9z" />
                </svg>
              </a>

            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}