// Utility for direct GitHub Cloud Synchronization (24/7 access even with laptop shut down)

export const REPO_OWNER = 'CapMorningStar';
export const REPO_NAME = 'ucsd-fall-2026';
export const FILE_PATH = 'Master Weekly To-Do & Deadlines.md';

const TOKEN_STORAGE_KEY = 'ucsd_gh_token';

// Extract course name
function extractCourse(text: string): string {
  if (/DSC\s*10/i.test(text)) return 'DSC 10';
  if (/COGS\s*9/i.test(text)) return 'COGS 9';
  if (/COGS\s*14A/i.test(text)) return 'COGS 14A';
  if (/SOCI\s*141/i.test(text)) return 'SOCI 141';
  if (/WCWP\s*100/i.test(text)) return 'WCWP 100';
  if (/Arcell/i.test(text)) return 'Arcell AI';
  if (/Triton\s*Firsts/i.test(text)) return 'Triton Firsts';
  if (/PACE/i.test(text)) return 'PACE';
  return 'General';
}

// Extract platform
function extractPlatform(text: string): string {
  if (/DataHub/i.test(text) && /Gradescope/i.test(text)) return 'DataHub / Gradescope';
  if (/Gradescope/i.test(text)) return 'Gradescope';
  if (/DataHub/i.test(text)) return 'DataHub';
  if (/Canvas/i.test(text)) return 'Canvas';
  if (/Google\s*Doc|Google\s*Form/i.test(text)) return 'Google Doc';
  if (/In-Person|Discussion|Worksheet|Pod/i.test(text)) return 'In-Person Prep';
  if (/Arcell|Triton|Internship|Fellowship/i.test(text)) return 'Internship';
  return 'Canvas';
}

// Extract due date label
function extractDueDate(text: string): string {
  const match = text.match(/(?:Due|bring to class|Taken in-person)\s*([^*()\n]+(?:PM|AM|Oct\s*\d+|Sep\s*\d+)?)/i);
  if (match) return match[0].trim();
  if (/Thursday,\s*Oct\s*1/i.test(text)) return 'Thursday, Oct 1';
  if (/Wednesday,\s*Sep\s*30/i.test(text)) return 'Wednesday, Sep 30';
  if (/Tuesday,\s*Oct\s*6/i.test(text)) return 'Due Tuesday, Oct 6 @ 11:59 PM';
  if (/Wednesday,\s*Oct\s*7/i.test(text)) return 'Due Wednesday, Oct 7 @ 11:59 PM';
  if (/Thursday,\s*Oct\s*8/i.test(text)) return 'Due Thursday, Oct 8 @ 11:59 PM';
  if (/Friday,\s*Oct\s*9/i.test(text)) return 'Due Friday, Oct 9 @ 11:59 PM';
  if (/Sunday,\s*Oct\s*11/i.test(text)) return 'Due Sunday, Oct 11 @ 9:00 AM';
  return 'Upcoming';
}

function checkIsUrgent48h(text: string, completed: boolean): boolean {
  if (completed) return false;
  if (/Sep\s*30|Oct\s*1\b|First\s*Class\s*Preparation/i.test(text)) return true;
  return false;
}

function isHomeworkItem(text: string, section: string, subSection: string): boolean {
  if (/Academic Deliverables/i.test(subSection) || /Week 2 Lookahead/i.test(section) || /Internship/i.test(subSection)) {
    return true;
  }
  if (/Lecture \d+/i.test(text) && !/Preparation|Discussion Section|Pod Meeting/i.test(text)) {
    return false;
  }
  if (/Lab|Homework|Quiz|Reading|Discussion|Groupwork|Autobiography|Questionnaire|Contract|Preparation|Follow up/i.test(text)) {
    return true;
  }
  return false;
}

// Unicode safe base64 decode
export function b64DecodeUnicode(str: string): string {
  return decodeURIComponent(
    atob(str.replace(/\s/g, ''))
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
}

// Unicode safe base64 encode
export function b64EncodeUnicode(str: string): string {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    )
  );
}

