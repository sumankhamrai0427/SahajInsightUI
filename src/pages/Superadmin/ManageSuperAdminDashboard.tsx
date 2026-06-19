import { ConstructionIcon } from 'lucide-react'
import React from 'react'

function ManageSuperAdminDashboard() {
  return (
    <div className="h-full py-24 flex flex-col items-center justify-center text-slate-900 dark:text-white p-4">
      <ConstructionIcon style={{ fontSize: 80 }} className="text-[#7CA1F3] mb-6" />
      <h1 className="text-4xl font-bold mb-4 text-center">Under Development</h1>
      <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 text-center max-w-md">
        This Page is under development for now. Please check back later!
      </p>
    </div>
  )
}

export default ManageSuperAdminDashboard

