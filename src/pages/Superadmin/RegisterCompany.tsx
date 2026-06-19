import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import { parsePhoneNumberFromString, CountryCode } from "libphonenumber-js";


import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Map,
  Globe2,
  Package,
  Calendar,
  Upload,
} from "lucide-react";
import FileUploadModal from "../../Modal/FileUploadModal";
import Tippy from "@tippyjs/react";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import { useNavigate } from "react-router-dom";
import { useParams, useLocation } from "react-router-dom";
import { POST_APIS, BASE_URL } from "../../../connection";
import ApiServices from "../../services/ApiServices";
import { MdCurrencyRupee } from "react-icons/md";




const RegisterCompany = () => {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);


  const [countryOptions, setCountryOptions] = useState<
    { label: string; value: string; dialCode: string }[]
  >([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [errorModal, setErrorModal] = useState({
    open: false,
    message: "",
  });


  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const company = location.state?.company;
  console.log("company", company);
  const isEditMode = Boolean(id && company);


  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoadingCountries(true);
        const res = await ApiServices.getCountryList();


        if (res?.data?.isSuccess) {
          setCountryOptions(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch country list", error);
      } finally {
        setLoadingCountries(false);
      }
    };


    fetchCountries();
  }, []);


  const formik = useFormik({
    validateOnMount: false,
    initialValues: {
      id: null,
      created_by: "",
      company_name: "",
      gst_number: "",
      company_email: "",
      country: "",
      dial_code: "", // phone prefix
      phone_number: "",
      // company_logo: null,


      // area: "",
      address: "",
      city: "",
      // district: "",
      // state: "",
      pin_code: "",


      // subscription_type: "FREE",
      from_date: "",
      to_date: "",
      subscription_amount: "",
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.company_name)
        errors.company_name = "Company Name is required";
      if (!values.company_email) {
        errors.company_email = "Company Email is required";
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.com$/i;
        if (!emailRegex.test(values.company_email)) {
          errors.company_email = "Enter a valid email ending with .com";
        }
      }


      // ---------- PHONE (OPTIONAL + COUNTRY BASED) ----------
      // if (values.phone_number) {
      //   if (!values.country) {
      //     errors.phone_number = "Select country to validate phone number";
      //   } else {
      //     try {
      //       const phone = parsePhoneNumberFromString(
      //         values.phone_number,
      //         values.country as any // ISO code: IN, US, AE, etc.
      //       );


      //       if (!phone || !phone.isValid()) {
      //         errors.phone_number =
      //           "Invalid phone number for selected country";
      //       }
      //     } catch {
      //       errors.phone_number = "Invalid phone number format";
      //     }
      //   }
      // }


      // ---------- PHONE (OPTIONAL + DIGITS + COUNTRY BASED) ----------
      if (values.phone_number) {
        // 1️⃣ digits-only check (your requirement)
        if (!/^\d+$/.test(values.phone_number)) {
          errors.phone_number = "Phone number must contain only digits";
        }
        // 2️⃣ country-based validation
        else {
          if (!values.country) {
            errors.phone_number = "Select country to validate phone number";
          } else {
            try {
              const countryCode = values.country as CountryCode;


              const phone = parsePhoneNumberFromString(
                values.phone_number,
                countryCode
              );


              if (!phone || !phone.isValid()) {
                errors.phone_number =
                  "Invalid phone number for selected country";
              }
            } catch {
              errors.phone_number = "Invalid phone number format";
            }
          }
        }
      }




      // if (!values.gst_number) {
      //   errors.gst_number = "GST Number is required";
      // }
      // if (!values.phone_number) {
      //   errors.phone_number = "Phone Number is required";
      // }
      // if (!values.phone_number) {
      //   errors.phone_number = "Phone Number is required";
      // } else if (!/^\d{7,12}$/.test(values.phone_number)) {
      //   errors.phone_number = "Enter valid phone number";
      // }


      // if (!values.area) errors.area = "Area is required";
      // if (!values.address) errors.address = "Address is required";
      // if (!values.city) errors.city = "City is required";
      // if (!values.district) errors.district = "District is required";
      // if (!values.state) errors.state = "State is required";
      // if (!values.country) errors.country = "Country is required";
      // if (!values.pin_code) {
      //   errors.pin_code = "PIN Code is required";
      // } else {
      //   const pinRegex = /^\d{6}$/;
      //   if (!pinRegex.test(values.pin_code)) {
      //     errors.pin_code = "PIN Code must be exactly 6 digits";
      //   }
      // }
      if (!values.from_date) {
        errors.from_date = "From date required";
      }
      if (!values.to_date) {
        errors.to_date = "To date required";
      } else if (values.from_date) {
        const fromDate = new Date(values.from_date);
        const toDate = new Date(values.to_date);
        const minToDate = new Date(fromDate);
        minToDate.setFullYear(minToDate.getFullYear() + 1);
        if (toDate < minToDate) {
          errors.to_date = "To date must be at least 1 year after From date";
        }
      }
      if (!values.subscription_amount)
        errors.subscription_amount = "Subscription Amount is required";



      //  FINAL CORRECT LOGO VALIDATION
      // if (!isEditMode && !values.company_logo) {
      //   errors.company_logo = "Company Logo is required";
      // }


      // if (values.company_logo) {
      //   const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
      //   const maxSize = 2 * 1024 * 1024;


      //   if (!allowedTypes.includes(values.company_logo.type)) {
      //     errors.company_logo = "Only PNG, JPG or JPEG files are allowed";
      //   } else if (values.company_logo.size > maxSize) {
      //     errors.company_logo = "Logo size must be less than 2MB";
      //   }
      // }


      return errors;
    },
    onSubmit: async (values) => {
      await submitCompany(values);
    },
  });
  const submitCompany = async (values: any) => {
    const payload: any = {
      company_name: values.company_name,
      company_email: values.company_email,
      phone_number: values.phone_number,
      dial_code: values.dial_code,
      country: values.country,
      gst_number: values.gst_number,
      address: values.address,
      city: values.city,
      pin_code: values.pin_code,
      subscription_amount: values.subscription_amount,
      from_date: values.from_date,
      to_date: values.to_date,
      created_by: JSON.parse(localStorage.getItem("ig_user") || "{}")?.user_id,
    };


    if (isEditMode && id) {
      payload.id = id;
    }


    try {
      const res = await ApiServices.companyRegister(payload);
      if (res?.data?.isSuccess) {
        navigate("/layout/manage-companies");
      } else {
        setErrorModal({
          open: true,
          message: res?.data?.message || "Failed to register company",
        });
      }
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        "Server error while registering company";
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
      setLogoPreview(null);
      setIsResetting(false);
    }, 400);
  };
  // useEffect(() => {
  //   if (!isEditMode || !company) return;
  //   if (formik.values.company_name) return;


  //   let addr = {
  //     area: "",
  //     city: "",
  //     district: "",
  //     state: "",
  //     country: "",
  //     pin_code: "",
  //   };


  //   try {
  //     addr = company.address ? JSON.parse(company.address) : addr;
  //   } catch (e) {
  //     console.warn("Invalid address JSON");
  //   }


  //   formik.setValues({
  //     id: company.id,
  //     created_by: company.created_by || "",


  //     company_name: company.company_name || "",
  //     company_email: company.company_email || "",
  //     phone_number: company.phone_number || "",
  //     // company_logo: null,


  //     // area: addr.area || "",
  //     city: addr.city || "",
  //     // district: addr.district || "",
  //     // state: addr.state || "",
  //     country: addr.country || "",
  //     pin_code: addr.pin_code || "",


  //     subscription_type: company.subscription_type || "FREE",


  //     from_date: company.from_date
  //       ? new Date(company.from_date).toISOString().slice(0, 10)
  //       : "",
  //     to_date: company.to_date
  //       ? new Date(company.to_date).toISOString().slice(0, 10)
  //       : "",
  //   });


  //   if (company.company_logo) {
  //     setLogoPreview(`${BASE_URL}${company.company_logo}`);
  //   }
  // }, [isEditMode, company]);


  useEffect(() => {
    if (!isEditMode || !company) return;


    // Prevent re-setting values on re-render
    if (formik.values.company_name) return;


    formik.setValues({
      id: company.id ?? null,
      created_by: company.created_by || "",


      company_name: company.company_name || "",
      company_email: company.company_email || "",
      gst_number: company.gst_number || "",


      country: company.country || "",
      dial_code: company.dial_code || "",
      phone_number: company.phone_number || "",


      address: company.address || "",
      city: company.city || "",
      pin_code: company.pin_code || "",


      subscription_amount: company.subscription_amount || "",


      from_date: company.from_date
        ? new Date(company.from_date).toISOString().slice(0, 10)
        : "",


      to_date: company.to_date
        ? new Date(company.to_date).toISOString().slice(0, 10)
        : "",
    });


    // 🔹 Logo preview (if exists)
    // if (company.company_logo) {
    //   setLogoPreview(`${BASE_URL}${company.company_logo}`);
    // } else {
    //   setLogoPreview(null);
    // }
  }, [isEditMode, company]);


  return (
    <div className="w-full mx-auto px-6">
      <form onSubmit={formik.handleSubmit}>
        <div className="rounded-xl py-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold text-[#1C1B1F]">
              Register a Company
            </h2>
            {!isEditMode && (
              <Tippy content="Reset" theme="gray">
                <button
                  type="button"
                  onClick={handleResetForm}
                  disabled={isResetting}
                  className={`
      w-10 h-10 flex items-center justify-center rounded-lg
      border border-[#D9D9D9]
      bg-[#F3F3F3] hover:bg-[#E5E5E5]
      transition-all
      ${isResetting ? "cursor-wait opacity-70" : "cursor-pointer"}
    `}
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


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">
                Company Name{" "}
                {!isEditMode && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <Building2
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  name="company_name"
                  value={formik.values.company_name}
                  onChange={formik.handleChange}
                  className="w-full pl-10 py-1.5 border rounded-lg"
                  placeholder="Enter Company Name"
                />
              </div>
              {formik.touched.company_name && formik.errors.company_name && (
                <p className="mt-1 text-xs text-red-500">
                  {formik.errors.company_name}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">
                Company Email{" "}
                {!isEditMode && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  name="company_email"
                  value={formik.values.company_email}
                  onChange={formik.handleChange}
                  className="w-full pl-10 py-1.5 border rounded-lg"
                  placeholder="Enter Company Email"
                />
              </div>
              {formik.touched.company_email && formik.errors.company_email && (
                <p className="mt-1 text-xs text-red-500">
                  {formik.errors.company_email}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">
                GST Number{" "}
              </label>
              <div className="relative">
                <Globe2
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  name="gst_number"
                  value={formik.values.gst_number}
                  onChange={formik.handleChange}
                  className="w-full pl-10 py-1.5 border rounded-lg"
                  placeholder="Enter GST Number"
                />
              </div>
              {/* {formik.touched.gst_number && formik.errors.gst_number && (
                <p className="mt-1 text-xs text-red-500">
                  {formik.errors.gst_number}
                </p>
              )} */}
            </div>


            <div>
              <label className="text-sm font-medium">
                Address
              </label>
              <div className="relative">
                <MapPin
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  name="address"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  className="w-full pl-10 py-1.5 border rounded-lg"
                  placeholder="Ex: Salt Lake"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">
                City
              </label>
              <div className="relative">
                <Map
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  name="city"
                  value={formik.values.city}
                  onChange={formik.handleChange}
                  className="w-full pl-10 py-1.5 border rounded-lg"
                  placeholder="Ex: Kolkata"
                />
              </div>


            </div>
            {/* <div>
              <label className="text-sm font-medium">
                District {!isEditMode && <span className="text-red-500">*</span>}
              </label>
              <input
                name="district"
                value={formik.values.district}
                onChange={formik.handleChange}
                className="w-full px-4 py-1.5 border rounded-lg"
                placeholder="Ex: North 24 Parganas"
              />
              {formik.touched.district && formik.errors.district && (
                <p className="mt-1 text-xs text-red-500">
                  {formik.errors.district}
                </p>
              )}
            </div> */}
            {/* <div>
              <label className="text-sm font-medium">
                State {!isEditMode && <span className="text-red-500">*</span>}
              </label>
              <input
                name="state"
                value={formik.values.state}
                onChange={formik.handleChange}
                className="w-full px-4 py-1.5 border rounded-lg"
                placeholder="Ex: West Bengal"
              />
              {formik.touched.state && formik.errors.state && (
                <p className="mt-1 text-xs text-red-500">
                  {formik.errors.state}
                </p>
              )}
            </div> */}
            {/* <div>
              <label className="text-sm font-medium">
                Country {!isEditMode && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <Globe2
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  name="country"
                  value={formik.values.country}
                  onChange={formik.handleChange}
                  className="w-full pl-10 py-1.5 border rounded-lg"
                  placeholder="Ender Country"
                />
              </div>
              {formik.touched.country && formik.errors.country && (
                <p className="mt-1 text-xs text-red-500">
                  {formik.errors.country}
                </p>
              )}
            </div> */}
            <div>
              <label className="text-sm font-medium">
                Country
              </label>


              <div className="relative">
                <Globe2
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />


                <select
                  name="country"
                  value={formik.values.country}
                  onChange={(e) => {
                    const selected = countryOptions.find(
                      (c) => c.value === e.target.value,
                    );


                    formik.setFieldValue("country", selected?.value || "");
                    formik.setFieldValue("dial_code", selected?.dialCode || "");
                    formik.setFieldTouched("country", true);
                  }}
                  className="w-full pl-10 py-1.5 border rounded-lg bg-white"
                  disabled={loadingCountries}
                >
                  <option value="" disabled>
                    {loadingCountries
                      ? "Loading countries..."
                      : "Select Country"}
                  </option>


                  {countryOptions.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>


              {/* {formik.touched.country && formik.errors.country && (
                <p className="mt-1 text-xs text-red-500">
                  {formik.errors.country}
                </p>
              )} */}
            </div>


            {/* <div>
              <label className="text-sm font-medium">
                Phone Number {!isEditMode && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <Phone
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  name="phone_number"
                  value={formik.values.phone_number}
                  onChange={formik.handleChange}
                  className="w-full pl-10 py-1.5 border rounded-lg"
                  placeholder="Enter Phone Number"
                />
              </div>
              {formik.touched.phone_number && formik.errors.phone_number && (
                <p className="mt-1 text-xs text-red-500">
                  {formik.errors.phone_number}
                </p>
              )}
            </div> */}
            <div>
              <label className="text-sm font-medium">
                Phone Number</label>


              <div className="flex">
                {/* Dial Code */}
                <div className="flex items-center px-3 border border-r-0 rounded-l-lg bg-gray-100 text-gray-700 text-sm min-w-[60px] justify-center">
                  {formik.values.dial_code}
                </div>


                {/* Phone Input */}
                <div className="relative w-full">
                  <Phone
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  {/* <input
                    name="phone_number"
                    value={formik.values.phone_number}
                    onChange={formik.handleChange}
                    className="w-full pl-10 py-1.5 border rounded-r-lg"
                    placeholder="Enter phone number"
                    disabled={!formik.values.country}
                  /> */}
                  <input
                    name="phone_number"
                    value={formik.values.phone_number}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\D/g, "");
                      formik.setFieldValue("phone_number", digitsOnly);
                    }}
                    onBlur={formik.handleBlur}
                    className="w-full pl-10 py-1.5 border rounded-r-lg"
                    placeholder="Enter phone number"
                    disabled={!formik.values.country}
                  />


                </div>
              </div>


              {formik.touched.phone_number && formik.errors.phone_number && (
                <p className="mt-1 text-xs text-red-500">
                  {formik.errors.phone_number}
                </p>
              )}
            </div>


            <div>
              <label className="text-sm font-medium">
                PIN Code


              </label>
              <div className="relative">
                <Package
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  name="pin_code"
                  value={formik.values.pin_code}
                  onChange={formik.handleChange}
                  className="w-full pl-10 py-1.5 border rounded-lg"
                  placeholder="Ex: 700091"
                />
              </div>


            </div>
            {/* <div>
              <label className="text-sm font-medium">
                Subscription Type {!isEditMode && <span className="text-red-500">*</span>}
              </label>
              <select
                name="subscription_type"
                value={formik.values.subscription_type}
                onChange={formik.handleChange}
                className="w-full px-4 py-1.5 border rounded-lg"
              >
                <option value="FREE">FREE</option>
                <option value="PAID">PAID</option>
              </select>
              {formik.touched.subscription_type &&
                formik.errors.subscription_type && (
                  <p className="mt-1 text-xs text-red-500">
                    {formik.errors.subscription_type}
                  </p>
                )}
            </div> */}
            <div>
              <label className="text-sm font-medium">
                From Date{" "}
                {!isEditMode && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <Calendar
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="date"
                  name="from_date"
                  // min={new Date().toISOString().split("T")[0]}
                  min={
                    isEditMode
                      ? undefined
                      : new Date().toISOString().split("T")[0]
                  }
                  value={formik.values.from_date}
                  onChange={formik.handleChange}
                  className="w-full pl-10 py-1.5 border rounded-lg"
                />
              </div>
              {formik.touched.from_date && formik.errors.from_date && (
                <p className="mt-1 text-xs text-red-500">
                  {formik.errors.from_date}
                </p>
              )}
            </div>


            <div>
              <label className="text-sm font-medium">
                To Date {!isEditMode && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <Calendar
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="date"
                  name="to_date"
                  min={
                    formik.values.from_date
                      ? (() => {
                        const fd = new Date(formik.values.from_date);
                        fd.setFullYear(fd.getFullYear() + 1);
                        return fd.toISOString().split("T")[0];
                      })()
                      : isEditMode
                        ? undefined
                        : new Date().toISOString().split("T")[0]
                  }
                  disabled={!formik.values.from_date}
                  value={formik.values.to_date}
                  onChange={formik.handleChange}
                  className="w-full pl-10 py-1.5 border rounded-lg"
                />
              </div>
              {formik.touched.to_date && formik.errors.to_date && (
                <p className="mt-1 text-xs text-red-500">
                  {formik.errors.to_date}
                </p>
              )}
            </div>


            <div>
              <label className="text-sm font-medium">
                Subscription Amount{" "}
                {!isEditMode && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <MdCurrencyRupee
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  name="subscription_amount"
                  value={formik.values.subscription_amount}
                  onChange={formik.handleChange}
                  className="w-full pl-10 py-1.5 border rounded-lg"
                  placeholder="Enter Subscription Amount"
                />
              </div>
              {formik.touched.subscription_amount &&
                formik.errors.subscription_amount && (
                  <p className="mt-1 text-xs text-red-500">
                    {formik.errors.subscription_amount}
                  </p>
                )}
            </div>


            {/* Logo */}
            {/* <div className="md:col-span-2">
              <label className="text-sm font-medium">
                Company Logo {!isEditMode && <span className="text-red-500">*</span>}
              </label>


              <div className="flex items-center gap-4 mt-2">
                <FileUploadModal
                  label="Upload Logo"
                  value={formik.values.company_logo}
                  maxSizeMB={2}
                  allowedTypes={["image/png", "image/jpeg", "image/jpg"]}
                  onChange={(file) => {
                    formik.setFieldTouched("company_logo", true);
                    formik.setFieldValue("company_logo", file);


                    if (file) {
                      setLogoPreview(URL.createObjectURL(file));
                    } else {
                      setLogoPreview(null);
                    }
                  }}
                />


                {logoPreview && (
                  <img
                    src={logoPreview}
                    alt="logo preview"
                    className="w-16 h-16 object-cover rounded border"
                  />
                )}
              </div>


              {formik.touched.company_logo &&
                typeof formik.errors.company_logo === "string" && (
                  <p className="mt-1 text-xs text-red-500">
                    {formik.errors.company_logo}
                  </p>
                )}
            </div> */}
          </div>
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
              disabled={formik.isSubmitting}
              className={`px-6 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                formik.isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isEditMode ? "Update Company" : "Register Company"}
            </button> */}
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className={`px-6 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2
    ${formik.isSubmitting ? "opacity-70 cursor-not-allowed" : ""}
  `}
            >
              {formik.isSubmitting && (
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}


              {formik.isSubmitting
                ? "Processing..."
                : isEditMode
                  ? "Update Company"
                  : "Register Company"}
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


            <div clasimport React, {useEffect, useState} from "react";
            import {useFormik} from "formik";
            import {parsePhoneNumberFromString, CountryCode} from "libphonenumber-js";


            import {
              Building2,
              Mail,
              Phone,
              MapPin,
              Map,
              Globe2,
              Package,
              Calendar,
              Upload,
} from "lucide-react";
            import FileUploadModal from "../../Modal/FileUploadModal";
            import Tippy from "@tippyjs/react";
            import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
            import {useNavigate} from "react-router-dom";
            import {useParams, useLocation} from "react-router-dom";
            import {POST_APIS, BASE_URL} from "../../../connection";
            import ApiServices from "../../services/ApiServices";
            import {MdCurrencyRupee} from "react-icons/md";




const RegisterCompany = () => {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
            const [isResetting, setIsResetting] = useState(false);


            const [countryOptions, setCountryOptions] = useState<
    { label: string; value: string; dialCode: string }[]
  >([]);
            const [loadingCountries, setLoadingCountries] = useState(false);
            const [errorModal, setErrorModal] = useState({
              open: false,
            message: "",
  });


            const navigate = useNavigate();
            const {id} = useParams();
            const location = useLocation();
            const company = location.state?.company;
            console.log("company", company);
            const isEditMode = Boolean(id && company);


  useEffect(() => {
    const fetchCountries = async () => {
      try {
              setLoadingCountries(true);
            const res = await ApiServices.getCountryList();


            if (res?.data?.isSuccess) {
              setCountryOptions(res.data.data);
        }
      } catch (error) {
              console.error("Failed to fetch country list", error);
      } finally {
              setLoadingCountries(false);
      }
    };


            fetchCountries();
  }, []);


            const formik = useFormik({
              validateOnMount: false,
            initialValues: {
              id: null,
            created_by: "",
            company_name: "",
            gst_number: "",
            company_email: "",
            country: "",
            dial_code: "", // phone prefix
            phone_number: "",
            // company_logo: null,


            // area: "",
            address: "",
            city: "",
            // district: "",
            // state: "",
            pin_code: "",


            // subscription_type: "FREE",
            from_date: "",
            to_date: "",
            subscription_amount: "",
    },
    validate: (values) => {
      const errors: Record<string, string> = { };
            if (!values.company_name)
            errors.company_name = "Company Name is required";
            if (!values.company_email) {
              errors.company_email = "Company Email is required";
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.com$/i;
            if (!emailRegex.test(values.company_email)) {
              errors.company_email = "Enter a valid email ending with .com";
        }
      }


      // ---------- PHONE (OPTIONAL + COUNTRY BASED) ----------
      // if (values.phone_number) {
      //   if (!values.country) {
      //     errors.phone_number = "Select country to validate phone number";
      //   } else {
      //     try {
      //       const phone = parsePhoneNumberFromString(
      //         values.phone_number,
      //         values.country as any // ISO code: IN, US, AE, etc.
      //       );


      //       if (!phone || !phone.isValid()) {
      //         errors.phone_number =
      //           "Invalid phone number for selected country";
      //       }
      //     } catch {
      //       errors.phone_number = "Invalid phone number format";
      //     }
      //   }
      // }


      // ---------- PHONE (OPTIONAL + DIGITS + COUNTRY BASED) ----------
      if (values.phone_number) {
        // 1️⃣ digits-only check (your requirement)
        if (!/^\d+$/.test(values.phone_number)) {
              errors.phone_number = "Phone number must contain only digits";
        }
            // 2️⃣ country-based validation
            else {
          if (!values.country) {
              errors.phone_number = "Select country to validate phone number";
          } else {
            try {
              const countryCode = values.country as CountryCode;


            const phone = parsePhoneNumberFromString(
            values.phone_number,
            countryCode
            );


            if (!phone || !phone.isValid()) {
              errors.phone_number =
              "Invalid phone number for selected country";
              }
            } catch {
              errors.phone_number = "Invalid phone number format";
            }
          }
        }
      }




      // if (!values.gst_number) {
      //   errors.gst_number = "GST Number is required";
      // }
      // if (!values.phone_number) {
      //   errors.phone_number = "Phone Number is required";
      // }
      // if (!values.phone_number) {
      //   errors.phone_number = "Phone Number is required";
      // } else if (!/^\d{7, 12}$/.test(values.phone_number)) {
      //   errors.phone_number = "Enter valid phone number";
      // }


      // if (!values.area) errors.area = "Area is required";
      // if (!values.address) errors.address = "Address is required";
      // if (!values.city) errors.city = "City is required";
      // if (!values.district) errors.district = "District is required";
      // if (!values.state) errors.state = "State is required";
      // if (!values.country) errors.country = "Country is required";
      // if (!values.pin_code) {
      //   errors.pin_code = "PIN Code is required";
      // } else {
      //   const pinRegex = /^\d{6}$/;
      //   if (!pinRegex.test(values.pin_code)) {
      //     errors.pin_code = "PIN Code must be exactly 6 digits";
      //   }
      // }
      if (!values.from_date) {
              errors.from_date = "From date required";
      }
            if (!values.to_date) {
              errors.to_date = "To date required";
      } else if (values.from_date) {
        const fromDate = new Date(values.from_date);
            const toDate = new Date(values.to_date);
            const minToDate = new Date(fromDate);
            minToDate.setFullYear(minToDate.getFullYear() + 1);
            if (toDate < minToDate) {
              errors.to_date = "To date must be at least 1 year after From date";
        }
      }
            if (!values.subscription_amount)
            errors.subscription_amount = "Subscription Amount is required";



      //  FINAL CORRECT LOGO VALIDATION
      // if (!isEditMode && !values.company_logo) {
      //   errors.company_logo = "Company Logo is required";
      // }


      // if (values.company_logo) {
      //   const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
      //   const maxSize = 2 * 1024 * 1024;


      //   if (!allowedTypes.includes(values.company_logo.type)) {
      //     errors.company_logo = "Only PNG, JPG or JPEG files are allowed";
      //   } else if (values.company_logo.size > maxSize) {
      //     errors.company_logo = "Logo size must be less than 2MB";
      //   }
      // }


      return errors;
    },
    onSubmit: async (values) => {
              await submitCompany(values);
    },
  });
  const submitCompany = async (values: any) => {
    const payload: any = {
              company_name: values.company_name,
            company_email: values.company_email,
            phone_number: values.phone_number,
            dial_code: values.dial_code,
            country: values.country,
            gst_number: values.gst_number,
            address: values.address,
            city: values.city,
            pin_code: values.pin_code,
            subscription_amount: values.subscription_amount,
            from_date: values.from_date,
            to_date: values.to_date,
            created_by: JSON.parse(localStorage.getItem("ig_user") || "{ }")?.user_id,
    };


            if (isEditMode && id) {
              payload.id = id;
    }


            try {
      const res = await ApiServices.companyRegister(payload);
            if (res?.data?.isSuccess) {
              navigate("/layout/manage-companies");
      } else {
              setErrorModal({
                open: true,
                message: res?.data?.message || "Failed to register company",
              });
      }
    } catch (err: any) {
              console.error(err);
            const msg =
            err?.response?.data?.message ||
            "Server error while registering company";
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
            setLogoPreview(null);
            setIsResetting(false);
    }, 400);
  };
  // useEffect(() => {
              //   if (!isEditMode || !company) return;
              //   if (formik.values.company_name) return;


              //   let addr = {
              //     area: "",
              //     city: "",
              //     district: "",
              //     state: "",
              //     country: "",
              //     pin_code: "",
              //   };


              //   try {
              //     addr = company.address ? JSON.parse(company.address) : addr;
              //   } catch (e) {
              //     console.warn("Invalid address JSON");
              //   }


              //   formik.setValues({
              //     id: company.id,
              //     created_by: company.created_by || "",


              //     company_name: company.company_name || "",
              //     company_email: company.company_email || "",
              //     phone_number: company.phone_number || "",
              //     // company_logo: null,


              //     // area: addr.area || "",
              //     city: addr.city || "",
              //     // district: addr.district || "",
              //     // state: addr.state || "",
              //     country: addr.country || "",
              //     pin_code: addr.pin_code || "",


              //     subscription_type: company.subscription_type || "FREE",


              //     from_date: company.from_date
              //       ? new Date(company.from_date).toISOString().slice(0, 10)
              //       : "",
              //     to_date: company.to_date
              //       ? new Date(company.to_date).toISOString().slice(0, 10)
              //       : "",
              //   });


              //   if (company.company_logo) {
              //     setLogoPreview(`${BASE_URL}${company.company_logo}`);
              //   }
              // }, [isEditMode, company]);


              useEffect(() => {
                if (!isEditMode || !company) return;


                // Prevent re-setting values on re-render
                if (formik.values.company_name) return;


                formik.setValues({
                  id: company.id ?? null,
                  created_by: company.created_by || "",


                  company_name: company.company_name || "",
                  company_email: company.company_email || "",
                  gst_number: company.gst_number || "",


                  country: company.country || "",
                  dial_code: company.dial_code || "",
                  phone_number: company.phone_number || "",


                  address: company.address || "",
                  city: company.city || "",
                  pin_code: company.pin_code || "",


                  subscription_amount: company.subscription_amount || "",


                  from_date: company.from_date
                    ? new Date(company.from_date).toISOString().slice(0, 10)
                    : "",


                  to_date: company.to_date
                    ? new Date(company.to_date).toISOString().slice(0, 10)
                    : "",
                });


                // 🔹 Logo preview (if exists)
                // if (company.company_logo) {
                //   setLogoPreview(`${BASE_URL}${company.company_logo}`);
                // } else {
                //   setLogoPreview(null);
                // }
              }, [isEditMode, company]);


            return (
            <div className="w-full mx-auto px-6">
              <form onSubmit={formik.handleSubmit}>
                <div className="rounded-xl py-4">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold text-[#1C1B1F]">
                      Register a Company
                    </h2>
                    {!isEditMode && (
                      <Tippy content="Reset" theme="gray">
                        <button
                          type="button"
                          onClick={handleResetForm}
                          disabled={isResetting}
                          className={`
      w-10 h-10 flex items-center justify-center rounded-lg
      border border-[#D9D9D9]
      bg-[#F3F3F3] hover:bg-[#E5E5E5]
      transition-all
      ${isResetting ? "cursor-wait opacity-70" : "cursor-pointer"}
    `}
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


                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">
                        Company Name{" "}
                        {!isEditMode && <span className="text-red-500">*</span>}
                      </label>
                      <div className="relative">
                        <Building2
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          name="company_name"
                          value={formik.values.company_name}
                          onChange={formik.handleChange}
                          className="w-full pl-10 py-1.5 border rounded-lg"
                          placeholder="Enter Company Name"
                        />
                      </div>
                      {formik.touched.company_name && formik.errors.company_name && (
                        <p className="mt-1 text-xs text-red-500">
                          {formik.errors.company_name}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        Company Email{" "}
                        {!isEditMode && <span className="text-red-500">*</span>}
                      </label>
                      <div className="relative">
                        <Mail
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          name="company_email"
                          value={formik.values.company_email}
                          onChange={formik.handleChange}
                          className="w-full pl-10 py-1.5 border rounded-lg"
                          placeholder="Enter Company Email"
                        />
                      </div>
                      {formik.touched.company_email && formik.errors.company_email && (
                        <p className="mt-1 text-xs text-red-500">
                          {formik.errors.company_email}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        GST Number{" "}
                      </label>
                      <div className="relative">
                        <Globe2
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          name="gst_number"
                          value={formik.values.gst_number}
                          onChange={formik.handleChange}
                          className="w-full pl-10 py-1.5 border rounded-lg"
                          placeholder="Enter GST Number"
                        />
                      </div>
                      {/* {formik.touched.gst_number && formik.errors.gst_number && (
                <p className="mt-1 text-xs text-red-500">
                  {formik.errors.gst_number}
                </p>
              )} */}
                    </div>


                    <div>
                      <label className="text-sm font-medium">
                        Address
                      </label>
                      <div className="relative">
                        <MapPin
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          name="address"
                          value={formik.values.address}
                          onChange={formik.handleChange}
                          className="w-full pl-10 py-1.5 border rounded-lg"
                          placeholder="Ex: Salt Lake"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        City
                      </label>
                      <div className="relative">
                        <Map
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          name="city"
                          value={formik.values.city}
                          onChange={formik.handleChange}
                          className="w-full pl-10 py-1.5 border rounded-lg"
                          placeholder="Ex: Kolkata"
                        />
                      </div>


                    </div>
                    {/* <div>
              <label className="text-sm font-medium">
                District {!isEditMode && <span className="text-red-500">*</span>}
              </label>
              <input
                name="district"
                value={formik.values.district}
                onChange={formik.handleChange}
                className="w-full px-4 py-1.5 border rounded-lg"
                placeholder="Ex: North 24 Parganas"
              />
              {formik.touched.district && formik.errors.district && (
                <p className="mt-1 text-xs text-red-500">
                  {formik.errors.district}
                </p>
              )}
            </div> */}
                    {/* <div>
              <label className="text-sm font-medium">
                State {!isEditMode && <span className="text-red-500">*</span>}
              </label>
              <input
                name="state"
                value={formik.values.state}
                onChange={formik.handleChange}
                className="w-full px-4 py-1.5 border rounded-lg"
                placeholder="Ex: West Bengal"
              />
              {formik.touched.state && formik.errors.state && (
                <p className="mt-1 text-xs text-red-500">
                  {formik.errors.state}
                </p>
              )}
            </div> */}
                    {/* <div>
              <label className="text-sm font-medium">
                Country {!isEditMode && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <Globe2
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  name="country"
                  value={formik.values.country}
                  onChange={formik.handleChange}
                  className="w-full pl-10 py-1.5 border rounded-lg"
                  placeholder="Ender Country"
                />
              </div>
              {formik.touched.country && formik.errors.country && (
                <p className="mt-1 text-xs text-red-500">
                  {formik.errors.country}
                </p>
              )}
            </div> */}
                    <div>
                      <label className="text-sm font-medium">
                        Country
                      </label>


                      <div className="relative">
                        <Globe2
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />


                        <select
                          name="country"
                          value={formik.values.country}
                          onChange={(e) => {
                            const selected = countryOptions.find(
                              (c) => c.value === e.target.value,
                            );


                            formik.setFieldValue("country", selected?.value || "");
                            formik.setFieldValue("dial_code", selected?.dialCode || "");
                            formik.setFieldTouched("country", true);
                          }}
                          className="w-full pl-10 py-1.5 border rounded-lg bg-white"
                          disabled={loadingCountries}
                        >
                          <option value="" disabled>
                            {loadingCountries
                              ? "Loading countries..."
                              : "Select Country"}
                          </option>


                          {countryOptions.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>


                      {/* {formik.touched.country && formik.errors.country && (
                <p className="mt-1 text-xs text-red-500">
                  {formik.errors.country}
                </p>
              )} */}
                    </div>


                    {/* <div>
              <label className="text-sm font-medium">
                Phone Number {!isEditMode && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <Phone
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  name="phone_number"
                  value={formik.values.phone_number}
                  onChange={formik.handleChange}
                  className="w-full pl-10 py-1.5 border rounded-lg"
                  placeholder="Enter Phone Number"
                />
              </div>
              {formik.touched.phone_number && formik.errors.phone_number && (
                <p className="mt-1 text-xs text-red-500">
                  {formik.errors.phone_number}
                </p>
              )}
            </div> */}
                    <div>
                      <label className="text-sm font-medium">
                        Phone Number</label>


                      <div className="flex">
                        {/* Dial Code */}
                        <div className="flex items-center px-3 border border-r-0 rounded-l-lg bg-gray-100 text-gray-700 text-sm min-w-[60px] justify-center">
                          {formik.values.dial_code}
                        </div>


                        {/* Phone Input */}
                        <div className="relative w-full">
                          <Phone
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          />
                          {/* <input
                    name="phone_number"
                    value={formik.values.phone_number}
                    onChange={formik.handleChange}
                    className="w-full pl-10 py-1.5 border rounded-r-lg"
                    placeholder="Enter phone number"
                    disabled={!formik.values.country}
                  /> */}
                          <input
                            name="phone_number"
                            value={formik.values.phone_number}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            onChange={(e) => {
                              const digitsOnly = e.target.value.replace(/\D/g, "");
                              formik.setFieldValue("phone_number", digitsOnly);
                            }}
                            onBlur={formik.handleBlur}
                            className="w-full pl-10 py-1.5 border rounded-r-lg"
                            placeholder="Enter phone number"
                            disabled={!formik.values.country}
                          />


                        </div>
                      </div>


                      {formik.touched.phone_number && formik.errors.phone_number && (
                        <p className="mt-1 text-xs text-red-500">
                          {formik.errors.phone_number}
                        </p>
                      )}
                    </div>


                    <div>
                      <label className="text-sm font-medium">
                        PIN Code


                      </label>
                      <div className="relative">
                        <Package
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          name="pin_code"
                          value={formik.values.pin_code}
                          onChange={formik.handleChange}
                          className="w-full pl-10 py-1.5 border rounded-lg"
                          placeholder="Ex: 700091"
                        />
                      </div>


                    </div>
                    {/* <div>
              <label className="text-sm font-medium">
                Subscription Type {!isEditMode && <span className="text-red-500">*</span>}
              </label>
              <select
                name="subscription_type"
                value={formik.values.subscription_type}
                onChange={formik.handleChange}
                className="w-full px-4 py-1.5 border rounded-lg"
              >
                <option value="FREE">FREE</option>
                <option value="PAID">PAID</option>
              </select>
              {formik.touched.subscription_type &&
                formik.errors.subscription_type && (
                  <p className="mt-1 text-xs text-red-500">
                    {formik.errors.subscription_type}
                  </p>
                )}
            </div> */}
                    <div>
                      <label className="text-sm font-medium">
                        From Date{" "}
                        {!isEditMode && <span className="text-red-500">*</span>}
                      </label>
                      <div className="relative">
                        <Calendar
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="date"
                          name="from_date"
                          // min={new Date().toISOString().split("T")[0]}
                          min={
                            isEditMode
                              ? undefined
                              : new Date().toISOString().split("T")[0]
                          }
                          value={formik.values.from_date}
                          onChange={formik.handleChange}
                          className="w-full pl-10 py-1.5 border rounded-lg"
                        />
                      </div>
                      {formik.touched.from_date && formik.errors.from_date && (
                        <p className="mt-1 text-xs text-red-500">
                          {formik.errors.from_date}
                        </p>
                      )}
                    </div>


                    <div>
                      <label className="text-sm font-medium">
                        To Date {!isEditMode && <span className="text-red-500">*</span>}
                      </label>
                      <div className="relative">
                        <Calendar
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="date"
                          name="to_date"
                          min={
                            formik.values.from_date
                              ? (() => {
                                const fd = new Date(formik.values.from_date);
                                fd.setFullYear(fd.getFullYear() + 1);
                                return fd.toISOString().split("T")[0];
                              })()
                              : isEditMode
                                ? undefined
                                : new Date().toISOString().split("T")[0]
                          }
                          disabled={!formik.values.from_date}
                          value={formik.values.to_date}
                          onChange={formik.handleChange}
                          className="w-full pl-10 py-1.5 border rounded-lg"
                        />
                      </div>
                      {formik.touched.to_date && formik.errors.to_date && (
                        <p className="mt-1 text-xs text-red-500">
                          {formik.errors.to_date}
                        </p>
                      )}
                    </div>


                    <div>
                      <label className="text-sm font-medium">
                        Subscription Amount{" "}
                        {!isEditMode && <span className="text-red-500">*</span>}
                      </label>
                      <div className="relative">
                        <MdCurrencyRupee
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          name="subscription_amount"
                          value={formik.values.subscription_amount}
                          onChange={formik.handleChange}
                          className="w-full pl-10 py-1.5 border rounded-lg"
                          placeholder="Enter Subscription Amount"
                        />
                      </div>
                      {formik.touched.subscription_amount &&
                        formik.errors.subscription_amount && (
                          <p className="mt-1 text-xs text-red-500">
                            {formik.errors.subscription_amount}
                          </p>
                        )}
                    </div>


                    {/* Logo */}
                    {/* <div className="md:col-span-2">
              <label className="text-sm font-medium">
                Company Logo {!isEditMode && <span className="text-red-500">*</span>}
              </label>


              <div className="flex items-center gap-4 mt-2">
                <FileUploadModal
                  label="Upload Logo"
                  value={formik.values.company_logo}
                  maxSizeMB={2}
                  allowedTypes={["image/png", "image/jpeg", "image/jpg"]}
                  onChange={(file) => {
                    formik.setFieldTouched("company_logo", true);
                    formik.setFieldValue("company_logo", file);


                    if (file) {
                      setLogoPreview(URL.createObjectURL(file));
                    } else {
                      setLogoPreview(null);
                    }
                  }}
                />


                {logoPreview && (
                  <img
                    src={logoPreview}
                    alt="logo preview"
                    className="w-16 h-16 object-cover rounded border"
                  />
                )}
              </div>


              {formik.touched.company_logo &&
                typeof formik.errors.company_logo === "string" && (
                  <p className="mt-1 text-xs text-red-500">
                    {formik.errors.company_logo}
                  </p>
                )}
            </div> */}
                  </div>
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
              disabled={formik.isSubmitting}
              className={`px-6 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                formik.isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isEditMode ? "Update Company" : "Register Company"}
            </button> */}
                    <button
                      type="submit"
                      disabled={formik.isSubmitting}
                      className={`px-6 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2
    ${formik.isSubmitting ? "opacity-70 cursor-not-allowed" : ""}
  `}
                    >
                      {formik.isSubmitting && (
                        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      )}


                      {formik.isSubmitting
                        ? "Processing..."
                        : isEditMode
                          ? "Update Company"
                          : "Register Company"}
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
                        className="px-5 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                      >
                        OK
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            );
};


            export default RegisterCompany;


sName="flex justify-end">
            <button
              onClick={() => setErrorModal({ open: false, message: "" })}
              className="px-5 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
        </div>
  )
}
    </div >
  );
};


export default RegisterCompany;

