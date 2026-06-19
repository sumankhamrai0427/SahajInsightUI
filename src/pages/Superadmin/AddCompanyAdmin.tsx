import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { POST_APIS, BASE_URL } from "../../../connection";
import { Dropdown } from "primereact/dropdown";
import Tippy from "@tippyjs/react";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import ApiServices from "../../services/ApiServices";
import { useParams, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

function AddCompanyAdmin() {
  const [isResetting, setIsResetting] = useState(false);
  const [companyCodes, setCompanyCodes] = useState([]);
  const [errorModal, setErrorModal] = useState({
    open: false,
    message: "",
  });
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const admin = location.state?.admin;
  const [showPassword, setShowPassword] = useState(false);

  // console.log("admin", admin);
  const isEditMode = Boolean(id && admin);
  useEffect(() => {
    fetchCompanyCodes();
  }, []);

  const fetchCompanyCodes = async () => {
    try {
      const res = await ApiServices.company_code_dropdown();
      if (res?.data?.isSuccess) {
        setCompanyCodes(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load company codes", err);
    }
  };

  const formik = useFormik({
    initialValues: {
      company_code: "",
      admin_name: "",
      admin_email: "",
      admin_password: "",

      phone_number: "",
      // area: "",
      // city: "",
      // district: "",
      // state: "",
      // country: "",
      // pin_code: "",
    },

    validate: (values) => {
      const errors: Record<string, string> = {};

      if (!isEditMode && !values.company_code) {
        errors.company_code = "Company Code is required";
      }

      if (!isEditMode && !values.admin_name) {
        errors.admin_name = "Admin Name is required";
      }

      if (!values.admin_email) {
        errors.admin_email = "Admin Email is required";
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.com$/i;
        if (!emailRegex.test(values.admin_email)) {
          errors.admin_email = "Enter a valid email ending with .com";
        }
      }

      // if (!values.admin_password) {
      //   errors.admin_password = "Password is required";
      // } else if (values.admin_password.length < 6) {
      //   errors.admin_password = "Password must be at least 6 characters";
      // }
      if (!isEditMode) {
        if (!values.admin_password) {
          errors.admin_password = "Password is required";
        } else if (values.admin_password.length < 6) {
          errors.admin_password = "Password must be at least 6 characters";
        }
      }

      // Optional phone number validation could go here if format checking is needed

      // if (!values.area) errors.area = "Area is required";
      // if (!values.city) errors.city = "City is required";
      // if (!values.district) errors.district = "District is required";
      // if (!values.state) errors.state = "State is required";
      // if (!values.country) errors.country = "Country is required";

      // if (!values.pin_code) {
      //   errors.pin_code = "PIN Code is required";
      // } else if (!/^\d{6}$/.test(values.pin_code)) {
      //   errors.pin_code = "PIN Code must be 6 digits";
      // }

      return errors;
    },

    onSubmit: async (values) => {
      await submitCompanyAdmin(values);
    },
  });
  const submitCompanyAdmin = async (values) => {
    const payload = {
      session_id: JSON.parse(localStorage.getItem("ig_user") || "{}")
        ?.session_id,
      created_by: JSON.parse(localStorage.getItem("ig_user") || "{}")?.user_id,
      id: null,
      company_code: values.company_code,
      admin_name: values.admin_name,
      admin_email: values.admin_email,
      admin_password: values.admin_password,

      phone_number: values.phone_number,

      // 🔥 backend expects STRING (JSON)
      // address: JSON.stringify({
      //   area: values.area,
      //   city: values.city,
      //   district: values.district,
      //   state: values.state,
      //   country: values.country,
      //   pin_code: values.pin_code,
      // }),
    };
    if (isEditMode && admin?.id) {
      payload.id = admin.id;
    }
    try {
      const res = await ApiServices.company_admin_register(payload);

      if (res?.data?.isSuccess) {
        navigate(-1);
      } else {
        alert(res?.data?.message || "Failed to create admin");
      }
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        "Server error while creating company admin";

      setErrorModal({
        open: true,
        message: msg,
      });
    }
  };

  const handleResetForm = () => {
    setIsResetting(true);
    setTimeout(() => {
      formik.resetForm();
      setIsResetting(false);
    }, 400);
  };
  useEffect(() => {
    if (!isEditMode || !admin) return;

    // let addr = {
    //   area: "",
    //   city: "",
    //   district: "",
    //   state: "",
    //   country: "",
    //   pin_code: "",
    // };

    // try {
    //   addr = admin.address ? JSON.parse(admin.address) : addr;
    // } catch (e) {
    //   console.warn("Invalid address JSON");
    // }

    formik.setValues({
      company_code: admin.company_code || "",
      admin_name: admin.admin_user_id || "",
      admin_email: admin.email || admin.admin_email || "",
      admin_password: admin.plain_password || "",

      phone_number: admin.phone_number || "",

      // area: addr.area || "",
      // city: addr.city || "",
      // district: addr.district || "",
      // state: addr.state || "",
      // country: addr.country || "",
      // pin_code: addr.pin_code || "",
    });
  }, [isEditMode, admin]);

  return (
    <div className="W-full mx-auto px-6\3 mb-4">
      <form onSubmit={formik.handleSubmit} autoComplete="off">
        <div className="rounded-xl px-6">
          <h2 className="text-xl font-semibold mb-6"></h2>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold">Add Company User</h2>
            {!isEditMode && (
              <Tippy content="Reset" theme="gray">
                <button
                  type="button"
                  onClick={handleResetForm}
                  disabled={isResetting}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg border border-[#D9D9D9] bg-[#F3F3F3] hover:bg-[#E5E5E5] transition-all${isResetting ? "cursor-wait opacity-70" : "cursor-pointer"}`}
                >
                  <AutorenewRoundedIcon
                    className={`w-5 h-5 text-gray-600 ${isResetting ? "animate-spin" : ""
                      }`}
                    fontSize="small"
                  />
                </button>
              </Tippy>
            )}
          </div>

          {/* Admin Name */}
          <div className="mb-4">
            <label className="text-sm font-medium">
              User Name{" "}
              {!isEditMode && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              name="admin_name"
              value={formik.values.admin_name}
              onChange={formik.handleChange}
              className="w-full px-4 py-1.5 border rounded-lg mt-1"
              placeholder="Enter User Name"
              autoComplete="off"
            />
            {formik.touched.admin_name && formik.errors.admin_name && (
              <p className="text-xs text-red-500 mt-1">
                {formik.errors.admin_name}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company Code */}
            <div className="">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Code{" "}
                {!isEditMode && <span className="text-red-500">*</span>}
              </label>
              {/* <Dropdown
                value={formik.values.company_code}
                options={companyCodes}
                optionLabel="label"
                optionValue="value"
                placeholder="Select Company Code"
                disabled={isEditMode}

                filter
                onChange={(e) =>
                  formik.setFieldValue("company_code", e.value)
                }
                className={`w-full h-[40px] rounded-lg border 
      ${formik.touched.company_code && formik.errors.company_code
                    ? "border-red-500"
                    : "border-gray-300"
                  }
      focus:border-blue-500 focus:ring-2 focus:ring-blue-100
      bg-white text-sm`}
                panelClassName="rounded-lg shadow-lg border border-gray-200"
              /> */}
              <Dropdown
                value={formik.values.company_code}
                options={companyCodes}
                optionLabel="label"
                optionValue="value"
                placeholder="Select Company Code"
                disabled={isEditMode}
                filter
                onChange={(e) => formik.setFieldValue("company_code", e.value)}
                className={`w-full border rounded-lg text-sm
    ${formik.touched.company_code && formik.errors.company_code
                    ? "border-red-500"
                    : "border-gray-300"
                  }
    ${isEditMode ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
  `}
                pt={{
                  root: {
                    className: "h-[40px] flex items-center px-0",
                  },

                  input: {
                    className: "px-4 py-2 text-sm text-gray-900",
                  },
                  trigger: {
                    className: "px-3 text-gray-500",
                  },
                  panel: {
                    className:
                      "rounded-lg shadow-lg border border-gray-200 bg-blue-50",
                  },
                  item: {
                    className: "px-4 py-2 text-sm hover:bg-blue-50",
                  },
                }}
              />

              {formik.touched.company_code && formik.errors.company_code && (
                <p className="text-xs text-red-500 mt-1">
                  {formik.errors.company_code}
                </p>
              )}
            </div>

            <div className="">
              <label className="text-sm font-medium">
                Admin Email {!isEditMode && <span className="text-red-500">*</span>}
              </label>
              <input
                type="email"
                name="admin_email"
                value={formik.values.admin_email}
                onChange={formik.handleChange}
                className="w-full px-4 py-1.5 border rounded-lg"
                placeholder="admin@company.com"
              />
              {formik.touched.admin_email && formik.errors.admin_email && (
                <p className="text-xs text-red-500 mt-1">
                  {formik.errors.admin_email}
                </p>
              )}
            </div>

            {/* Admin Password */}

            <div className="mb-4">
              <label className="text-sm font-medium">
                Password{" "}
                {!isEditMode && <span className="text-red-500">*</span>}
              </label>
              {/* <input
                  type="password"
                  name="admin_password"
                  value={formik.values.admin_password}
                  onChange={formik.handleChange}
                  className="w-full px-4 py-1.5 border rounded-lg"
                  placeholder="Enter Password"
                /> */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="admin_password"
                  value={formik.values.admin_password}
                  onChange={formik.handleChange}
                  className="w-full px-4 py-1.5 border rounded-lg pr-10"
                  placeholder="Enter Password"
                  autoComplete="new-password"
                />

                
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>

              </div>

              {formik.touched.admin_password &&
                formik.errors.admin_password && (
                  <p className="text-xs text-red-500 mt-1">
                    {formik.errors.admin_password}
                  </p>
                )}
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium">
                Phone Number
              </label>
              <input
                type="text"
                name="phone_number"
                value={formik.values.phone_number}
                onChange={formik.handleChange}
                className="w-full px-4 py-1.5 border rounded-lg"
                placeholder="Enter Phone Number"
              />
              {formik.touched.phone_number && formik.errors.phone_number && (
                <p className="text-xs text-red-500 mt-1">
                  {formik.errors.phone_number}
                </p>
              )}
            </div>
          </div>
          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">
                Area {!isEditMode && <span className="text-red-500">*</span>}
              </label>
              <input
                name="area"
                value={formik.values.area}
                onChange={formik.handleChange}
                className="w-full px-4 py-1.5 border rounded-lg mt-1"
                placeholder="Area / Street"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                City {!isEditMode && <span className="text-red-500">*</span>}
              </label>
              <input
                name="city"
                value={formik.values.city}
                onChange={formik.handleChange}
                className="w-full px-4 py-1.5 border rounded-lg mt-1"
                placeholder="City"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                District {!isEditMode && <span className="text-red-500">*</span>}
              </label>
              <input
                name="district"
                value={formik.values.district}
                onChange={formik.handleChange}
                className="w-full px-4 py-1.5 border rounded-lg mt-1"
                placeholder="District"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                State {!isEditMode && <span className="text-red-500">*</span>}
              </label>
              <input
                name="state"
                value={formik.values.state}
                onChange={formik.handleChange}
                className="w-full px-4 py-1.5 border rounded-lg mt-1"
                placeholder="State"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Country {!isEditMode && <span className="text-red-500">*</span>}
              </label>
              <input
                name="country"
                value={formik.values.country}
                onChange={formik.handleChange}
                className="w-full px-4 py-1.5 border rounded-lg mt-1"
                placeholder="Country"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                PIN Code {!isEditMode && <span className="text-red-500">*</span>}
              </label>
              <input
                name="pin_code"
                value={formik.values.pin_code}
                onChange={formik.handleChange}
                className="w-full px-4 py-1.5 border rounded-lg mt-1"
                placeholder="700091"
              />
            </div> */}
          {/* Buttons */}
          <div className="w-full flex items-center justify-between mt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-1.5 border rounded-lg text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            {/* <button
              type="submit"
              className="px-6 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {isEditMode ? "Update Admin" : " Create Admin"}
            </button> */}
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className={`px-6 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700
    flex items-center justify-center gap-2
    ${formik.isSubmitting ? "opacity-70 cursor-not-allowed" : ""}
  `}
            >
              {formik.isSubmitting && (
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}

              {formik.isSubmitting
                ? "Processing..."
                : isEditMode
                  ? "Update User"
                  : "Create User"}
            </button>

          </div>
        </div>
      </form>
      {errorModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-[420px] rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-red-600 mb-2">
              Action Failed
            </h3>

            <p className="text-gray-700 mb-6">{errorModal.message}</p>

            <div className="flex justify-end">
              <button
                onClick={() => setErrorModal({ open: false, message: "" })}
                className="px-5 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddCompanyAdmin;
