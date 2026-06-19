import React, { useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useFormik } from "formik";
import ApiServices from "../../services/ApiServices";

/* ================= TYPES ================= */

interface SEOFormValues {
  seo_title: string;
  target_keyword: string;
  meta_description: string;
  page_path: string;
}

/* ================= COMPONENT ================= */

function AddSEO() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();

  /* ================= FORMIK ================= */

  const formik = useFormik<SEOFormValues>({
    initialValues: {
      seo_title: "",
      target_keyword: "",
      meta_description: "",
      page_path: "",
    },

    validate: (values) => {
      const errors: Partial<SEOFormValues> = {};

      if (!values.seo_title.trim()) {
        errors.seo_title = "SEO Title is required";
      }

      if (!values.target_keyword.trim()) {
        errors.target_keyword = "Keyword is required";
      }

      if (!values.meta_description.trim()) {
        errors.meta_description = "Description is required";
      }

      if (!values.page_path.trim()) {
        errors.page_path = "Page path is required";
      }

      return errors;
    },

    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          ...values,
          page_path: values.page_path.startsWith("/")
            ? values.page_path.trim()
            : `/${values.page_path.trim()}`,
        };

        if (id) {
          await ApiServices.updateSEO({
            id,
            ...payload,
          });
        } else {
          await ApiServices.createSEO(payload);
        }

        navigate("/layout/manage-seo");
      } catch (error) {
        console.error("SEO save failed", error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  /* ================= PREFILL (EDIT MODE) ================= */

  useEffect(() => {
    if (location.state?.seo) {
      formik.setValues({
        seo_title: location.state.seo.seo_title || "",
        target_keyword: location.state.seo.target_keyword || "",
        meta_description: location.state.seo.meta_description || "",
        page_path: location.state.seo.page_path || "",
      });
    }
  }, [location.state]);

  /* ================= UI ================= */

  return (
    <div className="px-6 py-8">
      <h1 className="text-xl font-semibold mb-6">
        {id ? "Edit SEO" : "Add SEO"}
      </h1>

      <form onSubmit={formik.handleSubmit}>
        <div className="bg-white rounded-xl space-y-6">
          {/* ROW 1: SEO TITLE + PAGE PATH */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SEO TITLE */}
            <div>
              <label className="block text-sm font-medium mb-1">
                SEO Title <span className="text-red-500">*</span>
              </label>
              <input
                name="seo_title"
                type="text"
                placeholder="Enter SEO title"
                value={formik.values.seo_title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full h-10 px-4 rounded-lg border text-sm
                  ${
                    formik.touched.seo_title && formik.errors.seo_title
                      ? "border-red-500"
                      : "border-[#D9D9D9]"
                  }
                  focus:ring-1 focus:ring-[#5433FF]`}
              />
              {formik.touched.seo_title && formik.errors.seo_title && (
                <p className="text-xs text-red-500 mt-1">
                  {formik.errors.seo_title}
                </p>
              )}
            </div>

            {/* PAGE PATH */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Page Path <span className="text-red-500">*</span>
              </label>
              <input
                name="page_path"
                type="text"
                placeholder="Enter page path"
                value={formik.values.page_path}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full h-10 px-4 rounded-lg border text-sm
                  ${
                    formik.touched.page_path && formik.errors.page_path
                      ? "border-red-500"
                      : "border-[#D9D9D9]"
                  }
                  focus:ring-1 focus:ring-[#5433FF]`}
              />
              {formik.touched.page_path && formik.errors.page_path && (
                <p className="text-xs text-red-500 mt-1">
                  {formik.errors.page_path}
                </p>
              )}
            </div>
          </div>

          {/* KEYWORD (FULL WIDTH) */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Keyword <span className="text-red-500">*</span>
            </label>
            <input
              name="target_keyword"
              type="text"
              placeholder="Enter target keyword"
              value={formik.values.target_keyword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full h-10 px-4 rounded-lg border text-sm
                ${
                  formik.touched.target_keyword &&
                  formik.errors.target_keyword
                    ? "border-red-500"
                    : "border-[#D9D9D9]"
                }
                focus:ring-1 focus:ring-[#5433FF]`}
            />
            {formik.touched.target_keyword &&
              formik.errors.target_keyword && (
                <p className="text-xs text-red-500 mt-1">
                  {formik.errors.target_keyword}
                </p>
              )}
          </div>

          {/* DESCRIPTION (FULL WIDTH) */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="meta_description"
              rows={4}
              placeholder="Enter meta description"
              value={formik.values.meta_description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full px-4 py-2 rounded-lg border text-sm resize-none
                ${
                  formik.touched.meta_description &&
                  formik.errors.meta_description
                    ? "border-red-500"
                    : "border-[#D9D9D9]"
                }
                focus:ring-1 focus:ring-[#5433FF]`}
            />
            {formik.touched.meta_description &&
              formik.errors.meta_description && (
                <p className="text-xs text-red-500 mt-1">
                  {formik.errors.meta_description}
                </p>
              )}
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex justify-between gap-3 pt-2">
            {/* CANCEL */}
            <button
              type="button"
              onClick={() => navigate("/layout/manage-seo")}
              className="h-10 px-6 rounded-lg border text-gray-600 text-sm hover:bg-gray-100"
            >
              Cancel
            </button>

            {/* SAVE / UPDATE */}
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className={`px-6 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                flex items-center justify-center gap-2
                ${
                  formik.isSubmitting
                    ? "opacity-70 cursor-not-allowed"
                    : ""
                }
              `}
            >
              {formik.isSubmitting
                ? id
                  ? "Updating..."
                  : "Saving..."
                : id
                ? "Update SEO"
                : "Add SEO"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AddSEO;