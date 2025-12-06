import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../../utils/config";
import toast from "react-hot-toast";
import ClientCalendar from "../ClientCalendar";

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
              <ClientCalendar onChange={setDate} value={date} />
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

export default ClientDashboard;
