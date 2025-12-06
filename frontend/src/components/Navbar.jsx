import { theme } from "../utils/theme";

const Navbar = ({ view, setView, token, role, logout }) => {
  return (
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
  );
};

export default Navbar;
