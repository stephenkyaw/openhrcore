import { Fragment, useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { TODAY, fmt } from '@/lib/dates';
import { deptName, empById, empName, locationName, positionName } from '@/lib/lookups';
import { I } from '@/components/Icons';
import {
  Avatar,
  Badge,
  Button,
  Caption,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Dialog,
  Empty,
  Input,
  Label,
  PageHero,
  Select,
  Stat,
  TD,
  TH,
  THead,
  TR,
  Table,
  Tabs,
  Textarea,
} from '@/components/ui';
import { useStore } from '@/data/store';
import { DEPARTMENTS, EMPLOYEES, LOCATIONS } from '@/data/seed';
import {
  CANDIDATES,
  INTERVIEWS,
  JOBS,
  OFFERS,
  REC_STAGES,
  SCORECARDS,
  SCORECARD_RECOMMEND_TONE,
} from '@/data/seed-extended';

const PIPELINE_CONFIG = [
  { id: 'pipe-eng', name: 'Engineering pipeline', dept: 'd1', stages: ['applied', 'screen', 'interview', 'onsite', 'offer', 'hired'], sla: 7, status: 'active' },
  { id: 'pipe-design', name: 'Design pipeline', dept: 'd3', stages: ['applied', 'screen', 'interview', 'onsite', 'offer', 'hired'], sla: 10, status: 'active' },
  { id: 'pipe-people', name: 'People Ops pipeline', dept: 'd4', stages: ['applied', 'screen', 'interview', 'offer', 'hired'], sla: 5, status: 'active' },
];

const JOB_POSTINGS = [
  { id: 'jp1', job: 'j1', pipeline: 'pipe-eng', channel: 'LinkedIn', status: 'published', url: 'https://linkedin.com/jobs/mercury-backend', budget: 12000, applicants: 14, lastSync: '2026-05-19T09:00:00Z' },
  { id: 'jp2', job: 'j1', pipeline: 'pipe-eng', channel: 'JobDB', status: 'published', url: 'https://jobdb.com/mercury-backend', budget: 8000, applicants: 6, lastSync: '2026-05-18T15:30:00Z' },
  { id: 'jp3', job: 'j2', pipeline: 'pipe-design', channel: 'Careers page', status: 'published', url: '/careers/product-designer', budget: 0, applicants: 18, lastSync: '2026-05-20T08:20:00Z' },
];

const INTEGRATIONS = [
  { id: 'int-linkedin', name: 'LinkedIn Recruiter', provider: 'LinkedIn', status: 'connected', sync: 'two-way', token: '••••-lnkd-2026', scopes: 'jobs,candidates,messages', lastSync: '2026-05-20T07:45:00Z' },
  { id: 'int-jobdb', name: 'JobDB Thailand', provider: 'JobDB', status: 'connected', sync: 'jobs-inbound', token: '••••-jobdb-88', scopes: 'jobs,applicants', lastSync: '2026-05-19T11:15:00Z' },
  { id: 'int-indeed', name: 'Indeed', provider: 'Indeed', status: 'paused', sync: 'jobs-only', token: '', scopes: 'jobs', lastSync: '2026-05-13T10:00:00Z' },
];

const CAREER_PAGES = [
  { id: 'cp-main', name: 'Mercury Careers', slug: 'careers', status: 'published', theme: 'blue', locale: 'en', jobs: ['j1', 'j2', 'j3', 'j4', 'j5'], seoTitle: 'Careers at Mercury Labs' },
  { id: 'cp-eng', name: 'Engineering Careers', slug: 'engineering', status: 'draft', theme: 'dark', locale: 'en', jobs: ['j1', 'j4', 'j6'], seoTitle: 'Engineering jobs at Mercury Labs' },
];

const SOURCE_CHANNELS = [
  { id: 'src-careers', name: 'Inbound · Careers page', applied: 18, advanced: 6, hired: 1, cpa: 0, status: 'active', sub: 'Organic applications from published career pages' },
  { id: 'src-referral', name: 'Referral', applied: 12, advanced: 9, hired: 2, cpa: 2500, status: 'active', sub: 'Employee referrals with bonus policy' },
  { id: 'src-linkedin', name: 'LinkedIn', applied: 14, advanced: 7, hired: 1, cpa: 380, status: 'active', sub: 'Synced from LinkedIn Recruiter' },
  { id: 'src-outbound', name: 'Recruiter outbound', applied: 8, advanced: 5, hired: 0, cpa: 1200, status: 'active', sub: 'Direct sourced candidates' },
  { id: 'src-dribbble', name: 'Dribbble', applied: 3, advanced: 2, hired: 0, cpa: 0, status: 'paused', sub: 'Design sourcing channel' },
  { id: 'src-events', name: 'Conference / event', applied: 5, advanced: 2, hired: 0, cpa: 800, status: 'active', sub: 'Campus and community hiring events' },
];

const SCORECARD_TEMPLATE = [
  { id: 'sc-dim-system', dim: 'System design', desc: 'Trade-offs, partitioning, data modeling, failure modes.', weight: 25 },
  { id: 'sc-dim-code', dim: 'Code craft', desc: 'Idioms, readability, testing instincts, code review quality.', weight: 20 },
  { id: 'sc-dim-product', dim: 'Product sense', desc: 'Can the candidate push back on features and explain why?', weight: 20 },
  { id: 'sc-dim-ownership', dim: 'Ownership', desc: 'Evidence of end-to-end shipping with measurable impact.', weight: 20 },
  { id: 'sc-dim-collab', dim: 'Collaboration', desc: 'Disagrees and commits, can mentor junior engineers.', weight: 15 },
];

function Field({ label, value, mono }) {
  return (
    <div>
      <div className="text-[10.5px] uppercase tracking-wider text-muted-fg font-medium mb-0.5">{label}</div>
      <div className={cn('text-[13px]', mono && 'font-mono text-[12.5px]')}>{value}</div>
    </div>
  );
}

function PriorityBadge({ p }) {
  if (p === 'high') return <Badge tone="danger" size="sm">High</Badge>;
  if (p === 'medium') return <Badge tone="warn" size="sm">Medium</Badge>;
  return <Badge tone="outline" size="sm">Low</Badge>;
}

function JobStatusBadge({ s }) {
  if (s === 'open') return <Badge tone="ok"><I.CircleDot size={8} />Open</Badge>;
  if (s === 'draft') return <Badge tone="outline">Draft</Badge>;
  if (s === 'on-hold') return <Badge tone="warn">On hold</Badge>;
  if (s === 'closed') return <Badge tone="outline">Closed</Badge>;
  return <Badge>{s}</Badge>;
}

function makeId(prefix, value) {
  const base = String(value || prefix)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 20);
  return `${prefix}${base ? '-' + base : '-' + Math.random().toString(36).slice(2, 7)}`;
}

function jobOptions() {
  return JOBS.map((j) => <option key={j.id} value={j.id}>{j.title}</option>);
}

function stageOptions() {
  return REC_STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>);
}

function pipelineOptions() {
  return PIPELINE_CONFIG.map((p) => <option key={p.id} value={p.id}>{p.name}</option>);
}

function recDefaults(action) {
  const item = action?.item || {};
  return {
    title: item.title || item.name || '',
    dept: item.dept || DEPARTMENTS[0]?.id || '',
    loc: item.loc || LOCATIONS[0]?.id || '',
    hiring_manager: item.hiring_manager || 'e002',
    recruiter: item.recruiter || 'e011',
    status: item.status || 'open',
    priority: item.priority || 'medium',
    type: item.type || 'Permanent',
    headcount: item.headcount ?? 1,
    target_close: item.target_close || '2026-08-31',
    first: item.first || '',
    last: item.last || '',
    current: item.current || '',
    job: item.job || JOBS[0]?.id || '',
    cand: item.cand || CANDIDATES[0]?.id || '',
    stage: item.stage || 'applied',
    source: item.source || 'Inbound · Careers page',
    locText: item.loc || item.location || 'Bangkok, TH',
    exp: item.exp || '5y',
    rating: item.rating ?? '',
    salary_ask: item.salary_ask ?? '',
    label: item.label || '',
    color: item.color ?? 220,
    name: item.name || item.id || '',
    pipeline: item.pipeline || PIPELINE_CONFIG[0]?.id || '',
    channel: item.channel || 'LinkedIn',
    url: item.url || '',
    budget: item.budget ?? 0,
    applicants: item.applicants ?? 0,
    applied: item.applied ?? 0,
    advanced: item.advanced ?? 0,
    hired: item.hired ?? 0,
    cpa: item.cpa ?? 0,
    sub: item.sub || '',
    provider: item.provider || 'LinkedIn',
    sync: item.sync || 'jobs-inbound',
    token: item.token || '',
    scopes: item.scopes || 'jobs,candidates',
    slug: item.slug || '',
    theme: item.theme || 'blue',
    locale: item.locale || 'en',
    seoTitle: item.seoTitle || '',
    stages: Array.isArray(item.stages) ? item.stages.join(', ') : item.stages || 'applied, screen, interview, onsite, offer, hired',
    sla: item.sla ?? 7,
    date: item.date || '2026-06-01',
    time: item.time || '10:00',
    dur: item.dur ?? 60,
    interviewer: item.interviewer || 'e002',
    basic: item.basic ?? 120000,
    house: item.house ?? 18000,
    trans: item.trans ?? 2500,
    start_date: item.start_date || '2026-07-01',
    expires: item.expires || '2026-06-15',
    notes: item.notes || item.why || '',
    dim: item.dim || '',
    desc: item.desc || '',
    weight: item.weight ?? 20,
  };
}

