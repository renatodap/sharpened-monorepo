# CourtSync Component Library

## Design System Overview

CourtSync uses the **Sharpened** brand system with a mobile-first, dark-themed design optimized for tennis team management. All components follow accessibility guidelines (WCAG 2.1 AA) and are built with TypeScript for type safety.

### Brand Colors
```css
:root {
  /* Primary Brand */
  --navy: #0B2A4A;
  --navy-light: #1A3B5C;
  --navy-dark: #051A2F;
  
  /* Backgrounds */
  --black: #0A0A0A;
  --surface: #151515;
  --surface-elevated: #1F1F1F;
  
  /* Text */
  --white: #FFFFFF;
  --gray-light: #C7CBD1;
  --gray-muted: #8B9096;
  --gray-dark: #4A4A4A;
  
  /* Status Colors */
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
  --info: #3B82F6;
}
```

### Typography Scale
```css
:root {
  /* Font Sizes */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  
  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

### Spacing Scale
```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
}
```

## Base Components

### Button
```typescript
// components/ui/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  children,
  onClick,
  type = 'button'
}: ButtonProps) {
  const baseClasses = `
    inline-flex items-center justify-center rounded-lg font-medium
    transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
  `;
  
  const variants = {
    primary: 'bg-navy text-white hover:bg-navy-light focus:ring-navy',
    secondary: 'bg-surface text-white border border-gray-dark hover:bg-surface-elevated',
    ghost: 'text-gray-light hover:text-white hover:bg-surface',
    danger: 'bg-error text-white hover:bg-red-600 focus:ring-error'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]}`}
    >
      {loading && <Spinner className="mr-2" />}
      {children}
    </button>
  );
}
```

### Input
```typescript
// components/ui/Input.tsx
interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'tel' | 'url';
  error?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
}

export function Input({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  error,
  required = false,
  disabled = false,
  autoComplete
}: InputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-light">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        className={`
          w-full px-3 py-2 bg-surface border rounded-lg text-white
          placeholder-gray-muted focus:outline-none focus:ring-2
          focus:ring-navy focus:border-navy transition-colors
          ${error ? 'border-error' : 'border-gray-dark'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      />
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
    </div>
  );
}
```

### Card
```typescript
// components/ui/Card.tsx
interface CardProps {
  children: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: boolean;
  border?: boolean;
  className?: string;
}

