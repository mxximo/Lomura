import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { comments } from '../i18n/comments';
import { loadComments, sendComment } from '../services/api';

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
    if (body.trim().length < 10) { setError('tooShort'); return; }
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
    <section id={id} className="community-section" aria-labelledby="community-title">
      <header className="community-heading">
        <span className="eyebrow">{t.eyebrow}</span>
        <h2 id="community-title">{t.title}</h2><p>{t.intro}</p>
      </header>
      <div className="community-layout">
        <div className="community-voices" aria-busy={loading}>
          {loading ? <p role="status">{t.loading}</p> : loadError ? <div role="alert"><p>{t.error}</p><button className="text-button" onClick={() => setRefresh(v => v + 1)}>{t.retry}</button></div> : data?.items.length ? <>
            {data.items.map(comment => <figure className="community-comment" key={comment.id}>
              <blockquote><p>{comment.body}</p></blockquote>
              <figcaption><strong>{comment.alias}</strong><time dateTime={comment.created_at}>{new Date(comment.created_at).toLocaleDateString(lang === 'es' ? 'es-CO' : 'en-GB', { month: 'short', day: 'numeric', year: 'numeric' })}</time></figcaption>
            </figure>)}
            <div className="community-pagination">
              <button className="text-button" disabled={page === 1} onClick={() => setPage(p => p - 1)}>{t.prev}</button>
              <span>{page} / {Math.max(1, Math.ceil(data.total / 6))}</span>
              <button className="text-button" disabled={page * 6 >= data.total} onClick={() => setPage(p => p + 1)}>{t.next}</button>
            </div>
          </> : <div className="community-empty"><span aria-hidden="true">“</span><h3>{t.empty}</h3><p>{t.emptyText}</p></div>}
        </div>
        <div className="community-compose">
          {sent ? <div className="comment-received" role="status"><h3>{t.sent}</h3><p>{t.sentText}</p><button className="text-button" onClick={() => setSent(false)}>{t.another} →</button></div> : <form onSubmit={submit}>
            <h3>{t.write}</h3>
            {body && <p className="comment-draft-note">{t.draft}<button type="button" className="text-button" disabled={busy} onClick={() => { setAlias(''); setBody(''); setConsent(false); submission.current = null; setError(''); }}>{t.discard}</button></p>}
            <label htmlFor="comment-alias">{t.alias}</label>
            <input id="comment-alias" maxLength={40} value={alias} onChange={e => setAlias(e.target.value)} disabled={busy} autoComplete="off" />
            <label htmlFor="comment-body">{t.body}</label>
            <textarea id="comment-body" required minLength={10} maxLength={600} rows={5} value={body} onChange={e => setBody(e.target.value)} disabled={busy} aria-describedby="comment-hint" />
            <div className="comment-help"><p id="comment-hint">{t.hint}</p><span>{body.length}/600</span></div>
            <label className="comment-consent"><input type="checkbox" required checked={consent} onChange={e => setConsent(e.target.checked)} disabled={busy} />{t.consent}</label>
            {error && <p role="alert" className="error-text">{t[error]}</p>}
            <button className="button primary" type="submit" disabled={busy}>{busy ? t.sending : t.send} →</button>
          </form>}
        </div>
      </div>
    </section>
  );
}
