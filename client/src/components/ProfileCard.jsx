const BADGE_STYLES = {
  'Life Starter':  { emoji: '🥉', bg: 'bg-orange-50',  text: 'text-orange-600', border: 'border-orange-200' },
  'Regular Hero':  { emoji: '🥈', bg: 'bg-gray-50',    text: 'text-gray-600',   border: 'border-gray-200'   },
  'Blood Warrior': { emoji: '🥇', bg: 'bg-yellow-50',  text: 'text-yellow-600', border: 'border-yellow-200' },
}

const ProfileCard = ({ donor, onToggleAvailability }) => {
  const livesSaved = donor.donationCount * 3

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
      <div className="flex items-start justify-between flex-wrap gap-4">

        {/* Left — donor info */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-2xl font-bold text-red-600">
            {donor.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">{donor.name}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-semibold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                {donor.bloodType}
              </span>
              <span className="text-xs text-gray-400">
                {donor.location?.address || 'Location not set'}
              </span>
            </div>
          </div>
        </div>

        {/* Right — availability toggle */}
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs text-gray-500 font-medium">Available to donate</span>
          <button
            onClick={onToggleAvailability}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              donor.isAvailable ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
              donor.isAvailable ? 'left-7' : 'left-1'
            }`}/>
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="text-center p-3 bg-red-50 rounded-xl">
          <p className="text-2xl font-extrabold text-red-600">{donor.donationCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Donations</p>
        </div>
        <div className="text-center p-3 bg-pink-50 rounded-xl">
          <p className="text-2xl font-extrabold text-pink-600">{livesSaved}</p>
          <p className="text-xs text-gray-500 mt-0.5">Lives Saved</p>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-xl">
          <p className="text-2xl font-extrabold text-orange-500">{donor.badges.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Badges</p>
        </div>
      </div>

      {/* Last donated */}
      {donor.lastDonated && (
        <p className="text-xs text-gray-400 mt-4">
          Last donated: {new Date(donor.lastDonated).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric'
          })}
        </p>
      )}

      {/* Badges */}
      {donor.badges.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-gray-500 mb-2">YOUR BADGES</p>
          <div className="flex flex-wrap gap-2">
            {donor.badges.map((badge) => {
              const style = BADGE_STYLES[badge]
              return (
                <span
                  key={badge}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${style.bg} ${style.text} ${style.border}`}
                >
                  {style.emoji} {badge}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Next milestone */}
      {donor.donationCount < 10 && (
        <div className="mt-4 bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500">
            🎯 Next badge:{' '}
            <span className="font-semibold text-gray-700">
              {donor.donationCount < 1  ? `Donate once to earn 🥉 Life Starter`   :
               donor.donationCount < 5  ? `${5  - donor.donationCount} more donation(s) to earn 🥈 Regular Hero`  :
               donor.donationCount < 10 ? `${10 - donor.donationCount} more donation(s) to earn 🥇 Blood Warrior` : ''}
            </span>
          </p>
        </div>
      )}
    </div>
  )
}

export default ProfileCard