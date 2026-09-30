export interface Task {
  id: string;
  lineIndex: number;
  rawLine: string;
  title: string;
  details: string;
  course: string;
  platform: string;
  isCompleted: boolean;
  isUrgent48h: boolean;
  group: 'urgent48h' | 'week1' | 'week2' | 'archive';
  section: string;
  subSection: string;
}

export interface ClassSession {
  id: string;
  code: string;
  title: string;
  type: string;
  topic: string;
  time: string;
  room: string;
  instructor: string;
  mapUrl: string;
  color: string;
}

export interface DaySchedule {
  day: string;
  dateLabel: string;
  classes: ClassSession[];
}

export interface CourseLink {
  label: string;
  url: string;
}

export interface CourseCard {
  code: string;
  title: string;
  units: string;
  professors: string;
  links: CourseLink[];
  color: string;
  status: string;
}

export interface DashboardStats {
  total: number;
  completed: number;
  urgentCount: number;
  percentage: number;
}

export interface UserProfile {
  name: string;
  pid: string;
  email: string;
  term: string;
  week: string;
}

export interface DashboardData {
  success: boolean;
  user: UserProfile;
  tasks: Task[];
  stats: DashboardStats;
  schedule: DaySchedule[];
  courses: CourseCard[];
  lastSynced: string;
  vaultPath: string;
}

export interface NetworkInfo {
  localIp: string;
  mobileUrl: string;
  cloudUrl?: string;
  ghToken?: string;
  mdnsUrl?: string;
  qrDataUri: string;
  port: number;
}
