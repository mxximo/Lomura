import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { comments } from '../i18n/comments';
import { loadComments, sendComment } from '../services/api';

export default function Comments() {
  const { lang } = useLanguage();
  const t = comments[lang];
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [alias, setAlias] = useState('');
  const [body, setBody] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const submission = useRef(null);
  const lock = useRef(false);
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
    lock.current = true; setBusy(true); setError('');
    const values = { alias: alias.trim(), body: body.trim(), consent, language: lang };
    const fingerprint = JSON.stringify(values);
    if (submission.current?.fingerprint !== fingerprint)
      submission.current = { fingerprint, id: crypto.randomUUID() };
    try {
      await sendComment({ ...values, submission_id: submission.current.id });
      setSent(true); setAlias(''); setBody(''); setConsent(false); submission.current = null;
    } catch (error) { setError(error.status === 429 ? 'limited' : 'error'); }
    finally { lock.current = false; setBusy(false); }
  }
  return (
    <section id="comments" className="community-section" aria-labelledby="community-title">
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
