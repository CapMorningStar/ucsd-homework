import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import QRCode from 'qrcode';

const app = express();
const PORT = 3001;
const VITE_PORT = 5173;

app.use(cors());
app.use(express.json());

const OBSIDIAN_VAULT = '/Users/kyawsoelwin/Obsidian/Fall 2026';
const MASTER_TODO_PATH = path.join(OBSIDIAN_VAULT, 'Master Weekly To-Do & Deadlines.md');

// Helper to determine Local IP for Mobile Phone Connection
function getLocalNetworkIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

// Check git info for CapMorningStar/ucsd-fall-2026
function getGitInfo() {
  return new Promise((resolve) => {
    exec(
      'git log -1 --format="%h|%s|%cr" && git status --porcelain',
      { cwd: OBSIDIAN_VAULT },
      (err, stdout) => {
        if (err || !stdout) {
          resolve({
            repo: 'CapMorningStar/ucsd-fall-2026',
            branch: 'main',
            lastCommit: 'Synchronized',
            isClean: true
          });
          return;
        }

        const lines = stdout.trim().split('\n');
        const [hash, msg, relativeTime] = (lines[0] || '').split('|');
        const isClean = lines.length <= 1 || !lines.slice(1).some(l => l.includes('Master Weekly'));

        resolve({
          repo: 'CapMorningStar/ucsd-fall-2026',
          branch: 'main',
          lastCommit: `${hash || ''}: ${msg || 'Latest backup'} (${relativeTime || 'recently'})`,
          isClean
        });
      }
    );
  });
}

// Parse course name
function extractCourse(text) {
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

// Parse platform
function extractPlatform(text) {
  if (/DataHub/i.test(text) && /Gradescope/i.test(text)) return 'DataHub / Gradescope';
  if (/Gradescope/i.test(text)) return 'Gradescope';
  if (/DataHub/i.test(text)) return 'DataHub';
  if (/Canvas/i.test(text)) return 'Canvas';
  if (/Google\s*Doc|Google\s*Form/i.test(text)) return 'Google Doc';
  if (/In-Person|Discussion|Worksheet|Pod/i.test(text)) return 'In-Person Prep';
  if (/Arcell|Triton|Internship|Fellowship/i.test(text)) return 'Internship';
  return 'Canvas';
}

// Parse due date label
function extractDueDate(text) {
  const match = text.match(/(?:Due|bring to class|Taken in-person)\s*([^*()\n]+(?:PM|AM|Oct\s*\d+|Sep\s*\d+)?)/i);
  if (match) {
    return match[0].trim();
  }
  if (/Thursday,\s*Oct\s*1/i.test(text)) return 'Thursday, Oct 1';
  if (/Wednesday,\s*Sep\s*30/i.test(text)) return 'Wednesday, Sep 30';
  if (/Tuesday,\s*Oct\s*6/i.test(text)) return 'Due Tuesday, Oct 6 @ 11:59 PM';
  if (/Wednesday,\s*Oct\s*7/i.test(text)) return 'Due Wednesday, Oct 7 @ 11:59 PM';
  if (/Thursday,\s*Oct\s*8/i.test(text)) return 'Due Thursday, Oct 8 @ 11:59 PM';
  if (/Friday,\s*Oct\s*9/i.test(text)) return 'Due Friday, Oct 9 @ 11:59 PM';
  if (/Sunday,\s*Oct\s*11/i.test(text)) return 'Due Sunday, Oct 11 @ 9:00 AM';
  return 'Upcoming';
}

// Check 48-Hour Urgency
function checkIsUrgent48h(text, section, completed) {
  if (completed) return false;
  // If mentions next 48h dates (Sep 30, Oct 1) or first class prep
  if (/Sep\s*30|Oct\s*1\b|First\s*Class\s*Preparation/i.test(text)) return true;
  return false;
}

// Determine if this item is strictly HOMEWORK / DELIVERABLE (not passive lecture attendance)
function isHomeworkItem(text, section, subSection) {
  // Always include Academic Deliverables, Week 2 Lookahead, Internships
  if (/Academic Deliverables/i.test(subSection) || /Week 2 Lookahead/i.test(section) || /Internship/i.test(subSection)) {
    return true;
  }
  // If in class meetings, only include if it's preparation or workshop
  if (/Lecture \d+/i.test(text) && !/Preparation|Discussion Section|Pod Meeting/i.test(text)) {
    return false; // Skip ordinary lecture attendance to keep the app clean!
  }
  // Include discussions, worksheets, assignments, labs, quizzes, readings
  if (/Lab|Homework|Quiz|Reading|Discussion|Groupwork|Autobiography|Questionnaire|Contract|Preparation|Follow up/i.test(text)) {
    return true;
  }
  return false;
}

// Parse Master To-Do specifically for Homework Tracking
function parseHomeworkDeliverables() {
  if (!fs.existsSync(MASTER_TODO_PATH)) {
    return { activeTasks: [], completedTasks: [], stats: { active: 0, completed: 0, urgent: 0 } };
  }

  const content = fs.readFileSync(MASTER_TODO_PATH, 'utf-8');
  const lines = content.split('\n');

  let currentSection = 'General';
  let currentSubSection = '';
  let lastSynced = '2026-09-29';

  const frontmatterMatch = content.match(/last_synced:\s*([0-9-]+)/);
  if (frontmatterMatch) {
    lastSynced = frontmatterMatch[1];
  }

  const allItems = [];

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

      // Check if it's homework/deliverable
      if (!isHomeworkItem(rawText, currentSection, currentSubSection)) {
        return; // Filter out routine lecture attendance
      }

      // Title & details extraction
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

      const course = extractCourse(rawText);
      const platform = extractPlatform(rawText);
      const isUrgent = checkIsUrgent48h(rawText, currentSubSection, isCompleted);
      const dueFormatted = extractDueDate(rawText);

      allItems.push({
        id: `hw-${index}`,
        lineIndex: index,
        rawTitle: title,
        title,
        details,
        course,
        platform,
        dueFormatted,
        isCompleted,
        isUrgent48h: isUrgent,
        section: currentSection
      });
    }
  });

  // Active items: ONLY uncompleted homework! (When completed in Obsidian, it disappears from this list)
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

