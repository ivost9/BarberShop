import React, { useState, useEffect } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";

// ВГРАДЕН КАЛЕНДАР (за да няма грешки с външни библиотеки)
// FIX: Използваме директен URL или безопасна проверка, за да избегнем "process is not defined"
const API =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://barbershop-f3qp.onrender.com/api";

const theme = {
  bg: "min-h-screen bg-zinc-900 text-zinc-100 font-sans",
  card: "bg-zinc-800 p-6 rounded-xl shadow-xl border border-zinc-700",
  btnPrimary:
    "bg-amber-500 hover:bg-amber-600 text-zinc-900 font-bold py-2 px-4 rounded transition",
  btnDanger:
    "bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-sm",
  btnSecondary:
    "bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-2 px-4 rounded transition",
  input:
    "w-full bg-zinc-700 border-none rounded p-3 mb-4 text-white focus:ring-2 focus:ring-amber-500",
  header:
    "text-3xl font-bold text-amber-500 mb-6 text-center tracking-wider uppercase",
};

// --- CUSTOM CALENDAR COMPONENT ---
const SimpleCalendar = ({ value, onChange }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(value));

  const daysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const startDayOfMonth = (date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const changeMonth = (offset) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentMonth(newDate);
  };

  const handleDateClick = (day) => {
    const newDate = new Date(currentMonth);
    newDate.setDate(day);
    onChange(newDate);
  };

  const renderDays = () => {
    const totalDays = daysInMonth(currentMonth);
    const startDay = startDayOfMonth(currentMonth);
    const days = [];

    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    for (let i = 1; i <= totalDays; i++) {
      const dateToCheck = new Date(currentMonth);
      dateToCheck.setDate(i);

      const isSelected =
        value.getDate() === i &&
        value.getMonth() === currentMonth.getMonth() &&
        value.getFullYear() === currentMonth.getFullYear();

      const isToday =
        new Date().getDate() === i &&
        new Date().getMonth() === currentMonth.getMonth() &&
        new Date().getFullYear() === currentMonth.getFullYear();

      days.push(
        <button
          key={i}
          onClick={() => handleDateClick(i)}
          className={`
            p-2 rounded-lg font-bold text-sm transition
            ${
              isSelected
                ? "bg-amber-500 text-zinc-900 shadow-[0_0_10px_rgba(245,158,11,0.5)] scale-110"
                : isToday
                ? "bg-zinc-700 text-amber-500 border border-amber-500/50"
                : "text-zinc-300 hover:bg-zinc-700 hover:text-white"
            }
          `}
        >
          {i}
        </button>
      );
    }
    return days;
  };

  const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4 bg-zinc-900/50 p-2 rounded-lg">
        <button
          onClick={() => changeMonth(-1)}
          className="text-amber-500 px-3 py-1 hover:bg-zinc-700 rounded text-xl font-bold"
        >
          ‹
        </button>
        <span className="font-bold text-lg text-white uppercase tracking-widest">
          {currentMonth.toLocaleString("bg-BG", {
            month: "long",
            year: "numeric",
          })}
        </span>
        <button
          onClick={() => changeMonth(1)}
          className="text-amber-500 px-3 py-1 hover:bg-zinc-700 rounded text-xl font-bold"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {weekDays.map((d) => (
          <div key={d} className="text-xs text-zinc-500 uppercase font-bold">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">{renderDays()}</div>
    </div>
  );
};

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const [view, setView] = useState("home");

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setRole(null);
    setUsername(null);
    setView("home");
  };

  return (
    <div className={theme.bg}>
      <Toaster position="top-center" />

      {/* NAVIGATION */}
      <nav className="p-4 bg-zinc-950 flex justify-between items-center border-b border-zinc-800 sticky top-0 z-50">
        <h1
          className="text-2xl font-bold text-amber-500 cursor-pointer flex items-center gap-2"
          onClick={() => setView("home")}
        >
          💈 <span className="hidden sm:inline">ELITE BARBER</span>
        </h1>
        <div className="flex gap-2 sm:gap-4 text-sm sm:text-base">
          {!token ? (
            <>
              <button
                onClick={() => setView("login")}
                className="hover:text-white text-zinc-400 px-2 sm:px-0"
              >
                Вход
              </button>
              <button
                onClick={() => setView("register")}
                className={`${theme.btnPrimary} text-xs sm:text-base`}
              >
                Регистрация
              </button>
            </>
          ) : (
            <>
              {/* БУТОНЪТ ЗА АДМИН Е ПРЕМАХНАТ ОТ ТУК - ЛОГИКАТА Е ПРЕМЕСТЕНА В DASHBOARD */}
              <button
                onClick={() => setView("dashboard")}
                className={
                  view === "dashboard"
                    ? "text-amber-500 font-bold border-b-2 border-amber-500 pb-1"
                    : "text-zinc-400 hover:text-white"
                }
              >
                Часове
              </button>
              <button
                onClick={() => setView("profile")}
                className={
                  view === "profile"
                    ? "text-amber-500 font-bold border-b-2 border-amber-500 pb-1"
                    : "text-zinc-400 hover:text-white"
                }
              >
                {role === "admin" ? "Клиенти" : "Профил"}
              </button>
              <button
                onClick={logout}
                className="text-zinc-500 hover:text-red-400 ml-2 sm:ml-4"
              >
                Изход
              </button>
            </>
          )}
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="container mx-auto p-4 max-w-4xl mt-6 sm:mt-10 pb-24">
        {view === "home" && <Home setView={setView} token={token} />}
        {view === "login" && (
          <Auth
            type="login"
            setToken={setToken}
            setRole={setRole}
            setUsername={setUsername}
            setView={setView}
          />
        )}
        {view === "register" && (
          <Auth
            type="register"
            setToken={setToken}
            setRole={setRole}
            setUsername={setUsername}
            setView={setView}
          />
        )}
        {/* DASHBOARD now handles both Client and Admin views */}
        {view === "dashboard" && (
          <Dashboard token={token} username={username} role={role} />
        )}
        {view === "profile" && <Profile token={token} />}
      </div>
    </div>
  );
}