export function parseMarkdownToTasks(content: string) {
  const lines = content.split('\n');
  let currentSection = 'General';
  let currentSubSection = '';
  let lastSynced = '2026-09-29';

  const frontmatterMatch = content.match(/last_synced:\s*([0-9-]+)/);
  if (frontmatterMatch) lastSynced = frontmatterMatch[1];

  const allItems: any[] = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('## ')) {
      currentSection = trimmed.replace(/^##\s*/, '').trim();
      currentSubSection = '';
      return;
    }
    if (trimmed.startsWith('### ')) {
      currentSubSection = trimmed.replace(/^###\s*/, '').trim();
      return;
    }

    const checkMatch = trimmed.match(/^-\s*\[([ xX])\]\s*(.*)$/);
    if (checkMatch) {
      const isCompleted = checkMatch[1].toLowerCase() === 'x';
      const rawText = checkMatch[2].trim();

      if (!isHomeworkItem(rawText, currentSection, currentSubSection)) return;

      const titleMatch = rawText.match(/^\*\*([^*]+)\*\*:?\s*(.*)$/);
      let title = rawText;
      let details = '';

      if (titleMatch) {
        title = titleMatch[1].trim();
        details = titleMatch[2].trim();
      } else {
        title = rawText.replace(/\*\*/g, '').split(':')[0].trim();
        details = rawText.replace(/\*\*/g, '').slice(title.length).replace(/^:\s*/, '').trim();
      }

      allItems.push({
        id: `hw-${index}`,
        lineIndex: index,
        rawTitle: title,
        title,
        details,
        course: extractCourse(rawText),
        platform: extractPlatform(rawText),
        dueFormatted: extractDueDate(rawText),
        isCompleted,
        isUrgent48h: checkIsUrgent48h(rawText, isCompleted),
        section: currentSection
      });
    }
  });

  const activeTasks = allItems.filter(t => !t.isCompleted);
  const completedTasks = allItems.filter(t => t.isCompleted);

  return {
    activeTasks,
    completedTasks,
    stats: {
      active: activeTasks.length,
      completed: completedTasks.length,
      urgent: activeTasks.filter(t => t.isUrgent48h).length
    },
    lastSynced
  };
}

// Manage GitHub token in URL hash or localStorage
export function getGitHubToken(): string | null {
  if (typeof window === 'undefined') return null;

  // Check URL hash: e.g. #token=gho_...
  const hash = window.location.hash;
  if (hash && hash.includes('token=')) {
    const match = hash.match(/token=([a-zA-Z0-9_]+)/);
    if (match && match[1]) {
      const token = match[1];
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      // Clean hash from URL for security
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      return token;
    }
  }

  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function saveGitHubToken(token: string) {
  if (!token) {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } else {
    localStorage.setItem(TOKEN_STORAGE_KEY, token.trim());
  }
}

// Fetch file from GitHub API
export async function fetchFileFromGitHub(token: string) {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${encodeURIComponent(FILE_PATH)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json'
    }
  });

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new Error('Invalid or expired GitHub token. Please re-authenticate.');
    }
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  const content = b64DecodeUnicode(json.content);
  return {
    content,
    sha: json.sha,
    parsed: parseMarkdownToTasks(content)
  };
}

// Update file on GitHub API
export async function toggleTaskOnGitHub(token: string, title: string, completed: boolean) {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${encodeURIComponent(FILE_PATH)}`;
  
  // 1. Get latest SHA & content
  const current = await fetchFileFromGitHub(token);
  const lines = current.content.split('\n');

  let modified = false;
  const updatedLines = lines.map(line => {
    if (line.includes(title)) {
      if (completed) {
        if (line.includes('- [ ]')) {
          modified = true;
          let updated = line.replace('- [ ]', '- [x]');
          if (!updated.includes('✅')) updated = updated.trim() + ' ✅';
          return updated;
        }
      } else {
        if (line.includes('- [x]') || line.includes('- [X]')) {
          modified = true;
          let updated = line.replace(/-\s*\[[xX]\]/, '- [ ]');
          updated = updated.replace(/\s*✅.*$/, '');
          return updated;
        }
      }
    }
    return line;
  });

  if (!modified) {
    throw new Error(`Task '${title}' not found in markdown file.`);
  }

  const todayStr = new Date().toISOString().split('T')[0];
  let newContent = updatedLines.join('\n');
  newContent = newContent.replace(/last_synced:\s*[0-9-]+/, `last_synced: ${todayStr}`);

  // 2. Commit update to GitHub
  const body = {
    message: `chore(mobile): ${completed ? 'complete' : 'reopen'} '${title}'`,
    content: b64EncodeUnicode(newContent),
    sha: current.sha,
    branch: 'main'
  };

  const putRes = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!putRes.ok) {
    throw new Error(`Failed to commit update to GitHub: ${putRes.status}`);
  }

  return parseMarkdownToTasks(newContent);
}
