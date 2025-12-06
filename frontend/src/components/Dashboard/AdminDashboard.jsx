import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../../utils/config";
import toast from "react-hot-toast";
import ClientCalendar from "../ClientCalendar";

const AdminDashboard = ({ token }) => {
  const [allApps, setAllApps] = useState([]);
  const [acceptingNew, setAcceptingNew] = useState(true);
  const [adminView, setAdminView] = useState("calendar"); // 'calendar' or 'list'
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchAll = async () => {
    try {
      const res = await axios.get(`${API}/admin/all`, {
        headers: { Authorization: token },
      });
      setAllApps(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API}/settings`);
      setAcceptingNew(res.data.acceptingNewClients);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAll();
    fetchSettings();
  }, [token]);

  const markNoShow = async (id) => {
    if (!window.confirm("Сигурен ли си?")) return;
    try {
      await axios.post(
        `${API}/admin/noshow`,
        { id },
        { headers: { Authorization: token } }
      );
      toast.success("Маркирано");
      fetchAll();
    } catch (err) {}
  };

  const toggleRegistration = async () => {
    try {
      const res = await axios.post(
        `${API}/admin/toggle-registration`,
        {},
        { headers: { Authorization: token } }
      );
      setAcceptingNew(res.data.acceptingNewClients);
      toast.success(
        res.data.acceptingNewClients
          ? "Регистрациите са ОТВОРЕНИ"
          : "Регистрациите са ЗАТВОРЕНИ"
      );
    } catch (err) {
      toast.error("Грешка при промяна на настройките");
    }
  };

  const getAppsForDate = (date) => {
    return allApps
      .filter((app) => {
        const appDate = new Date(app.date);
        return (
          appDate.getDate() === date.getDate() &&
          appDate.getMonth() === date.getMonth() &&
          appDate.getFullYear() === date.getFullYear()
        );
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setAdminView("list");
  };

  const changeDay = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const dailyApps = getAppsForDate(selectedDate);

  return (
    <div className="animate-fade-in max-w-6xl mx-auto px-4 py-8">
      {/* --- КОНТРАСТЕН КОНТЕЙНЕР ЗА НАСТРОЙКИ --- */}
      <div
        className={`mb-10 p-6 rounded-xl border-l-4 flex flex-col md:flex-row justify-between items-center gap-6 transition-all duration-300 ${
          acceptingNew
            ? "bg-zinc-800 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.1)]"
            : "bg-zinc-800 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-full ${
              acceptingNew ? "bg-green-500/10" : "bg-red-500/10"
            }`}
          >
            {/* Икона според статуса */}
            <span className="text-2xl">{acceptingNew ? "🔓" : "🔒"}</span>
          </div>
          <div>
            <h3
              className={`text-xl font-bold ${
                acceptingNew ? "text-green-400" : "text-red-400"
              }`}
            >
              {acceptingNew
                ? "Регистрациите са ОТВОРЕНИ"
                : "Регистрациите са ЗАТВОРЕНИ"}
            </h3>
            <p className="text-zinc-400 text-sm mt-1">
              {acceptingNew
                ? "Нови клиенти могат да си записват часове."
                : "Достъпът за нови потребители е временно спрян."}
            </p>
          </div>
        </div>

        <button
          onClick={toggleRegistration}
          className={`px-8 py-3 rounded-lg font-bold transition flex items-center gap-2 shadow-lg border ${
            acceptingNew
              ? "bg-transparent border-green-600 text-green-500 hover:bg-green-600 hover:text-white"
              : "bg-transparent border-red-600 text-red-500 hover:bg-red-600 hover:text-white"
          }`}
        >
          {acceptingNew ? "ЗАТВОРИ ДОСТЪПА" : "ОТВОРИ ДОСТЪПА"}
        </button>
      </div>

      {/* УСЛОВЕН РЕНДЪР: КАЛЕНДАР ИЛИ СПИСЪК */}
      {adminView === "calendar" ? (
        <div
          className="flex flex-col items-center animate-fade-in"
          style={{ paddingBottom: "150px" }}
        >
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white uppercase tracking-widest">
              ГРАФИК
            </h3>
            <p className="text-amber-500 text-sm font-mono mt-1">
              ИЗБЕРИ ДАТА ЗА ПРЕГЛЕД
            </p>
          </div>

          {/* --- КОНТРАСТЕН КОНТЕЙНЕР ЗА КАЛЕНДАРА --- */}
          <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-700 w-full max-w-lg shadow-[0_20px_50px_-12px_rgba(0,0,0,0.7)] hover:border-zinc-600 transition-colors">
            <ClientCalendar onChange={handleDateClick} value={selectedDate} />

            <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-center text-xs text-zinc-500">
              <span>📅 Кликни на ден, за да видиш записаните часове</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-fade-in">
          {/* НАВИГАЦИЯ ЗА ДЕНЯ */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setAdminView("calendar")}
              className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700 transition flex items-center gap-2 border border-zinc-700"
            >
              ⬅ Обратно към календара
            </button>
          </div>

          <div className="bg-zinc-900 rounded-xl overflow-hidden shadow-2xl border border-zinc-700">
            {/* Header на деня със стрелки */}
            <div className="bg-zinc-950 p-6 flex justify-between items-center border-b border-zinc-800">
              <button
                onClick={() => changeDay(-1)}
                className="text-amber-500 text-4xl hover:bg-zinc-900 rounded px-4 transition pb-2"
              >
                ‹
              </button>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white uppercase tracking-wide">
                  {selectedDate.toLocaleDateString("bg-BG", {
                    weekday: "long",
                  })}
                </h3>
                <p className="text-zinc-400">
                  {selectedDate.toLocaleDateString("bg-BG", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <button
                onClick={() => changeDay(1)}
                className="text-amber-500 text-4xl hover:bg-zinc-900 rounded px-4 transition pb-2"
              >
                ›
              </button>
            </div>

            {dailyApps.length === 0 ? (
              <div className="p-20 text-center bg-zinc-900">
                <div className="text-7xl mb-4 opacity-10 grayscale">📅</div>
                <p className="text-zinc-500 italic text-lg">
                  Няма записани часове за тази дата.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-zinc-300">
                  <thead className="bg-zinc-950 text-zinc-500 uppercase text-xs tracking-wider font-semibold">
                    <tr>
                      <th className="p-5 pl-8">Час</th>
                      <th className="p-5">Клиент</th>
                      <th className="p-5">Услуга</th>
                      <th className="p-5">Статус</th>
                      <th className="p-5 text-right pr-8">Действие</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 bg-zinc-900">
                    {dailyApps.map((app) => {
                      const dateObj = new Date(app.date);
                      return (
                        <tr
                          key={app._id}
                          className="hover:bg-zinc-800 transition group"
                        >
                          <td className="p-5 pl-8 font-mono text-xl text-white font-bold border-l-4 border-transparent group-hover:border-amber-500 transition-all">
                            {dateObj.toLocaleTimeString("bg-BG", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="p-5">
                            <div className="font-bold text-white text-lg">
                              {app.clientName || "Неизвестен"}
                            </div>
                            <div className="text-xs text-zinc-500 mt-1">
                              @{app.username}
                            </div>
                          </td>
                          <td className="p-5 text-zinc-300">
                            {app.serviceType === "full"
                              ? "Коса+Брада"
                              : "Подстригване"}
                          </td>
                          <td className="p-5">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                app.status === "active"
                                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                  : app.status === "cancelled"
                                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                  : app.status === "noshow"
                                  ? "bg-zinc-700 text-zinc-400 border border-zinc-600 line-through decoration-zinc-400"
                                  : "bg-gray-800 text-gray-400"
                              }`}
                            >
                              {app.status === "active"
                                ? "АКТИВЕН"
                                : app.status === "cancelled"
                                ? "ОТМЕНЕН"
                                : app.status === "noshow"
                                ? "НЕ СЕ ЯВИ"
                                : app.status}
                            </span>
                          </td>
                          <td className="p-5 pr-8 text-right">
                            {app.status === "active" && (
                              <button
                                onClick={() => markNoShow(app._id)}
                                className="text-xs font-bold text-red-400 hover:text-white border border-red-900 hover:bg-red-600 px-3 py-2 rounded transition shadow opacity-50 group-hover:opacity-100"
                              >
                                НЕ СЕ ЯВИ
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
