// import React, { useState, useRef } from 'react';
// import { 
//   Upload, 
//   Building2, 
//   Mail, 
//   Phone, 
//   Lock, 
//   Eye, 
//   EyeOff,
//   CheckCircle,
//   AlertCircle,
//   Save,
//   Globe,
//   Shield
// } from 'lucide-react';

// // Type definitions
// interface CompanyDetails {
//   name: string;
//   code: string;
//   address: string;
//   city: string;
//   state: string;
//   zipCode: string;
// }

// interface ContactInfo {
//   email: string;
//   phone: string;
//   website: string;
// }

// interface PasswordChange {
//   currentPassword: string;
//   newPassword: string;
//   confirmPassword: string;
// }

// const Settings: React.FC = () => {
//   // State for company details
//   const [companyDetails, setCompanyDetails] = useState<CompanyDetails>({
//     name: 'Acme Corporation',
//     code: 'ACME001',
//     address: '123 Innovation Drive',
//     city: 'San Francisco',
//     state: 'CA',
//     zipCode: '94107'
//   });

//   // State for contact info
//   const [contactInfo, setContactInfo] = useState<ContactInfo>({
//     email: 'contact@acmecorp.com',
//     phone: '+1 (555) 123-4567',
//     website: 'acmecorp.com'
//   });

//   // State for password change
//   const [passwordData, setPasswordData] = useState<PasswordChange>({
//     currentPassword: '',
//     newPassword: '',
//     confirmPassword: ''
//   });

//   // State for logo upload
//   const [logo, setLogo] = useState<string | null>('https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop&crop=center');
//   const [logoError, setLogoError] = useState<string>('');
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   // State for form validation
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

//   // Password visibility states
//   const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
//   const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

//   // Handle company details change
//   const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setCompanyDetails(prev => ({ ...prev, [name]: value }));
//     setErrors(prev => ({ ...prev, [name]: '' }));
//   };

//   // Handle contact info change
//   const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setContactInfo(prev => ({ ...prev, [name]: value }));
//     setErrors(prev => ({ ...prev, [name]: '' }));
//   };

//   // Handle password change
//   const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setPasswordData(prev => ({ ...prev, [name]: value }));
//     setErrors(prev => ({ ...prev, [name]: '' }));
//   };

//   // Handle logo upload
//   const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     setLogoError('');

//     if (!file) return;

//     if (!['image/jpeg', 'image/png'].includes(file.type)) {
//       setLogoError('Only JPEG/PNG files allowed');
//       return;
//     }

//     if (file.size > 2 * 1024 * 1024) {
//       setLogoError('File size must be < 2MB');
//       return;
//     }

//     const reader = new FileReader();
//     reader.onload = (event) => {
//       setLogo(event.target?.result as string);
//       setSaveSuccess(true);
//       setTimeout(() => setSaveSuccess(false), 2000);
//     };
//     reader.readAsDataURL(file);
//   };

//   // Trigger file input click
//   const triggerFileInput = () => {
//     fileInputRef.current?.click();
//   };

//   // Validate form
//   const validateForm = (): boolean => {
//     const newErrors: Record<string, string> = {};
    
//     if (!companyDetails.name.trim()) newErrors.companyName = 'Required';
//     if (!companyDetails.code.trim()) newErrors.companyCode = 'Required';
    
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!contactInfo.email.trim()) newErrors.email = 'Required';
//     else if (!emailRegex.test(contactInfo.email)) newErrors.email = 'Invalid email';
    
//     const isPasswordSectionFilled = 
//       passwordData.currentPassword || 
//       passwordData.newPassword || 
//       passwordData.confirmPassword;
    
//     if (isPasswordSectionFilled) {
//       if (!passwordData.currentPassword) newErrors.currentPassword = 'Required';
//       if (!passwordData.newPassword) newErrors.newPassword = 'Required';
//       else if (passwordData.newPassword.length < 8) newErrors.newPassword = 'Min 8 chars';
      
//       if (!passwordData.confirmPassword) newErrors.confirmPassword = 'Required';
//       else if (passwordData.newPassword !== passwordData.confirmPassword) newErrors.confirmPassword = 'Mismatch';
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   // Handle form submission
//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (validateForm()) {
//       setSaveSuccess(true);
//       setPasswordData({
//         currentPassword: '',
//         newPassword: '',
//         confirmPassword: ''
//       });
      
//       setTimeout(() => setSaveSuccess(false), 2000);
//       console.log('Settings saved:', { companyDetails, contactInfo });
//     }
//   };

