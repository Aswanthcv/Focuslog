export function toPaise(rupees) {
  return Math.round(Number(rupees) * 100);
}

export function formatRupees(paise) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(paise / 100);
}
