const SKILL_CLASSES = {
  beginner: 'skill-beginner',
  intermediate: 'skill-intermediate',
  advanced: 'skill-advanced',
  'all levels': 'skill-all',
}

export default function SkillBadge({ level, size = 'sm' }) {
  const key = level?.toLowerCase() || 'all levels'
  const cls = SKILL_CLASSES[key] || 'skill-all'
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'

  return (
    <span className={`inline-flex items-center rounded-full font-body font-medium ${sizeClass} ${cls}`}>
      {level || 'All Levels'}
    </span>
  )
}
