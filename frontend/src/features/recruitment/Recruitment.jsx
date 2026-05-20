import { Fragment, useState } from 'react';
import { cn } from '@/lib/cn';
import { TODAY } from '@/lib/dates';
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
  Empty,
  Input,
  PageHero,
  Select,
  Stat,
  TD,
  TH,
  THead,
  TR,
  Table,
  Tabs,
} from '@/components/ui';
import { NewCandidateDialog, NewJobDialog } from '@/components/forms';
import {
  CANDIDATES,
  INTERVIEWS,
  JOBS,
  OFFERS,
  REC_STAGES,
  SCORECARDS,
  SCORECARD_RECOMMEND_TONE,
} from '@/data/seed-extended';

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

function CandCard({ cand, onNav }) {
  const ivs = INTERVIEWS.filter((iv) => iv.cand === cand.id);
  const scs = SCORECARDS.filter((s) => s.cand === cand.id);
  const avgRating = scs.length ? scs.reduce((s, x) => s + x.rating, 0) / scs.length : cand.rating || null;
  const daysInStage = Math.max(1, Math.round((TODAY - new Date(cand.applied)) / 86400000));

  return (
    <button
      onClick={() => onNav('recruitment', null, { candId: cand.id })}
      className="w-full text-left bg-card border border-border rounded p-2.5 hover:border-accent/40 hover:shadow-sm focus-ring"
    >
      <div className="flex items-start gap-2.5">
        <Avatar name={`${cand.first} ${cand.last}`} hue={cand.hue} size={32} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[12.5px] font-semibold leading-tight truncate">{cand.first} {cand.last}</span>
            {avgRating != null && (
              <span className="text-[10px] font-mono tabular-nums text-warn flex items-center gap-0.5">★ {avgRating.toFixed(1)}</span>
            )}
          </div>
          <div className="text-[10.5px] text-muted-fg truncate">{cand.current}</div>
          <div className="text-[10px] text-muted-fg font-mono mt-0.5">{cand.loc} · {cand.exp}</div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border text-[10px] text-muted-fg">
        {ivs.length > 0 && <span className="inline-flex items-center gap-0.5"><I.Calendar size={9} />{ivs.length}</span>}
        {scs.length > 0 && (
          <span className="inline-flex items-center gap-0.5">
            <I.Check size={9} />{scs.length} scorecard{scs.length !== 1 ? 's' : ''}
          </span>
        )}
        <span className="ml-auto font-mono">{daysInStage}d</span>
      </div>
    </button>
  );
}

