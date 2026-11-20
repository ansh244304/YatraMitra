export function formatRs(value) {
  const amount = Number(value) || 0;
  return `Rs ${amount.toLocaleString('en-IN')}`;
}