//   return (
//     <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 overflow-y-auto">
//       <div className="h-full max-w-8xl mx-auto flex flex-col px-5">
//         {/* Header */}
//         <div className="mb-3 pt-1 flex-shrink-0 px-4 flex items-center justify-between">
//           <h1 className="text-xl font-bold text-gray-900">Manage company profile and security</h1>
//           <div className="flex items-center gap-3 mt-1">
//             {saveSuccess && (
//               <div className="flex items-center text-green-600">
//                 <CheckCircle className="h-3 w-3 mr-1" />
//                 <span className="text-xs font-medium">Saved!</span>
//               </div>
//             )}
//             <div className="flex space-x-1.5">
//               <button
//                 type="button"
//                 className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50 transition duration-200"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 form="settings-form"
//                 className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition duration-200 flex items-center"
//               >
//                 <Save className="h-3 w-3 mr-1" />
//                 Save
//               </button>
//             </div>
//           </div>
//         </div>

//         <form id="settings-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
//           <div className="h-full flex flex-col lg:flex-row gap-3">
//             {/* Left Column - Company Details */}
//             <div className="lg:flex-[2] flex flex-col space-y-3 h-full">
//               {/* Company Details Card */}
//               <div className="bg-white rounded-lg shadow-sm p-3 pt-1 flex-1 max-h-[300px] overflow-y-auto">
//                 <div className="flex items-center mb-3">
//                   <Building2 className="h-4 w-4 text-blue-600 mr-2" />
//                   <h2 className="text-base font-bold text-gray-900">Company Details</h2>
//                 </div>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-2">
//                   <div className="md:col-span-2">
//                     <label className="block text-xs font-medium text-gray-900 mb-1">
//                       Company Name *
//                     </label>
//                     <input
//                       type="text"
//                       name="name"
//                       value={companyDetails.name}
//                       onChange={handleCompanyChange}
//                       className={`w-full px-3 py-1.5 border text-xs rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none ${errors.companyName ? 'border-red-500' : 'border-gray-300'}`}
//                     />
//                     {errors.companyName && (
//                       <p className="text-red-600 text-xs mt-0.5">{errors.companyName}</p>
//                     )}
//                   </div>
                  
//                   <div>
//                     <label className="block text-xs font-medium text-gray-900 mb-1">
//                       Company Code *
//                     </label>
//                     <input
//                       type="text"
//                       name="code"
//                       value={companyDetails.code}
//                       onChange={handleCompanyChange}
//                       className={`w-full px-3 py-1.5 border text-xs rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none ${errors.companyCode ? 'border-red-500' : 'border-gray-300'}`}
//                     />
//                     {errors.companyCode && (
//                       <p className="text-red-600 text-xs mt-0.5">{errors.companyCode}</p>
//                     )}
//                   </div>
                  
//                   <div>
//                     <label className="block text-xs font-medium text-gray-900 mb-1">
//                       City
//                     </label>
//                     <input
//                       type="text"
//                       name="city"
//                       value={companyDetails.city}
//                       onChange={handleCompanyChange}
//                       className="w-full px-3 py-1.5 border border-gray-300 text-xs rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
//                     />
//                   </div>
                  
//                   <div className="md:col-span-2">
//                     <label className="block text-xs font-medium text-gray-900 mb-1">
//                       Address
//                     </label>
//                     <input
//                       type="text"
//                       name="address"
//                       value={companyDetails.address}
//                       onChange={handleCompanyChange}
//                       className="w-full px-3 py-1.5 border border-gray-300 text-xs rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
//                     />
//                   </div>
                  
//                   <div className="grid grid-cols-2 gap-2">
//                     <div>
//                       <label className="block text-xs font-medium text-gray-900 ">
//                         State
//                       </label>
//                       <input
//                         type="text"
//                         name="state"
//                         value={companyDetails.state}
//                         onChange={handleCompanyChange}
//                         className="w-full px-3 py-1.5 border border-gray-300 text-xs rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
//                       />
//                     </div>
                    
//                     <div>
//                       <label className="block text-xs font-medium text-gray-900">
//                         ZIP Code
//                       </label>
//                       <input
//                         type="text"
//                         name="zipCode"
//                         value={companyDetails.zipCode}
//                         onChange={handleCompanyChange}
//                         className="w-full px-3 py-1.5 border border-gray-300 text-xs rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>
              
//               {/* Contact Information Card */}
//               <div className="bg-white rounded-lg shadow-sm p-3 max-h-[200px] flex-1 overflow-y-auto">
//                 <div className="flex items-center mb-3">
//                   <Mail className="h-4 w-4 text-blue-600 mr-2" />
//                   <h2 className="text-base font-bold text-gray-900">Contact Information</h2>
//                 </div>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                   <div>
//                     <label className="block text-xs font-medium text-gray-900 mb-1">
//                       Email *
//                     </label>
//                     <div className="relative">
//                       <Mail className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
//                       <input
//                         type="email"
//                         name="email"
//                         value={contactInfo.email}
//                         onChange={handleContactChange}
//                         className={`w-full pl-8 pr-3 py-1.5 border text-xs rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
//                       />
//                     </div>
//                     {errors.email && (
//                       <p className="text-red-600 text-xs mt-0.5">{errors.email}</p>
//                     )}
//                   </div>
                  
