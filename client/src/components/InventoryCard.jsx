// Displays stock level for a single blood type with color-coded urgency
const InventoryCard = ({ bloodType, units, onChange, editable }) => {

  const getUrgencyStyle = (units) => {
    if (units < 5)  return { bg: 'bg-red-50',    border: 'border-red-400',    badge: 'bg-red-500',    label: 'Critical' }
    if (units < 15) return { bg: 'bg-yellow-50', border: 'border-yellow-400', badge: 'bg-yellow-500', label: 'Low'      }
    return              { bg: 'bg-green-50',  border: 'border-green-400',  badge: 'bg-green-500',  label: 'Stable'   }
  }

  const style = getUrgencyStyle(units)

  return (
    <div className={`rounded-xl border-2 p-4 ${style.bg} ${style.border} flex flex-col items-center gap-2`}>
      <span className="text-2xl font-bold text-gray-800">{bloodType}</span>
      <span className="text-3xl font-extrabold text-gray-900">{units}</span>
      <span className="text-xs text-gray-500">units available</span>
      <span className={`text-xs text-white px-2 py-0.5 rounded-full ${style.badge}`}>
        {style.label}
      </span>

      {/* Editable input shown only on blood bank dashboard */}
      {editable && (
        <input
          type="number"
          min="0"
          value={units}
          onChange={(e) => onChange(bloodType, parseInt(e.target.value))}
          className="mt-1 w-20 text-center border border-gray-300 rounded-lg p-1 text-sm"
        />
      )}
    </div>
  )
}

export default InventoryCard