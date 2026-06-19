import { Alert, Snackbar } from "@mui/material";
import React, { useState, useEffect } from "react";
import Union from "../../assets/Union.svg";
import view_quilt from "../../assets/view_quilt.svg";
import ApiServices from "../../services/ApiServices";
import { useAuth } from "./AuthContext";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useLocation, useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const [user_email, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [companyCode, setCompanyCode] = useState("");
  const [companyCodeError, setCompanyCodeError] = useState("");
  const currentYear = getCurrentYear();
  const location = useLocation();
  const navigate = useNavigate();

  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [captchaCode, setCaptchaCode] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");

  const getLoginTypeFromPath = () => {
    if (location.pathname.includes("super-admin")) return "SUPER_ADMIN";
    return "COMPANY";
  };
  const loginType = getLoginTypeFromPath();




  const generateCaptcha = () => {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    setCaptchaCode(code);
  };
  useEffect(() => {
    generateCaptcha();
  }, []);



  const handleLogin = async (e) => {
    e.preventDefault();

    //  CAPTCHA validation
    if (captchaInput !== captchaCode) {
      setNotification({
        open: true,
        message: "Invalid CAPTCHA code",
        severity: "error",
      });
      generateCaptcha();
      setCaptchaInput("");
      return;
    }

    setLoading(true);
    setNotification({ open: false, message: "", severity: "info" });

    let res = null;

    try {
      let response;

      //  API selection based on login type
      if (loginType === "SUPER_ADMIN") {
        //  Super Admin Login
        const payload = {
          user_email,
          password,
        };

        response = await ApiServices.superAdminLogin(payload);
      } else {
        //  Unified Company Login
        const payload = {
          company_code: companyCode,
          user_email,
          password,
          login_type: null, // login_type is no longer required by backend for unified login
        };

        response = await ApiServices.login(payload);
      }

      res = response.data;
      console.log("Login Response:", res);

      //Success handling
      if (res?.isSuccess) {
        setNotification({
          open: true,
          message: "Login successful!",
          severity: "success",
        });

        // existing auth flow (UNCHANGED)
        setTimeout(() => {
          login(res.data);
        }, 1500);

        return;
      }

      // API-level failure
      setNotification({
        open: true,
        message: res?.message || "Login failed",
        severity: "error",
      });
    } catch (err) {
      // Network / server error
      setNotification({
        open: true,
        message:
          err?.response?.data?.message ||
          err?.message ||
          "Network Error",
        severity: "error",
      });
    } finally {
      // Stop loader only if failed
      if (!res?.isSuccess) {
        setLoading(false);
      }
    }
  };

  const isFormValid =
    user_email.trim() !== "" &&
    password.trim() !== "" &&
    captchaInput.trim() !== "" &&
    !loading &&
    !emailError &&
    (loginType === "SUPER_ADMIN" || companyCode.trim() !== "") &&
    !companyCodeError;


  function getCurrentYear() {
    return new Date().getFullYear();
  }


  const handleCloseNotification = () =>
    setNotification((prev) => ({ ...prev, open: false }));

  const loginTitleMap = {
    SUPER_ADMIN: "Super Admin Login",
    COMPANY: "Company Login",
  };

  const loginSubtitleMap = {
    SUPER_ADMIN: "Restricted access for system administrators only",
    COMPANY: "Login to your company workspace",
  };


  return (
    <div
      className="w-full h-screen flex items-center justify-center 
    bg-gradient-to-br from-[#4C6685] via-[#5479A1] to-[#5584C1]
    overflow-hidden relative"
    >
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
      <div
        className="absolute top-10 left-10 w-96 h-96 rounded-full 
          blur-3xl opacity-40 mix-blend-screen bg-[#048951ff]"
      ></div>
      <div
        className="absolute top-20 -right-20 w-96 h-96 rounded-full 
         blur-3xl mix-blend-screen bg-[#04418fff]"
      ></div>
      <div
        className="absolute -bottom-20 left-1/3 w-96 h-96 rounded-full 
         blur-3xl mix-blend-screen bg-[#322858ff]"
      ></div>
      <img
        src={Union}
        alt="cross-pattern"
        className="absolute bottom-0 right-0 w-[500px] md:w-[800px] pointer-events-none"
      />
      <div className="absolute top-6 left-6 md:top-8 md:left-10 flex items-center gap-2 text-white font-semibold text-lg z-50">
        <span
          className="text-white/80 cursor-pointer"
          onClick={() => navigate("/")}
        >
          Sahajinsight
        </span>

      </div>
      <div className="flex flex-col items-center justify-center w-full relative py-2 px-4">
        <img src={view_quilt} alt="cross-pattern" className="w-12" />
        {/* <div className="flex flex-col items-center">
          <h1 className="text-white text-3xl font-bold">InsightGrid</h1>
          <p className="text-white/80 text-sm mt-1">
            Customize Every View. Empower Every Decision.
          </p>
        </div> */}

        <div className="flex flex-col items-center text-center mb-8">
          <h1 className="text-white text-2xl md:text-3xl font-bold">
            {loginTitleMap[loginType]}
          </h1>
          <p className="text-white/80 text-sm mt-1">
            {loginSubtitleMap[loginType]}
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="w-full max-w-xs flex flex-col space-y-4"
        >
          <div className="w-full">
            <input
              type="text"
              placeholder="User Name"
              value={user_email}
              onChange={(e) => {
                const val = e.target.value;
                setUserEmail(val);
                // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                // if (val && !emailRegex.test(val)) {
                //   setEmailError("Enter a valid User Email");
                // } else {
                //   setEmailError("");
                // }
              }}
              className={`w-full px-4 py-2 rounded-md bg-transparent border ${emailError ? "border-red-400" : "border-white/40"
                } text-white outline-none placeholder-white/60`}
            />
            {emailError && (
              <p className="text-red-400 text-xs mt-1 ml-1">{emailError}</p>
            )}
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 pr-10 rounded-md bg-transparent border border-white/40 text-white outline-none placeholder-white/60"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
            >
              {showPassword ? (
                <VisibilityOff fontSize="small" />
              ) : (
                <Visibility fontSize="small" />
              )}
            </button>
          </div>


          {loginType !== "SUPER_ADMIN" && (
            <div className="w-full">
              <input
                type="text"
                placeholder="Company Code"
                value={companyCode}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  setCompanyCode(val);

                  const codeRegex = /^[A-Z0-9]{3,}$/;
                  if (val && !codeRegex.test(val)) {
                    setCompanyCodeError(
                      "Company Code must be at least 3 characters (A–Z, 0–9)"
                    );
                  } else {
                    setCompanyCodeError("");
                  }
                }}
                className={`w-full px-4 py-2 rounded-md bg-transparent border ${companyCodeError ? "border-red-400" : "border-white/40"
                  } text-white outline-none placeholder-white/60`}
              />

              {companyCodeError && (
                <p className="text-red-400 text-xs mt-1 ml-1">
                  {companyCodeError}
                </p>
              )}
            </div>
          )}



          <div className="flex items-center gap-2">
            <div
              className="flex-1 bg-white/20 text-white text-center font-bold tracking-widest py-2 rounded-md select-none"
              style={{ fontFamily: "monospace", fontSize: "1.2rem" }}
            >
              {captchaCode}
            </div>
            <button
              type="button"
              onClick={generateCaptcha}
              className="p-2 bg-white/20 rounded-md text-white hover:bg-white/30 transition"
            >
              <AutorenewRoundedIcon fontSize="small" />
            </button>
          </div>

          <input
            type="text"
            placeholder="Enter CAPTCHA"
            value={captchaInput}
            onChange={(e) => setCaptchaInput(e.target.value)}
            className="w-full px-4 py-2 rounded-md bg-transparent border border-white/40 text-white outline-none placeholder-white/60"
          />

          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full py-2 rounded-md font-medium transition
    ${isFormValid
                ? "bg-white/40 text-white hover:bg-white/60"
                : "bg-white/20 text-white/50 cursor-not-allowed"
              }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>
        <p className="text-white/70 text-xs mt-12 text-center">
          ©{currentYear} Aivista Technologies Pvt. Ltd. All rights reserved
        </p>
      </div>
    </div>
  );
}
