import { memo, useState, useRef, useEffect, useCallback } from 'react';

interface ProjectNameProps {
  name: string;
  onChange: (name: string) => void;
}

export const ProjectName = memo(({ name, onChange }: ProjectNameProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const commit = useCallback(() => {
    const trimmed = draft.trim();
    if (trimmed) onChange(trimmed);
    else setDraft(name);
    setEditing(false);
  }, [draft, name, onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') commit();
      if (e.key === 'Escape') { setDraft(name); setEditing(false); }
    },
    [commit, name],
  );

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        className="text-sm font-bold bg-transparent border-b-2 border-blue-500 outline-none text-gray-800 dark:text-white w-40 min-w-0"
        aria-label="Nombre del proyecto"
        maxLength={60}
      />
    );
  }

  return (
    <div className="flex items-center gap-1 min-w-0">
      <span
        className="font-bold text-gray-800 dark:text-white text-sm truncate max-w-[160px]"
        title={name}
      >
        {name}
      </span>
      <button
        onClick={() => { setDraft(name); setEditing(true); }}
        aria-label="Editar nombre del proyecto"
        className="p-0.5 text-gray-400 hover:text-blue-500 shrink-0"
        title="Editar nombre"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
    </div>
  );
});
