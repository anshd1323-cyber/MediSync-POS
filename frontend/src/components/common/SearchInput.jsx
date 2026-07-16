// ============================================================
// SearchInput — debounced search with icon and clear button
// ============================================================
import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

export default function SearchInput({
  value: controlledValue,
  onChange,
  placeholder = 'Search…',
  debounceMs = 300,
  id = 'search-input',
}) {
  const [localValue, setLocalValue] = useState(controlledValue || '');
  const timerRef = useRef(null);

  // Sync with external controlled value
  useEffect(() => {
    if (controlledValue !== undefined) {
      setLocalValue(controlledValue);
    }
  }, [controlledValue]);

  const handleChange = (e) => {
    const val = e.target.value;
    setLocalValue(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onChange?.(val);
    }, debounceMs);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange?.('');
  };

  return (
    <div className="search-input-wrapper">
      <Search size={18} className="search-input-icon" />
      <input
        type="text"
        className="search-input"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        id={id}
      />
      {localValue && (
        <button className="search-input-clear" onClick={handleClear} id={`${id}-clear`} aria-label="Clear">
          <X size={16} />
        </button>
      )}
    </div>
  );
}
