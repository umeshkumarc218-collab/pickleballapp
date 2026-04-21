export function getAvailability(capacity, booked) {
  const spots = capacity - booked
  const pct = booked / capacity
  if (spots === 0) return { label: 'Full', color: 'red', pct: 1 }
  if (pct >= 0.7) return { label: 'Few left', color: 'amber', spots, pct }
  return { label: 'Open', color: 'green', spots, pct }
}

export default function AvailabilityBadge({ capacity, booked }) {
  const { label, color, spots, pct } = getAvailability(capacity, booked)

  const dot = {
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
  }[color]

  const bar = {
    green: 'bg-green-400',
    amber: 'bg-amber-400',
    red: 'bg-red-400',
  }[color]

  return (
    <div className="flex flex-col gap-1 min-w-[90px]">
      <div className="flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full ${dot} shrink-0`} />
        <span className="text-xs font-body font-medium text-gray-700">
          {label}
          {spots !== undefined && ` (${spots})`}
        </span>
      </div>
      <div className="h-1 rounded-full bg-gray-100 w-full overflow-hidden">
        <div
          className={`h-full rounded-full ${bar} transition-all`}
          style={{ width: `${Math.round(pct * 100)}%` }}
        />
      </div>
    </div>
  )
}
