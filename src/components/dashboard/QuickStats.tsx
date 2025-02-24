
interface QuickStatsProps {
  activeChores: number;
  familyMembersCount: number;
  completedToday: number;
  totalPoints: number;
}

export function QuickStats({
  activeChores,
  familyMembersCount,
  completedToday,
  totalPoints,
}: QuickStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
        <h3 className="text-sm font-medium text-neutral-600">Active Chores</h3>
        <p className="text-2xl font-semibold text-neutral-900 mt-2">{activeChores}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
        <h3 className="text-sm font-medium text-neutral-600">Family Members</h3>
        <p className="text-2xl font-semibold text-neutral-900 mt-2">{familyMembersCount}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
        <h3 className="text-sm font-medium text-neutral-600">Completed Today</h3>
        <p className="text-2xl font-semibold text-neutral-900 mt-2">{completedToday}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
        <h3 className="text-sm font-medium text-neutral-600">Total Points Earned</h3>
        <p className="text-2xl font-semibold text-neutral-900 mt-2">{totalPoints}</p>
      </div>
    </div>
  );
}
