import { 
  Flame, 
  Dumbbell, 
  Heart, 
  Activity, 
  Zap,
  Target,
  Wind,
  Droplet
} from 'lucide-react'

// Workout day icon configurations
export const WORKOUT_ICONS = {
  'FAT LOSS': {
    icon: Flame,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    images: ['/workout-icons/fat-loss.png']
  },
  'SHOULDER + ABS': {
    icon: Dumbbell,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    images: ['/workout-icons/shoulder.png', '/workout-icons/abs.png']
  },
  'LEGS + CORE': {
    icon: Target,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    images: ['/workout-icons/leg.png', '/workout-icons/core.png']
  },
  'ACTIVE RECOVERY + WALKING': {
    icon: Wind,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    images: ['/workout-icons/recovery.png', '/workout-icons/walking.png']
  },
  'BACK + BICEP': {
    icon: Zap,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
    images: ['/workout-icons/back.png', '/workout-icons/bicep.png']
  },
  'CHEST + TRICEP': {
    icon: Heart,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/20',
    images: ['/workout-icons/chest.png', '/workout-icons/tricep.png']
  }
}

// Get icon config for a workout day name
export const getWorkoutIcon = (workoutDayName) => {
  if (!workoutDayName) return null
  
  // Normalize the name and check for matches
  const normalizedName = workoutDayName.toUpperCase().trim()
  
  // Exact match
  if (WORKOUT_ICONS[normalizedName]) {
    return WORKOUT_ICONS[normalizedName]
  }
  
  // Partial match (for variations in naming)
  for (const [key, config] of Object.entries(WORKOUT_ICONS)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return config
    }
  }
  
  // Default fallback
  return {
    icon: Dumbbell,
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/20',
    images: []
  }
}

// Workout Icon Component (Lucide Icon)
export const WorkoutIcon = ({ workoutDayName, size = 'md', showBg = true, className = '' }) => {
  const config = getWorkoutIcon(workoutDayName)
  if (!config) return null
  
  const Icon = config.icon
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
    '2xl': 'w-10 h-10'
  }
  
  const bgSizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
    xl: 'p-3',
    '2xl': 'p-4'
  }
  
  if (showBg) {
    return (
      <div className={`${config.bgColor} ${bgSizeClasses[size]} rounded-lg ${className}`}>
        <Icon className={`${config.color} ${sizeClasses[size]}`} />
      </div>
    )
  }
  
  return <Icon className={`${config.color} ${sizeClasses[size]} ${className}`} />
}

// Workout Image Component (PNG Images - can show multiple)
export const WorkoutImage = ({ workoutDayName, size = 'md', className = '' }) => {
  const config = getWorkoutIcon(workoutDayName)
  if (!config || !config.images || config.images.length === 0) return null
  
  const sizeClasses = {
    sm: 'w-3 h-3 sm:w-4 sm:h-4',
    md: 'w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6',
    lg: 'w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10',
    xl: 'w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12',
    '2xl': 'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16'
  }
  
  const gapClasses = {
    sm: 'gap-0.5',
    md: 'gap-0.5 sm:gap-1',
    lg: 'gap-1',
    xl: 'gap-1 sm:gap-1.5',
    '2xl': 'gap-1.5 sm:gap-2'
  }
  
  return (
    <div className={`flex items-center justify-center ${gapClasses[size]} ${className}`}>
      {config.images.map((imagePath, index) => (
        <img 
          key={index}
          src={imagePath} 
          alt={`${workoutDayName} ${index + 1}`}
          className={`${sizeClasses[size]} object-contain flex-shrink-0`}
        />
      ))}
    </div>
  )
}
