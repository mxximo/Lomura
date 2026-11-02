import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { comments } from '../i18n/comments';
import { loadComments, sendComment } from '../services/api';
import Icon from './Icon';

const draftKey = 'dw-comment-draft';
function readDraft() {
  try {
    const draft = JSON.parse(sessionStorage.getItem(draftKey));
    if (!draft || Date.now() - draft.saved > 86400000) return {};
    return {
      alias: typeof draft.alias === 'string' ? draft.alias.slice(0, 40) : '',
      body: typeof draft.body === 'string' ? draft.body.slice(0, 600) : '',
      submission: draft.submission?.id && /^[\da-f-]{36}$/i.test(draft.submission.id) && typeof draft.submission.fingerprint === 'string' ? draft.submission : null,
    };
  } catch { return {}; }
}

export default function Comments({ id = "comments" }) {
  const { lang } = useLanguage();
  const t = comments[lang];
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [draft] = useState(readDraft);
  const [alias, setAlias] = useState(draft.alias || '');
  const [body, setBody] = useState(draft.body || '');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const submission = useRef(draft.submission || null);
  const lock = useRef(false);
  const bodyInput = useRef(null);
  const receipt = useRef(null);
  useEffect(() => { if (sent) receipt.current?.focus(); }, [sent]);
  function saveDraft() {
    try {
      if (alias || body) sessionStorage.setItem(draftKey, JSON.stringify({ alias, body, submission: submission.current, saved: Date.now() }));
      else sessionStorage.removeItem(draftKey);
    } catch { /* Submission still works when browser storage is unavailable. */ }
  }
  useEffect(saveDraft, [alias, body]);
  useEffect(() => {
    if (data && !loading && page > Math.max(1, Math.ceil(data.total / 6))) setPage(Math.max(1, Math.ceil(data.total / 6)));
  }, [data, loading, page]);
  useEffect(() => {
    let active = true;
    setLoading(true); setLoadError(false);
    loadComments(page).then(value => { if (active) setData(value); })
      .catch(() => { if (active) setLoadError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page, refresh]);
  async function submit(event) {
    event.preventDefault();
    if (lock.current) return;
    if (body.trim().length < 10) { setError('tooShort'); bodyInput.current?.focus(); return; }
    if (t.prompts.some(prompt => prompt.text.trim() === body.trim())) { setError('completePrompt'); bodyInput.current?.focus(); return; }
    lock.current = true; setBusy(true); setError('');
    const values = { alias: alias.trim(), body: body.trim(), consent, language: lang };
    const fingerprint = JSON.stringify(values);
    if (submission.current?.fingerprint !== fingerprint)
      submission.current = { fingerprint, id: crypto.randomUUID() };
    saveDraft();
    try {
      await sendComment({ ...values, submission_id: submission.current.id });
      setSent(true); setAlias(''); setBody(''); setConsent(false); submission.current = null;
    } catch (error) { setError(error.status === 429 ? 'limited' : 'error'); }
    finally { lock.current = false; setBusy(false); }
  }
  return (
    <section id={id} className="community-section opinion-section" aria-labelledby="community-title">
      <header className="community-heading">
        <span className="eyebrow">{t.eyebrow}</span>
        <h2 id="community-title">{t.title}</h2><p>{t.intro}</p>
      </header>
      <div className="community-layout opinion-layout">
        <div className="community-compose">
          {sent ? <div className="comment-received" role="status" tabIndex={-1} ref={receipt}>
            <span className="opinion-success-icon"><Icon name="check" size={26} /></span>
            <h3>{t.sent}</h3><p>{t.sentText}</p>
            <button className="button secondary" onClick={() => { setSent(false); }}>{t.another}<Icon name="arrow" size={16} /></button>
          </div> : <form onSubmit={submit} aria-busy={busy}>
            <div className="opinion-form-heading"><h3>{t.write}</h3><span><Icon name="privacy" size={15} />{t.reviewNote}</span></div>
            <label htmlFor="comment-body">{t.body}</label>
            <textarea id="comment-body" ref={bodyInput} required minLength={10} maxLength={600} rows={5}
              placeholder={t.placeholder} value={body} onChange={e => { setBody(e.target.value); if (error) setError(''); }} disabled={busy}
              aria-invalid={['tooShort', 'completePrompt'].includes(error) ? true : undefined} aria-describedby={`comment-hint${error ? ' comment-error' : ''}`} />
            <div className="comment-help"><p id="comment-hint">{t.hint}</p><span aria-label={t.characters}>{body.length}/600</span></div>
            {!body && <div className="opinion-prompts" aria-label={t.promptLabel}>
              {t.prompts.map(prompt => <button type="button" key={prompt.label} disabled={busy} onClick={() => { setBody(prompt.text); bodyInput.current?.focus(); }}>{prompt.label}<span aria-hidden="true"> ↗</span></button>)}
            </div>}
            <div className="opinion-alias">
              <label htmlFor="comment-alias">{t.alias}</label>
              <input id="comment-alias" maxLength={40} placeholder={t.aliasPlaceholder} value={alias} onChange={e => setAlias(e.target.value)} disabled={busy} autoComplete="off" aria-describedby="alias-hint" />
              <p id="alias-hint">{t.aliasHint}</p>
            </div>
            <label className="comment-consent"><input type="checkbox" required checked={consent} onChange={e => setConsent(e.target.checked)} disabled={busy} /><span>{t.consent}</span></label>
            {error && <div id="comment-error" role="alert" className="opinion-send-error"><Icon name="bell" size={18} /><p>{t[error]}</p></div>}
            <div className="opinion-form-actions">
              <button className="button primary" type="submit" disabled={busy}>{busy ? t.sending : t.send}<Icon name="arrow" size={17} /></button>
              {body && <button type="button" className="text-button opinion-discard" disabled={busy} onClick={() => { setAlias(''); setBody(''); setConsent(false); submission.current = null; setError(''); bodyInput.current?.focus(); }}>{t.discard}</button>}
            </div>
            {body && <p className="comment-draft-note">{t.draft}</p>}
          </form>}
        </div>
        <aside className="opinion-guide" aria-labelledby="opinion-guide-title">
          <span className="opinion-guide-icon" aria-hidden="true"><Icon name="privacy" size={23} /></span>
          <h3 id="opinion-guide-title">{t.guideTitle}</h3><p>{t.guideIntro}</p>
          <ol>{t.steps.map(step => <li key={step.title}><strong>{step.title}</strong><span>{step.text}</span></li>)}</ol>
          <p className="opinion-guide-footnote">{t.privacyNote}</p>
        </aside>
      </div>
      <div className="community-voices opinion-published" aria-busy={loading}>
        <header className="opinion-published-heading"><h3>{t.publishedTitle}</h3>{!loading && !loadError && data?.total > 0 && <span>{data.total}</span>}</header>
        {loading ? <div className="opinion-notice" role="status"><span className="opinion-loading-dot" aria-hidden="true" /><p>{t.loading}</p></div>
          : loadError ? <div className="opinion-notice opinion-load-error" role="status"><Icon name="bell" size={19} /><div><strong>{t.loadErrorTitle}</strong><p>{t.loadErrorHint}</p></div><button className="text-button" onClick={() => setRefresh(v => v + 1)}>{t.retry}<Icon name="arrow" size={15} /></button></div>
          : data?.items.length ? <>
            <div className="opinion-posts">{data.items.map(comment => <figure className="community-comment" key={comment.id}>
              <blockquote><p>{comment.body}</p></blockquote>
              <figcaption><span className="opinion-person"><span className="opinion-avatar" aria-hidden="true">{Array.from(comment.alias.trim())[0] || 'L'}</span><strong>{comment.alias}</strong></span><time dateTime={comment.created_at}>{new Date(comment.created_at).toLocaleDateString(lang === 'es' ? 'es-CO' : 'en-GB', { month: 'short', day: 'numeric', year: 'numeric' })}</time></figcaption>
            </figure>)}</div>
            {data.total > 6 && <div className="community-pagination">
              <button className="text-button" disabled={page === 1} onClick={() => setPage(p => p - 1)}>{t.prev}</button>
              <span>{page} / {Math.max(1, Math.ceil(data.total / 6))}</span>
              <button className="text-button" disabled={page * 6 >= data.total} onClick={() => setPage(p => p + 1)}>{t.next}</button>
            </div>}
          </> : <div className="opinion-notice opinion-empty"><Icon name="leaf" size={22} /><div><strong>{t.empty}</strong><p>{t.emptyText}</p></div></div>}
      </div>
    </section>
  );
}
