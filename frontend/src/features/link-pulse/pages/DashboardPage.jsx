import { useAuth } from "../../auth/hook/useAuth.js";
import { AdminDashboardPage } from "../components/AdminDashboard.jsx";
import { LinkPulseDashboardPage } from "./LinkPulseDashboardPage.jsx";

function DashboardPage() {
  const { user } = useAuth();
  return user.role === "admin" ? (
    <AdminDashboardPage />
  ) : (
    <LinkPulseDashboardPage />
  );
}

export { DashboardPage };
