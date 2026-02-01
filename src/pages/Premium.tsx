import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Premium page now redirects to Academy Store tab
export default function Premium() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/learn?type=store", { replace: true });
  }, [navigate]);

  return null;
}
