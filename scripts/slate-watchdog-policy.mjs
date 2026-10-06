export function schedulerStale(row, nowMs, graceSec) {
  const stamp = value => value == null ? null : new Date(value).getTime();
  const due = stamp(row.dynamicRefreshDueAt);
  const last = stamp(row.dynamicLastRunAt);
  const lease = stamp(row.dynamicRefreshLeaseUntil);
  if (!Number.isFinite(nowMs) || !Number.isFinite(graceSec) || graceSec <= 0 ||
      !Number.isFinite(due) || (last !== null && !Number.isFinite(last)) ||
      (lease !== null && !Number.isFinite(lease))) return false;
  return due < nowMs - graceSec * 1000 &&
    (last === null || last < due) && (lease === null || lease <= nowMs);
}
