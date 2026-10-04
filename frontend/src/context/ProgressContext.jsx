import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
const Context = createContext(null);
export function ProgressProvider({ children }) {
  const [storageError, setStorageError] = useState(false);
  const [lastLesson, setLastLesson] = useState(() => {
    try {
      return localStorage.getItem("dw-last-lesson") || "";
    } catch {
      return "";
    }
  });
  const visit = useCallback((slug) => setLastLesson(slug), []);
  const [completed, setCompleted] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("dw-progress") || "[]");
      return Array.isArray(saved)
        ? [...new Set(saved.filter((id) => /^[1-5]\.[1-2]$/.test(id)))].slice(
            0,
            10,
          )
        : [];
    } catch {
      return [];
    }
  });
  function toggle(id) {
    setCompleted((old) => {
      const next = old.includes(id)
        ? old.filter((x) => x !== id)
        : [...old, id];
      return next;
    });
  }
  useEffect(() => {
    try {
      localStorage.setItem("dw-progress", JSON.stringify(completed));
      localStorage.setItem("dw-last-lesson", lastLesson);
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [completed, lastLesson]);
  useEffect(() => {
    function sync(event) {
      try {
        if (event.key === "dw-progress") {
          const value = JSON.parse(event.newValue || "[]");
          if (Array.isArray(value))
            setCompleted([
              ...new Set(
                value.filter(
                  (id) => typeof id === "string" && /^[1-5]\.[1-2]$/.test(id),
                ),
              ),
            ]);
        }
        if (event.key === "dw-last-lesson") setLastLesson(event.newValue || "");
      } catch {
        /* Ignore invalid external writes. */
      }
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  function resetProgress() {
    setCompleted([]);
    setLastLesson("");
  }
  return (
    <Context.Provider
      value={{
        completed,
        toggle,
        lastLesson,
        visit,
        storageError,
        resetProgress,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useProgress = () => useContext(Context);
