export const surveyDraftKey = "dw-survey-session-v1";
export const emptySurvey = () => ({
  screen_hours: 6,
  breaks: "",
  sleep: "",
  usefulness: "",
  goal: "",
  comment: "",
  consent: false,
});
export function readSurveyDraft() {
  try {
    const draft = JSON.parse(sessionStorage.getItem(surveyDraftKey));
    const v = draft?.values;
    if (
      !v ||
      !Number.isInteger(v.screen_hours) ||
      v.screen_hours < 0 ||
      v.screen_hours > 24 ||
      !["", "often", "sometimes", "rarely"].includes(v.breaks) ||
      !["", "often", "sometimes", "rarely"].includes(v.sleep) ||
      !["", "1", "2", "3", "4", "5"].includes(String(v.usefulness)) ||
      !["", "eyes", "posture", "security", "focus", "sleep"].includes(v.goal) ||
      typeof v.comment !== "string" ||
      v.comment.length > 1000
    )
      return null;
    const values = Object.fromEntries(
      Object.keys(emptySurvey()).map((k) => [
        k,
        k === "consent" ? false : v[k],
      ]),
    );
    const s = draft.snapshot;
    const validSnapshot =
      s &&
      Object.keys(s).length === Object.keys(emptySurvey()).length + 2 &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        s.submission_id,
      ) &&
      ["es", "en"].includes(s.language) &&
      s.consent === true &&
      Object.keys(emptySurvey())
        .filter((k) => k !== "consent")
        .every((k) => String(s[k]) === String(values[k]));
    return {
      values,
      hoursConfirmed: draft.hoursConfirmed === true,
      snapshot: validSnapshot ? s : null,
    };
  } catch {
    return null;
  }
}
