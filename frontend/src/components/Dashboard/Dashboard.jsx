import AdminDashboard from "./AdminDashboard";
import ClientDashboard from "./ClientDashboard";

const Dashboard = ({ token, username, role }) => {
  // Ако е админ, показваме новия админ панел (календар + списък)
  if (role === "admin") {
    return <AdminDashboard token={token} />;
  }
  // Ако е клиент, показваме стандартната версия за запазване на час
  return <ClientDashboard token={token} username={username} />;
};

export default Dashboard;
