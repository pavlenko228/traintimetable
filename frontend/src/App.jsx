import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

import { api, clearToken, setToken } from "./api/client";
import Header from "./components/Header";
import AdminPage from "./pages/AdminPage";
import ConductorPage from "./pages/ConductorPage";
import DispatcherPage from "./pages/DispatcherPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SchedulePage from "./pages/SchedulePage";
import TicketsPage from "./pages/TicketsPage";
import TrainPage from "./pages/TrainPage";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState("schedule");

  const [loginData, setLoginData] = useState({
    email: "passenger@test.ru",
    password: "123",
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [search, setSearch] = useState({
    from: "Москва",
    to: "Санкт-Петербург",
    date: "2026-05-14",
  });

  const [trains, setTrains] = useState([]);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [wagonType, setWagonType] = useState("");
  const [bookingDone, setBookingDone] = useState(false);

  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [manifest, setManifest] = useState([]);

  const [loginError, setLoginError] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const [passengerForm, setPassengerForm] = useState({
    passenger_name: "",
    birth_date: "",
    document_number: "",
    bonus_card: "",
  });

  const seatPrice =
    selectedTrain?.prices?.[wagonType] ||
    Object.values(selectedTrain?.prices || { x: 0 })[0];

  const total = selectedSeats.length * seatPrice;

  const takenSeats = useMemo(() => {
    return seats
      .filter((seat) => seat.status === "taken" || seat.status === "sold")
      .map((seat) => seat.number);
  }, [seats]);

  useEffect(() => {
    loadTrains();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadTrains() {
    try {
      setLoading(true);
      setApiError("");

      const data = await api(
        `/trips/search?from_station=${encodeURIComponent(search.from)}&to_station=${encodeURIComponent(search.to)}&date=${search.date}`
      );

      setTrains(data);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function login(e) {
    e.preventDefault();

    try {
      setLoginError("");
      setApiError("");

      const data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify(loginData),
      });

      setToken(data.access_token);
      setCurrentUser(data.user);
      openRolePage(data.user.role);
    } catch (err) {
      setLoginError(err.message);
    }
  }

  async function register(e) {
    e.preventDefault();

    try {
      setRegisterError("");
      setApiError("");

      const data = await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: registerData.name,
          email: registerData.email,
          password: registerData.password,
          role: "passenger",
        }),
      });

      if (data?.access_token) {
        setToken(data.access_token);
        setCurrentUser(data.user);
        setView("schedule");
        return;
      }

      setLoginData({
        email: registerData.email,
        password: registerData.password,
      });
      setView("login");
    } catch (err) {
      setRegisterError(err.message);
    }
  }

  function openRolePage(role) {
    if (role === "passenger") setView("schedule");
    if (role === "dispatcher") setView("dispatcher");
    if (role === "admin") {
      setView("admin");
      loadUsers();
    }
    if (role === "conductor") {
      setView("conductor");
      loadManifest();
    }
  }

  function logout() {
    clearToken();
    setCurrentUser(null);
    setView("schedule");
    setSelectedTrain(null);
    setSelectedSeats([]);
    setBookingDone(false);
    setOrders([]);
    setUsers([]);
    setManifest([]);
  }

  function handleBuyClick(train) {
    if (!currentUser) {
      setSelectedTrain(train);
      setView("login");
      return;
    }

    if (currentUser.role !== "passenger") {
      alert("Покупка билета доступна только пассажиру");
      return;
    }

    chooseTrain(train);
  }

  async function chooseTrain(train) {
    const firstWagonType = Object.keys(train.prices || {})[0] || "Купе";

    setSelectedTrain(train);
    setWagonType(firstWagonType);
    setSelectedSeats([]);
    setBookingDone(false);
    setPassengerForm({
      passenger_name: currentUser?.name || "",
      birth_date: "",
      document_number: "",
      bonus_card: "",
    });
    setView("train");

    await loadSeats(train.id, firstWagonType);
  }

  async function loadSeats(tripId, type) {
    try {
      setApiError("");
      const data = await api(`/trips/${tripId}/seats?wagon_type=${encodeURIComponent(type)}`);
      setSeats(data);
    } catch (err) {
      setApiError(err.message);
    }
  }

  function toggleSeat(seat) {
    if (takenSeats.includes(seat)) return;

    setSelectedSeats((prev) =>
      prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]
    );
  }

  function getSeatIdByNumber(number) {
    return seats.find((seat) => seat.number === number)?.id;
  }

  async function payOrder() {
    try {
      setApiError("");

      const order = await api("/orders", {
        method: "POST",
        body: JSON.stringify({
          trip_id: selectedTrain.id,
          passengers: selectedSeats.map((seatNumber) => ({
            seat_id: getSeatIdByNumber(seatNumber),
            passenger_name: passengerForm.passenger_name,
            birth_date: passengerForm.birth_date,
            document_number: passengerForm.document_number,
            bonus_card: passengerForm.bonus_card,
          })),
        }),
      });

      await api(`/orders/${order.id}/pay`, { method: "POST" });

      setBookingDone(true);
      setSelectedSeats([]);
      await loadSeats(selectedTrain.id, wagonType);
    } catch (err) {
      setApiError(err.message);
    }
  }

  async function loadMyOrders() {
    try {
      setApiError("");
      const data = await api("/orders/my");
      setOrders(data);
    } catch (err) {
      setApiError(err.message);
    }
  }

  async function refundOrder(orderId) {
    try {
      setApiError("");
      await api(`/orders/${orderId}/refund`, { method: "POST" });
      await loadMyOrders();
    } catch (err) {
      setApiError(err.message);
    }
  }

  async function updateTripStatus(tripId, status) {
    try {
      setApiError("");
      await api(`/dispatcher/trips/${tripId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await loadTrains();
    } catch (err) {
      setApiError(err.message);
    }
  }

  async function loadUsers() {
    try {
      const data = await api("/admin/users");
      setUsers(data);
    } catch {
      setUsers([]);
    }
  }

  async function loadManifest() {
    try {
      const data = await api("/conductor/manifest");
      setManifest(data);
    } catch {
      setManifest([]);
    }
  }

  return (
    <div className="app">
      <Header
        currentUser={currentUser}
        setView={setView}
        logout={logout}
        loadMyOrders={loadMyOrders}
        loadUsers={loadUsers}
        loadManifest={loadManifest}
      />

      <main>
        {apiError && <div className="error">{apiError}</div>}
        {loading && <div className="notice">Загрузка...</div>}

        {view === "schedule" && (
          <SchedulePage
            search={search}
            setSearch={setSearch}
            trains={trains}
            loadTrains={loadTrains}
            handleBuyClick={handleBuyClick}
          />
        )}

        {view === "login" && (
          <LoginPage
            loginData={loginData}
            setLoginData={setLoginData}
            login={login}
            loginError={loginError}
            setView={setView}
          />
        )}

        {view === "register" && (
          <RegisterPage
            registerData={registerData}
            setRegisterData={setRegisterData}
            register={register}
            registerError={registerError}
            setView={setView}
          />
        )}

        {view === "train" && selectedTrain && (
          <TrainPage
            selectedTrain={selectedTrain}
            currentUser={currentUser}
            wagonType={wagonType}
            setWagonType={setWagonType}
            selectedSeats={selectedSeats}
            setSelectedSeats={setSelectedSeats}
            seats={seats}
            takenSeats={takenSeats}
            toggleSeat={toggleSeat}
            loadSeats={loadSeats}
            passengerForm={passengerForm}
            setPassengerForm={setPassengerForm}
            total={total}
            payOrder={payOrder}
            bookingDone={bookingDone}
            setView={setView}
          />
        )}

        {view === "tickets" && currentUser?.role === "passenger" && (
          <TicketsPage orders={orders} refundOrder={refundOrder} />
        )}

        {view === "dispatcher" && currentUser?.role === "dispatcher" && (
          <DispatcherPage trains={trains} updateTripStatus={updateTripStatus} loadTrains={loadTrains} />
        )}

        {view === "admin" && currentUser?.role === "admin" && <AdminPage users={users} />}

        {view === "conductor" && currentUser?.role === "conductor" && <ConductorPage manifest={manifest} />}
      </main>
    </div>
  );
}

export default App;
