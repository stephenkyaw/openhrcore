import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEss } from '../store/EssStore';
import { colors, radius, spacing } from '../theme';
import { formatMoney, formatShortDate, todayStr } from '../utils/dates';

interface ChatMessage {
  id: string | number;
  role: 'user' | 'assistant';
  content: string;
  attachType?: string;
  isAudio?: boolean;
}

// ─── Mock AI brain ────────────────────────────────────────────────────────────

function buildReply(text: string, data: ReturnType<typeof useEss>): string {
  const q = text.toLowerCase().trim();
  const {
    attendance, balances, employee, leaveTypes, monthSummary,
    notifications, payslips, pendingApprovals, requests, tasks,
    upcomingLeave, ytdEarnings,
  } = data;

  const annual   = balances.lt1 || { granted: 0, used: 0, pending: 0 };
  const sick     = balances.lt2 || { granted: 0, used: 0, pending: 0 };
  const personal = balances.lt3 || { granted: 0, used: 0, pending: 0 };
  const annualLeft   = annual.granted - annual.used - annual.pending;
  const sickLeft     = sick.granted - sick.used - sick.pending;
  const personalLeft = personal.granted - personal.used - personal.pending;

  const latestPay = payslips[0];
  const netPay = latestPay
    ? latestPay.earnings.reduce((s, l) => s + l.amount, 0) -
      latestPay.deductions.reduce((s, l) => s + l.amount, 0)
    : 0;

  const todayRec  = attendance[0];
  const todayDate = todayStr();
  const isToday   = todayRec?.date === todayDate;
  const unread    = notifications.filter((n) => !n.read).length;
  const openTasks = tasks.filter((t) => !t.done).length;
  const pendingLeave = requests.filter((r) => r.status === 'pending').length;

  if (/leave|annual|vacation|holiday/.test(q) && /balance|left|remain|how many|how much/.test(q))
    return `Here are your current leave balances:\n\n• Annual Leave: ${annualLeft} days left (${annual.used} used, ${annual.pending} pending)\n• Sick Leave: ${sickLeft} days left\n• Personal Leave: ${personalLeft} days left\n\nYou have ${pendingLeave} pending request${pendingLeave !== 1 ? 's' : ''} awaiting approval.`;

  if (/leave|vacation/.test(q) && /request|apply|submit|how/.test(q))
    return `To request leave, go to the Leave tab and tap "Request".\n\nPick your leave type, choose your dates using the calendar, add a reason, and tap "Submit request". Your manager will be notified instantly.`;

  if (/leave|vacation/.test(q) && /pending|waiting|status/.test(q))
    return pendingLeave === 0
      ? `Good news — you have no pending leave requests right now.`
      : `You have ${pendingLeave} pending leave request${pendingLeave !== 1 ? 's' : ''}. Check Leave → History.`;

  if (/annual leave|al\b/.test(q))
    return `Your Annual Leave: ${annualLeft} days remaining out of ${annual.granted} granted.\n\n${annualLeft <= 3 ? '⚠️ Running low — plan ahead!' : annualLeft >= 10 ? 'You still have plenty of days this year.' : "You're in good shape for the year."}`;

  if (/sick leave|sl\b/.test(q))
    return `Your Sick Leave: ${sickLeft} days remaining out of ${sick.granted} granted (${sick.used} used).`;

  if (/attendance|clock|check.?in|present|absent|late/.test(q) && /today|now|current/.test(q)) {
    if (!isToday || !todayRec) return `You haven't clocked in yet today. Head to the Time tab to clock in.`;
    if (todayRec.in && !todayRec.out) return `You clocked in at ${todayRec.in} and your shift is still active. Don't forget to clock out!`;
    return `Today: ${todayRec.in} – ${todayRec.out} · ${todayRec.hours}h worked${todayRec.wfh ? ' (WFH)' : ''} · ${todayRec.status}.`;
  }

  if (/attendance|present|absent|late|wfh/.test(q) && /month|this month|may/.test(q))
    return `Your attendance this month:\n\n• Present: ${monthSummary.present} days\n• Late: ${monthSummary.late} days\n• Absent: ${monthSummary.absent} days\n• WFH: ${monthSummary.wfh} days\n\nTotal: ${monthSummary.total} days.`;

  if (/clock.?in|check.?in/.test(q))
    return `To clock in, go to the Time tab and tap "Clock in". You can also toggle WFH if working remotely.`;

  if (/clock.?out|check.?out/.test(q))
    return `To clock out, go to the Time tab and tap "Clock out". Make sure your shift is still active.`;

  if (/correction|forgot|missed clock/.test(q))
    return `No worries! Go to Time → Requests and submit a Correction Request with the date and correct times.`;

  if (/overtime|ot\b/.test(q))
    return `Overtime requests are under Time → Requests. Fill in the date, hours, and reason.`;

  if (/payslip|salary|pay|wage|earning|net pay/.test(q) && /latest|last|recent|current/.test(q)) {
    if (!latestPay) return `No payslip found yet. Check back after your first pay date.`;
    return `Your latest payslip — ${latestPay.period}:\n\n• Gross: ${formatMoney(latestPay.earnings.reduce((s, l) => s + l.amount, 0), 'THB')}\n• Net pay: ${formatMoney(netPay, 'THB')}\n• Pay date: ${formatShortDate(latestPay.payDate)}\n\nSee the full breakdown in the Pay tab.`;
  }

  if (/ytd|year.?to.?date|this year/.test(q))
    return `Year-to-date (${new Date().getFullYear()}):\n\n• Gross: ${formatMoney(ytdEarnings.gross, 'THB')}\n• Net: ${formatMoney(ytdEarnings.net, 'THB')}\n• Tax paid: ${formatMoney(ytdEarnings.tax, 'THB')}\n• Months paid: ${ytdEarnings.months}`;

  if (/payslip|salary|pay|wage/.test(q))
    return `View all your payslips under the Pay tab. Latest net pay: ${formatMoney(netPay, 'THB')} for ${latestPay?.period}.`;

  if (/claim|reimbursement|expense/.test(q))
    return `Submit expense claims under Pay → Claims. Enter category, amount, and description, then tap "Submit claim".`;

  if (/advance|salary advance/.test(q))
    return `Salary advances are under Pay → Advances. They're deducted from your next payslip and require HR approval.`;

  if (/approval|approve|pending approval|team leave/.test(q))
    return pendingApprovals.length === 0
      ? `No leave requests are waiting for your approval right now.`
      : `You have ${pendingApprovals.length} leave request${pendingApprovals.length !== 1 ? 's' : ''} pending. Go to Leave → Approvals.`;

  if (/upcoming|next leave|scheduled/.test(q)) {
    if (upcomingLeave.length === 0) return `You have no upcoming approved leave scheduled.`;
    const next = upcomingLeave[0];
    const lt = leaveTypes.find((t) => t.id === next.type);
    return `Next leave: ${lt?.name || 'Leave'} from ${formatShortDate(next.from)} to ${formatShortDate(next.to)} (${next.days} day${next.days !== 1 ? 's' : ''}).`;
  }

  if (/document|doc|certificate|passport|contract/.test(q))
    return `Your documents are under Me → Docs. You can upload new ones and track expiry dates.`;

  if (/task|onboarding|checklist/.test(q))
    return `You have ${openTasks} open onboarding task${openTasks !== 1 ? 's' : ''} remaining. Go to Me → Tasks to complete them.`;

  if (/notification|inbox|unread/.test(q))
    return unread === 0
      ? `You're all caught up — no unread notifications.`
      : `You have ${unread} unread notification${unread !== 1 ? 's' : ''}. Go to Me → Details to view them.`;

  if (/profile|my info|employee id|emp id|department|position/.test(q))
    return `Your profile:\n\n• Name: ${employee.first} ${employee.last}\n• ID: ${employee.code}\n• Position: ${employee.position}\n• Department: ${employee.dept}\n• Location: ${employee.location}\n• Hire date: ${employee.hire}`;

  if (/manager|report to|who is my/.test(q))
    return data.manager
      ? `You report to ${data.manager.first} ${data.manager.last} (${data.manager.position}).`
      : `No manager is assigned to you currently.`;

  if (/team|reports|direct report/.test(q))
    return data.team.length === 0
      ? `You currently have no direct reports.`
      : `You manage ${data.team.length} direct report${data.team.length !== 1 ? 's' : ''}: ${data.team.map((m) => m.first).join(', ')}.`;

  if (/^(hi|hello|hey|good morning|good afternoon|good evening|howdy)\b/.test(q)) {
    const h = new Date().getHours();
    const greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    return `${greet}, ${employee.first}! 👋 How can I help you today?\n\nAsk me about leave, attendance, payslips, documents, and more.`;
  }

  if (/thank|thanks|great|awesome|perfect/.test(q))
    return `You're welcome, ${employee.first}! Let me know if there's anything else I can help with.`;

  if (/help|what can you|what do you/.test(q))
    return `I can help you with:\n\n• Leave balances & requests\n• Attendance & clocking in/out\n• Payslips & YTD earnings\n• Expense claims & advances\n• Approvals & team\n• Documents & tasks\n• Notifications\n\nJust ask me anything!`;

  return `I'm not sure about that one. Try asking:\n\n• "How many leave days do I have?"\n• "What's my net pay?"\n• "Show my attendance this month"`;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const ATTACH_ICONS: Record<string, string> = {
  camera: 'camera-outline',
  gallery: 'image-outline',
  document: 'document-text-outline',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypingIndicator(): React.ReactElement {
  return (
    <View style={styles.msgRow}>
      <View style={styles.aiAvatar}>
        <Ionicons name="sparkles" size={11} color="#fff" />
      </View>
      <View style={[styles.bubble, styles.aiBubble, styles.typingBubble]}>
        <View style={styles.typingDots}>
          <View style={[styles.dot, { opacity: 0.35 }]} />
          <View style={[styles.dot, { opacity: 0.65 }]} />
          <View style={[styles.dot, { opacity: 1 }]} />
        </View>
      </View>
    </View>
  );
}

function Message({ item }: { item: ChatMessage }): React.ReactElement {
  const isUser = item.role === 'user';
  const textStyle = [styles.bubbleText, isUser && styles.bubbleTextUser];

  let inner: React.ReactElement;
  if (item.attachType) {
    inner = (
      <View style={styles.mediaRow}>
        <Ionicons name={(ATTACH_ICONS[item.attachType] || 'attach-outline') as any} size={16} color={isUser ? 'rgba(255,255,255,0.85)' : colors.primary} />
        <Text style={textStyle}>{item.content}</Text>
      </View>
    );
  } else if (item.isAudio) {
    inner = (
      <View style={styles.mediaRow}>
        <Ionicons name="mic" size={15} color={isUser ? 'rgba(255,255,255,0.85)' : colors.primary} />
        <Text style={textStyle}>{item.content}</Text>
      </View>
    );
  } else {
    inner = <Text style={textStyle}>{item.content}</Text>;
  }

  return (
    <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
      {!isUser && (
        <View style={styles.aiAvatar}>
          <Ionicons name="sparkles" size={11} color="#fff" />
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        {inner}
      </View>
    </View>
  );
}

const QUICK_REPLIES = [
  'How many leave days do I have?',
  "What's my latest payslip?",
  'Show attendance this month',
  'Any pending approvals?',
  'What tasks are open?',
];

const ATTACH_OPTIONS = [
  { key: 'camera',   icon: 'camera-outline',        label: 'Camera'   },
  { key: 'gallery',  icon: 'image-outline',          label: 'Gallery'  },
  { key: 'document', icon: 'document-text-outline',  label: 'Document' },
];

const WAVEFORM = [5, 12, 7, 18, 9, 15, 6, 20, 10, 16, 8, 14, 7, 18, 11];

// ─── Screen ───────────────────────────────────────────────────────────────────

const TAB_INSET = 84;

export function ChatScreen(): React.ReactElement {
  const essData = useEss();
  const { employee } = essData;

  const welcome = useMemo((): ChatMessage => ({
    id: 'welcome',
    role: 'assistant',
    content: `Hi ${employee.first}! 👋 I'm your OpenHRCore AI assistant.\n\nI can help with leave balances, attendance, payslips, approvals, and more. What would you like to know?`,
  }), [employee.first]);

  const [messages, setMessages] = useState<ChatMessage[]>([welcome]);
  const [input, setInput]       = useState('');
  const [typing, setTyping]     = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [recording, setRecording]   = useState(false);
  const [recSecs, setRecSecs]       = useState(0);

  const listRef     = useRef<FlatList<ChatMessage>>(null);
  const recSecsRef  = useRef(0);
  const recTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (recTimerRef.current !== null) clearInterval(recTimerRef.current);
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, typing, scrollToBottom]);

  const pushReply = useCallback((reply: string) => {
    setTyping(false);
    setMessages((prev) => [...prev, { id: Date.now(), role: 'assistant', content: reply }]);
  }, []);

  const send = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setShowAttach(false);
    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', content: trimmed }]);
    setInput('');
    setTyping(true);
    setTimeout(() => pushReply(buildReply(trimmed, essData)), 600 + Math.random() * 600);
  }, [essData, pushReply]);

  const handleAttach = useCallback((type: string) => {
    setShowAttach(false);
    const labels: Record<string, string> = { camera: 'Photo taken', gallery: 'Image selected', document: 'Document attached' };
    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', content: labels[type], attachType: type }]);
    setTyping(true);
    setTimeout(() => pushReply(`Got your ${type}! Attachment processing is coming in the next release. Is there anything else I can help with?`), 900);
  }, [pushReply]);

  const startRecording = useCallback(() => {
    setShowAttach(false);
    recSecsRef.current = 0;
    setRecSecs(0);
    setRecording(true);
    recTimerRef.current = setInterval(() => {
      recSecsRef.current += 1;
      setRecSecs(recSecsRef.current);
    }, 1000);
  }, []);

  const stopRecording = useCallback(() => {
    if (recTimerRef.current !== null) clearInterval(recTimerRef.current);
    const dur = fmtTime(recSecsRef.current || 1);
    setRecording(false);
    setRecSecs(0);
    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', content: `Voice message (${dur})`, isAudio: true }]);
    setTyping(true);
    setTimeout(() => pushReply(`I received your voice message! Voice processing is coming soon. Feel free to type your question and I'll answer right away.`), 1100);
  }, [pushReply]);

  const showQuickReplies = messages.length === 1 && !recording;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'android' ? 'height' : undefined}
    >
      {/* ── Message list ─────────────────────────────────────── */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => String(m.id)}
        renderItem={({ item }) => <Message item={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={scrollToBottom}
        ListFooterComponent={typing ? <TypingIndicator /> : null}
      />

      {/* ── Quick replies ─────────────────────────────────────── */}
      {showQuickReplies && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickBar}
          contentContainerStyle={styles.quickContent}
        >
          {QUICK_REPLIES.map((q, i) => (
            <Pressable
              key={q}
              style={[styles.quickChip, i < QUICK_REPLIES.length - 1 && styles.quickChipGap]}
              onPress={() => send(q)}
            >
              <Text style={styles.quickChipText}>{q}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* ── Attach menu ───────────────────────────────────────── */}
      {showAttach && (
        <View style={styles.attachMenu}>
          {ATTACH_OPTIONS.map((opt) => (
            <Pressable key={opt.key} style={styles.attachOpt} onPress={() => handleAttach(opt.key)}>
              <View style={styles.attachIconWrap}>
                <Ionicons name={opt.icon as any} size={22} color={colors.primary} />
              </View>
              <Text style={styles.attachOptLabel}>{opt.label}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* ── Input / Recording bar ─────────────────────────────── */}
      {recording ? (
        <View style={styles.recBar}>
          <View style={styles.recDot} />
          <Text style={styles.recTime}>{fmtTime(recSecs)}</Text>
          <View style={styles.waveform}>
            {WAVEFORM.map((h, i) => (
              <View key={i} style={[styles.waveBar, { height: h + (recSecs % 3) * 2 }]} />
            ))}
          </View>
          <Pressable onPress={stopRecording} accessibilityLabel="Stop recording" style={styles.stopBtn}>
            <Ionicons name="stop-circle" size={34} color={colors.danger} />
          </Pressable>
        </View>
      ) : (
        <View style={styles.inputBar}>
          <Pressable
            style={styles.iconBtn}
            onPress={() => setShowAttach((v) => !v)}
            accessibilityLabel="Attach file"
          >
            <Ionicons
              name={showAttach ? 'close-circle' : 'add-circle-outline'}
              size={26}
              color={showAttach ? colors.muted : colors.primary}
            />
          </Pressable>

          <TextInput
            style={styles.input}
            value={input}
            onChangeText={(t) => { setInput(t); setShowAttach(false); }}
            placeholder="Ask me anything…"
            placeholderTextColor={colors.muted}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => send(input)}
            blurOnSubmit
          />

          {input.trim() ? (
            <Pressable style={styles.sendBtn} onPress={() => send(input)} accessibilityLabel="Send message">
              <Ionicons name="send" size={16} color="#fff" />
            </Pressable>
          ) : (
            <Pressable style={styles.iconBtn} onPress={startRecording} accessibilityLabel="Voice message">
              <Ionicons name="mic-outline" size={24} color={colors.primary} />
            </Pressable>
          )}
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.bg,
    flex: 1,
    paddingBottom: TAB_INSET,
  },
  list: {
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    rowGap: spacing.md,
  },

  // ── Messages ──────────────────────────────────────────────────
  msgRow: {
    alignItems: 'flex-end',
    columnGap: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  msgRowUser: { justifyContent: 'flex-end' },

  aiAvatar: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },

  bubble: {
    borderRadius: radius.xl,
    maxWidth: '78%',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: radius.sm,
  },
  aiBubble: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: radius.sm,
    borderColor: colors.border,
    borderWidth: 1,
  },
  bubbleText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  bubbleTextUser: { color: '#fff' },

  mediaRow: {
    alignItems: 'center',
    columnGap: spacing.sm,
    flexDirection: 'row',
  },

  // ── Typing dots ───────────────────────────────────────────────
  typingBubble: { paddingVertical: 10 },
  typingDots: {
    alignItems: 'center',
    columnGap: 5,
    flexDirection: 'row',
    height: 14,
  },
  dot: {
    backgroundColor: colors.muted,
    borderRadius: 3,
    height: 6,
    width: 6,
  },

  // ── Quick replies ──────────────────────────────────────────────
  quickBar: { flexGrow: 0 },
  quickContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  quickChip: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderRadius: radius.full,
    borderWidth: 1.5,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  quickChipGap: { marginRight: spacing.sm },
  quickChipText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },

  // ── Attach menu ───────────────────────────────────────────────
  attachMenu: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  attachOpt: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  attachIconWrap: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  attachOptLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },

  // ── Input bar ─────────────────────────────────────────────────
  inputBar: {
    alignItems: 'flex-end',
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    columnGap: spacing.sm,
    flexDirection: 'row',
    paddingBottom: Platform.OS === 'ios' ? spacing.lg : spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  iconBtn: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderWidth: 1,
    color: colors.text,
    flex: 1,
    fontSize: 14,
    maxHeight: 100,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
  },
  sendBtn: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },

  // ── Recording bar ─────────────────────────────────────────────
  recBar: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    columnGap: spacing.md,
    flexDirection: 'row',
    paddingBottom: Platform.OS === 'ios' ? spacing.lg : spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  recDot: {
    backgroundColor: colors.danger,
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  recTime: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '700',
    minWidth: 36,
  },
  waveform: {
    alignItems: 'center',
    columnGap: 3,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  waveBar: {
    backgroundColor: colors.primary,
    borderRadius: 2,
    opacity: 0.7,
    width: 3,
  },
  stopBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
