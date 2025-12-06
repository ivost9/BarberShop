import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { theme } from "../utils/theme";
import { API } from "../utils/config";

const { card, header, input, btnPrimary } = theme;

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
      <div className={card}>
        <h2 className={header}>{type === "login" ? "ВХОД" : "РЕГИСТРАЦИЯ"}</h2>
        <form onSubmit={handleSubmit}>
          {type === "register" && (
            <div className="flex gap-2">
              <input
                className={input}
                placeholder="Име"
                required
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
              <input
                className={input}
                placeholder="Фамилия"
                required
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
              <input
                className={input}
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
            className={input}
            placeholder="Потребителско име (за вход)"
            required
            autoComplete="username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
          />
          <input
            className={input}
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
            className={`${btnPrimary} w-full flex justify-center items-center`}
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

export default Auth;
