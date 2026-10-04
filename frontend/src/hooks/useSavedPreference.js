import { useEffect, useState } from "react";

// Only non-sensitive activity preferences belong here. Never store passwords.
export default function useSavedPreference(key, initial, validate) {
  const [value, setValue] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      return validate(saved) ? saved : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* Storage is optional; the activity still works. */
    }
  }, [key, value]);
  return [value, setValue];
}