function RecForm({ mode, form, update }) {
  return (
    <div className="p-5 space-y-3.5 max-h-[70vh] overflow-y-auto scroll-thin">
      {mode === 'job' && (
        <>
          <div><Label>Job title</Label><Input value={form.title} onChange={(e) => update('title', e.target.value)} className="mt-1.5" autoFocus /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Department</Label><Select value={form.dept} onChange={(e) => update('dept', e.target.value)} className="mt-1.5">{DEPARTMENTS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</Select></div>
            <div><Label>Location</Label><Select value={form.loc} onChange={(e) => update('loc', e.target.value)} className="mt-1.5">{LOCATIONS.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</Select></div>
            <div><Label>Hiring manager</Label><Select value={form.hiring_manager} onChange={(e) => update('hiring_manager', e.target.value)} className="mt-1.5">{EMPLOYEES.map((e) => <option key={e.id} value={e.id}>{e.first} {e.last}</option>)}</Select></div>
            <div><Label>Recruiter</Label><Select value={form.recruiter} onChange={(e) => update('recruiter', e.target.value)} className="mt-1.5">{EMPLOYEES.map((e) => <option key={e.id} value={e.id}>{e.first} {e.last}</option>)}</Select></div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div><Label>Status</Label><Select value={form.status} onChange={(e) => update('status', e.target.value)} className="mt-1.5"><option value="open">Open</option><option value="draft">Draft</option><option value="on-hold">On hold</option><option value="closed">Closed</option></Select></div>
            <div><Label>Priority</Label><Select value={form.priority} onChange={(e) => update('priority', e.target.value)} className="mt-1.5"><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></Select></div>
            <div><Label>Headcount</Label><Input type="number" value={form.headcount} onChange={(e) => update('headcount', +e.target.value)} className="mt-1.5 font-mono" /></div>
            <div><Label>Type</Label><Input value={form.type} onChange={(e) => update('type', e.target.value)} className="mt-1.5" /></div>
          </div>
        </>
      )}
      {mode === 'candidate' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>First name</Label><Input value={form.first} onChange={(e) => update('first', e.target.value)} className="mt-1.5" autoFocus /></div>
            <div><Label>Last name</Label><Input value={form.last} onChange={(e) => update('last', e.target.value)} className="mt-1.5" /></div>
          </div>
          <div><Label>Current role/company</Label><Input value={form.current} onChange={(e) => update('current', e.target.value)} className="mt-1.5" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Job</Label><Select value={form.job} onChange={(e) => update('job', e.target.value)} className="mt-1.5">{jobOptions()}</Select></div>
            <div><Label>Stage</Label><Select value={form.stage} onChange={(e) => update('stage', e.target.value)} className="mt-1.5">{stageOptions()}</Select></div>
            <div><Label>Source</Label><Input value={form.source} onChange={(e) => update('source', e.target.value)} className="mt-1.5" /></div>
            <div><Label>Location</Label><Input value={form.locText} onChange={(e) => update('locText', e.target.value)} className="mt-1.5" /></div>
          </div>
        </>
      )}
      {mode === 'talent' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>First name</Label><Input value={form.first} onChange={(e) => update('first', e.target.value)} className="mt-1.5" autoFocus /></div>
            <div><Label>Last name</Label><Input value={form.last} onChange={(e) => update('last', e.target.value)} className="mt-1.5" /></div>
          </div>
          <div><Label>Location</Label><Input value={form.locText} onChange={(e) => update('locText', e.target.value)} className="mt-1.5" /></div>
          <div><Label>Notes</Label><Textarea rows={3} value={form.notes || form.current} onChange={(e) => update('notes', e.target.value)} className="mt-1.5" /></div>
          <div><Label>Rating</Label><Input type="number" step="0.5" value={form.rating} onChange={(e) => update('rating', +e.target.value)} className="mt-1.5 font-mono" /></div>
        </>
      )}
      {mode === 'stage' && (
        <>
          <div><Label>Stage label</Label><Input value={form.label} onChange={(e) => update('label', e.target.value)} className="mt-1.5" autoFocus /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Stage id</Label><Input value={form.name} onChange={(e) => update('name', e.target.value)} className="mt-1.5 font-mono" /></div>
            <div><Label>Color hue</Label><Input type="number" value={form.color} onChange={(e) => update('color', +e.target.value)} className="mt-1.5 font-mono" /></div>
          </div>
        </>
      )}
      {mode === 'scorecard' && (
        <>
          <div><Label>Dimension</Label><Input value={form.dim} onChange={(e) => update('dim', e.target.value)} className="mt-1.5" autoFocus /></div>
          <div><Label>Evaluation guidance</Label><Textarea rows={3} value={form.desc} onChange={(e) => update('desc', e.target.value)} className="mt-1.5" /></div>
          <div><Label>Weight</Label><Input type="number" value={form.weight} onChange={(e) => update('weight', +e.target.value)} className="mt-1.5 font-mono" /></div>
        </>
      )}
      {mode === 'pipeline' && (
        <>
          <div><Label>Pipeline name</Label><Input value={form.name} onChange={(e) => update('name', e.target.value)} className="mt-1.5" autoFocus /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Department</Label><Select value={form.dept} onChange={(e) => update('dept', e.target.value)} className="mt-1.5">{DEPARTMENTS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</Select></div>
            <div><Label>SLA days</Label><Input type="number" value={form.sla} onChange={(e) => update('sla', +e.target.value)} className="mt-1.5 font-mono" /></div>
          </div>
          <div><Label>Stages</Label><Textarea rows={3} value={form.stages} onChange={(e) => update('stages', e.target.value)} className="mt-1.5" /></div>
        </>
      )}
      {mode === 'post' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Job</Label><Select value={form.job} onChange={(e) => update('job', e.target.value)} className="mt-1.5">{jobOptions()}</Select></div>
            <div><Label>Pipeline</Label><Select value={form.pipeline} onChange={(e) => update('pipeline', e.target.value)} className="mt-1.5">{pipelineOptions()}</Select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Channel</Label><Select value={form.channel} onChange={(e) => update('channel', e.target.value)} className="mt-1.5"><option>LinkedIn</option><option>JobDB</option><option>Indeed</option><option>Careers page</option><option>Referral</option></Select></div>
            <div><Label>Status</Label><Select value={form.status} onChange={(e) => update('status', e.target.value)} className="mt-1.5"><option value="draft">Draft</option><option value="published">Published</option><option value="paused">Paused</option><option value="closed">Closed</option></Select></div>
          </div>
          <div><Label>Posting URL</Label><Input value={form.url} onChange={(e) => update('url', e.target.value)} className="mt-1.5" /></div>
          <div><Label>Budget</Label><Input type="number" value={form.budget} onChange={(e) => update('budget', +e.target.value)} className="mt-1.5 font-mono" /></div>
        </>
      )}
      {mode === 'source' && (
        <>
          <div><Label>Source / channel name</Label><Input value={form.name} onChange={(e) => update('name', e.target.value)} className="mt-1.5" autoFocus /></div>
          <div><Label>Description</Label><Textarea rows={2} value={form.sub} onChange={(e) => update('sub', e.target.value)} className="mt-1.5" /></div>
          <div className="grid grid-cols-4 gap-3">
            <div><Label>Applied</Label><Input type="number" value={form.applied} onChange={(e) => update('applied', +e.target.value)} className="mt-1.5 font-mono" /></div>
            <div><Label>Advanced</Label><Input type="number" value={form.advanced} onChange={(e) => update('advanced', +e.target.value)} className="mt-1.5 font-mono" /></div>
            <div><Label>Hired</Label><Input type="number" value={form.hired} onChange={(e) => update('hired', +e.target.value)} className="mt-1.5 font-mono" /></div>
            <div><Label>CPA</Label><Input type="number" value={form.cpa} onChange={(e) => update('cpa', +e.target.value)} className="mt-1.5 font-mono" /></div>
          </div>
          <div><Label>Status</Label><Select value={form.status} onChange={(e) => update('status', e.target.value)} className="mt-1.5"><option value="active">Active</option><option value="paused">Paused</option><option value="archived">Archived</option></Select></div>
        </>
      )}
      {mode === 'integration' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => update('name', e.target.value)} className="mt-1.5" autoFocus /></div>
            <div><Label>Provider</Label><Select value={form.provider} onChange={(e) => update('provider', e.target.value)} className="mt-1.5"><option>LinkedIn</option><option>JobDB</option><option>Indeed</option><option>Greenhouse</option><option>Workable</option></Select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Status</Label><Select value={form.status} onChange={(e) => update('status', e.target.value)} className="mt-1.5"><option value="connected">Connected</option><option value="paused">Paused</option><option value="error">Error</option></Select></div>
            <div><Label>Sync mode</Label><Input value={form.sync} onChange={(e) => update('sync', e.target.value)} className="mt-1.5" /></div>
          </div>
          <div><Label>API key / token</Label><Input value={form.token} onChange={(e) => update('token', e.target.value)} className="mt-1.5 font-mono" /></div>
          <div><Label>Scopes</Label><Input value={form.scopes} onChange={(e) => update('scopes', e.target.value)} className="mt-1.5" /></div>
        </>
      )}
      {mode === 'career' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Page name</Label><Input value={form.name} onChange={(e) => update('name', e.target.value)} className="mt-1.5" autoFocus /></div>
            <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => update('slug', e.target.value)} className="mt-1.5 font-mono" /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Status</Label><Select value={form.status} onChange={(e) => update('status', e.target.value)} className="mt-1.5"><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option></Select></div>
            <div><Label>Theme</Label><Select value={form.theme} onChange={(e) => update('theme', e.target.value)} className="mt-1.5"><option>blue</option><option>dark</option><option>light</option></Select></div>
            <div><Label>Locale</Label><Input value={form.locale} onChange={(e) => update('locale', e.target.value)} className="mt-1.5" /></div>
          </div>
          <div><Label>SEO title</Label><Input value={form.seoTitle} onChange={(e) => update('seoTitle', e.target.value)} className="mt-1.5" /></div>
        </>
      )}
      {mode === 'interview' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Candidate</Label><Select value={form.cand || form.id} onChange={(e) => update('cand', e.target.value)} className="mt-1.5">{CANDIDATES.map((c) => <option key={c.id} value={c.id}>{c.first} {c.last}</option>)}</Select></div>
            <div><Label>Interviewer</Label><Select value={form.interviewer} onChange={(e) => update('interviewer', e.target.value)} className="mt-1.5">{EMPLOYEES.map((e) => <option key={e.id} value={e.id}>{e.first} {e.last}</option>)}</Select></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} className="mt-1.5 font-mono" /></div>
            <div><Label>Time</Label><Input value={form.time} onChange={(e) => update('time', e.target.value)} className="mt-1.5 font-mono" /></div>
            <div><Label>Duration</Label><Input type="number" value={form.dur} onChange={(e) => update('dur', +e.target.value)} className="mt-1.5 font-mono" /></div>
          </div>
          <div><Label>Type</Label><Input value={form.type} onChange={(e) => update('type', e.target.value)} className="mt-1.5" /></div>
        </>
      )}
      {mode === 'offer' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Candidate</Label><Select value={form.cand || form.id} onChange={(e) => update('cand', e.target.value)} className="mt-1.5">{CANDIDATES.map((c) => <option key={c.id} value={c.id}>{c.first} {c.last}</option>)}</Select></div>
            <div><Label>Status</Label><Select value={form.status} onChange={(e) => update('status', e.target.value)} className="mt-1.5"><option value="pending-approval">Pending approval</option><option value="sent">Sent</option><option value="accepted">Accepted</option></Select></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Basic</Label><Input type="number" value={form.basic} onChange={(e) => update('basic', +e.target.value)} className="mt-1.5 font-mono" /></div>
            <div><Label>Housing</Label><Input type="number" value={form.house} onChange={(e) => update('house', +e.target.value)} className="mt-1.5 font-mono" /></div>
            <div><Label>Transport</Label><Input type="number" value={form.trans} onChange={(e) => update('trans', +e.target.value)} className="mt-1.5 font-mono" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Start date</Label><Input type="date" value={form.start_date} onChange={(e) => update('start_date', e.target.value)} className="mt-1.5 font-mono" /></div>
            <div><Label>Expires</Label><Input type="date" value={form.expires} onChange={(e) => update('expires', e.target.value)} className="mt-1.5 font-mono" /></div>
          </div>
        </>
      )}
    </div>
  );
}

function RecActionDialog({ action, onClose, onSubmit }) {
  const [form, setForm] = useState(recDefaults(action));
  useEffect(() => { if (action) setForm(recDefaults(action)); }, [action]);
  if (!action) return null;
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const isDelete = action.mode === 'delete';
  return (
    <Dialog open onClose={onClose} width={680}>
      <div className="p-5 border-b border-border flex items-start justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.12em] text-muted-fg font-semibold">Recruitment · {action.mode}</div>
          <div className="text-[16px] font-semibold mt-1">{action.title}</div>
          <div className="text-[12px] text-muted-fg mt-1">{isDelete ? 'Confirm removal from the current recruitment workspace.' : 'Complete the details. The action is audit logged.'}</div>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onClose}><I.X size={13} /></Button>
      </div>
      {isDelete ? (
        <div className="p-5 text-[13px]">Delete <b>{action.item?.title || action.item?.name || action.item?.first || action.item?.id}</b>?</div>
      ) : (
        <RecForm mode={action.mode} form={form} update={update} />
      )}
      <div className="p-4 border-t border-border flex items-center justify-end gap-2">
        <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
        <Button variant={isDelete ? 'destructive' : 'default'} size="md" onClick={() => onSubmit(action, form)}>{isDelete ? <I.X size={13} /> : <I.Check size={13} />}{isDelete ? 'Delete' : 'Submit'}</Button>
      </div>
    </Dialog>
  );
}

