import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Premium page now redirects to Academy Store
// All premium content is centralized in /learn/store
export default function Premium() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to Academy Store
    navigate("/learn/store", { replace: true });
  }, [navigate]);

  return null;
}
