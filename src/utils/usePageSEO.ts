import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ApiServices from "../services/ApiServices";

export default function usePageSEO() {
  const location = useLocation();
  const [seo, setSeo] = useState<any>(null);

  useEffect(() => {
    ApiServices.getSEOByPath(location.pathname)
      .then((res) => {
        setSeo(res.data?.data || null); // no fallback
      })
      .catch(() => setSeo(null));
  }, [location.pathname]);

  return seo;
}