//                   <div>
//                     <label className="block text-xs font-medium text-gray-900 mb-1">
//                       Phone
//                     </label>
//                     <div className="relative">
//                       <Phone className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
//                       <input
//                         type="text"
//                         name="phone"
//                         value={contactInfo.phone}
//                         onChange={handleContactChange}
//                         className="w-full pl-8 pr-3 py-1.5 border border-gray-300 text-xs rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
//                       />
//                     </div>
//                   </div>
                  
//                   <div className="md:col-span-2">
//                     <label className="block text-xs font-medium text-gray-900 mb-1">
//                       Website
//                     </label>
//                     <div className="relative">
//                       <Globe className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
//                       <input
//                         type="text"
//                         name="website"
//                         value={contactInfo.website}
//                         onChange={handleContactChange}
//                         className="w-full pl-8 pr-3 py-1.5 border border-gray-300 text-xs rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
//                         placeholder="example.com"
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
            
//             {/* Right Column - Logo & Password */}
//             <div className="lg:flex-1 flex flex-col space-y-3 h-full">
//               {/* Logo Upload Card */}
//               <div className="bg-white rounded-lg shadow-sm p-3 flex-shrink-0">
//                 <div className="flex items-center mb-3">
//                   <Upload className="h-4 w-4 text-blue-600 mr-2" />
//                   <h2 className="text-base font-bold text-gray-900">Company Logo</h2>
//                 </div>
                
//                 <div className="flex flex-col items-center">
//                   <div className="relative mb-2">
//                     <div className="w-20 h-20 rounded-lg border border-dashed border-gray-300 overflow-y-auto bg-gray-50 flex items-center justify-center">
//                       {logo ? (
//                         <img 
//                           src={logo} 
//                           alt="Company Logo" 
//                           className="w-full h-full object-cover"
//                         />
//                       ) : (
//                         <div className="text-gray-400">
//                           <Upload className="h-6 w-6 mx-auto" />
//                           <p className="mt-1 text-xs">Upload</p>
//                         </div>
//                       )}
//                     </div>
//                   </div>
                  
//  <div className="text-center w-full">
//                     <button
//                       type="button"
//                       onClick={triggerFileInput}
//                       className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition duration-200 flex items-center justify-center mx-auto w-full"
//                     >
//                       <Upload className="h-3 w-3 mr-1.5" />
//                       Upload Logo
//                     </button>
                    
//                     <input
//                       type="file"
//                       ref={fileInputRef}
//                       onChange={handleLogoUpload}
//                       accept=".jpg,.jpeg,.png"
//                       className="hidden"
//                     />
                    
//                     <p className="text-gray-500 text-xs mt-1">JPEG/PNG,  2MB</p>
                    
//                     {/* Logo Error */}
//                     {logoError && (
//                       <div className="mt-1 flex items-center justify-center text-red-600 text-xs">
//                         <AlertCircle className="h-3 w-3 mr-1" />
//                         {logoError}
//                       </div>
//                     )}
//                   </div>


//                 </div>
//               </div>
              
//               {/* Password Change Card */}
//               <div className="bg-white rounded-lg shadow-sm p-3 flex-1 max-h-[305px]">
//                 <div className="flex items-center mb-3">
//                   <Shield className="h-4 w-4 text-blue-600 mr-2" />
//                   <h2 className="text-base font-bold text-gray-900">Change Password</h2>
//                 </div>
                
//                 <div className="space-y-2.5">
//                   <div>
//                     <label className="block text-xs font-medium text-gray-900 mb-1">
//                       Current
//                     </label>
//                     <div className="relative">
//                       <Lock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
//                       <input
//                         type={showCurrentPassword ? "text" : "password"}
//                         name="currentPassword"
//                         value={passwordData.currentPassword}
//                         onChange={handlePasswordChange}
//                         className={`w-full pl-8 pr-8 py-1.5 border text-xs rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none ${errors.currentPassword ? 'border-red-500' : 'border-gray-300'}`}
//                       />
//                       <button
//                         type="button"
//                         onClick={() => setShowCurrentPassword(!showCurrentPassword)}
//                         className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-500"
//                       >
//                         {showCurrentPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
//                       </button>
//                     </div>
//                     {errors.currentPassword && (
//                       <p className="text-red-600 text-xs mt-0.5">{errors.currentPassword}</p>
//                     )}
//                   </div>
                  
