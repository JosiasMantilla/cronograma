import { memo, useCallback } from 'react';
import { getAvatarColor, getInitials } from '../../utils/avatarHelpers';

const MAX_VISIBLE = 3;

interface MemberAvatarsProps {
  integrantes: string[];
  tareaId: string;
  onAvatarClick: (tareaId: string) => void;
}

export const MemberAvatars = memo(({ integrantes, tareaId, onAvatarClick }: MemberAvatarsProps) => {
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onAvatarClick(tareaId);
    },
    [tareaId, onAvatarClick],
  );

  const visible = integrantes.slice(0, MAX_VISIBLE);
  const overflow = integrantes.length - MAX_VISIBLE;

  if (integrantes.length === 0) {
    return (
      <button
        onClick={handleClick}
        className="text-[10px] text-gray-400 dark:text-gray-500 hover:text-blue-500 shrink-0 whitespace-nowrap"
        title="Sin asignar – click para agregar"
        aria-label="Sin integrantes asignados"
      >
        Sin asignar
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-0.5 shrink-0"
      aria-label={`Integrantes: ${integrantes.join(', ')}`}
      title={integrantes.join(', ')}
    >
      {visible.map((name) => (
        <span
          key={name}
          className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
          style={{ backgroundColor: getAvatarColor(name) }}
        >
          {getInitials(name)}
        </span>
      ))}
      {overflow > 0 && (
        <span className="w-5 h-5 rounded-full bg-gray-400 dark:bg-gray-600 flex items-center justify-center text-[9px] font-bold text-white shrink-0">
          +{overflow}
        </span>
      )}
    </button>
  );
});
