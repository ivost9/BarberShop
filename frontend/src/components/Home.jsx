import React from "react";
import { theme } from "../utils/theme";

const Home = ({ setView, token }) => {
  const { card } = theme;
  return (
    <div className="text-center mt-10 sm:mt-20 animate-fade-in">
      <h1 className="text-4xl sm:text-6xl font-black text-white mb-4 leading-tight">
        СТИЛЪТ Е <br className="sm:hidden" />
        <span className="text-amber-500">ВЕЧЕН</span>
      </h1>

      <p className="text-lg sm:text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
        Класическо бръснене и модерни прически.
      </p>

      {/* Conditional Rendering за бутоните */}
      {!token ? (
        <button
          onClick={() => setView("register")}
          className="bg-amber-500 text-zinc-900 px-8 py-4 text-lg sm:text-xl font-bold rounded-full hover:bg-amber-400 transition transform hover:scale-105 shadow-[0_0_20px_rgba(245,158,11,0.3)] cursor-pointer"
        >
          ЗАПАЗИ ЧАС СЕГА
        </button>
      ) : (
        <button
          onClick={() => setView("dashboard")}
          className="bg-zinc-700 text-white px-8 py-4 text-xl font-bold rounded-full hover:bg-zinc-600 border border-zinc-600 cursor-pointer"
        >
          КЪМ ГРАФИКА
        </button>
      )}

      {/* Grid секция с услуги */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        {/* Карта 1: Подстригване */}
        <div className={`${card} hover:-translate-y-2 transition duration-300`}>
          <div className="text-4xl mb-4">✂️</div>
          <h3 className="text-xl font-bold text-amber-500 mb-2">
            Подстригване
          </h3>
          <p className="text-zinc-400">
            Нашите бръснари не просто подстригват – те създават визия с
            прецизност до милиметър и внимание към всеки детайл.
          </p>
        </div>

        {/* Карта 2: Бръснене */}
        <div className={`${card} hover:-translate-y-2 transition duration-300`}>
          <div className="text-4xl mb-4">🪒</div>
          <h3 className="text-xl font-bold text-amber-500 mb-2">Бръснене</h3>
          <p className="text-zinc-400">
            Работим само с водещи световни брандове, за да гарантираме
            безкомпромисна грижа за твоята коса и брада.
          </p>
        </div>

        {/* Карта 3: Лоялност */}
        <div className={`${card} hover:-translate-y-2 transition duration-300`}>
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
};

export default Home;
