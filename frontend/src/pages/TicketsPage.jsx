import { statusTitle } from "../utils/formatters";

function TicketsPage({ orders, refundOrder }) {
  return (
    <section className="panel">
      <h2>Мои билеты</h2>

      {!orders.length && <div className="notice">У вас пока нет оформленных билетов.</div>}

      {orders.map((order) => (
        <div className="ticket" key={order.id}>
          <div>
            <b>Заказ №{order.id}</b>
            <p>Статус: {statusTitle(order.status)}</p>

            {order.tickets?.map((ticket) => (
              <p key={ticket.id}>Поезд {ticket.train_number || "—"} · место {ticket.seat_number || "—"}</p>
            ))}

            <span className="badge">{statusTitle(order.status)}</span>
          </div>

          <div className="qr">QR</div>

          {order.status === "paid" && <button onClick={() => refundOrder(order.id)}>Оформить возврат</button>}
        </div>
      ))}

      <div className="notice">Возврат рассчитывается автоматически с учетом времени до отправления и сборов.</div>
    </section>
  );
}

export default TicketsPage;