//                   <div>
//                     <label className="block text-xs font-medium text-gray-900 mb-1">
//                       New Password
//                     </label>
//                     <div className="relative">
//                       <Lock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
//                       <input
//                         type={showNewPassword ? "text" : "password"}
//                         name="newPassword"
//                         value={passwordData.newPassword}
//                         onChange={handlePasswordChange}
//                         className={`w-full pl-8 pr-8 py-1.5 border text-xs rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none ${errors.newPassword ? 'border-red-500' : 'border-gray-300'}`}
//                       />
//                       <button
//                         type="button"
//                         onClick={() => setShowNewPassword(!showNewPassword)}
//                         className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-500"
//                       >
//                         {showNewPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
//                       </button>
                      
//                     </div>
                    
//                     {/* Password strength indicator */}
//                     {passwordData.newPassword && (
//                       <div className="mt-1">
//                         <div className="flex justify-between mb-0.5">
//                           <span className="text-xs text-gray-900">Strength</span>
//                           <span className={`text-xs font-medium ${
//                             passwordData.newPassword.length >= 8 ? 'text-green-500' : 
//                             passwordData.newPassword.length >= 6 ? 'text-yellow-500' : 'text-red-500'
//                           }`}>
//                             {passwordData.newPassword.length >= 8 ? 'Strong' : 
//                              passwordData.newPassword.length >= 6 ? 'Medium' : 'Weak'}
//                           </span>
//                         </div>
//                         <div className="h-1 w-full bg-gray-200 rounded-full overflow-y-auto">
//                           <div 
//                             className={`h-full ${
//                               passwordData.newPassword.length >= 8 ? 'bg-green-500' : 
//                               passwordData.newPassword.length >= 6 ? 'bg-yellow-500' : 'bg-red-500'
//                             } transition-all duration-300`}
//                             style={{ width: `${Math.min(passwordData.newPassword.length * 12, 100)}%` }}
//                           ></div>
//                         </div>
//                       </div>
//                     )}
                    
//                     {errors.newPassword && (
//                       <p className="text-red-600 text-xs mt-0.5">{errors.newPassword}</p>
//                     )}
//                   </div>
                  
//                   <div>
//                     <label className="block text-xs font-medium text-gray-900 mb-1">
//                       Confirm
//                     </label>
//                     <div className="relative">
//                       <Lock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
//                       <input
//                         type={showConfirmPassword ? "text" : "password"}
//                         name="confirmPassword"
//                         value={passwordData.confirmPassword}
//                         onChange={handlePasswordChange}
//                         className={`w-full pl-8 pr-8 py-1.5 border text-xs rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
//                       />
//                       <button
//                         type="button"
//                         onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                         className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-500"
//                       >
//                         {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
//                       </button>
//                     </div>
//                     {errors.confirmPassword && (
//                       <p className="text-red-600 text-xs mt-0.5">{errors.confirmPassword}</p>
//                     )}
//                   </div>
//                        <div className="pt-2">
//                     <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
//                       <p className="text-xs text-blue-800 flex items-start">
//                         <AlertCircle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 mt-0.5" />
//                         Password must be at least 8 characters long with uppercase, numbers, and special characters.
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
              
//               {/* Save Button Card */}
             
//             </div>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Settings;  

// AccountSettingsPage.tsx

import React, { useState } from "react";
import { User, Lock, Palette } from "lucide-react";
import ProfileSettings from "./components/ProfileSettings";
import PasswordSettings from "./components/PasswordSettings";
import Theme from "./components/Theme";

type TabType = "profile" | "password" | "Theme";

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "password", label: "Password", icon: Lock },
    { id: "Theme", label: "Theme", icon: Palette },
  ];

  const getHeaderTitle = () => {
    switch (activeTab) {
      case "profile":
        return "Manage company profile";
      case "password":
        return "Password Settings";
      case "Theme":
        return "Theme Settings";
      default:
        return "Settings";
    }
  };

  return (
    <div className="h-full">
      {/* Header */}
      <div className=" px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left Title */}
          <h1 className="text-2xl font-bold text-gray-800">
            {getHeaderTitle()}
          </h1>

          {/* Right Tabs */}
          <nav className="flex items-center gap-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? "border-[#7CA1F3] text-[#7CA1F3]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="">
        {activeTab === "profile" && <ProfileSettings activeTab={activeTab} />}
        {activeTab === "password" && <PasswordSettings activeTab={activeTab} />}
        {activeTab === "Theme" && <Theme />}
      </div>
    </div>
  );
};

export default Settings;