function CandCard({ cand, onNav, onDragStart, onDragEnd, dragging }) {
  const ivs = INTERVIEWS.filter((iv) => iv.cand === cand.id);
  const scs = SCORECARDS.filter((s) => s.cand === cand.id);
  const avgRating = scs.length ? scs.reduce((s, x) => s + x.rating, 0) / scs.length : cand.rating || null;
  const daysInStage = Math.max(1, Math.round((TODAY - new Date(cand.applied)) / 86400000));
  const job = JOBS.find((j) => j.id === cand.job);

  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onClick={() => onNav('recruitment', null, { candId: cand.id })}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onNav('recruitment', null, { candId: cand.id });
        }
      }}
      onDragStart={(e) => onDragStart(e, cand)}
      onDragEnd={onDragEnd}
      className={cn(
        'group w-full text-left bg-card border border-border rounded-md p-2.5 hover:border-accent/50 hover:shadow-soft focus-ring cursor-grab active:cursor-grabbing transition-all duration-150',
        dragging && 'opacity-40 scale-[0.98] border-accent shadow-soft'
      )}
    >
      <div className="flex items-start gap-2.5">
        <Avatar name={`${cand.first} ${cand.last}`} hue={cand.hue} size={32} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[12.5px] font-semibold leading-tight truncate">{cand.first} {cand.last}</span>
            {avgRating != null && (
              <span className="text-[10px] font-mono tabular-nums text-warn flex items-center gap-0.5">★ {avgRating.toFixed(1)}</span>
            )}
            <span className="ml-auto text-muted-fg/40 group-hover:text-muted-fg transition-colors"><I.Menu size={11} /></span>
          </div>
          <div className="text-[10.5px] text-muted-fg truncate">{cand.current}</div>
          <div className="text-[10px] text-muted-fg font-mono mt-0.5">{cand.loc} · {cand.exp}</div>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-border">
        <div className="text-[10.5px] text-muted-fg truncate mb-1.5">{job?.title || 'Open role'}</div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-fg">
        {ivs.length > 0 && <span className="inline-flex items-center gap-0.5"><I.Calendar size={9} />{ivs.length}</span>}
        {scs.length > 0 && (
          <span className="inline-flex items-center gap-0.5">
            <I.Check size={9} />{scs.length} scorecard{scs.length !== 1 ? 's' : ''}
          </span>
        )}
        <span className="ml-auto font-mono">{daysInStage}d</span>
        </div>
      </div>
    </div>
  );
}

