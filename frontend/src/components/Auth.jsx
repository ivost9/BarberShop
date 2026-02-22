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

  // --- ФУНКЦИЯ ЗА ВАЛИДАЦИЯ ---
  const validateForm = () => {
    const { username, password, firstName, lastName, phone } = formData;

    // 1. ПЪРВО: Проверка дали изобщо е попълнено нещо (Empty checks)
    if (!username.trim() || !password.trim()) {
      toast.error("Моля, попълнете всички полета");
      return false;
    }

    if (type === "register") {
      if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
        toast.error("Моля, попълнете всички полета за регистрация");
        return false;
      }
      if (username.length < 3) {
        toast.error("Потребителското име трябва да е поне 3 символа");
        return false;
      }

      // Парола (8-30 символа)
      if (password.length < 8 || password.length > 30) {
        toast.error("Паролата трябва да бъде между 8 и 30 символа");
        return false;
      }

      // Само за Регистрация
      if (type === "register") {
        const nameRegex = /^[A-Za-zА-Яа-я]+$/; // Само букви
        const phoneRegex = /^08\d{8}$/; // Започва с 08 и е точно 10 цифри

        if (
          firstName.length < 3 ||
          firstName.length > 30 ||
          !nameRegex.test(firstName)
        ) {
          toast.error("Името трябва да е само с букви и между 3-30 символа");
          return false;
        }

        if (
          lastName.length < 3 ||
          lastName.length > 30 ||
          !nameRegex.test(lastName)
        ) {
          toast.error(
            "Фамилията трябва да е само с букви и между 3-30 символа",
          );
          return false;
        }

        if (!phoneRegex.test(phone)) {
          toast.error("Невалиден телефонен номер");
          return false;
        }
      }
    }

    // 2. ВТОРО: Специфични формати (след като знаем, че не са празни)

    // Потребителско име

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Първо минава през новата валидация
    if (!validateForm()) return;

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

        setView("dashboard");
        toast.success(`Здравейте, ${res.data.firstName || ""}!`);
      } else {
        toast.success("Регистрацията е успешна! Сега влезте.");
        setView("login");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Възникна грешка");
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
          <p className="text-zinc-400 mb-8">Съжаляваме, графикът ни е пълен.</p>
          <button
            onClick={() => setView("login")}
            className="text-amber-500 hover:text-amber-400 underline"
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
            <div className="flex flex-col gap-2 mb-4">
              <input
                className={input}
                placeholder="Име"
                required // <--- Връщаме native проверката
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
              <input
                className={input}
                placeholder="Фамилия"
                required // <--- Връщаме native проверката
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
              <input
                className={input}
                placeholder="Телефон"
                type="tel"
                required // <--- Връщаме native проверката
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
          )}

          <input
            className={input}
            placeholder="Потребителско име"
            required // <--- Връщаме native проверката
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
          />
          <input
            className={input}
            type="password"
            placeholder="Парола"
            required // <--- Връщаме native проверката
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />

          <button
            disabled={isLoading}
            className={`${btnPrimary} w-full flex justify-center items-center mt-4`}
          >
            {isLoading ? <span className="animate-spin mr-2">⏳</span> : null}
            {type === "login" ? "ВЛЕЗ" : "РЕГИСТРАЦИЯ"}
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
