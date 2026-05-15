export function roleTitle(role) {
  if (role === "passenger") return "Пассажир";
  if (role === "dispatcher") return "Диспетчер";
  if (role === "admin") return "Администратор";
  if (role === "conductor") return "Проводник";
  return "Гость";
}

export function statusTitle(status) {
  if (status === "paid") return "Оплачен";
  if (status === "pending") return "Ожидает оплаты";
  if (status === "refunded") return "Возвращен";
  if (status === "cancelled") return "Отменен";
  return status || "Неизвестно";
}

export function money(value) {
  return Number(value || 0).toLocaleString();
}