export function Card({
  children,
  padding = 'md',
  shadow = true,
  border = true,
  className = ''
}: CardProps) {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };
  
  return (
    <div className={`
      bg-surface rounded-lg
      ${paddingClasses[padding]}
      ${shadow ? 'shadow-lg' : ''}
      ${border ? 'border border-gray-dark' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
}
```

## Calendar Components

### CalendarView
```typescript
// components/calendar/CalendarView.tsx
interface CalendarEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  event_type: 'practice' | 'match' | 'meeting' | 'travel';
  facility?: {
    name: string;
    type: string;
  };
}

interface CalendarViewProps {
  events: CalendarEvent[];
  view: 'day' | 'week' | 'month';
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onAddEvent?: () => void;
}

export function CalendarView({
  events,
  view,
  currentDate,
  onDateChange,
  onEventClick,
  onAddEvent
}: CalendarViewProps) {
  return (
    <div className="bg-surface rounded-lg border border-gray-dark">
      <CalendarHeader
        view={view}
        currentDate={currentDate}
        onDateChange={onDateChange}
        onAddEvent={onAddEvent}
      />
      <CalendarGrid
        view={view}
        currentDate={currentDate}
        events={events}
        onEventClick={onEventClick}
      />
    </div>
  );
}
```

### EventCard
```typescript
// components/calendar/EventCard.tsx
interface EventCardProps {
  event: CalendarEvent;
  showTime?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

export function EventCard({
  event,
  showTime = true,
  compact = false,
  onClick
}: EventCardProps) {
  const eventTypeColors = {
    practice: 'bg-info border-blue-500',
    match: 'bg-error border-red-500',
    meeting: 'bg-warning border-yellow-500',
    travel: 'bg-success border-green-500'
  };
  
  return (
    <div
      className={`
        rounded-lg border-l-4 p-3 cursor-pointer
        hover:bg-surface-elevated transition-colors
        ${eventTypeColors[event.event_type]}
        bg-surface
      `}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-white truncate">
            {event.title}
          </h4>
          {showTime && (
            <p className="text-xs text-gray-muted mt-1">
              {formatEventTime(event.start_time, event.end_time)}
            </p>
          )}
          {event.facility && !compact && (
            <p className="text-xs text-gray-light mt-1">
              📍 {event.facility.name}
            </p>
          )}
        </div>
        <EventTypeIcon type={event.event_type} />
      </div>
    </div>
  );
}
```

## Communication Components

### MessageBubble
```typescript
// components/communication/MessageBubble.tsx
interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  message_type: 'text' | 'announcement' | 'image' | 'file';
  attachments?: any[];
  reactions?: Record<string, string[]>;
  created_at: string;
  is_own?: boolean;
}

interface MessageBubbleProps {
  message: Message;
  onReact?: (emoji: string) => void;
  onReply?: () => void;
}

export function MessageBubble({
  message,
  onReact,
  onReply
}: MessageBubbleProps) {
  return (
    <div className={`flex space-x-3 ${message.is_own ? 'flex-row-reverse space-x-reverse' : ''}`}>
      <Avatar
        src={message.sender.avatar_url}
        name={message.sender.full_name}
        size="sm"
      />
      <div className={`flex-1 max-w-xs lg:max-w-md ${message.is_own ? 'items-end' : ''}`}>
        <div className={`
          rounded-lg px-4 py-2
          ${message.is_own 
            ? 'bg-navy text-white' 
            : 'bg-surface border border-gray-dark text-white'
          }
          ${message.message_type === 'announcement' 
            ? 'bg-warning text-black font-medium' 
            : ''
          }
        `}>
          {message.content}
          {message.attachments?.map((attachment, i) => (
            <AttachmentPreview key={i} attachment={attachment} />
          ))}
        </div>
        <MessageFooter
          timestamp={message.created_at}
          reactions={message.reactions}
          onReact={onReact}
          onReply={onReply}
          align={message.is_own ? 'right' : 'left'}
        />
      </div>
    </div>
  );
}
```

### ChannelList
```typescript
// components/communication/ChannelList.tsx
interface Channel {
  id: string;
  name: string;
  type: 'team' | 'coaches' | 'social' | 'direct';
  unread_count: number;
  last_message?: {
    content: string;
    sender_name: string;
    created_at: string;
  };
}

interface ChannelListProps {
  channels: Channel[];
  activeChannelId?: string;
  onChannelSelect: (channel: Channel) => void;
  onCreateChannel?: () => void;
}

export function ChannelList({
  channels,
  activeChannelId,
  onChannelSelect,
  onCreateChannel
}: ChannelListProps) {
  return (
    <div className="bg-surface border-r border-gray-dark h-full">
      <div className="p-4 border-b border-gray-dark">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Messages</h2>
          {onCreateChannel && (
            <Button variant="ghost" size="sm" onClick={onCreateChannel}>
              <PlusIcon className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      <div className="overflow-y-auto">
        {channels.map((channel) => (
          <ChannelItem
            key={channel.id}
            channel={channel}
            isActive={channel.id === activeChannelId}
            onClick={() => onChannelSelect(channel)}
          />
        ))}
      </div>
    </div>
  );
}
```

## Video Components

### VideoPlayer
```typescript
// components/video/VideoPlayer.tsx
interface VideoPlayerProps {
  src: string;
  title: string;
  poster?: string;
  annotations?: VideoAnnotation[];
  onTimeUpdate?: (currentTime: number) => void;
  onAddAnnotation?: (timestamp: number) => void;
}

export function VideoPlayer({
  src,
  title,
  poster,
  annotations = [],
  onTimeUpdate,
  onAddAnnotation
}: VideoPlayerProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-auto"
        controls
        onTimeUpdate={(e) => {
          const time = e.currentTarget.currentTime;
          setCurrentTime(time);
          onTimeUpdate?.(time);
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      
      {/* Annotation Overlay */}
      <AnnotationOverlay
        annotations={annotations}
        currentTime={currentTime}
        onAnnotationClick={(annotation) => {
          if (videoRef.current) {
            videoRef.current.currentTime = annotation.timestamp_seconds;
          }
        }}
      />
      
      {/* Add Annotation Button */}
      {onAddAnnotation && (
        <button
          className="absolute top-4 right-4 bg-navy text-white p-2 rounded-lg"
          onClick={() => onAddAnnotation(currentTime)}
        >
          💬 Add Note
        </button>
      )}
    </div>
  );
}
```

### VideoLibrary
```typescript
// components/video/VideoLibrary.tsx
interface VideoLibraryProps {
  videos: Video[];
  loading?: boolean;
  onVideoSelect: (video: Video) => void;
  onUpload?: () => void;
  filters?: {
    event_type?: string;
    player_id?: string;
    date_range?: [Date, Date];
  };
  onFiltersChange?: (filters: any) => void;
}

export function VideoLibrary({
  videos,
  loading = false,
  onVideoSelect,
  onUpload,
  filters,
  onFiltersChange
}: VideoLibraryProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Video Library</h2>
        {onUpload && (
          <Button onClick={onUpload}>
            📹 Upload Video
          </Button>
        )}
      </div>
      
      {onFiltersChange && (
        <VideoFilters
          filters={filters}
          onChange={onFiltersChange}
        />
      )}
      
      {loading ? (
        <VideoLibrarySkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onClick={() => onVideoSelect(video)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

## Mobile-Optimized Components

### BottomNavigation
```typescript
// components/mobile/BottomNavigation.tsx
interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: number;
}

interface BottomNavigationProps {
  items: NavItem[];
  activeItem: string;
}

export function BottomNavigation({ items, activeItem }: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-dark md:hidden">
      <div className="flex items-center justify-around py-2">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`
              flex flex-col items-center py-2 px-3 rounded-lg
              ${activeItem === item.id 
                ? 'text-navy bg-navy/10' 
                : 'text-gray-muted'
              }
            `}
          >
            <div className="relative">
              <item.icon className="w-6 h-6" />
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-2 -right-2 bg-error text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
```

### SwipeableCard
```typescript
// components/mobile/SwipeableCard.tsx
interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: {
    icon: React.ComponentType;
    color: string;
    label: string;
  };
  rightAction?: {
    icon: React.ComponentType;
    color: string;
    label: string;
  };
}

