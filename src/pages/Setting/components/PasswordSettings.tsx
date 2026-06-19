import React, { useState } from 'react';
import { useForm, Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import ConstructionIcon from '@mui/icons-material/Construction';
import * as yup from 'yup';
import { Eye, EyeOff, Lock, Save, CheckCircle } from 'lucide-react';
const schema = yup.object({
  currentPassword: yup.string().required('Current password is required').min(6, 'Password must be at least 6 characters'),
  newPassword: yup.string().required('New password is required').min(8, 'Password must be at least 8 characters'),
  confirmPassword: yup.string()
    .required('Please confirm your password')
    .oneOf([yup.ref('newPassword')], 'Passwords must match'),
});
type FormData = yup.InferType<typeof schema>;
interface PasswordSettingsProps {
  activeTab: string;
}
const PasswordSettings: React.FC<PasswordSettingsProps> = ({ activeTab }) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema) as unknown as Resolver<FormData>,
  });
  const onSubmit = async (data: FormData) => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Password data:', data);
    setIsSaving(false);
    setIsSuccess(true);
    reset();
    setTimeout(() => setIsSuccess(false), 3000);
  };
  if (activeTab !== 'password') return null;
   return (
    // <div className="max-w-8xl h-full overflow-y-auto px-6">
    //   <div className=" overflow-y-auto ">
    //     <p className="text-gray-600 pb-2">Update your password to keep your account secure</p>
    //   </div>
    //   {isSuccess && (
    //     <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
    //       <CheckCircle className="text-green-600" size={20} />
    //       <span className="text-green-800">Password updated successfully!</span>
    //     </div>
    //   )}
    //   <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
    //     <div className=" rounded-xl mb-6">
    //       <div className="flex items-center justify-between mb-4 pt-5">
    //         <h3 className="text-lg font-semibold text-gray-800">Change Password</h3>
    //         <button
    //           type="submit"
    //           disabled={isSaving}
    //           className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
    //         >
    //           <Save size={18} />
    //           {isSaving ? 'Updating...' : 'Update Password'}
    //         </button>
    //       </div>
          
    //       <div className="space-y-3">
    //         {/* Current Password */}
    //         <div>
    //           <label className="block text-sm font-medium text-gray-700 mb-2">
    //             Current Password *
    //           </label>
    //           <div className="relative">
    //             <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
    //               <Lock size={18} className="text-gray-400" />
    //             </div>
    //             <input
    //               type={showCurrentPassword ? 'text' : 'password'}
  
    //               className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
    //                 errors.currentPassword ? 'border-red-300' : 'border-gray-300'
    //               }`}
    //               placeholder="Enter your current password"
    //             />
    //             <button
    //               type="button"
    //               onClick={() => setShowCurrentPassword(!showCurrentPassword)}
    //               className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
    //             >
    //               {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
    //             </button>
    //           </div>
    //           {errors.currentPassword && (
    //             <p className="mt-1 text-sm text-red-600">{errors.currentPassword.message}</p>
    //           )}
    //         </div>

    //         {/* New Password */}
    //         <div>
    //           <label className="block text-sm font-medium text-gray-700 mb-2">
    //             New Password *
    //           </label>
    //           <div className="relative">
    //             <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
    //               <Lock size={18} className="text-gray-400" />
    //             </div>
    //             <input
    //               type={showNewPassword ? 'text' : 'password'}
          
    //               className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
    //                 errors.newPassword ? 'border-red-300' : 'border-gray-300'
    //               }`}
    //               placeholder="Enter your new password"
    //             />
    //             <button
    //               type="button"
    //               onClick={() => setShowNewPassword(!showNewPassword)}
    //               className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
    //             >
    //               {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
    //             </button>
    //           </div>
    //           {errors.newPassword && (
    //             <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
    //           )}
    //           <div className="mt-2 text-sm text-gray-500">
    //             Password must be at least 8 characters long
    //           </div>
    //         </div>

    //         {/* Confirm Password */}
    //         <div>
    //           <label className="block text-sm font-medium text-gray-700 mb-2">
    //             Confirm New Password *
    //           </label>
    //           <div className="relative">
    //             <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
    //               <Lock size={18} className="text-gray-400" />
    //             </div>
    //             <input
    //               type={showConfirmPassword ? 'text' : 'password'}
    
    //               className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
    //                 errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
    //               }`}
    //               placeholder="Confirm your new password"
    //             />
    //             <button
    //               type="button"
    //               onClick={() => setShowConfirmPassword(!showConfirmPassword)}
    //               className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
    //             >
    //               {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
    //             </button>
    //           </div>
    //           {errors.confirmPassword && (
    //             <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
    //           )}
    //         </div>
    //       </div>
    //     </div>
    //   </form>
    // </div>
    <div className="h-full py-24 flex flex-col items-center justify-center text-slate-900 dark:text-white p-4">
      <ConstructionIcon style={{ fontSize: 80 }} className="text-[#7CA1F3] mb-6" />
      <h1 className="text-4xl font-bold mb-4 text-center">Under Development</h1>
      <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 text-center max-w-md">
        We are working hard to bring you this feature. Please check back later!
      </p>
    </div>
  );
};

export default PasswordSettings;