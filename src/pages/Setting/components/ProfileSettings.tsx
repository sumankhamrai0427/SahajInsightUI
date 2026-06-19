import React, { useState } from "react";
import { useFormik } from "formik";
import {
  User,
  Mail,
  Phone,
  Camera,
  Trash2,
  Save,
  Building2,
  Hash,
  MapPin,
  Package,
} from "lucide-react";
import ApiServices from "../../../services/ApiServices";

interface ProfileSettingsProps {
  activeTab: string;
}
const ProfileSettings: React.FC<ProfileSettingsProps> = ({ activeTab }) => {
  const userData = JSON.parse(localStorage.getItem("ig_user") || "{}");
  const [avatar, setAvatar] = useState<string | null>(
     userData?.company_logo_url || null
  );
  const [isSaving, setIsSaving] = useState(false);
  console.log("User Data in ProfileSettings:", userData);

  // let parsedAddress = {
  //   area: "",
  //   city: "",
  //   district: "",
  //   state: "",
  //   country: "",
  //   pin_code: ""
  // };

  // try {
  //   if (userData?.company_address) {
  //     parsedAddress =
  //       typeof userData.company_address === "string"
  //         ? JSON.parse(userData.company_address)
  //         : userData.company_address;
  //   }
  // } catch (e) {
  //   console.warn("Invalid company_address JSON");
  // }
  // const formattedAddress = [
  //   parsedAddress.area,
  //   parsedAddress.city,
  //   parsedAddress.district,
  //   parsedAddress.state,
  //   parsedAddress.country
  // ]
  //   .filter(Boolean)
  //   .join(", ");
  const formik = useFormik({
    initialValues: {
      companyName: userData?.company_name || "",
      companyCode: userData?.company_code || "",
      address: userData?.company_address,
      zipCode: userData?.pin_code || "",
      email: userData?.company_email || "",
      phoneNumber: userData?.company_phone || "",
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.companyName) errors.companyName = "Company Name is required";
      if (!values.companyCode) errors.companyCode = "Company Code is required";
      if (!values.address) errors.address = "Address is required";
      if (!values.zipCode) errors.zipCode = "Zip Code is required";
      if (!values.email) {
        errors.email = "Email is required";
      } else if (
        !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
      ) {
        errors.email = "Invalid email address";
      }
      if (!values.phoneNumber) errors.phoneNumber = "Phone Number is required";
      return errors;
    },
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsSaving(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Form data:", values);
      setIsSaving(false);
      alert("Profile updated successfully!");
    },
  });

  // const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       setAvatar(reader.result as string);
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };
  // const handleAvatarUpload = async (
  //   event: React.ChangeEvent<HTMLInputElement>,
  // ) => {
  //   const file = event.target.files?.[0];
  //   if (!file) return;

  //   // 1️⃣ instant preview
  //   const reader = new FileReader();
  //   reader.onloadend = () => {
  //     setAvatar(reader.result as string);
  //   };
  //   reader.readAsDataURL(file);

  //   // 2️⃣ backend upload
  //   const formData = new FormData();
  //   formData.append("company_id", userData.company_id);
  //   formData.append("company_logo", file);

  //   try {
  //     const res = await fetch(`${BASE_URL}/admin/company/logo`, {
  //       method: "POST",
  //       body: formData,
  //     });

  //     const json = await res.json();

  //     if (json.isSuccess) {
  //       // 3️⃣ session (localStorage) update
  //     const updatedUser = {
  //       ...userData,
  //       company_logo: json.data.company_logo,
  //       company_logo_url: json.data.company_logo_url,
  //     };

  //     localStorage.setItem("ig_user", JSON.stringify(updatedUser));
  //     setAvatar(json.data.company_logo_url);

  //     } else {
  //       alert(json.message || "Logo upload failed");
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     alert("Server error while uploading logo");
  //   }
  // };
const handleAvatarUpload = async (
  event: React.ChangeEvent<HTMLInputElement>
) => {
  const file = event.target.files?.[0];
  if (!file) return;

  // 1️⃣ instant preview
  const reader = new FileReader();
  reader.onloadend = () => {
    setAvatar(reader.result as string);
  };
  reader.readAsDataURL(file);

  // 2️⃣ backend upload
  const formData = new FormData();
  formData.append("company_id", userData.company_id);
  formData.append("company_logo", file);

  try {
    const res = await ApiServices.uploadCompanyLogo(formData);
    const json = res.data;

    if (json.isSuccess) {
      const updatedUser = {
        ...userData,
        company_logo: json.data.company_logo,
        company_logo_url: json.data.company_logo_url,
      };

      localStorage.setItem("ig_user", JSON.stringify(updatedUser));
      setAvatar(json.data.company_logo_url);
    } else {
      alert(json.message || "Logo upload failed");
    }
  } catch (err) {
    console.error(err);
    alert("Server error while uploading logo");
  }
};

  const handleDeleteAvatar = () => {
    setAvatar(null);
  };

  if (activeTab !== "profile") return null;
  return (
    <div className="max-w-8xl">
      <form onSubmit={formik.handleSubmit} className="relative">
        <div className="rounded-xl px-4 ">
          <div className="flex flex-col md:flex-row items-start md:items-center ">
            <div className="relative p-4 ">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={48} className="text-gray-400" />
                )}
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow cursor-pointer"
              >
                <Camera size={16} className="text-gray-600" />
              </label>
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            {/* <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {userData?.company_name || "Company Name"}
              </h3>
            </div> */}
          </div>
        </div>
        <div className="rounded-xl pt-3 px-6">
          <h3 className="text-lg font-semibold text-gray-800 pb-2">
            {" "}
            Company Details{" "}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <div className="relative ">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Building2 size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="companyName"
                  value={formik.values.companyName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Company name"
                  className={`w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                    formik.touched.companyName && formik.errors.companyName
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  disabled
                />
              </div>
              {formik.touched.companyName && formik.errors.companyName && (
                <p className="mt-1 text-sm text-red-600">
                  {formik.errors.companyName as string}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Code
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Hash size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="companyCode"
                  value={formik.values.companyCode}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Company Code"
                  className={`w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                    formik.touched.companyCode && formik.errors.companyCode
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  disabled
                />
              </div>
              {formik.touched.companyCode && formik.errors.companyCode && (
                <p className="mt-1 text-sm text-red-600">
                  {formik.errors.companyCode as string}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <MapPin size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="address"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Address"
                  className={`w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                    formik.touched.address && formik.errors.address
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  disabled
                />
              </div>
              {formik.touched.address && formik.errors.address && (
                <p className="mt-1 text-sm text-red-600">
                  {formik.errors.address as string}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zip Code
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Package size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="zipCode"
                  value={formik.values.zipCode}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Zip Code"
                  className={`w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                    formik.touched.zipCode && formik.errors.zipCode
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  disabled
                />
              </div>
              {formik.touched.zipCode && formik.errors.zipCode && (
                <p className="mt-1 text-sm text-red-600">
                  {formik.errors.zipCode as string}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Email"
                  className={`w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                    formik.touched.email && formik.errors.email
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  disabled
                />
              </div>
              {formik.touched.email && formik.errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {formik.errors.email as string}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Phone size={18} className="text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formik.values.phoneNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Phone Number"
                  className={`w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                    formik.touched.phoneNumber && formik.errors.phoneNumber
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  disabled
                />
              </div>
              {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                <p className="mt-1 text-sm text-red-600">
                  {formik.errors.phoneNumber as string}
                </p>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