// --- COMPONENTS ---

const Home = ({ setView, token }) => (
  <div className="text-center mt-10 sm:mt-20 animate-fade-in">
    <h1 className="text-4xl sm:text-6xl font-black text-white mb-4 leading-tight">
      СТИЛЪТ Е <br className="sm:hidden" />
      <span className="text-amber-500">ВЕЧЕН</span>
    </h1>
    <p className="text-lg sm:text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
      Класическо бръснене и модерни прически в атмосфера на истински мъжки клуб.
    </p>
    {!token ? (
      <button
        onClick={() => setView("register")}
        className="bg-amber-500 text-zinc-900 px-8 py-4 text-lg sm:text-xl font-bold rounded-full hover:bg-amber-400 transition transform hover:scale-105 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
      >
        ЗАПАЗИ ЧАС СЕГА
      </button>
    ) : (
      <button
        onClick={() => setView("dashboard")}
        className="bg-zinc-700 text-white px-8 py-4 text-xl font-bold rounded-full hover:bg-zinc-600 border border-zinc-600"
      >
        КЪМ ГРАФИКА
      </button>
    )}

    <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
      <div
        className={`${theme.card} hover:-translate-y-2 transition duration-300`}
      >
        <div className="text-4xl mb-4">✂️</div>
        <h3 className="text-xl font-bold text-amber-500 mb-2">Подстригване</h3>
        <p className="text-zinc-400">
          Нашите бръснари не просто подстригват – те създават визия с прецизност
          до милиметър и внимание към всеки детайл.
        </p>
      </div>
      <div
        className={`${theme.card} hover:-translate-y-2 transition duration-300`}
      >
        <div className="text-4xl mb-4">🪒</div>
        <h3 className="text-xl font-bold text-amber-500 mb-2">Бръснене</h3>
        <p className="text-zinc-400">
          Работим само с водещи световни брандове, за да гарантираме
          безкомпромисна грижа за твоята коса и брада.
        </p>
      </div>
      <div
        className={`${theme.card} hover:-translate-y-2 transition duration-300`}
      >
        <div className="text-4xl mb-4">🛡️</div>
        <h3 className="text-xl font-bold text-amber-500 mb-2">Лоялност</h3>
        <p className="text-zinc-400">
          Специално отношение за редовните клиенти. Приоритет при записване и
          отстъпки.
        </p>
      </div>
    </div>
  </div>
);

