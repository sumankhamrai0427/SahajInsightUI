import React, { useEffect, useState } from 'react'
import { useFormik } from "formik";
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { POST_APIS, BASE_URL } from "../../../../connection";
import Tippy from "@tippyjs/react";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import ApiServices from "../../../services/ApiServices";

function AddCompanyUser() {
  const [isResetting, setIsResetting] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const user = location.state?.user;
  const isEditMode = Boolean(id && user);

  const companyCodeFromLS =
    JSON.parse(localStorage.getItem("ig_user") || "{}")?.company_code || "";
  const [errorModal, setErrorModal] = useState({
    open: false,
    message: "",
  });
  const formik = useFormik({
    initialValues: {
      company_code: companyCodeFromLS,
      user_name: "",
      user_email: "",
      user_password: "",
    },

    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!isEditMode && !values.user_name) {
        errors.user_name = "User Name is required";
      }

      if (!values.user_email) {
        errors.user_email = "User Email is required";
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.com$/i;
        if (!emailRegex.test(values.user_email)) {
          errors.user_email = "Enter a valid email ending with .com";
        }
      }

      if (!isEditMode) {
        if (!values.user_password) {
          errors.user_password = "Password is required";
        } else if (values.user_password.length < 6) {
          errors.user_password = "Password must be at least 6 characters";
        }
      }

      return errors;
    },

    onSubmit: async (values) => {
      await submitCompanyAdmin(values);
    },
  });
  const submitCompanyAdmin = async (values: any) => {
    const payload = {
      id: null,
      company_code: values.company_code,
      user_name: values.user_name,
      user_email: values.user_email,
      user_password: values.user_password,
      created_by: JSON.parse(localStorage.getItem("ig_user") || "{}")?.user_id,
      session_id: JSON.parse(localStorage.getItem("ig_user") || "{}")?.session_id,
    };

    if (isEditMode && user?.id) {
      payload.id = user.id;
    }
    try {
      const res = await ApiServices.companyUserRegister(payload);

      if (res?.data?.isSuccess) {
        navigate(-1); // back to list
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
    if (!isEditMode || !user) return;

    formik.setValues({
      company_code: companyCodeFromLS,
      user_name: user.user_name || user.full_name || "",
      user_email: user.user_email || user.email || "",
      user_password: "",
    });
  }, [isEditMode, user]);

  return (
    <div className="p-6">
      <form onSubmit={formik.handleSubmit}>
        <div className="rounded-xl px-2 gap-2">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 ">
            </h2>
          </div>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold mb-6">
              Add User
            </h2>
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

          {/* Company Code */}
          <div className="mb-4">
            <label className="text-sm font-medium">
              Company Code
            </label>

            <input
              type="text"
              name="company_code"
              value={formik.values.company_code}

              onChange={formik.handleChange}
              className="w-full px-4 py-2 border rounded-lg mt-1 cursor-not-allowed"
              disabled={true}

            />
          </div>


          {/* User Name + User Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* User Name */}
            <div>
              <label className="text-sm font-medium">
                User Name {!isEditMode && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                name="user_name"
                value={formik.values.user_name}
                disabled={isEditMode}
                onChange={formik.handleChange}
                placeholder="Enter User Name"
                className={`w-full px-4 py-2 border rounded-lg mt-1 
        ${isEditMode ? "bg-gray-100 cursor-not-allowed" : ""}
      `}
              />
              {formik.touched.user_name && formik.errors.user_name && (
                <p className="text-xs text-red-500 mt-1">
                  {formik.errors.user_name}
                </p>
              )}
            </div>

            {/* User Email */}
            <div>
              <label className="text-sm font-medium">
                User Email {!isEditMode && <span className="text-red-500">*</span>}
              </label>
              <input
                type="email"
                name="user_email"
                value={formik.values.user_email}
                disabled={isEditMode}
                onChange={formik.handleChange}
                placeholder="admin@company.com"
                className={`w-full px-4 py-2 border rounded-lg mt-1 
        ${isEditMode ? "bg-gray-100 cursor-not-allowed" : ""}
      `}
              />
              {formik.touched.user_email && formik.errors.user_email && (
                <p className="text-xs text-red-500 mt-1">
                  {formik.errors.user_email}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {!isEditMode && (
              <div>
                <label className="text-sm font-medium">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="user_password"
                  value={formik.values.user_password}
                  onChange={formik.handleChange}
                  placeholder="Enter Password"
                  className="w-full px-4 py-2 border rounded-lg mt-1"
                />
                {formik.touched.user_password && formik.errors.user_password && (
                  <p className="text-xs text-red-500 mt-1">
                    {formik.errors.user_password}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="w-full flex items-center justify-between mt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {isEditMode ? "Update User" : " Create User"}
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}
export default AddCompanyUser