function Pipeline({ onNav, jobFilterDefault }) {
  const [jobFilter, setJobFilter] = useState(jobFilterDefault || 'all');
  const visible = REC_STAGES.filter((s) => s.id !== 'rejected');
  const cands = CANDIDATES.filter((c) => jobFilter === 'all' || c.job === jobFilter);

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-3 border-b border-border flex items-center gap-2 bg-bg flex-none">
        <Select value={jobFilter} onChange={(e) => setJobFilter(e.target.value)} className="w-72">
          <option value="all">All open jobs</option>
          {JOBS.filter((j) => j.status === 'open').map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
        </Select>
        <div className="ml-auto flex items-center gap-3 text-[11.5px] text-muted-fg">
          <span>
            <I.Sparkle size={11} className="inline text-accent mr-1" />
            <b className="text-fg">Tip:</b> Ask the agent to "summarize the pipeline for backend"
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-x-auto overflow-y-hidden scroll-thin">
        <div className="flex gap-3 p-6 h-full min-w-max">
          {visible.map((stage) => {
            const col = cands.filter((c) => c.stage === stage.id);
            return (
              <div key={stage.id} className="w-[260px] flex flex-col flex-none">
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: `oklch(0.65 0.13 ${stage.color})` }} />
                    <span className="text-[12px] font-semibold">{stage.label}</span>
                  </div>
                  <span className="text-[11px] font-mono tabular-nums text-muted-fg">{col.length}</span>
                </div>
                <div className="flex-1 bg-card rounded-md border border-border p-2 space-y-2 overflow-y-auto scroll-thin">
                  {col.map((c) => <CandCard key={c.id} cand={c} onNav={onNav} />)}
                  {col.length === 0 && (
                    <div className="text-[11px] text-muted-fg italic px-2 py-3 text-center">No candidates</div>
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

function JobsList({ onNav }) {
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
      </div>

      <div className="grid grid-cols-2 gap-3">
        {filtered.map((j) => {
          const cands = CANDIDATES.filter((c) => c.job === j.id);
          const inFlight = cands.filter((c) => !['hired', 'rejected'].includes(c.stage));
          const offerStage = cands.filter((c) => c.stage === 'offer').length;
          const hm = empById(j.hiring_manager);
          const rc = empById(j.recruiter);

          return (
            <button
              key={j.id}
              onClick={() => onNav('recruitment', null, { jobId: j.id })}
              className="text-left bg-card border border-border rounded-md hover:border-accent/40 hover:shadow-sm focus-ring"
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
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CandidatesList({ onNav }) {
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
              const stage = REC_STAGES.find((s) => s.id === c.stage);
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
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: `oklch(0.65 0.13 ${stage.color})` }} />
                      {stage.label}
                    </span>
                  </TD>
                  <TD>{c.rating ? <span className="font-mono text-warn">★ {c.rating.toFixed(1)}</span> : <span className="text-muted-fg">—</span>}</TD>
                  <TD className="text-[12px] text-muted-fg">{c.source}</TD>
                  <TD className="font-mono text-[12px] text-muted-fg">{c.applied}</TD>
                  <TD className="text-right"><I.ArrowUpRight size={13} className="text-muted-fg" /></TD>
                </TR>
              );
            })}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

function InterviewsList() {
  const byDate = {};
  INTERVIEWS.forEach((iv) => {
    byDate[iv.date] = byDate[iv.date] || [];
    byDate[iv.date].push(iv);
  });
  return (
    <div className="p-6 space-y-4">
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
                      <Button size="sm" variant="outline">Open</Button>
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

function OffersList() {
  return (
    <div className="p-6 grid grid-cols-2 gap-3">
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
              <Button variant="outline" size="sm"><I.Eye size={11} />Preview letter</Button>
              <Button variant="outline" size="sm"><I.Refresh size={11} />Revise</Button>
              {o.status === 'pending-approval' && <Button size="sm"><I.Check size={11} />Approve & send</Button>}
              {o.status === 'sent' && <Button size="sm"><I.Mail size={11} />Resend</Button>}
            </div>
          </Card>
        );
      })}
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

function ScorecardTemplate() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Scorecard template</CardTitle>
          <Button size="sm" variant="outline"><I.Edit size={11} />Edit</Button>
        </CardHeader>
        <CardBody className="space-y-3.5">
          {[
            { dim: 'System design', desc: 'Trade-offs, partitioning, data modeling, failure modes.', weight: 25 },
            { dim: 'Code craft', desc: 'Idioms, readability, testing instincts, code review quality.', weight: 20 },
            { dim: 'Product sense', desc: 'Can the candidate push back on features and explain why?', weight: 20 },
            { dim: 'Ownership', desc: 'Evidence of end-to-end shipping with measurable impact.', weight: 20 },
            { dim: 'Collaboration', desc: 'Disagrees and commits, can mentor junior engineers.', weight: 15 },
          ].map((row) => (
            <div key={row.dim} className="flex items-center gap-4 pb-3 border-b border-border last:border-0 last:pb-0">
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

function JobDetail({ jobId, onNav }) {
  const j = JOBS.find((x) => x.id === jobId);
  const [tab, setTab] = useState('pipeline');
  const [addCandOpen, setAddCandOpen] = useState(false);
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
            <Button variant="outline" size="md"><I.Edit size={13} />Edit JD</Button>
            <Button size="md" onClick={() => setAddCandOpen(true)}><I.Plus size={13} />Add candidate</Button>
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
        {tab === 'pipeline' && <Pipeline onNav={onNav} jobFilterDefault={jobId} />}
        {tab === 'jd' && <JobDescription job={j} />}
        {tab === 'scorecard' && <ScorecardTemplate />}
        {tab === 'activity' && <JobActivity />}
      </div>
      <NewCandidateDialog
        open={addCandOpen}
        onClose={() => setAddCandOpen(false)}
        jobId={jobId}
        onCreated={(id) => onNav('recruitment', null, { candId: id })}
      />
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

function CandInterviews({ ivs }) {
  if (ivs.length === 0) return <Empty title="No interviews scheduled" />;
  return (
    <Card>
      <Table>
        <THead>
          <TR className="hover:bg-transparent">
            <TH>Date</TH><TH>Time</TH><TH>Type</TH><TH>Interviewer</TH><TH>Status</TH>
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
              </TR>
            );
          })}
        </tbody>
      </Table>
    </Card>
  );
}

function CandOffer({ offer, cand, job }) {
  if (!offer) {
    return (
      <Empty
        title="No offer extended yet"
        sub="Advance to the offer stage to draft compensation."
        action={<Button size="md"><I.Plus size={13} />Draft offer</Button>}
      />
    );
  }
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Offer letter</CardTitle>
          <Badge tone="warn">Sent · expires {offer.expires}</Badge>
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

function CandidateDetail({ candId, onNav }) {
  const cand = CANDIDATES.find((c) => c.id === candId);
  const [tab, setTab] = useState('overview');
  if (!cand) return <div className="p-6">Candidate not found.</div>;
  const job = JOBS.find((j) => j.id === cand.job);
  const ivs = INTERVIEWS.filter((iv) => iv.cand === cand.id);
  const scs = SCORECARDS.filter((s) => s.cand === cand.id);
  const offer = OFFERS.find((o) => o.cand === cand.id);
  const stageObj = REC_STAGES.find((s) => s.id === cand.stage);

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
            <Button variant="outline" size="md"><I.Doc size={13} />Resume</Button>
            <Button variant="outline" size="md"><I.X size={13} />Reject</Button>
            <Button size="md"><I.ArrowRight size={13} />Advance</Button>
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
        {tab === 'interviews' && <CandInterviews ivs={ivs} />}
        {tab === 'offer' && <CandOffer offer={offer} cand={cand} job={job} />}
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

function TalentPool() {
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
            <Button size="sm" variant="outline"><I.Sparkle size={11} className="text-accent" />Match to open roles</Button>
            <Button size="sm" variant="outline"><I.Plus size={11} />Add</Button>
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
              <TR key={p.id}>
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
                    <Button variant="ghost" size="icon-sm" title="Re-engage"><I.Mail size={12} /></Button>
                    <Button variant="ghost" size="icon-sm" title="Move to pipeline"><I.ArrowRight size={12} /></Button>
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

function Sources() {
  const sources = [
    { name: 'Inbound · Careers page', applied: 18, advanced: 6, hired: 1, cpa: 0 },
    { name: 'Referral', applied: 12, advanced: 9, hired: 2, cpa: 2500 },
    { name: 'LinkedIn', applied: 14, advanced: 7, hired: 1, cpa: 380 },
    { name: 'Recruiter outbound', applied: 8, advanced: 5, hired: 0, cpa: 1200 },
    { name: 'Dribbble', applied: 3, advanced: 2, hired: 0, cpa: 0 },
    { name: 'Conference / event', applied: 5, advanced: 2, hired: 0, cpa: 800 },
  ];
  const total = sources.reduce(
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
        <CardHeader><CardTitle>Sources of hire</CardTitle><Caption>Funnel performance over the last 90 days</Caption></CardHeader>
        <Table>
          <THead>
            <TR className="hover:bg-transparent">
              <TH>Source</TH><TH className="text-right">Applied</TH><TH className="text-right">Advanced</TH>
              <TH className="text-right">Hired</TH><TH className="text-right">Advance %</TH>
              <TH>Funnel</TH><TH className="text-right">Cost per applicant</TH>
            </TR>
          </THead>
          <tbody>
            {sources.map((s) => {
              const advPct = (s.advanced / s.applied) * 100;
              const hirePct = (s.hired / s.applied) * 100;
              return (
                <TR key={s.name}>
                  <TD className="text-[13px] font-medium">{s.name}</TD>
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
                </TR>
              );
            })}
          </tbody>
        </Table>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader><CardTitle>Channels</CardTitle></CardHeader>
          <div className="border-t border-border">
            {[
              { name: 'LinkedIn Recruiter', sub: '2 seats · 480 InMails/mo', status: 'active' },
              { name: 'Wellfound (AngelList)', sub: 'Free tier', status: 'active' },
              { name: 'Indeed', sub: 'Sponsored slots × 3', status: 'active' },
              { name: 'Hacker News Who’s hiring', sub: 'Monthly post', status: 'active' },
              { name: 'Built In Asia', sub: 'Annual subscription', status: 'paused' },
            ].map((c) => (
              <div key={c.name} className="px-4 py-2.5 border-b border-border last:border-0 flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-medium">{c.name}</div>
                  <div className="text-[11.5px] text-muted-fg">{c.sub}</div>
                </div>
                {c.status === 'active' ? (
                  <Badge tone="ok" size="sm"><I.CircleDot size={8} />Active</Badge>
                ) : (
                  <Badge tone="outline" size="sm">Paused</Badge>
                )}
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader><CardTitle>Referral program</CardTitle></CardHeader>
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

export function Recruitment({ params, onNav }) {
  const tab = params?.tab || 'jobs';
  const setTab = (t) => onNav('recruitment', null, { tab: t });
  const jobId = params?.jobId;
  const candId = params?.candId;
  const [newJobOpen, setNewJobOpen] = useState(false);

  if (jobId) return <JobDetail jobId={jobId} onNav={onNav} />;
  if (candId) return <CandidateDetail candId={candId} onNav={onNav} />;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-bg">
      <PageHero
        eyebrow="People · Recruitment"
        title="Recruitment"
        tone="blue"
        sub="Manage open roles, candidate pipelines, interviews, offers, talent pools, and hand-offs into employee records."
        actions={
          <>
            <Button variant="outline" size="md"><I.Download size={13} />Export</Button>
            <Button size="md" onClick={() => setNewJobOpen(true)}><I.Plus size={13} />New job</Button>
          </>
        }
        metrics={[
          { label: 'Open roles', value: JOBS.filter((j) => j.status === 'open').length, sub: 'Active requisitions' },
          { label: 'Candidates', value: CANDIDATES.length, sub: 'Total pipeline' },
          { label: 'Interviews', value: INTERVIEWS.length, sub: 'Scheduled' },
          { label: 'Offers', value: OFFERS.length, sub: 'In progress' },
        ]}
      />
      <div className="px-6 bg-bg border-b border-border-soft">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { id: 'jobs', label: 'Jobs', count: JOBS.filter((j) => j.status === 'open').length },
            { id: 'pipeline', label: 'Pipeline' },
            { id: 'candidates', label: 'Candidates', count: CANDIDATES.length },
            { id: 'talent', label: 'Talent pool' },
            { id: 'interviews', label: 'Interviews', count: INTERVIEWS.length },
            { id: 'offers', label: 'Offers', count: OFFERS.length },
            { id: 'sources', label: 'Sources' },
          ]}
        />
      </div>
      <div className="flex-1 overflow-y-auto scroll-thin">
        {tab === 'jobs' && <JobsList onNav={onNav} />}
        {tab === 'pipeline' && <Pipeline onNav={onNav} />}
        {tab === 'candidates' && <CandidatesList onNav={onNav} />}
        {tab === 'talent' && <TalentPool />}
        {tab === 'interviews' && <InterviewsList />}
        {tab === 'offers' && <OffersList />}
        {tab === 'sources' && <Sources />}
      </div>
      <NewJobDialog
        open={newJobOpen}
        onClose={() => setNewJobOpen(false)}
        onCreated={(id) => onNav('recruitment', null, { jobId: id })}
      />
    </div>
  );
}