const Auth = ({ type, setToken, setRole, setUsername, setView }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [acceptingNew, setAcceptingNew] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (type === "register") {
      axios.get(`${API}/settings`).then((res) => {
        setAcceptingNew(res.data.acceptingNewClients);
      });
    }
  }, [type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post(`${API}/${type}`, formData);
      if (type === "login") {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);
        localStorage.setItem("username", res.data.username);

        setToken(res.data.token);
        setRole(res.data.role);
        setUsername(res.data.username);

        setView("dashboard"); // ВИНАГИ ОТИВА КЪМ DASHBOARD, ТАМ СЕ ОПРЕДЕЛЯ ИЗГЛЕДА
        toast.success(`Здравейте, ${res.data.firstName || ""}!`);
      } else {
        toast.success("Регистрацията успешна! Сега влезте.");
        setView("login");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Грешка");
    } finally {
      setIsLoading(false);
    }
  };

  if (type === "register" && !acceptingNew) {
    return (
      <div className="max-w-md mx-auto animate-fade-in">
        <div className="bg-zinc-800 p-8 rounded-xl border border-zinc-700 text-center shadow-2xl">
          <div className="text-6xl mb-6 opacity-80">🚫</div>
          <h3 className="text-2xl font-bold text-white mb-4">
            РЕГИСТРАЦИИТЕ СА ЗАТВОРЕНИ
          </h3>
          <p className="text-zinc-400 mb-8">
            Съжаляваме, в момента графикът ни е пълен с редовни клиенти и не
            приемаме нови регистрации.
          </p>
          <button
            onClick={() => setView("login")}
            className="text-amber-500 hover:text-amber-400 underline underline-offset-4"
          >
            Обратно към вход
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto animate-fade-in">
      <div className={theme.card}>
        <h2 className={theme.header}>
          {type === "login" ? "ВХОД" : "РЕГИСТРАЦИЯ"}
        </h2>
        <form onSubmit={handleSubmit}>
          {type === "register" && (
            <div className="flex gap-2">
              <input
                className={theme.input}
                placeholder="Име"
                required
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
              <input
                className={theme.input}
                placeholder="Фамилия"
                required
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
              <input
                className={theme.input}
                placeholder="Телефонен номер"
                required
                autoComplete="Телефон"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
          )}

          <input
            className={theme.input}
            placeholder="Потребителско име (за вход)"
            required
            autoComplete="username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
          />
          <input
            className={theme.input}
            type="password"
            placeholder="Парола"
            required
            autoComplete="current-password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
          <button
            disabled={isLoading}
            className={`${theme.btnPrimary} w-full flex justify-center items-center`}
          >
            {isLoading ? <span className="animate-spin mr-2">⏳</span> : null}
            {type === "login" ? "ВЛЕЗ" : "РЕГИСТРИРАЙ СЕ"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            onClick={() => setView(type === "login" ? "register" : "login")}
            className="text-zinc-500 text-sm hover:text-zinc-300"
          >
            {type === "login"
              ? "Нямаш акаунт? Регистрирай се"
              : "Имаш акаунт? Влез"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Profile = ({ token }) => {
  const [profile, setProfile] = useState(null);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API}/me`, {
          headers: { Authorization: token },
        });
        setProfile(res.data);

        // Ако е админ, изтегли всички потребители
        if (res.data.role === "admin") {
          try {
            const usersRes = await axios.get(`${API}/admin/users`, {
              headers: { Authorization: token },
            });
            setClients(usersRes.data);
          } catch (usersErr) {
            console.error("Failed to fetch clients", usersErr);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, [token]);

  if (!profile)
    return <div className="text-center text-white mt-10">Зареждане...</div>;

  // --- ИЗГЛЕД ЗА АДМИН (Списък с клиенти) ---
  if (profile.role === "admin") {
    return (
      <div className="animate-fade-in">
        <h2 className="section-header">СПИСЪК КЛИЕНТИ</h2>

        <div className="bg-zinc-800 rounded-xl overflow-hidden shadow-2xl border border-zinc-700">
          {clients.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 italic">
              Няма намерени регистрирани клиенти.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-zinc-300">
                <thead className="bg-zinc-900/50 text-amber-500 uppercase text-xs sm:text-sm tracking-wider">
                  <tr>
                    <th className="p-4">Име</th>
                    <th className="p-4">Телефон</th>
                    <th className="p-4 text-center">Неявявания</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-700">
                  {clients.map((client) => (
                    <tr
                      key={client._id}
                      className="hover:bg-zinc-700/30 transition"
                    >
                      <td className="p-4 font-bold text-white">
                        {client.firstName} {client.lastName}
                      </td>
                      <td className="p-4 text-zinc-400 font-mono">
                        {client.phone || "N/A"}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`font-bold ${
                            client.noShowCount > 0
                              ? "text-red-500"
                              : "text-green-500"
                          }`}
                        >
                          {client.noShowCount}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- ИЗГЛЕД ЗА КЛИЕНТ (Личен профил) ---
  return (
    <div className="max-w-md mx-auto mt-10 animate-fade-in">
      <div className="card text-center">
        <div className="w-28 h-28 bg-zinc-700 rounded-full mx-auto mb-6 flex items-center justify-center text-5xl border-4 border-amber-500 shadow-xl">
          👤
        </div>
        <h2 className="text-3xl font-bold text-white mb-1">
          {profile.firstName} {profile.lastName}
        </h2>
        <p className="text-amber-500 font-mono mb-8">@{profile.username}</p>

        <div className="space-y-3">
          <div className="bg-zinc-900/50 p-4 rounded-lg flex justify-between items-center border border-zinc-700">
            <span className="text-zinc-400">Статус</span>
            <span className="text-white font-bold bg-zinc-700 px-3 py-1 rounded text-sm">
              {profile.role === "admin" ? "АДМИН" : "КЛИЕНТ"}
            </span>
          </div>

          <div className="bg-zinc-900/50 p-4 rounded-lg flex justify-between items-center border border-zinc-700">
            <span className="text-zinc-400">Неявявания</span>
            <span
              className={`${
                profile.noShowCount > 0 ? "text-red-500" : "text-green-500"
              } font-bold text-xl`}
            >
              {profile.noShowCount}{" "}
              <span className="text-zinc-600 text-sm font-normal">/ 2</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- CLIENT DASHBOARD (Старата версия - изглед за клиент) ---
const ClientDashboard = ({ token, username }) => {
  const [appointments, setAppointments] = useState([]);
  const [date, setDate] = useState(new Date());
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const fetchApps = async () => {
    try {
      const res = await axios.get(`${API}/appointments`);
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  // 1. ИЗЧИСЛЯВАМЕ РЕЗЕРВАЦИЯТА ТУК
  const myAppointment = appointments.find(
    (app) =>
      app.username === username &&
      app.status === "active" &&
      new Date(app.date) > new Date()
  );

  // 2. АКТУАЛНАТА УСЛУГА Е ТАЗИ, КОЯТО Е ИЗБРАНА ИЛИ ТАЗИ ОТ РЕЗЕРВАЦИЯТА
  const effectiveService = selectedService || myAppointment?.serviceType;

  const book = async (slotDate) => {
    const isoDate = slotDate.toISOString();
    const serviceName = effectiveService === "full" ? "Коса + Брада" : "Коса";

    if (
      !window.confirm(
        `Потвърждавате ли час за ${serviceName} на ${slotDate.toLocaleTimeString(
          [],
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        )}?`
      )
    )
      return;

    try {
      await axios.post(
        `${API}/book`,
        { date: isoDate, serviceType: effectiveService },
        { headers: { Authorization: token } }
      );
      toast.success("Часът е запазен успешно!");
      fetchApps();
      setSelectedService(null);
    } catch (err) {
      toast.error(err.response?.data?.error || "Грешка при запазване");
    }
  };

  const handleCancel = async () => {
    if (!myAppointment) return;
    try {
      await axios.post(
        `${API}/cancel`,
        { id: myAppointment._id },
        { headers: { Authorization: token } }
      );
      toast.success("Резервацията е отменена успешно.");
      setShowCancelModal(false);
      fetchApps();
    } catch (err) {
      toast.error(err.response?.data?.error || "Грешка при отмяна");
    }
  };

  const generateSlots = () => {
    const slots = [];
    const duration = effectiveService === "full" ? 60 : 30;

    for (let hour = 9; hour < 18; hour++) {
      checkSlot(hour, 0, duration, slots);
      checkSlot(hour, 30, duration, slots);
    }
    return slots;
  };

  const checkSlot = (hour, minute, duration, slots) => {
    const slotStart = new Date(date);
    slotStart.setHours(hour, minute, 0, 0);

    const slotEnd = new Date(slotStart.getTime() + duration * 60000);
    const workDayEnd = new Date(date);
    workDayEnd.setHours(18, 0, 0, 0);

    if (slotEnd > workDayEnd) return;

    const now = new Date();
    const isPast = slotStart < now;

    const isTaken = appointments.some((app) => {
      const appStart = new Date(app.date);
      const appDuration = app.duration || 30;
      const appEnd = new Date(appStart.getTime() + appDuration * 60000);
      return appStart < slotEnd && appEnd > slotStart;
    });

    slots.push({
      time: `${hour}:${minute === 0 ? "00" : "30"}`,
      fullDate: slotStart,
      isTaken: isTaken,
      isPast: isPast,
    });
  };

  const isSunday = date.getDay() === 0;

  const isCancellationAllowed = () => {
    if (!myAppointment) return false;
    const appDate = new Date(myAppointment.date);
    const now = new Date();
    const diffInHours = (appDate - now) / (1000 * 60 * 60);
    return diffInHours >= 12;
  };

  return (
    <div className="animate-fade-in">
      {/* МОДАЛЕН ПРОЗОРЕЦ */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-700 shadow-2xl max-w-sm w-full text-center relative">
            <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-wide">
              ОТМЯНА НА ЧАС
            </h3>
            {isCancellationAllowed() ? (
              <div>
                <p className="text-zinc-400 mb-8 text-lg">Сигурни ли сте?</p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="text-zinc-400 hover:text-white px-6 py-3 rounded-lg"
                  >
                    Назад
                  </button>
                  <button
                    onClick={handleCancel}
                    className="btn-danger text-lg px-6 py-3 rounded-lg shadow-lg"
                  >
                    Потвърди
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-5xl mb-4">⚠️</div>
                <p className="text-zinc-300 mb-2 font-medium">
                  Остават по-малко от{" "}
                  <span className="text-amber-500 font-bold">12 часа</span>.
                </p>
                <p className="text-zinc-500 text-sm mb-6">
                  Моля, свържете се с нас лично.
                </p>
                <a
                  href="tel:0888123456"
                  className="block bg-zinc-800 py-4 rounded-xl text-amber-500 font-mono text-2xl font-bold border border-zinc-700 hover:border-amber-500 transition mb-6"
                >
                  0888 123 456
                </a>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="text-zinc-500 underline"
                >
                  Затвори прозореца
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* БАНЕР ЗА УСПЕШНА РЕЗЕРВАЦИЯ */}
      {myAppointment && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl p-6 mb-8 text-black shadow-lg flex flex-col md:flex-row justify-between items-center animate-fade-in relative group border border-amber-400/50">
          <div>
            <h2 className="text-2xl font-bold uppercase mb-1 flex items-center gap-2 text-white drop-shadow-md">
              ✅ РЕЗЕРВИРАН ЧАС
            </h2>
            <p className="text-lg font-medium text-white/90">
              {myAppointment.serviceType === "full"
                ? "Коса + Брада"
                : "Подстригване"}{" "}
              на{" "}
              <span className="font-black text-xl border-b-2 border-white/30 pb-0.5">
                {new Date(myAppointment.date).toLocaleString("bg-BG", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <button
              onClick={() => setShowCancelModal(true)}
              className="bg-black/20 hover:bg-black/30 text-white px-4 py-2 rounded-lg text-sm font-bold transition backdrop-blur-md border border-white/20"
            >
              ОТКАЖИ
            </button>
            <div className="text-5xl opacity-80 mix-blend-overlay hidden md:block">
              ✂️
            </div>
          </div>
        </div>
      )}

      {/* СТЪПКА 1: ИЗБОР НА УСЛУГА (Скриваме ако вече има час и не сме натиснали изрично за смяна) */}
      {!myAppointment && !selectedService && (
        <div className="animate-fade-in text-center">
          <h2 className="section-header">ИЗБЕРИ УСЛУГА</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div
              onClick={() => setSelectedService("hair")}
              className="service-card group"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition duration-300">
                ✂️
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                ПОДСТРИГВАНЕ
              </h3>
              <p className="text-zinc-400">Класическо мъжко подстригване</p>
            </div>

            <div
              onClick={() => setSelectedService("full")}
              className="service-card group"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition duration-300">
                🧔
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                КОСА + БРАДА
              </h3>
              <p className="text-zinc-400">Пълен пакет грижа за визията</p>
            </div>
          </div>
        </div>
      )}

      {/* СТЪПКА 2: КАЛЕНДАР И ЧАСОВЕ (Показваме ако има избрана услуга ИЛИ ако вече има резервация) */}
      {(selectedService || myAppointment) && (
        <div className="flex flex-col md:flex-row gap-8 animate-fade-in">
          <div className="md:w-1/2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="section-header mb-0">ИЗБЕРИ ДАТА</h2>
              {/* Показваме бутона за смяна само ако няма активна резервация */}
              {!myAppointment && (
                <button
                  onClick={() => setSelectedService(null)}
                  className="text-sm text-zinc-500 hover:text-white underline"
                >
                  (Смени услугата)
                </button>
              )}
            </div>

            <div className="card flex justify-center border border-zinc-700">
              <SimpleCalendar onChange={setDate} value={date} />
            </div>
            <p className="mt-4 text-center text-zinc-400">
              Избрана дата:{" "}
              <span className="text-amber-500 font-bold uppercase">
                {date.toLocaleDateString("bg-BG", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </span>
            </p>
          </div>

          <div className="md:w-1/2">
            <h2 className="section-header">СВОБОДНИ ЧАСОВЕ</h2>
            <p className="text-center text-zinc-500 mb-4 text-sm">
              За услуга:{" "}
              <span className="text-white font-bold">
                {effectiveService === "full" ? "Коса + Брада" : "Подстригване"}
              </span>
            </p>

            {isSunday ? (
              <div className="mt-10 p-8 bg-zinc-800/50 border border-zinc-700 rounded-xl text-center shadow-lg">
                <div className="text-5xl mb-4 opacity-80">☕</div>
                <h3 className="text-2xl font-bold text-zinc-300 mb-2">
                  ПОЧИВЕН ДЕН
                </h3>
                <p className="text-zinc-500">
                  Салонът работи от Понеделник до Събота.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3">
                  {generateSlots().map((slot, index) => (
                    <button
                      key={index}
                      // Забранен ако е зает, минал или ако това е моят собствен час (или имам активна резервация)
                      disabled={slot.isTaken || slot.isPast || !!myAppointment}
                      onClick={() => book(slot.fullDate)}
                      className={`
                        py-3 rounded-lg font-bold transition duration-200 border relative overflow-hidden group
                        ${
                          slot.isTaken
                            ? "bg-red-900/20 border-red-900/50 text-red-500/50 cursor-not-allowed"
                            : slot.isPast
                            ? "bg-zinc-800 border-zinc-700 text-zinc-600 cursor-not-allowed"
                            : !!myAppointment // Ако имам резервация, показвам го като неактивен (сив)
                            ? "bg-zinc-800 border-zinc-700 text-zinc-500 cursor-not-allowed "
                            : "bg-zinc-800 border-amber-500/50 text-white hover:bg-amber-500 hover:text-zinc-900 hover:border-amber-500 shadow-[0_0_10px_rgba(0,0,0,0.3)]"
                        }
                      `}
                    >
                      {slot.isTaken ? "ЗАЕТО" : slot.time}
                    </button>
                  ))}
                </div>
                {generateSlots().every((s) => s.isTaken || s.isPast) && (
                  <div className="mt-6 text-center text-red-400 border border-red-900 bg-red-900/20 p-4 rounded">
                    Няма свободни часове за този ден.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- ADMIN DASHBOARD (Новата версия - изглед за админ) ---
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
            <SimpleCalendar onChange={handleDateClick} value={selectedDate} />

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

// --- MAIN DASHBOARD WRAPPER ---
const Dashboard = ({ token, username, role }) => {
  // Ако е админ, показваме новия админ панел (календар + списък)
  if (role === "admin") {
    return <AdminDashboard token={token} />;
  }
  // Ако е клиент, показваме стандартната версия за запазване на час
  return <ClientDashboard token={token} username={username} />;
};

export default App;