function Pipeline({ onNav, jobFilterDefault, onAction, onMove }) {
  const [jobFilter, setJobFilter] = useState(jobFilterDefault || 'all');
  const [pipelineFilter, setPipelineFilter] = useState('all');
  const [draggingId, setDraggingId] = useState(null);
  const [overStage, setOverStage] = useState(null);
  const activePipe = PIPELINE_CONFIG.find((p) => p.id === pipelineFilter);
  const visible = (activePipe ? activePipe.stages.map((id) => REC_STAGES.find((s) => s.id === id)).filter(Boolean) : REC_STAGES).filter((s) => s.id !== 'rejected');
  const pipeJobIds = activePipe ? JOBS.filter((j) => j.dept === activePipe.dept).map((j) => j.id) : null;
  const cands = CANDIDATES.filter((c) => (jobFilter === 'all' || c.job === jobFilter) && (!pipeJobIds || pipeJobIds.includes(c.job)));
  const totalVisible = cands.length || 1;
  const dragCand = CANDIDATES.find((c) => c.id === draggingId);
  const startDrag = (e, cand) => {
    setDraggingId(cand.id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', cand.id);
  };
  const endDrag = () => {
    setDraggingId(null);
    setOverStage(null);
  };
  const dropOnStage = (e, stage) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggingId;
    const cand = CANDIDATES.find((c) => c.id === id);
    if (cand && cand.stage !== stage.id) onMove(cand, stage);
    endDrag();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-3 border-b border-border flex items-center gap-2 bg-bg flex-none">
        <Select value={jobFilter} onChange={(e) => setJobFilter(e.target.value)} className="w-72">
          <option value="all">All open jobs</option>
          {JOBS.filter((j) => j.status === 'open').map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
        </Select>
        <Select value={pipelineFilter} onChange={(e) => setPipelineFilter(e.target.value)} className="w-56">
          <option value="all">All pipelines</option>
          {PIPELINE_CONFIG.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>
        <Button size="sm" variant="outline" onClick={() => onAction('stage', null, 'Add pipeline stage')}><I.Plus size={11} />Stage</Button>
        <Button size="sm" variant="outline" onClick={() => onAction('pipeline', null, 'New pipeline')}><I.Plus size={11} />Pipeline</Button>
        <div className="ml-auto flex items-center gap-3 text-[11.5px] text-muted-fg">
          <span>
            <I.ArrowRight size={11} className="inline text-accent mr-1" />
            <b className="text-fg">Drag candidates</b> between stages to update the pipeline
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-x-auto overflow-y-hidden scroll-thin bg-gradient-to-b from-muted/25 to-bg">
        <div className="flex gap-3 p-6 h-full min-w-max">
          {visible.map((stage) => {
            const col = cands.filter((c) => c.stage === stage.id);
            const activeDrop = overStage === stage.id;
            const pct = Math.round((col.length / totalVisible) * 100);
            return (
              <div key={stage.id} className="w-[278px] flex flex-col flex-none">
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: `oklch(0.65 0.13 ${stage.color})` }} />
                    <span className="text-[12px] font-semibold">{stage.label}</span>
                    {dragCand && dragCand.stage !== stage.id && activeDrop && <Badge tone="accent" size="sm">Drop here</Badge>}
                  </div>
                  <span className="inline-flex items-center gap-1">
                    <button className="text-[11px] font-mono tabular-nums text-muted-fg hover:text-fg" onClick={() => onAction('stage', stage, 'Edit stage')}>{col.length}</button>
                    <Button variant="ghost" size="icon-sm" onClick={() => onAction('delete', stage, 'Delete stage', 'stage')}><I.X size={10} /></Button>
                  </span>
                </div>
                <div className="h-1 rounded-full bg-muted overflow-hidden mb-2 mx-1">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: `oklch(0.65 0.13 ${stage.color})` }} />
                </div>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    if (overStage !== stage.id) setOverStage(stage.id);
                  }}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) setOverStage(null);
                  }}
                  onDrop={(e) => dropOnStage(e, stage)}
                  className={cn(
                    'flex-1 rounded-lg border p-2 space-y-2 overflow-y-auto scroll-thin transition-all duration-150',
                    activeDrop ? 'bg-accent-soft/60 border-accent/50 ring-2 ring-accent/15' : 'bg-card/90 border-border shadow-soft-sm'
                  )}
                >
                  {col.map((c) => (
                    <CandCard
                      key={c.id}
                      cand={c}
                      onNav={onNav}
                      onDragStart={startDrag}
                      onDragEnd={endDrag}
                      dragging={draggingId === c.id}
                    />
                  ))}
                  {col.length === 0 && (
                    <div className={cn(
                      'text-[11px] text-muted-fg px-2 py-8 text-center rounded-md border border-dashed',
                      activeDrop ? 'border-accent text-accent bg-card/70' : 'border-border'
                    )}>
                      {activeDrop ? 'Release to move candidate' : 'No candidates'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function JobsList({ onNav, onAction }) {
  const [status, setStatus] = useState('open');
  const filtered = JOBS.filter((j) => status === 'all' || j.status === status);

  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <Card><Stat label="Open roles" value={JOBS.filter((j) => j.status === 'open').length} sub="Across 4 departments" icon={<I.Briefcase size={14} />} /></Card>
        <Card>
          <Stat
            label="Active candidates"
            value={CANDIDATES.filter((c) => !['hired', 'rejected'].includes(c.stage)).length}
            sub="In pipeline"
            icon={<I.Users size={14} />}
          />
        </Card>
        <Card><Stat label="Interviews this week" value={INTERVIEWS.length} sub="3 onsites scheduled" icon={<I.Calendar size={14} />} /></Card>
        <Card><Stat label="Avg time to hire" value="38d" sub="−4d vs last quarter" delta="−4d" icon={<I.Clock size={14} />} /></Card>
      </div>

      <div className="flex items-center gap-2">
        {['open', 'draft', 'on-hold', 'closed', 'all'].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={cn(
              'h-7 px-2.5 rounded text-[12px] capitalize border',
              status === s ? 'bg-accent text-accent-fg border-accent' : 'border-border bg-card text-muted-fg hover:text-fg'
            )}
          >
            {s}{' '}
            <span className="font-mono tabular-nums text-[10.5px] opacity-70 ml-1">
              {JOBS.filter((j) => s === 'all' || j.status === s).length}
            </span>
          </button>
        ))}
        <Button size="sm" variant="outline" className="ml-auto" onClick={() => onAction('job', null, 'New job')}><I.Plus size={11} />New job</Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {filtered.map((j) => {
          const cands = CANDIDATES.filter((c) => c.job === j.id);
          const inFlight = cands.filter((c) => !['hired', 'rejected'].includes(c.stage));
          const offerStage = cands.filter((c) => c.stage === 'offer').length;
          const hm = empById(j.hiring_manager);
          const rc = empById(j.recruiter);

          return (
            <div
              key={j.id}
              onClick={() => onNav('recruitment', null, { jobId: j.id })}
              className="text-left bg-card border border-border rounded-md hover:border-accent/40 hover:shadow-sm focus-ring cursor-pointer"
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-2 gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[15px] font-semibold leading-tight">{j.title}</span>
                      <PriorityBadge p={j.priority} />
                    </div>
                    <div className="text-[12px] text-muted-fg">{deptName(j.dept)} · {locationName(j.loc)} · {j.type}</div>
                  </div>
                  <JobStatusBadge s={j.status} />
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border text-[12px]">
                  <div>
                    <div className="text-[10.5px] uppercase tracking-wider text-muted-fg">Pipeline</div>
                    <div className="font-mono tabular-nums">
                      {inFlight.length}<span className="text-muted-fg"> / {cands.length}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10.5px] uppercase tracking-wider text-muted-fg">In offer</div>
                    <div className="font-mono tabular-nums">{offerStage}</div>
                  </div>
                  <div>
                    <div className="text-[10.5px] uppercase tracking-wider text-muted-fg">Opened</div>
                    <div className="font-mono">{j.opened ? j.opened.slice(5) : '—'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border">
                  {hm && (
                    <span className="inline-flex items-center gap-1.5 text-[11.5px] text-muted-fg">
                      <Avatar name={`${hm.first} ${hm.last}`} hue={hm.hue} size={16} /> Hiring · {hm.first}
                    </span>
                  )}
                  <span className="text-muted-fg/40">·</span>
                  {rc && (
                    <span className="inline-flex items-center gap-1.5 text-[11.5px] text-muted-fg">
                      <Avatar name={`${rc.first} ${rc.last}`} hue={rc.hue} size={16} /> Recruiter · {rc.first}
                    </span>
                  )}
                  <span className="ml-auto inline-flex items-center gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); onAction('job', j, 'Edit job'); }}><I.Edit size={12} /></Button>
                    <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); onAction('post', { job: j.id, pipeline: PIPELINE_CONFIG.find((p) => p.dept === j.dept)?.id || PIPELINE_CONFIG[0].id }, 'Create job post'); }}><I.Send size={12} /></Button>
                    <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); onAction('delete', j, 'Delete job', 'job'); }}><I.X size={12} /></Button>
                  </span>
                </div>
              </div>
              <div className="flex gap-px h-1.5 bg-border">
                {REC_STAGES.filter((s) => s.id !== 'rejected').map((s) => {
                  const n = cands.filter((c) => c.stage === s.id).length;
                  return (
                    <div
                      key={s.id}
                      className="flex-1"
                      style={{ background: n > 0 ? `oklch(0.65 0.13 ${s.color})` : 'transparent', opacity: n > 0 ? 1 : 0 }}
                      title={`${s.label}: ${n}`}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CandidatesList({ onNav, onAction }) {
  const [q, setQ] = useState('');
  const [stage, setStage] = useState('all');
  const filtered = CANDIDATES.filter((c) => {
    if (stage !== 'all' && c.stage !== stage) return false;
    if (q && !`${c.first} ${c.last} ${c.current} ${c.loc}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-3 border-b border-border bg-bg flex items-center gap-2 flex-none">
        <div className="relative w-72">
          <I.Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-fg" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search candidate, current company…" className="pl-7" />
        </div>
        <Select value={stage} onChange={(e) => setStage(e.target.value)} className="w-44">
          <option value="all">All stages</option>
          {REC_STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </Select>
        <div className="ml-auto text-[12px] text-muted-fg font-mono">{filtered.length} of {CANDIDATES.length}</div>
        <Button size="sm" variant="outline" onClick={() => onAction('candidate', null, 'Add candidate')}><I.Plus size={11} />Add candidate</Button>
      </div>
      <div className="flex-1 overflow-y-auto scroll-thin">
        <Table>
          <THead>
            <TR className="hover:bg-transparent">
              <TH>Candidate</TH><TH>Role</TH><TH>Stage</TH>
              <TH>Rating</TH><TH>Source</TH><TH>Applied</TH><TH />
            </TR>
          </THead>
          <tbody>
            {filtered.map((c) => {
              const job = JOBS.find((j) => j.id === c.job);
              const stageObj = REC_STAGES.find((s) => s.id === c.stage) || { label: c.stage, color: 220 };
              return (
                <TR key={c.id} className="cursor-pointer" onClick={() => onNav('recruitment', null, { candId: c.id })}>
                  <TD>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={`${c.first} ${c.last}`} hue={c.hue} size={26} />
                      <div className="min-w-0">
                        <div className="text-[13px] font-medium leading-tight">{c.first} {c.last}</div>
                        <div className="text-[11.5px] text-muted-fg truncate">{c.current} · {c.loc}</div>
                      </div>
                    </div>
                  </TD>
                  <TD className="text-[12.5px]">{job?.title}</TD>
                  <TD>
                    <span className="inline-flex items-center gap-1.5 text-[12.5px]">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: `oklch(0.65 0.13 ${stageObj.color})` }} />
                      {stageObj.label}
                    </span>
                  </TD>
                  <TD>{c.rating ? <span className="font-mono text-warn">★ {c.rating.toFixed(1)}</span> : <span className="text-muted-fg">—</span>}</TD>
                  <TD className="text-[12px] text-muted-fg">{c.source}</TD>
                  <TD className="font-mono text-[12px] text-muted-fg">{c.applied}</TD>
                  <TD className="text-right">
                    <div className="inline-flex gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); onAction('candidate', c, 'Edit candidate'); }}><I.Edit size={12} /></Button>
                      <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); onAction('delete', c, 'Delete candidate', 'candidate'); }}><I.X size={12} /></Button>
                    </div>
                  </TD>
                </TR>
              );
            })}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

function InterviewsList({ onAction }) {
  const byDate = {};
  INTERVIEWS.forEach((iv) => {
    byDate[iv.date] = byDate[iv.date] || [];
    byDate[iv.date].push(iv);
  });
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-end">
        <Button size="sm" variant="outline" onClick={() => onAction('interview', null, 'Schedule interview')}><I.Plus size={11} />Schedule interview</Button>
      </div>
      {Object.entries(byDate).map(([date, ivs]) => {
        const d = new Date(date);
        return (
          <Card key={date}>
            <div className="px-4 py-2.5 border-b border-border flex items-center gap-3 bg-bg">
              <div className="text-[13px] font-semibold">{d.toLocaleString('en', { weekday: 'long' })}</div>
              <div className="text-[12px] text-muted-fg font-mono">{date}</div>
              <div className="ml-auto text-[11.5px] text-muted-fg">{ivs.length} interview{ivs.length !== 1 ? 's' : ''}</div>
            </div>
            <div>
              {ivs.map((iv) => {
                const cand = CANDIDATES.find((c) => c.id === iv.cand);
                const interviewer = empById(iv.interviewer);
                const job = JOBS.find((j) => j.id === cand.job);
                return (
                  <div key={iv.id} className="px-4 py-3 border-b border-border last:border-0 flex items-center gap-4">
                    <div className="w-16 text-center flex-none">
                      <div className="text-[15px] font-mono font-semibold tabular-nums">{iv.time}</div>
                      <div className="text-[10.5px] font-mono text-muted-fg">{iv.dur}min</div>
                    </div>
                    <div className="w-px h-10 bg-border" />
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <Avatar name={`${cand.first} ${cand.last}`} hue={cand.hue} size={32} />
                      <div className="min-w-0">
                        <div className="text-[13px] font-medium truncate">
                          {cand.first} {cand.last} <span className="text-muted-fg font-normal">· {job?.title}</span>
                        </div>
                        <div className="text-[11.5px] text-muted-fg truncate">{iv.type}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-none">
                      <div className="text-right">
                        <div className="text-[11.5px] text-muted-fg">Interviewer</div>
                        <div className="text-[12.5px] flex items-center gap-1.5">
                          <Avatar name={`${interviewer.first} ${interviewer.last}`} hue={interviewer.hue} size={20} />
                          {interviewer.first} {interviewer.last}
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => onAction('interview', iv, 'Edit interview')}>Open</Button>
                      <Button size="sm" variant="ghost" onClick={() => onAction('delete', iv, 'Delete interview', 'interview')}><I.X size={11} /></Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function OffersList({ onAction }) {
  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center justify-end">
        <Button size="sm" variant="outline" onClick={() => onAction('offer', null, 'Draft offer')}><I.Plus size={11} />Draft offer</Button>
      </div>
      <div className="grid grid-cols-2 gap-3">
      {OFFERS.map((o) => {
        const cand = CANDIDATES.find((c) => c.id === o.cand);
        const job = JOBS.find((j) => j.id === o.job);
        return (
          <Card key={o.id}>
            <div className="px-4 py-3 border-b border-border flex items-center gap-3">
              <Avatar name={`${cand.first} ${cand.last}`} hue={cand.hue} size={36} />
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold">{cand.first} {cand.last}</div>
                <div className="text-[11.5px] text-muted-fg">{job.title} · starts {o.start_date}</div>
              </div>
              {o.status === 'sent' && <Badge tone="warn"><I.Send size={10} />Sent · expires {o.expires}</Badge>}
              {o.status === 'pending-approval' && <Badge tone="outline">Pending approval</Badge>}
              {o.status === 'accepted' && <Badge tone="ok">Accepted</Badge>}
            </div>
            <CardBody className="space-y-1.5 text-[12.5px]">
              <div className="flex justify-between"><span className="text-muted-fg">Basic</span><span className="font-mono tabular-nums">฿{o.basic.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-fg">Housing</span><span className="font-mono tabular-nums">฿{o.house.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-fg">Transport</span><span className="font-mono tabular-nums">฿{o.trans.toLocaleString()}</span></div>
              <div className="flex justify-between pt-1.5 mt-1 border-t border-border font-semibold">
                <span>Total / mo</span><span className="font-mono tabular-nums">฿{o.total.toLocaleString()}</span>
              </div>
            </CardBody>
            <div className="border-t border-border px-4 py-2.5 flex items-center justify-end gap-1.5">
              <Button variant="outline" size="sm" onClick={() => onAction('offer', o, 'Preview offer')}><I.Eye size={11} />Preview letter</Button>
              <Button variant="outline" size="sm" onClick={() => onAction('offer', o, 'Revise offer')}><I.Refresh size={11} />Revise</Button>
              {o.status === 'pending-approval' && <Button size="sm" onClick={() => onAction('offer', { ...o, status: 'sent' }, 'Approve & send offer')}><I.Check size={11} />Approve & send</Button>}
              {o.status === 'sent' && <Button size="sm" onClick={() => onAction('offer', o, 'Resend offer')}><I.Mail size={11} />Resend</Button>}
              <Button variant="ghost" size="icon-sm" onClick={() => onAction('delete', o, 'Delete offer', 'offer')}><I.X size={11} /></Button>
            </div>
          </Card>
        );
      })}
      </div>
    </div>
  );
}

function JobDescription({ job }) {
  return (
    <div className="p-6 grid grid-cols-3 gap-4">
      <Card className="col-span-2">
        <CardHeader><CardTitle>About the role</CardTitle></CardHeader>
        <CardBody className="space-y-3 text-[13px] leading-relaxed text-fg/90">
          <p>
            We are looking for a senior engineer to help us build the next generation of HR infrastructure. You will own a vertical slice end-to-end — from data model through to AI agent tooling — in an open-source codebase used by real companies.
          </p>
          <div>
            <div className="font-semibold mb-1.5 mt-2">What you will do</div>
            <ul className="space-y-1 text-[12.5px] text-fg/85 list-disc pl-5">
              <li>Design and build feature-first vertical slices: service, repository, HTTP routes, and agent tools.</li>
              <li>Treat the service layer as the single source of truth — both UI and agent must call it.</li>
              <li>Write durable code: every state change recorded in the audit log; permissions enforced once.</li>
              <li>Partner with the agent runtime team to expose new tools as features ship.</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-1.5 mt-2">What we look for</div>
            <ul className="space-y-1 text-[12.5px] text-fg/85 list-disc pl-5">
              <li>6+ years building backend systems with non-trivial domain complexity.</li>
              <li>Strong product instinct — you can argue against a feature request that doesn't earn its complexity.</li>
              <li>Experience with multi-tenant or compliance-sensitive software is a strong plus.</li>
            </ul>
          </div>
        </CardBody>
      </Card>
      <div className="space-y-3">
        <Card>
          <CardHeader><CardTitle>Compensation</CardTitle></CardHeader>
          <CardBody className="space-y-2 text-[13px]">
            <div className="flex justify-between"><span className="text-muted-fg">Band</span><span className="font-mono">L4 · Senior</span></div>
            <div className="flex justify-between"><span className="text-muted-fg">Base range</span><span className="font-mono">฿110K–฿165K</span></div>
            <div className="flex justify-between"><span className="text-muted-fg">Equity</span><span>0.05–0.15%</span></div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader><CardTitle>Hiring panel</CardTitle></CardHeader>
          <CardBody className="space-y-2">
            {['e002', 'e004', 'e005', 'e009'].map((id) => {
              const e = empById(id);
              return (
                <div key={id} className="flex items-center gap-2.5">
                  <Avatar name={`${e.first} ${e.last}`} hue={e.hue} size={26} />
                  <div className="text-[12.5px]">
                    <div className="leading-tight">{e.first} {e.last}</div>
                    <div className="text-[11px] text-muted-fg">{positionName(e.position)}</div>
                  </div>
                </div>
              );
            })}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function ScorecardTemplate({ onAction }) {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Scorecard template</CardTitle>
            <Caption>Structured evaluation criteria for this job.</Caption>
          </div>
          <Button size="sm" variant="outline" onClick={() => onAction('scorecard', null, 'Add scorecard dimension')}><I.Plus size={11} />Add dimension</Button>
        </CardHeader>
        <CardBody className="space-y-3.5">
          {SCORECARD_TEMPLATE.map((row) => (
            <div key={row.id} className="flex items-center gap-4 pb-3 border-b border-border last:border-0 last:pb-0">
              <div className="w-44 flex-none">
                <div className="text-[13px] font-medium">{row.dim}</div>
                <div className="text-[11.5px] text-muted-fg">Weight {row.weight}%</div>
              </div>
              <div className="text-[12.5px] text-muted-fg flex-1">{row.desc}</div>
              <div className="flex items-center gap-1 flex-none">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div
                    key={n}
                    className={cn(
                      'w-6 h-6 rounded border border-border flex items-center justify-center text-[11px] font-mono',
                      n === 4 ? 'bg-accent text-accent-fg border-accent' : 'text-muted-fg'
                    )}
                  >
                    {n}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1 flex-none">
                <Button variant="ghost" size="icon-sm" onClick={() => onAction('scorecard', row, 'Edit scorecard dimension')}><I.Edit size={12} /></Button>
                <Button variant="ghost" size="icon-sm" onClick={() => onAction('delete', row, 'Delete scorecard dimension', 'scorecard')}><I.X size={12} /></Button>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}

function JobActivity() {
  return (
    <div className="p-6">
      <Card>
        <CardBody>
          <ol className="relative ml-2 space-y-3 text-[12.5px] border-l border-border pl-5">
            {[
              { d: '2026-05-17', a: 'Mei Suzuki advanced to offer', who: 'e011' },
              { d: '2026-05-15', a: 'Adam Mendez scheduled for technical interview', who: 'e011' },
              { d: '2026-05-14', a: 'Lena Müller advanced to recruiter screen', who: 'e011' },
              { d: '2026-05-11', a: 'JD updated — added "agent runtime" responsibility', who: 'e001' },
              { d: '2026-05-08', a: 'Reema Aziz applied via LinkedIn', who: 'system' },
              { d: '2026-03-12', a: 'Job opened', who: 'e001' },
            ].map((x, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[26px] top-1.5 w-2.5 h-2.5 rounded-full bg-muted ring-4 ring-bg" />
                <div>{x.a}</div>
                <div className="text-[11px] text-muted-fg font-mono">{x.d} · {x.who === 'system' ? 'system' : empName(x.who)}</div>
              </li>
            ))}
          </ol>
        </CardBody>
      </Card>
    </div>
  );
}

function JobDetail({ jobId, onNav, onAction, onMove }) {
  const j = JOBS.find((x) => x.id === jobId);
  const [tab, setTab] = useState('pipeline');
  if (!j) return <div className="p-6">Job not found.</div>;
  const cands = CANDIDATES.filter((c) => c.job === jobId);
  const hm = empById(j.hiring_manager);
  const rc = empById(j.recruiter);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-6 pt-5 pb-4 border-b border-border">
        <div className="text-[11.5px] text-muted-fg mb-2 flex items-center gap-1">
          <button onClick={() => onNav('recruitment')} className="hover:text-fg">Recruitment</button>
          <I.ChevronRight size={11} className="text-muted-fg/60" />
          <span>Jobs</span>
          <I.ChevronRight size={11} className="text-muted-fg/60" />
          <span className="font-mono">{j.id}</span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap mb-1">
              <h1 className="text-[22px] font-semibold ">{j.title}</h1>
              <PriorityBadge p={j.priority} />
              <JobStatusBadge s={j.status} />
            </div>
            <div className="text-[13px] text-muted-fg">
              {deptName(j.dept)} · {locationName(j.loc)} · {j.type} · {j.headcount} headcount
            </div>
            <div className="flex items-center gap-4 mt-2.5 text-[12.5px] text-muted-fg">
              {hm && (
                <span className="inline-flex items-center gap-1.5">
                  <Avatar name={`${hm.first} ${hm.last}`} hue={hm.hue} size={18} />Hiring · {hm.first} {hm.last}
                </span>
              )}
              {rc && (
                <span className="inline-flex items-center gap-1.5">
                  <Avatar name={`${rc.first} ${rc.last}`} hue={rc.hue} size={18} />Recruiter · {rc.first} {rc.last}
                </span>
              )}
              <span className="font-mono">Opened {j.opened || 'draft'} · Target close {j.target_close || '—'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-none">
            <Button variant="outline" size="md" onClick={() => onAction('job', j, 'Edit job description')}><I.Edit size={13} />Edit JD</Button>
            <Button size="md" onClick={() => onAction('candidate', { job: jobId }, 'Add candidate')}><I.Plus size={13} />Add candidate</Button>
          </div>
        </div>
        <div className="mt-4">
          <Tabs
            value={tab}
            onChange={setTab}
            items={[
              { id: 'pipeline', label: 'Pipeline', count: cands.length },
              { id: 'jd', label: 'Description' },
              { id: 'scorecard', label: 'Scorecard template' },
              { id: 'activity', label: 'Activity' },
            ]}
          />
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        {tab === 'pipeline' && <Pipeline onNav={onNav} jobFilterDefault={jobId} onAction={onAction} onMove={onMove} />}
        {tab === 'jd' && <JobDescription job={j} />}
        {tab === 'scorecard' && <ScorecardTemplate onAction={onAction} />}
        {tab === 'activity' && <JobActivity />}
      </div>
    </div>
  );
}

function CandOverview({ cand, ivs, scs }) {
  const avg = scs.length ? scs.reduce((s, x) => s + x.rating, 0) / scs.length : null;
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="col-span-2">
        <CardHeader><CardTitle>Pipeline progress</CardTitle></CardHeader>
        <CardBody>
          <div className="flex items-center gap-1">
            {REC_STAGES.filter((s) => s.id !== 'rejected').map((stage, i) => {
              const stageIdx = REC_STAGES.findIndex((x) => x.id === cand.stage);
              const thisIdx = REC_STAGES.findIndex((x) => x.id === stage.id);
              const passed = thisIdx <= stageIdx;
              const current = stage.id === cand.stage;
              return (
                <Fragment key={stage.id}>
                  <div className="flex-1 flex flex-col items-center gap-1.5 px-1">
                    <div
                      className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-semibold border-2',
                        current
                          ? 'bg-accent text-accent-fg border-accent'
                          : passed
                          ? 'bg-accent/15 text-accent border-accent/30'
                          : 'bg-muted text-muted-fg/60 border-border'
                      )}
                    >
                      {passed ? '✓' : i + 1}
                    </div>
                    <div className={cn('text-[10.5px] text-center', current ? 'font-semibold' : 'text-muted-fg')}>{stage.label}</div>
                  </div>
                  {i < REC_STAGES.length - 2 && <div className={cn('flex-1 h-px', passed ? 'bg-accent/40' : 'bg-border')} />}
                </Fragment>
              );
            })}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Snapshot</CardTitle></CardHeader>
        <CardBody className="space-y-2 text-[12.5px]">
          <Field label="Days in pipeline" value={`${Math.max(1, Math.round((TODAY - new Date(cand.applied)) / 86400000))} days`} mono />
          <Field label="Salary expectation" value={cand.salary_ask ? `฿${cand.salary_ask.toLocaleString()} / mo` : '—'} mono />
          <Field label="Avg scorecard" value={avg ? `★ ${avg.toFixed(2)} (${scs.length})` : '—'} />
          <Field label="Interviews completed" value={`${ivs.length} scheduled`} />
        </CardBody>
      </Card>

      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Resume highlights</CardTitle>
          <Caption>Extracted by agent · review before relying on</Caption>
        </CardHeader>
        <CardBody className="space-y-3 text-[13px]">
          <div>
            <div className="font-semibold mb-1">Experience</div>
            <ul className="space-y-1.5 text-[12.5px] text-fg/85">
              <li><b>{cand.current}</b> — {cand.exp} · Owned distributed payments infrastructure; reduced p99 latency 38% over 18 months.</li>
              <li><b>Previous · Datafold</b> — 2019–2023 · Led data-diff product from prototype to $4M ARR. Hired and managed a team of 6 engineers.</li>
              <li><b>Earliest · Allegro</b> — 2016–2019 · Backend on auction services, mentored 4 junior engineers to mid-level.</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-1">Skills</div>
            <div className="flex flex-wrap gap-1.5">
              {['Go', 'Python', 'PostgreSQL', 'Kafka', 'Kubernetes', 'gRPC', 'OpenTelemetry', 'Polish (native)', 'English'].map((s) => (
                <Badge key={s} tone="outline" size="sm">{s}</Badge>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function CandScorecards({ scs }) {
  if (scs.length === 0) return <Empty title="No scorecards yet" sub="Scorecards appear as the panel submits them." />;
  return (
    <div className="space-y-3">
      {scs.map((s) => {
        const interviewer = empById(s.interviewer);
        const rec = SCORECARD_RECOMMEND_TONE[s.recommend];
        return (
          <Card key={s.id}>
            <div className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <Avatar name={`${interviewer.first} ${interviewer.last}`} hue={interviewer.hue} size={32} />
                <div className="flex-1">
                  <div className="text-[13px] font-medium">{interviewer.first} {interviewer.last}</div>
                  <div className="text-[11.5px] text-muted-fg">{s.round}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5 text-warn">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < s.rating ? '' : 'opacity-20'}>★</span>
                    ))}
                  </div>
                  <Badge tone={rec.tone}>{rec.label}</Badge>
                </div>
              </div>
              <div className="text-[13px] text-fg/90 italic pl-11 leading-relaxed">"{s.notes}"</div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function CandInterviews({ ivs, cand, onAction }) {
  if (ivs.length === 0) {
    return (
      <Empty
        title="No interviews scheduled"
        action={<Button size="md" onClick={() => onAction('interview', { cand: cand.id }, 'Schedule interview')}><I.Plus size={13} />Schedule interview</Button>}
      />
    );
  }
  return (
    <Card>
      <Table>
        <THead>
          <TR className="hover:bg-transparent">
            <TH>Date</TH><TH>Time</TH><TH>Type</TH><TH>Interviewer</TH><TH>Status</TH><TH />
          </TR>
        </THead>
        <tbody>
          {ivs.map((iv) => {
            const e = empById(iv.interviewer);
            return (
              <TR key={iv.id}>
                <TD className="font-mono text-[12.5px]">{iv.date}</TD>
                <TD className="font-mono text-[12.5px] tabular-nums">
                  {iv.time} <span className="text-muted-fg">({iv.dur}m)</span>
                </TD>
                <TD className="text-[13px]">{iv.type}</TD>
                <TD>
                  <div className="flex items-center gap-2">
                    <Avatar name={`${e.first} ${e.last}`} hue={e.hue} size={22} />
                    <span className="text-[12.5px]">{e.first} {e.last}</span>
                  </div>
                </TD>
                <TD><Badge tone="outline">Scheduled</Badge></TD>
                <TD className="text-right">
                  <div className="inline-flex gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => onAction('interview', iv, 'Edit interview')}><I.Edit size={12} /></Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => onAction('delete', iv, 'Delete interview', 'interview')}><I.X size={12} /></Button>
                  </div>
                </TD>
              </TR>
            );
          })}
        </tbody>
      </Table>
    </Card>
  );
}

function CandOffer({ offer, cand, job, onAction }) {
  if (!offer) {
    return (
      <Empty
        title="No offer extended yet"
        sub="Advance to the offer stage to draft compensation."
        action={<Button size="md" onClick={() => onAction('offer', { cand: cand.id, job: job.id }, 'Draft offer')}><I.Plus size={13} />Draft offer</Button>}
      />
    );
  }
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Offer letter</CardTitle>
          <div className="flex items-center gap-1.5">
            <Badge tone="warn">Sent · expires {offer.expires}</Badge>
            <Button variant="ghost" size="icon-sm" onClick={() => onAction('offer', offer, 'Edit offer')}><I.Edit size={12} /></Button>
            <Button variant="ghost" size="icon-sm" onClick={() => onAction('delete', offer, 'Delete offer', 'offer')}><I.X size={12} /></Button>
          </div>
        </CardHeader>
        <CardBody>
          <div className="p-6 border border-border rounded bg-card font-serif text-[13px] leading-relaxed space-y-3">
            <div className="font-sans text-[11px] uppercase tracking-widest text-muted-fg">Mercury Labs Co., Ltd.</div>
            <div>Dear {cand.first},</div>
            <p>
              We are delighted to extend an offer of employment for the position of <b>{job.title}</b>, joining the {deptName(job.dept)} team. Your start date is <b>{offer.start_date}</b>, reporting to {empName(job.hiring_manager)}.
            </p>
            <p>
              Your monthly compensation will be <b>฿{offer.total.toLocaleString()}</b> gross, comprising basic salary, housing, and transport allowances as detailed below. You will be eligible for standard statutory benefits and 15 days of annual leave.
            </p>
            <p>
              This offer is contingent on standard background checks and is valid until {offer.expires}. Please indicate acceptance by replying to this email or signing the attached letter.
            </p>
            <div className="pt-3">Warm regards,<br /><b>Anya Sirichai</b> · Head of People</div>
          </div>
        </CardBody>
      </Card>
      <div className="space-y-3">
        <Card>
          <CardHeader><CardTitle>Breakdown</CardTitle></CardHeader>
          <CardBody className="space-y-1.5 text-[12.5px]">
            <div className="flex justify-between"><span className="text-muted-fg">Basic</span><span className="font-mono">฿{offer.basic.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-fg">Housing</span><span className="font-mono">฿{offer.house.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-fg">Transport</span><span className="font-mono">฿{offer.trans.toLocaleString()}</span></div>
            <div className="flex justify-between pt-1.5 mt-1 border-t border-border font-semibold">
              <span>Monthly</span><span className="font-mono">฿{offer.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-muted-fg">
              <span>Annualized</span><span className="font-mono">฿{(offer.total * 12).toLocaleString()}</span>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader><CardTitle>Equity</CardTitle></CardHeader>
          <CardBody className="space-y-1.5 text-[12.5px]">
            <div className="flex justify-between"><span className="text-muted-fg">Grant</span><span className="font-mono">0.12%</span></div>
            <div className="flex justify-between"><span className="text-muted-fg">Vesting</span><span>4y · 1y cliff</span></div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function CandMessages({ cand }) {
  return (
    <Card>
      <CardBody className="space-y-4">
        {[
          { from: 'agent', who: 'Kofi Mensah · Recruiter', d: '2026-05-17', txt: `Hi ${cand.first}, thank you for your time on the onsite — the panel was impressed and we are putting together an offer. Expect formal letter by end of week.` },
          { from: 'cand', who: `${cand.first} ${cand.last}`, d: '2026-05-15', txt: 'Thanks for the onsite invite — looking forward to meeting the team on Tuesday. Quick question on the system design round: should I prepare for green-field or extend an existing service?' },
          { from: 'agent', who: 'Kofi Mensah · Recruiter', d: '2026-05-13', txt: `Hi ${cand.first}, we'd love to invite you to a final round onsite. Sending logistics in a separate email.` },
        ].map((m, i) => (
          <div key={i} className={cn('flex gap-3', m.from === 'cand' && 'flex-row-reverse')}>
            <Avatar name={m.who} hue={m.from === 'cand' ? cand.hue : 70} size={32} />
            <div className={cn('max-w-[70%] rounded-md border px-3 py-2', m.from === 'cand' ? 'bg-accent-soft border-accent/20' : 'bg-card border-border')}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[12px] font-semibold">{m.who}</span>
                <span className="text-[10.5px] font-mono text-muted-fg">{m.d}</span>
              </div>
              <div className="text-[13px] leading-relaxed text-fg/90">{m.txt}</div>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}

function CandidateDetail({ candId, onNav, onAction }) {
  const cand = CANDIDATES.find((c) => c.id === candId);
  const [tab, setTab] = useState('overview');
  if (!cand) return <div className="p-6">Candidate not found.</div>;
  const job = JOBS.find((j) => j.id === cand.job);
  const ivs = INTERVIEWS.filter((iv) => iv.cand === cand.id);
  const scs = SCORECARDS.filter((s) => s.cand === cand.id);
  const offer = OFFERS.find((o) => o.cand === cand.id);
  const stageObj = REC_STAGES.find((s) => s.id === cand.stage) || REC_STAGES[0];
  const nextStage = REC_STAGES.filter((s) => s.id !== 'rejected')[Math.min(
    REC_STAGES.filter((s) => s.id !== 'rejected').findIndex((s) => s.id === cand.stage) + 1,
    REC_STAGES.filter((s) => s.id !== 'rejected').length - 1
  )]?.id || cand.stage;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-6 pt-5 pb-4 border-b border-border">
        <div className="text-[11.5px] text-muted-fg mb-2 flex items-center gap-1">
          <button onClick={() => onNav('recruitment')} className="hover:text-fg">Recruitment</button>
          <I.ChevronRight size={11} className="text-muted-fg/60" />
          <button onClick={() => onNav('recruitment', null, { jobId: job.id })} className="hover:text-fg">{job.title}</button>
        </div>
        <div className="flex items-start gap-4">
          <Avatar name={`${cand.first} ${cand.last}`} hue={cand.hue} size={64} className="text-lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap mb-1">
              <h1 className="text-[22px] font-semibold ">{cand.first} {cand.last}</h1>
              <Badge tone="outline" className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: `oklch(0.65 0.13 ${stageObj.color})` }} />
                {stageObj.label}
              </Badge>
              {cand.rating && <Badge tone="warn">★ {cand.rating.toFixed(1)}</Badge>}
            </div>
            <div className="text-[13px] text-muted-fg">{cand.current} · {cand.loc} · {cand.exp} experience</div>
            <div className="flex items-center gap-4 mt-2.5 text-[12.5px] text-muted-fg">
              <span className="inline-flex items-center gap-1.5">
                <I.Mail size={12} /> {cand.first.toLowerCase()}.{cand.last.toLowerCase()}@example.com
              </span>
              <span className="inline-flex items-center gap-1.5"><I.Tag size={12} /> {cand.source}</span>
              <span className="inline-flex items-center gap-1.5"><I.Calendar size={12} /> Applied {cand.applied}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-none">
            <Button variant="outline" size="md" onClick={() => onAction('candidate', cand, 'Review candidate profile')}><I.Doc size={13} />Resume</Button>
            <Button variant="outline" size="md" onClick={() => onAction('candidate', { ...cand, stage: 'rejected' }, 'Reject candidate')}><I.X size={13} />Reject</Button>
            <Button size="md" onClick={() => onAction('candidate', { ...cand, stage: nextStage }, 'Advance candidate')}><I.ArrowRight size={13} />Advance</Button>
          </div>
        </div>
        <div className="mt-4">
          <Tabs
            value={tab}
            onChange={setTab}
            items={[
              { id: 'overview', label: 'Overview' },
              { id: 'scorecards', label: 'Scorecards', count: scs.length },
              { id: 'interviews', label: 'Interviews', count: ivs.length },
              { id: 'offer', label: 'Offer', count: offer ? 1 : null },
              { id: 'messages', label: 'Messages' },
            ]}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scroll-thin p-6">
        {tab === 'overview' && <CandOverview cand={cand} ivs={ivs} scs={scs} />}
        {tab === 'scorecards' && <CandScorecards scs={scs} />}
        {tab === 'interviews' && <CandInterviews ivs={ivs} cand={cand} onAction={onAction} />}
        {tab === 'offer' && <CandOffer offer={offer} cand={cand} job={job} onAction={onAction} />}
        {tab === 'messages' && <CandMessages cand={cand} />}
      </div>
    </div>
  );
}

const TALENT_POOL = [
  { id: 'tp1', first: 'Ravi', last: 'Sundaram', skills: ['Go', 'Distributed systems', 'Postgres'], location: 'Singapore, SG', lastTouched: '2026-03-30', rating: 4, hue: 60, why: 'Solid SWE, didn’t make it past final for backend — try again for L4 next year' },
  { id: 'tp2', first: 'Sophie', last: 'Lambert', skills: ['React', 'Typescript', 'GraphQL'], location: 'Paris, FR', lastTouched: '2026-02-15', rating: 5, hue: 320, why: 'Top-tier frontend — keep warm for senior FE opening' },
  { id: 'tp3', first: 'Karthik', last: 'Iyer', skills: ['PM', 'Fintech', 'API products'], location: 'Bangalore, IN', lastTouched: '2026-01-20', rating: 4, hue: 30, why: 'PM finalist, declined offer due to relocation. Stay in touch' },
  { id: 'tp4', first: 'Mei-Ling', last: 'Wu', skills: ['Design systems', 'Figma', 'Brand'], location: 'Taipei, TW', lastTouched: '2025-12-08', rating: 5, hue: 280, why: 'Outstanding portfolio. Open to remote roles only — wait for next remote slot' },
  { id: 'tp5', first: 'Hassan', last: 'Yusuf', skills: ['Data eng', 'dbt', 'Airflow'], location: 'Dubai, AE', lastTouched: '2025-11-19', rating: 3.5, hue: 150, why: 'Strong technical, slightly under bar on system design. Try at L3' },
  { id: 'tp6', first: 'Elena', last: 'Petrova', skills: ['QA', 'Test automation', 'Cypress'], location: 'Belgrade, RS', lastTouched: '2025-10-04', rating: 4, hue: 200, why: 'QA lead — keep on file for when we open quality eng role' },
];

function TalentPool({ onAction }) {
  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <Card><Stat label="People warm" value={TALENT_POOL.length} sub="Past finalists worth re-engaging" icon={<I.Users size={14} />} /></Card>
        <Card><Stat label="Top tier (★ 5)" value={TALENT_POOL.filter((p) => p.rating >= 5).length} sub="Reach out first for new reqs" icon={<I.Sparkle size={14} />} /></Card>
        <Card><Stat label="Re-engaged this Q" value="4" sub="Of which 2 moved into pipeline" icon={<I.Refresh size={14} />} /></Card>
        <Card><Stat label="Avg time on file" value="124d" sub="Refresh after 180d" icon={<I.Clock size={14} />} /></Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Talent pool</CardTitle>
            <Caption>People we wanted but couldn’t hire — kept warm for the right opening.</Caption>
          </div>
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="outline" onClick={() => onAction('talent', { id: 'match' }, 'Match talent to roles')}><I.Sparkle size={11} className="text-accent" />Match to open roles</Button>
            <Button size="sm" variant="outline" onClick={() => onAction('talent', null, 'Add talent')}><I.Plus size={11} />Add</Button>
          </div>
        </CardHeader>
        <Table>
          <THead>
            <TR className="hover:bg-transparent">
              <TH>Person</TH><TH>Skills</TH><TH>Rating</TH>
              <TH>Last touched</TH><TH>Why they’re here</TH><TH />
            </TR>
          </THead>
          <tbody>
            {TALENT_POOL.map((p) => (
              <TR key={p.id} className="cursor-pointer" onClick={() => onAction('talent', p, 'Edit talent')}>
                <TD>
                  <div className="flex items-center gap-2.5">
                    <Avatar name={`${p.first} ${p.last}`} hue={p.hue} size={26} />
                    <div>
                      <div className="text-[13px] font-medium">{p.first} {p.last}</div>
                      <div className="text-[11px] text-muted-fg">{p.location}</div>
                    </div>
                  </div>
                </TD>
                <TD>
                  <div className="flex flex-wrap gap-1">
                    {p.skills.map((s) => <Badge key={s} tone="outline" size="sm">{s}</Badge>)}
                  </div>
                </TD>
                <TD><span className="font-mono text-warn">★ {p.rating.toFixed(1)}</span></TD>
                <TD className="font-mono text-[12px] text-muted-fg">{p.lastTouched}</TD>
                <TD className="text-[12px] text-muted-fg max-w-[280px] truncate">{p.why}</TD>
                <TD className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <Button variant="ghost" size="icon-sm" title="Re-engage" onClick={(e) => { e.stopPropagation(); onAction('talent', p, 'Re-engage talent'); }}><I.Mail size={12} /></Button>
                    <Button variant="ghost" size="icon-sm" title="Move to pipeline" onClick={(e) => { e.stopPropagation(); onAction('candidate', { first: p.first, last: p.last, current: p.why, source: 'Talent pool', loc: p.location }, 'Move talent to pipeline'); }}><I.ArrowRight size={12} /></Button>
                    <Button variant="ghost" size="icon-sm" title="Delete" onClick={(e) => { e.stopPropagation(); onAction('delete', p, 'Delete talent', 'talent'); }}><I.X size={12} /></Button>
                  </div>
                </TD>
              </TR>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}

function Sources({ onAction }) {
  const total = SOURCE_CHANNELS.reduce(
    (s, x) => ({ applied: s.applied + x.applied, advanced: s.advanced + x.advanced, hired: s.hired + x.hired }),
    { applied: 0, advanced: 0, hired: 0 }
  );

  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <Card><Stat label="Applied" value={total.applied} sub="Last 90 days" icon={<I.Mail size={14} />} /></Card>
        <Card><Stat label="Advanced" value={total.advanced} sub={`${Math.round(total.advanced / total.applied * 100)}% advance rate`} icon={<I.ArrowRight size={14} />} /></Card>
        <Card><Stat label="Hired" value={total.hired} sub="Year to date" icon={<I.Check size={14} />} /></Card>
        <Card><Stat label="Quality of source" value="Referral" sub="Best advance rate · 75%" delta="+22%" icon={<I.TrendingUp size={14} />} /></Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Sources of hire</CardTitle>
            <Caption>Funnel performance over the last 90 days</Caption>
          </div>
          <Button size="sm" variant="outline" onClick={() => onAction('source', null, 'Add source')}><I.Plus size={11} />Add source</Button>
        </CardHeader>
        <Table>
          <THead>
            <TR className="hover:bg-transparent">
              <TH>Source</TH><TH className="text-right">Applied</TH><TH className="text-right">Advanced</TH>
              <TH className="text-right">Hired</TH><TH className="text-right">Advance %</TH>
              <TH>Funnel</TH><TH className="text-right">Cost per applicant</TH><TH />
            </TR>
          </THead>
          <tbody>
            {SOURCE_CHANNELS.map((s) => {
              const advPct = s.applied ? (s.advanced / s.applied) * 100 : 0;
              const hirePct = s.applied ? (s.hired / s.applied) * 100 : 0;
              return (
                <TR key={s.id} className="cursor-pointer" onClick={() => onAction('source', s, 'Edit source')}>
                  <TD>
                    <div className="text-[13px] font-medium">{s.name}</div>
                    <div className="text-[11px] text-muted-fg truncate max-w-[260px]">{s.sub}</div>
                  </TD>
                  <TD className="text-right font-mono tabular-nums">{s.applied}</TD>
                  <TD className="text-right font-mono tabular-nums">{s.advanced}</TD>
                  <TD className="text-right font-mono tabular-nums">{s.hired}</TD>
                  <TD className="text-right font-mono tabular-nums">{Math.round(advPct)}%</TD>
                  <TD>
                    <div className="flex gap-px h-2 rounded-full overflow-hidden bg-muted w-32">
                      <div className="bg-accent" style={{ width: `${hirePct}%` }} />
                      <div className="bg-accent/40" style={{ width: `${advPct - hirePct}%` }} />
                    </div>
                  </TD>
                  <TD className="text-right font-mono tabular-nums text-muted-fg">{s.cpa ? `฿${s.cpa.toLocaleString()}` : '—'}</TD>
                  <TD className="text-right">
                    <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); onAction('source', s, 'Edit source'); }}><I.Edit size={12} /></Button>
                    <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); onAction('delete', s, 'Delete source', 'source'); }}><I.X size={12} /></Button>
                  </TD>
                </TR>
              );
            })}
          </tbody>
        </Table>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader>
            <CardTitle>Channels</CardTitle>
            <Button size="sm" variant="outline" onClick={() => onAction('source', null, 'Add channel')}><I.Plus size={11} />Add channel</Button>
          </CardHeader>
          <div className="border-t border-border">
            {SOURCE_CHANNELS.map((c) => (
              <div key={c.id} className="px-4 py-2.5 border-b border-border last:border-0 flex items-center justify-between gap-2">
                <div>
                  <div className="text-[13px] font-medium">{c.name}</div>
                  <div className="text-[11.5px] text-muted-fg">{c.sub}</div>
                </div>
                <div className="flex items-center gap-1">
                  {c.status === 'active' ? (
                    <Badge tone="ok" size="sm"><I.CircleDot size={8} />Active</Badge>
                  ) : (
                    <Badge tone="outline" size="sm">Paused</Badge>
                  )}
                  <Button variant="ghost" size="icon-sm" onClick={() => onAction('source', c, 'Edit channel')}><I.Edit size={12} /></Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Referral program</CardTitle>
            <Button size="sm" variant="outline" onClick={() => onAction('source', SOURCE_CHANNELS.find((s) => s.id === 'src-referral'), 'Edit referral source')}><I.Edit size={11} />Edit</Button>
          </CardHeader>
          <CardBody className="space-y-2.5 text-[13px]">
            <Field label="Active referral bonus" value="฿20,000 on 90-day mark" />
            <Field label="Senior role bonus" value="฿50,000 on hire (L5+)" />
            <Field label="Referrals this quarter" value="12 submitted · 2 hired" mono />
            <Field label="Top referrer" value="Marcus Tan · 4 referrals YTD" />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function PipelineManager({ onAction }) {
  return (
    <div className="p-6 grid grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Dynamic pipelines</CardTitle>
            <Caption>Each job can publish into a department-specific pipeline.</Caption>
          </div>
          <Button size="sm" variant="outline" onClick={() => onAction('pipeline', null, 'New pipeline')}><I.Plus size={11} />New pipeline</Button>
        </CardHeader>
        <div className="border-t border-border">
          {PIPELINE_CONFIG.map((p) => (
            <div key={p.id} className="px-4 py-3 border-b border-border last:border-0">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-[13px] font-semibold">{p.name}</div>
                  <div className="text-[11.5px] text-muted-fg">{deptName(p.dept)} · SLA {p.sla}d · {p.stages.length} stages</div>
                </div>
                <div className="flex items-center gap-1">
                  <Badge tone={p.status === 'active' ? 'ok' : 'outline'}>{p.status}</Badge>
                  <Button variant="ghost" size="icon-sm" onClick={() => onAction('pipeline', p, 'Edit pipeline')}><I.Edit size={12} /></Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => onAction('delete', p, 'Delete pipeline', 'pipeline')}><I.X size={12} /></Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {p.stages.map((id) => {
                  const s = REC_STAGES.find((x) => x.id === id);
                  return <Badge key={id} tone="outline" size="sm">{s?.label || id}</Badge>;
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Stage library</CardTitle>
          <Button size="sm" variant="outline" onClick={() => onAction('stage', null, 'Add stage')}><I.Plus size={11} />Add stage</Button>
        </CardHeader>
        <div className="border-t border-border">
          {REC_STAGES.map((s) => (
            <div key={s.id} className="px-4 py-2.5 border-b border-border last:border-0 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: `oklch(0.65 0.13 ${s.color})` }} />
              <div className="flex-1">
                <div className="text-[13px] font-medium">{s.label}</div>
                <div className="text-[11px] text-muted-fg font-mono">{s.id}</div>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={() => onAction('stage', s, 'Edit stage')}><I.Edit size={12} /></Button>
              <Button variant="ghost" size="icon-sm" onClick={() => onAction('delete', s, 'Delete stage', 'stage')}><I.X size={12} /></Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function JobPosts({ onAction }) {
  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center justify-end">
        <Button size="sm" variant="outline" onClick={() => onAction('post', null, 'Create job post')}><I.Plus size={11} />Create job post</Button>
      </div>
      <Card>
        <Table>
          <THead><TR className="hover:bg-transparent"><TH>Job post</TH><TH>Pipeline</TH><TH>Channel</TH><TH>Status</TH><TH className="text-right">Applicants</TH><TH className="text-right">Budget</TH><TH /></TR></THead>
          <tbody>
            {JOB_POSTINGS.map((p) => {
              const job = JOBS.find((j) => j.id === p.job);
              const pipe = PIPELINE_CONFIG.find((x) => x.id === p.pipeline);
              return (
                <TR key={p.id} className="cursor-pointer" onClick={() => onAction('post', p, 'Edit job post')}>
                  <TD>
                    <div className="text-[13px] font-medium">{job?.title}</div>
                    <div className="text-[11px] text-muted-fg truncate max-w-[260px]">{p.url}</div>
                  </TD>
                  <TD className="text-[12.5px]">{pipe?.name}</TD>
                  <TD><Badge tone="outline">{p.channel}</Badge></TD>
                  <TD><Badge tone={p.status === 'published' ? 'ok' : p.status === 'paused' ? 'warn' : 'outline'}>{p.status}</Badge></TD>
                  <TD className="text-right font-mono">{p.applicants}</TD>
                  <TD className="text-right font-mono">{p.budget ? `฿${p.budget.toLocaleString()}` : '—'}</TD>
                  <TD className="text-right">
                    <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); onAction('post', p, 'Edit job post'); }}><I.Edit size={12} /></Button>
                    <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); onAction('delete', p, 'Delete job post', 'post'); }}><I.X size={12} /></Button>
                  </TD>
                </TR>
              );
            })}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}

function Integrations({ onAction }) {
  return (
    <div className="p-6 grid grid-cols-3 gap-3">
      <div className="col-span-3 flex justify-end">
        <Button size="sm" variant="outline" onClick={() => onAction('integration', null, 'Add integration')}><I.Plus size={11} />Add integration</Button>
      </div>
      {INTEGRATIONS.map((i) => (
        <Card key={i.id} className="cursor-pointer hover:shadow-soft transition-shadow" onClick={() => onAction('integration', i, 'Edit integration')}>
          <CardHeader>
            <div>
              <CardTitle>{i.name}</CardTitle>
              <Caption className="mt-0.5">{i.provider} · {i.sync}</Caption>
            </div>
            <Badge tone={i.status === 'connected' ? 'ok' : i.status === 'error' ? 'danger' : 'outline'}>{i.status}</Badge>
          </CardHeader>
          <CardBody className="space-y-2 text-[12.5px]">
            <Field label="Scopes" value={i.scopes} />
            <Field label="Last sync" value={i.lastSync?.replace('T', ' ').slice(0, 16) || 'Never'} mono />
            <div className="flex gap-1 pt-2">
              <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onAction('integration', i, 'Sync integration'); }}><I.Refresh size={11} />Sync</Button>
              <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onAction('integration', i, 'Edit integration'); }}><I.Edit size={11} />Edit</Button>
              <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onAction('delete', i, 'Delete integration', 'integration'); }}><I.X size={11} /></Button>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

function CareerPages({ onAction }) {
  return (
    <div className="p-6 grid grid-cols-2 gap-3">
      <div className="col-span-2 flex justify-end">
        <Button size="sm" variant="outline" onClick={() => onAction('career', null, 'New career page')}><I.Plus size={11} />New career page</Button>
      </div>
      {CAREER_PAGES.map((p) => (
        <Card key={p.id} className="cursor-pointer hover:shadow-soft transition-shadow" onClick={() => onAction('career', p, 'Edit career page')}>
          <CardHeader>
            <div>
              <CardTitle>{p.name}</CardTitle>
              <Caption className="mt-0.5">/{p.slug} · {p.locale} · {p.jobs.length} jobs</Caption>
            </div>
            <Badge tone={p.status === 'published' ? 'ok' : 'outline'}>{p.status}</Badge>
          </CardHeader>
          <CardBody className="space-y-2">
            <Field label="SEO title" value={p.seoTitle} />
            <div className="flex flex-wrap gap-1">
              {p.jobs.map((id) => <Badge key={id} tone="outline" size="sm">{JOBS.find((j) => j.id === id)?.title || id}</Badge>)}
            </div>
            <div className="flex justify-end gap-1 pt-2">
              <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onAction('career', p, 'Preview career page'); }}><I.Eye size={11} />Preview</Button>
              <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onAction('career', p, 'Edit career page'); }}><I.Edit size={11} />Edit</Button>
              <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onAction('delete', p, 'Delete career page', 'career'); }}><I.X size={11} /></Button>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

export function Recruitment({ params, onNav }) {
  const { toast, logAudit, bump } = useStore();
  const tab = params?.tab || 'jobs';
  const setTab = (t) => onNav('recruitment', null, { tab: t });
  const jobId = params?.jobId;
  const candId = params?.candId;
  const [action, setAction] = useState(null);

  const actionItem = (mode, item, title, deleteType) => {
    if (mode === 'export') {
      logAudit({ action: 'recruitment.export', entity: `recruitment:${tab}`, meta: { tab } });
      toast('Recruitment export queued');
      return;
    }
    if (mode === 'talent' && item?.id === 'match') {
      logAudit({ action: 'recruitment.talent.match', entity: 'talent_pool:all', meta: { open_roles: JOBS.filter((j) => j.status === 'open').length } });
      toast('Talent matching queued');
      return;
    }
    setAction({ mode, item, title, deleteType });
  };

  const moveCandidate = (candidate, stage) => {
    const from = candidate.stage;
    candidate.stage = stage.id;
    logAudit({
      action: 'recruitment.candidate.move',
      entity: `candidate:${candidate.id}`,
      meta: { from, to: stage.id, stage: stage.label },
    });
    bump();
    toast(`${candidate.first} ${candidate.last} moved to ${stage.label}`);
  };

  const submitAction = (act, form) => {
    const type = act.mode === 'delete' ? act.deleteType : act.mode;
    const collections = {
      job: JOBS,
      candidate: CANDIDATES,
      stage: REC_STAGES,
      pipeline: PIPELINE_CONFIG,
      post: JOB_POSTINGS,
      integration: INTEGRATIONS,
      career: CAREER_PAGES,
      source: SOURCE_CHANNELS,
      scorecard: SCORECARD_TEMPLATE,
      interview: INTERVIEWS,
      offer: OFFERS,
      talent: TALENT_POOL,
    };
    const today = fmt(TODAY);
    const now = `${today}T09:00:00Z`;
    const upsert = (arr, next) => {
      const idx = next.id ? arr.findIndex((x) => x.id === next.id) : -1;
      if (idx >= 0) {
        Object.assign(arr[idx], next);
        return arr[idx];
      }
      arr.unshift(next);
      return next;
    };

    if (act.mode === 'delete') {
      const arr = collections[type];
      const id = act.item?.id;
      const idx = arr?.findIndex((x) => x.id === id) ?? -1;
      if (idx >= 0) arr.splice(idx, 1);
      if (type === 'candidate') {
        for (let i = INTERVIEWS.length - 1; i >= 0; i--) if (INTERVIEWS[i].cand === id) INTERVIEWS.splice(i, 1);
        for (let i = OFFERS.length - 1; i >= 0; i--) if (OFFERS[i].cand === id) OFFERS.splice(i, 1);
      }
      if (type === 'job') {
        for (let i = JOB_POSTINGS.length - 1; i >= 0; i--) if (JOB_POSTINGS[i].job === id) JOB_POSTINGS.splice(i, 1);
        CANDIDATES.filter((c) => c.job === id).forEach((c) => { c.stage = 'rejected'; });
      }
      if (type === 'pipeline') {
        for (let i = JOB_POSTINGS.length - 1; i >= 0; i--) if (JOB_POSTINGS[i].pipeline === id) JOB_POSTINGS.splice(i, 1);
      }
      if (type === 'stage') {
        PIPELINE_CONFIG.forEach((p) => { p.stages = p.stages.filter((s) => s !== id); });
        CANDIDATES.filter((c) => c.stage === id).forEach((c) => { c.stage = 'applied'; });
      }
      logAudit({ action: `recruitment.${type}.delete`, entity: `${type}:${id}`, meta: {} });
      bump();
      toast(`${type} deleted`);
      setAction(null);
      return;
    }

    let saved;
    if (type === 'job') {
      saved = upsert(JOBS, {
        id: act.item?.id || makeId('j', form.title),
        title: form.title || 'Untitled role',
        dept: form.dept,
        loc: form.loc,
        hiring_manager: form.hiring_manager,
        recruiter: form.recruiter,
        status: form.status,
        priority: form.priority,
        opened: act.item?.opened || (form.status === 'open' ? today : ''),
        target_close: form.target_close,
        headcount: Number(form.headcount) || 1,
        type: form.type || 'Permanent',
      });
    }
    if (type === 'candidate') {
      saved = upsert(CANDIDATES, {
        id: act.item?.id || makeId('cn', `${form.first}-${form.last}`),
        job: form.job,
        first: form.first || 'New',
        last: form.last || 'Candidate',
        loc: form.locText,
        applied: act.item?.applied || today,
        stage: form.stage,
        source: form.source,
        rating: form.rating === '' ? null : Number(form.rating) || null,
        exp: form.exp || '5y',
        current: form.current || 'Current role',
        hue: act.item?.hue || 220,
        salary_ask: form.salary_ask === '' ? null : Number(form.salary_ask) || null,
      });
    }
    if (type === 'stage') {
      saved = upsert(REC_STAGES, {
        id: form.name || act.item?.id || makeId('stage', form.label),
        label: form.label || 'New stage',
        color: Number(form.color) || 220,
      });
    }
    if (type === 'pipeline') {
      saved = upsert(PIPELINE_CONFIG, {
        id: act.item?.id || makeId('pipe', form.name),
        name: form.name || 'New pipeline',
        dept: form.dept,
        stages: String(form.stages || '').split(',').map((s) => s.trim()).filter(Boolean),
        sla: Number(form.sla) || 7,
        status: act.item?.status || 'active',
      });
    }
    if (type === 'post') {
      saved = upsert(JOB_POSTINGS, {
        id: act.item?.id || makeId('jp', `${form.job}-${form.channel}`),
        job: form.job,
        pipeline: form.pipeline,
        channel: form.channel,
        status: form.status,
        url: form.url,
        budget: Number(form.budget) || 0,
        applicants: Number(form.applicants) || 0,
        lastSync: now,
      });
    }
    if (type === 'integration') {
      saved = upsert(INTEGRATIONS, {
        id: act.item?.id || makeId('int', form.provider),
        name: form.name || `${form.provider} integration`,
        provider: form.provider,
        status: form.status,
        sync: form.sync,
        token: form.token,
        scopes: form.scopes,
        lastSync: now,
      });
    }
    if (type === 'career') {
      saved = upsert(CAREER_PAGES, {
        id: act.item?.id || makeId('cp', form.slug || form.name),
        name: form.name || 'Careers page',
        slug: form.slug || makeId('', form.name).slice(1),
        status: form.status,
        theme: form.theme,
        locale: form.locale,
        jobs: act.item?.jobs || JOBS.filter((j) => j.status === 'open').map((j) => j.id),
        seoTitle: form.seoTitle,
      });
    }
    if (type === 'source') {
      saved = upsert(SOURCE_CHANNELS, {
        id: act.item?.id || makeId('src', form.name),
        name: form.name || 'New source',
        applied: Number(form.applied) || 0,
        advanced: Number(form.advanced) || 0,
        hired: Number(form.hired) || 0,
        cpa: Number(form.cpa) || 0,
        status: form.status || 'active',
        sub: form.sub || 'Recruitment source',
      });
    }
    if (type === 'scorecard') {
      saved = upsert(SCORECARD_TEMPLATE, {
        id: act.item?.id || makeId('sc-dim', form.dim),
        dim: form.dim || 'New dimension',
        desc: form.desc || 'Evaluation guidance',
        weight: Number(form.weight) || 20,
      });
    }
    if (type === 'interview') {
      saved = upsert(INTERVIEWS, {
        id: act.item?.id || makeId('iv', `${form.cand}-${form.date}`),
        cand: form.cand,
        date: form.date,
        time: form.time,
        dur: Number(form.dur) || 60,
        type: form.type || 'Interview',
        interviewer: form.interviewer,
        status: act.item?.status || 'scheduled',
      });
    }
    if (type === 'offer') {
      const total = (Number(form.basic) || 0) + (Number(form.house) || 0) + (Number(form.trans) || 0);
      saved = upsert(OFFERS, {
        id: act.item?.id || makeId('of', form.cand),
        cand: form.cand,
        job: act.item?.job || CANDIDATES.find((c) => c.id === form.cand)?.job || JOBS[0]?.id,
        basic: Number(form.basic) || 0,
        house: Number(form.house) || 0,
        trans: Number(form.trans) || 0,
        total,
        currency: act.item?.currency || 'THB',
        status: form.status,
        sent_at: act.item?.sent_at || (form.status === 'sent' ? today : ''),
        expires: form.expires,
        start_date: form.start_date,
      });
    }
    if (type === 'talent') {
      saved = upsert(TALENT_POOL, {
        id: act.item?.id || makeId('tp', `${form.first}-${form.last}`),
        first: form.first || 'New',
        last: form.last || 'Talent',
        skills: act.item?.skills || ['General'],
        location: form.locText,
        lastTouched: today,
        rating: Number(form.rating) || 3,
        hue: act.item?.hue || 180,
        why: form.notes || form.current || 'Added by recruiter',
      });
    }

    logAudit({
      action: `recruitment.${type}.${act.item?.id ? 'update' : 'create'}`,
      entity: `${type}:${saved?.id || 'new'}`,
      meta: { title: act.title },
    });
    bump();
    toast(`${type} ${act.item?.id ? 'updated' : 'created'}`);
    setAction(null);
  };

  if (jobId) {
    return (
      <>
        <JobDetail jobId={jobId} onNav={onNav} onAction={actionItem} onMove={moveCandidate} />
        <RecActionDialog action={action} onClose={() => setAction(null)} onSubmit={submitAction} />
      </>
    );
  }
  if (candId) {
    return (
      <>
        <CandidateDetail candId={candId} onNav={onNav} onAction={actionItem} />
        <RecActionDialog action={action} onClose={() => setAction(null)} onSubmit={submitAction} />
      </>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-bg">
      <PageHero
        eyebrow="People · Recruitment"
        title="Recruitment"
        tone="blue"
        sub="Manage open roles, candidate pipelines, interviews, offers, talent pools, and hand-offs into employee records."
        actions={
          <>
            <Button variant="outline" size="md" onClick={() => actionItem('export', { id: tab }, 'Export recruitment data')}><I.Download size={13} />Export</Button>
            <Button size="md" onClick={() => actionItem('job', null, 'New job')}><I.Plus size={13} />New job</Button>
          </>
        }
        metrics={[
          { label: 'Open roles', value: JOBS.filter((j) => j.status === 'open').length, sub: 'Active requisitions' },
          { label: 'Candidates', value: CANDIDATES.length, sub: 'Total pipeline' },
          { label: 'Interviews', value: INTERVIEWS.length, sub: 'Scheduled' },
          { label: 'Offers', value: OFFERS.length, sub: 'In progress' },
        ]}
      />
      <div className="px-6 bg-bg border-b border-border-soft overflow-x-auto scroll-thin">
        <Tabs
          value={tab}
          onChange={setTab}
          className="min-w-max border-b-0"
          items={[
            { id: 'jobs', label: 'Jobs', count: JOBS.filter((j) => j.status === 'open').length },
            { id: 'pipeline', label: 'Pipeline' },
            { id: 'pipelines', label: 'Pipeline setup', count: PIPELINE_CONFIG.length },
            { id: 'posts', label: 'Job posts', count: JOB_POSTINGS.length },
            { id: 'candidates', label: 'Candidates', count: CANDIDATES.length },
            { id: 'talent', label: 'Talent pool' },
            { id: 'interviews', label: 'Interviews', count: INTERVIEWS.length },
            { id: 'offers', label: 'Offers', count: OFFERS.length },
            { id: 'integrations', label: 'Integrations', count: INTEGRATIONS.length },
            { id: 'careers', label: 'Career pages', count: CAREER_PAGES.length },
            { id: 'sources', label: 'Sources' },
          ]}
        />
      </div>
      <div className="flex-1 overflow-y-auto scroll-thin">
        {tab === 'jobs' && <JobsList onNav={onNav} onAction={actionItem} />}
        {tab === 'pipeline' && <Pipeline onNav={onNav} onAction={actionItem} onMove={moveCandidate} />}
        {tab === 'pipelines' && <PipelineManager onAction={actionItem} />}
        {tab === 'posts' && <JobPosts onAction={actionItem} />}
        {tab === 'candidates' && <CandidatesList onNav={onNav} onAction={actionItem} />}
        {tab === 'talent' && <TalentPool onAction={actionItem} />}
        {tab === 'interviews' && <InterviewsList onAction={actionItem} />}
        {tab === 'offers' && <OffersList onAction={actionItem} />}
        {tab === 'integrations' && <Integrations onAction={actionItem} />}
        {tab === 'careers' && <CareerPages onAction={actionItem} />}
        {tab === 'sources' && <Sources onAction={actionItem} />}
      </div>
      <RecActionDialog action={action} onClose={() => setAction(null)} onSubmit={submitAction} />
    </div>
  );
}
