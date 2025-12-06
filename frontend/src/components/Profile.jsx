import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../utils/config";

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

export default Profile;