export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction
}: SwipeableCardProps) {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  return (
    <div className="relative overflow-hidden">
      {/* Action Backgrounds */}
      {leftAction && (
        <div className={`absolute inset-y-0 left-0 w-20 flex items-center justify-center ${leftAction.color}`}>
          <leftAction.icon className="w-6 h-6 text-white" />
        </div>
      )}
      {rightAction && (
        <div className={`absolute inset-y-0 right-0 w-20 flex items-center justify-center ${rightAction.color}`}>
          <rightAction.icon className="w-6 h-6 text-white" />
        </div>
      )}
      
      {/* Main Card */}
      <div
        className={`
          transform transition-transform duration-200 bg-surface
          ${isDragging ? 'transition-none' : ''}
        `}
        style={{ transform: `translateX(${dragOffset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}
```

## Form Components

### FormField
```typescript
// components/forms/FormField.tsx
interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  help?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  required = false,
  error,
  help,
  children
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-light">
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>
      {children}
      {help && !error && (
        <p className="text-sm text-gray-muted">{help}</p>
      )}
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
    </div>
  );
}
```

### DateTimePicker
```typescript
// components/forms/DateTimePicker.tsx
interface DateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
  minDate?: Date;
  maxDate?: Date;
  required?: boolean;
  error?: string;
}

export function DateTimePicker({
  value,
  onChange,
  label,
  minDate,
  maxDate,
  required = false,
  error
}: DateTimePickerProps) {
  return (
    <FormField label={label} required={required} error={error}>
      <div className="grid grid-cols-2 gap-3">
        <Input
          type="date"
          value={format(value, 'yyyy-MM-dd')}
          onChange={(dateStr) => {
            const newDate = new Date(dateStr);
            newDate.setHours(value.getHours(), value.getMinutes());
            onChange(newDate);
          }}
          min={minDate ? format(minDate, 'yyyy-MM-dd') : undefined}
          max={maxDate ? format(maxDate, 'yyyy-MM-dd') : undefined}
        />
        <Input
          type="time"
          value={format(value, 'HH:mm')}
          onChange={(timeStr) => {
            const [hours, minutes] = timeStr.split(':').map(Number);
            const newDate = new Date(value);
            newDate.setHours(hours, minutes);
            onChange(newDate);
          }}
        />
      </div>
    </FormField>
  );
}
```

## Loading & Empty States

### LoadingSkeleton
```typescript
// components/ui/LoadingSkeleton.tsx
interface LoadingSkeletonProps {
  lines?: number;
  avatar?: boolean;
  className?: string;
}

export function LoadingSkeleton({
  lines = 3,
  avatar = false,
  className = ''
}: LoadingSkeletonProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="flex space-x-4">
        {avatar && (
          <div className="rounded-full bg-gray-dark h-10 w-10"></div>
        )}
        <div className="flex-1 space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={`h-4 bg-gray-dark rounded ${
                i === lines - 1 ? 'w-3/4' : 'w-full'
              }`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### EmptyState
```typescript
// components/ui/EmptyState.tsx
interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action
}: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      {Icon && (
        <Icon className="mx-auto h-12 w-12 text-gray-muted mb-4" />
      )}
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-gray-muted mb-6 max-w-sm mx-auto">{description}</p>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
```

## Utility Components

### StatusBadge
```typescript
// components/ui/StatusBadge.tsx
interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'error' | 'success';
  label: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, label, size = 'md' }: StatusBadgeProps) {
  const statusColors = {
    active: 'bg-success text-white',
    inactive: 'bg-gray-dark text-gray-light',
    pending: 'bg-warning text-black',
    error: 'bg-error text-white',
    success: 'bg-success text-white'
  };
  
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm'
  };
  
  return (
    <span className={`
      inline-flex items-center rounded-full font-medium
      ${statusColors[status]} ${sizes[size]}
    `}>
      {label}
    </span>
  );
}
```

This component library provides a comprehensive foundation for building the CourtSync tennis team management application with consistent design, accessibility, and mobile optimization.