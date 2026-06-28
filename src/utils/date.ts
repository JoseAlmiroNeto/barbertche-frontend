export function isoForOffset(offset: number) {
  const today = new Date();
  const date = new Date(today);
  date.setDate(today.getDate() + offset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function dateLabel(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit"
  });
}

export function weekdayOf(iso: string) {
  return new Date(`${iso}T12:00:00`).getDay();
}

export function weekdayName(day: number) {
  return ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"][day];
}
