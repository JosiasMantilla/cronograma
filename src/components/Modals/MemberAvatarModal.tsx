import { memo, useState, useCallback, useEffect } from 'react';
import { getAvatarColor, getInitials } from '../../utils/avatarHelpers';
import type { ITarea } from '../../types';

interface MemberAvatarModalProps {
  tarea: ITarea;
  onSave: (tareaId: string, members: string[]) => void;
  onClose: () => void;
}

export const MemberAvatarModal = memo(({ tarea, onSave, onClose }: MemberAvatarModalProps) => {
  const [members, setMembers] = useState<string[]>([...tarea.integrantes]);
  const [newMember, setNewMember] = useState('');

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const add = useCallback(() => {
    const name = newMember.trim();
    if (name && !members.includes(name)) {
      setMembers((prev) => [...prev, name]);
      setNewMember('');
    }
  }, [newMember, members]);

  const remove = useCallback((name: string) => {
    setMembers((prev) => prev.filter((m) => m !== name));
  }, []);

  const handleSave = useCallback(() => {
    onSave(tarea.id, members);
    onClose();
  }, [tarea.id, members, onSave, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-label="Gestionar integrantes"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-sm p-6 mx-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Integrantes</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none" aria-label="Cerrar">×</button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 truncate">{tarea.nombre}</p>

        {/* Current members */}
        <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
          {members.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-2">Sin integrantes</p>
          )}
          {members.map((name) => (
            <div key={name} className="flex items-center gap-2">
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ backgroundColor: getAvatarColor(name) }}
              >
                {getInitials(name)}
              </span>
              <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">{name}</span>
              <button
                onClick={() => remove(name)}
                className="text-gray-400 hover:text-red-500 text-sm shrink-0"
                aria-label={`Eliminar ${name}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Add new */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newMember}
            onChange={(e) => setNewMember(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
            placeholder="Agregar integrante…"
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Nombre del nuevo integrante"
          />
          <button
            onClick={add}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
            aria-label="Agregar"
          >+</button>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancelar</button>
          <button onClick={handleSave} className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">Guardar</button>
        </div>
      </div>
    </div>
  );
});