// 1. API: Get Homework Dashboard data
app.get('/api/dashboard', async (req, res) => {
  try {
    const data = parseHomeworkDeliverables();
    const gitInfo = await getGitInfo();

    res.json({
      success: true,
      user: {
        name: 'Kyaw Soe Lwin',
        courses: ['DSC 10', 'COGS 9', 'COGS 14A', 'SOCI 141', 'WCWP 100'],
        term: 'Fall 2026'
      },
      ...data,
      gitInfo,
      vaultPath: OBSIDIAN_VAULT
    });
  } catch (err) {
    console.error('Error in /api/dashboard:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. API: Toggle homework item
app.post('/api/tasks/toggle', (req, res) => {
  try {
    const { title, completed } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, error: 'Title required' });
    }

    if (!fs.existsSync(MASTER_TODO_PATH)) {
      return res.status(404).json({ success: false, error: 'Vault file not found' });
    }

    let content = fs.readFileSync(MASTER_TODO_PATH, 'utf-8');
    const lines = content.split('\n');
    let modified = false;

    const updatedLines = lines.map(line => {
      if (line.includes(title)) {
        if (completed) {
          if (line.includes('- [ ]')) {
            modified = true;
            let updated = line.replace('- [ ]', '- [x]');
            if (!updated.includes('✅')) {
              updated = updated.trim() + ' ✅';
            }
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

    if (modified) {
      const todayStr = new Date().toISOString().split('T')[0];
      let newContent = updatedLines.join('\n');
      newContent = newContent.replace(/last_synced:\s*[0-9-]+/, `last_synced: ${todayStr}`);

      fs.writeFileSync(MASTER_TODO_PATH, newContent, 'utf-8');

      // Trigger background git commit & push to GitHub
      exec(
        `git add "Master Weekly To-Do & Deadlines.md" && git commit -m "chore(mobile): ${completed ? 'completed' : 'reopened'} '${title}'" && git push origin main`,
        { cwd: OBSIDIAN_VAULT },
        (err) => {
          if (err) console.warn('Git push warning:', err.message);
          else console.log('Successfully pushed task update to GitHub!');
        }
      );

      // Return fresh parsed list
      const freshData = parseHomeworkDeliverables();
      return res.json({
        success: true,
        title,
        completed,
        ...freshData
      });
    }

    return res.status(404).json({ success: false, error: 'Task not found in file' });
  } catch (err) {
    console.error('Error toggling task:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. API: Network info for phone scanning & 24/7 GitHub Cloud Access
app.get('/api/network-info', async (req, res) => {
  try {
    const localIp = getLocalNetworkIp();
    const mobileUrl = `http://${localIp}:${VITE_PORT}`;

    // Get GitHub token via gh CLI if available
    let ghToken = '';
    try {
      const { execSync } = await import('child_process');
      ghToken = execSync('gh auth token', { encoding: 'utf-8' }).trim();
    } catch (e) {
      console.warn('Could not read gh token:', e.message);
    }

    const cloudUrl = `https://capmorningstar.github.io/ucsd-homework/#token=${ghToken}`;

    // Generate QR Code for 24/7 Cloud Access
    const qrDataUri = await QRCode.toDataURL(cloudUrl, {
      margin: 2,
      width: 280,
      color: {
        dark: '#F59E0B',
        light: '#0A0A0C'
      }
    });

    res.json({
      localIp,
      mobileUrl,
      cloudUrl,
      ghToken,
      qrDataUri,
      port: VITE_PORT
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalNetworkIp();
  console.log(`\n======================================================`);
  console.log(`⚡ UCSD Clean Homework Tracker Sync Bridge Running!`);
  console.log(`📁 Connected Obsidian Vault: ${OBSIDIAN_VAULT}`);
  console.log(`🐙 Connected GitHub Repo:   CapMorningStar/ucsd-fall-2026`);
  console.log(`💻 Local API:    http://localhost:${PORT}`);
  console.log(`📱 Mobile LAN:   http://${ip}:${VITE_PORT}`);
  console.log(`======================================================\n`);
});
