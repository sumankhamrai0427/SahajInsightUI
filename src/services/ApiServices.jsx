import axios from "axios";
import { GET_APIS, POST_APIS } from "../../connection";
class ApiServices {
  login(body) {
    return axios.post(POST_APIS.login, body);
  }

  getUiData(body) {
    return axios.post(POST_APIS.get_ui_data, body);
  }
  // ---- RAG Chat APIs ----
  ragChat(body) {
    return axios.post(POST_APIS.rag_chat, body);
  }
  saveRagChat(body) {
    return axios.post(POST_APIS.save_rag_chat, body);
  }
  getRagChatHistory(body) {
    return axios.post(POST_APIS.get_rag_chat_history, body);
  }

  // ---- SQL & Unified Chat APIs ----
  chat(body) {
    return axios.post(POST_APIS.chat_ai, body);
  }
  unifiedChat(body) {
    return axios.post(POST_APIS.unified_chat, body);
  }
  llmWebSearch(body) {
    return axios.post(POST_APIS.llm_web_search, body);
  }

  executeSql(body) {
    return axios.post(POST_APIS.execute_sql, body);
  }

  // For file upload (FormData)
  fileUpload(formData) {
    return axios.post(POST_APIS.fileUpload, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  }

  // For preview (JSON)
  preview(payload) {
    return axios.post(POST_APIS.fileUpload, payload, {
      headers: { "Content-Type": "application/json" }
    });
  }


  processSessionData(body) {
    return axios.post(POST_APIS.processSessionData, body);
  }

  saveChat(body) {
    return axios.post(POST_APIS.save_chat, body);
  }

  tracker(body) {
    return axios.post(POST_APIS.tracker, body);
  }


  getDashboardData(body) {
    return axios.post(POST_APIS.get_dashboard_data, body);
  }

  getChatHistory(body) {
    return axios.post(POST_APIS.get_chat_history, body);
  }

  getSavedQueryResponse(body) {
    return axios.post(POST_APIS.get_saved_query_response, body);
  }

  getTableData(body) {
    return axios.post(POST_APIS.get_table_data, body);
  }
  getReportList(body) {
    return axios.post(POST_APIS.get_report_list, body);
  }

  report_save(body) {
    return axios.post(POST_APIS.report_save, body);
  }

  deleteUploadedFile(body) {
    return axios.post(POST_APIS.delete_uploaded_file, body);
  }

  updateUploadedFile(body) {
    return axios.post(POST_APIS.update_uploaded_file, body);
  }


  getUploadProgress(body) {
    return axios.post(POST_APIS.upload_progress, body);
  }
  superAdminLogin(body) {
    return axios.post(POST_APIS.super_admin_login, body);
  }
  getAllCompanies() {
    return axios.get(GET_APIS.get_all_companies);
  }
  adminCompanyDelete(body) {
    return axios.post(POST_APIS.admin_company_delete, body);
  }
  modifyChart(body) {
    return axios.post(POST_APIS.modify_chart, body);
  }
  getAllCompanyAdmins() {
    return axios.get(GET_APIS.get_all_company_admins);
  }
  // companyRegister(formData) {
  //   return axios.post(POST_APIS.company_register, formData, {
  //     headers: {
  //       "Content-Type": "multipart/form-data",
  //     },
  //   });
  // }

  companyRegister(body){
    return axios.post(POST_APIS.company_register, body);
  }
  company_admin_register(body) {
    return axios.post(POST_APIS.company_admin_register, body);
  }
  company_code_dropdown() {
    return axios.get(GET_APIS.company_code_dropdown);
  }
  getCompanyUsers(body) {
    return axios.post(POST_APIS.company_get_users, body);
  }
  companyUserRegister(body) {
    return axios.post(POST_APIS.company_user_register, body);
  }
  contactUs(body) {
  return axios.post(POST_APIS.contact_us, body);
  }

  getCountryList() {
    return axios.get(GET_APIS.country_list);
  }
  uploadCompanyLogo(formData) {
  return axios.post(POST_APIS.logo, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

createSEO(body){
  return axios.post(POST_APIS.createSEO, body);
}
getSEOlist(){
  return axios.get(GET_APIS.getSEOlist);
}
updateSEO(body){
  return axios.post(POST_APIS.updateSEO, body);
}

  deleteSEO(body) {
    return axios.post(POST_APIS.deleteSEO, body);
  }
  getSEOByPath(path) {
    return axios.get(
      `${GET_APIS.getSEObyPath}?path=${encodeURIComponent(path)}`
    );
  }

  listWorkspaces(body) {
    return axios.post(POST_APIS.list_workspaces, body);
  }
  createWorkspace(body) {
    return axios.post(POST_APIS.create_workspace, body);
  }
  assignUserWorkspace(body) {
    return axios.post(POST_APIS.assign_user_workspace, body);
  }
  getAssignedUsersWorkspace(body) {
    return axios.post(POST_APIS.assigned_users_workspace, body);
  }
  getUserWorkspaces(body) {
    return axios.post(POST_APIS.user_workspaces, body);
  }
  getAllUsersWorkspace(body) {
    return axios.post(POST_APIS.all_users_workspace, body);
  }
  summarizeSources(body) {
    return axios.post(POST_APIS.summarize_sources, body);
  }
  ingestSelectedSources(body) {
    return axios.post(POST_APIS.rag_ingest_selected, body);
  }
  suggestWorkspaceQuestions(body) {
    return axios.post(POST_APIS.suggest_workspace_questions, body);
  }
}

export default new ApiServices();
