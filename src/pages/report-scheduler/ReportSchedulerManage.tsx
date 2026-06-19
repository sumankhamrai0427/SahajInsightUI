import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import { MdOutlineHourglassEmpty } from "react-icons/md";
import { AuthProvider, useAuth } from "../Auth/AuthContext";
import ApiServices from "../../services/ApiServices";

const ReportSchedulerManage = () => {
  const navigate = useNavigate();
  const [globalFilter, setGlobalFilter] = useState("");
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { downloadData, setDownloadData } = useAuth();





  const getStoredUser = () => {
    try {
      const raw = localStorage.getItem("ig_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const getDateTime = (value: string) => {
    const d = new Date(value);
    return {
      date: d.toLocaleDateString(),
      time: d.toLocaleTimeString(),
    };
  };

  useEffect(() => {
    fetchReportList();
  }, []);

  const fetchReportList = async () => {
    try {
      setLoading(true);

      const user = getStoredUser();

      if (!user?.session_id || !user?.user_id) {
        console.error("Session or User ID missing");
        return;
      }

      const payload = {
        session_id: user.session_id,
        created_by: user.user_id,
      };

      const response = await ApiServices.getReportList(payload);

      console.log("📥 Full API Response:", response);
      console.log("📥 Response Data:", response?.data);

      setReports(response?.data?.data?.["Report list"] || []);
    } catch (error) {
      console.error("Report list error:", error);
    } finally {
      setLoading(false);
    }
  };



  // const filteredQueries = queries.filter((q) =>
  //   Object.values(q).some((v) =>
  //     String(v).toLowerCase().includes(globalFilter.toLowerCase())
  //   )
  // );

  const filteredReports = reports.filter((r) =>
    Object.values(r).some((v) =>
      String(v).toLowerCase().includes(globalFilter.toLowerCase())
    )
  );







  return (
    <div className="mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        {/* Left Side */}
        <div className="flex items-center gap-8">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 leading-tight">
              Report Scheduler
            </h1>
            <p className="text-sm text-gray-500 mt-1 whitespace-nowrap">
              Start by uploading a data file to create your first view.
            </p>
          </div>

          <div className="">
            <button
              className="px-4 py-2 bg-blue-400  hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center"
              onClick={() => navigate("/layout/report-scheduler-form")}
            >
              Create Schedule
            </button>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <input
              type="text"
              placeholder="Global Search"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 
                         focus:bg-white focus:ring-2 focus:ring-[#5433FF] outline-none transition-all"
              style={{ width: "568px", height: "45px" }}
            />
          </div>

          {/* Refresh Button */}
          <button
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 
                             bg-gray-50 hover:bg-gray-100 transition-all"
          >
            <AutorenewRoundedIcon
              className="w-5 h-5 text-gray-500"
              fontSize="small"
            />
          </button>
        </div>
      </div>

      {/* <DownloadView data={downloadData} /> */}
      {/* Table Section */}
      {loading ? (
        <div className="flex justify-center py-24 text-gray-500">
          <AutorenewRoundedIcon className="animate-spin" fontSize="small" />
        </div>
      ) : filteredReports.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-5 py-3 text-left">Report Name</th>
                <th className="px-5 py-3 text-left">Schedule Name</th>
                <th className="px-5 py-3 text-left">Schedule on</th>
                <th className="px-5 py-3 text-left">Rows</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredReports.map((item) => {
                const { date, time } = getDateTime(item.created_at);

                return (
                  <tr key={item.report_id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-xs">
                      {item.report_name}
                    </td>

                    <td className="px-6 py-3 text-xs text-gray-600">
                      {date}
                    </td>

                    <td className="px-6 py-3 text-xs text-gray-600">
                      {time}
                    </td>

                    <td className="px-6 py-3 text-xs text-gray-600">
                      {item.row_affected}
                    </td>

                    <td className="px-6 py-3">
                      <div className="flex justify-end gap-2">




                        {/* <button
                          className="text-green-600 bg-green-100 px-3 py-1 rounded-full text-xs"
                          onClick={() =>
                            navigate("/layout/report-designer-view", {
                              state: { report_id: item.report_id },
                            })
                          }
                        >
                          Edit
                        </button> */}
                        <button
                          className="text-green-600 bg-green-100 px-3 py-1 rounded-full text-xs"
                          onClick={() => {
                            console.log(" Edit Report Data:", item);

                            navigate("/layout/report-designer-view", {
                              state: { report: item },
                            });
                          }}
                        >
                          Edit
                        </button>

                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[300px]">
          <MdOutlineHourglassEmpty size={40} className="text-gray-400" />
          <p className="text-gray-500 mt-2">Empty Schedule List</p>
        </div>
      )}
    </div>
  );
};

export default ReportSchedulerManage;
