import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { comments } from '../i18n/comments';
import { adminRequest, exportResponses } from '../services/api';

export default function AdminComments() {
  const { lang } = useLanguage();
  const t = comments[lang];
  const [status, setStatus] = useState('pending');
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    setLoading(true); setError(false);
    adminRequest(`/comments?status=${status}&page=${page}`).then(value => { if (active) setData(value); })
      .catch(() => { if (active) setError(true); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [status, page, refresh]);
  async function moderate(id, status) {
    setBusy(true); setError(false);
    try { await adminRequest(`/comments/${id}`, { method: 'POST', body: JSON.stringify({ status }) }); setRefresh(v => v + 1); }
    catch { setError(true); } finally { setBusy(false); }
  }
  async function download() {
    setBusy(true); setError(false);
    try { await exportResponses('', 'comments-export', 'lumora-comentarios.csv'); }
    catch { setError(true); } finally { setBusy(false); }
  }
  return <section className="admin-comments admin-records glass" aria-labelledby="admin-comments-title">
    <h2 id="admin-comments-title">{t.moderation}</h2><p>{t.moderationIntro}</p>
    <div className="comment-admin-toolbar"><label>{t.status}<select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} disabled={busy}>{['pending','approved','rejected','all'].map(value => <option value={value} key={value}>{t[value]}</option>)}</select></label><button className="button secondary" onClick={download} disabled={busy}>{t.csv}</button></div>
    {error && <div role="alert"><p className="error-text">{t.error}</p><button className="text-button" onClick={() => setRefresh(v => v + 1)}>{t.retry}</button></div>}
    {loading ? <p role="status">{t.loading}</p> : !error && (!data?.items.length ? <p>{t.none}</p> : <>
      {data.items.map(comment => <article className="admin-comment" key={comment.id}>
        <header><strong>{comment.alias}</strong><span>{t[comment.status === 'pending' ? 'pending' : comment.status === 'approved' ? 'approved' : 'rejected']}</span></header>
        <p>{comment.body}</p><time dateTime={comment.created_at}>{new Date(comment.created_at).toLocaleString(lang === 'es' ? 'es-CO' : 'en-GB')}</time>
        <div className="button-row"><button className="button secondary" disabled={busy || comment.status === 'approved'} onClick={() => moderate(comment.id, 'approved')}>{t.approve}</button><button className="text-button" disabled={busy || comment.status === 'rejected'} onClick={() => moderate(comment.id, 'rejected')}>{t.reject}</button></div>
      </article>)}
      <div className="community-pagination"><button className="text-button" disabled={page === 1 || busy} onClick={() => setPage(p => p - 1)}>{t.prev}</button><span>{page}</span><button className="text-button" disabled={page * 20 >= data.total || busy} onClick={() => setPage(p => p + 1)}>{t.next}</button></div>
    </>)}
  </section>;
}
