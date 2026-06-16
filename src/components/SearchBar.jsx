import { Search, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const SearchBar = ({
  value = '',
  onChange,
  placeholder = 'Buscar...',
  filters = [],
  filterValues = {},
  onFilterChange,
  onClear,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const hasAnyFilter = Object.values(filterValues).some(v => v && v !== 'ALL');
  const hasActiveValue = value || hasAnyFilter;

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleClear = () => {
    onClear?.();
    setOpen(false);
  };

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (!next) {
      onClear?.();
    }
  };

  return (
    <div className={`search-bar ${open ? 'search-bar--open' : ''}`} ref={ref}>
      <button className="search-bar-toggle" onClick={toggle} title="Buscar">
        <Search size={16} />
        {hasActiveValue && <span className="search-bar-toggle-dot" />}
      </button>

      {open && (
        <div className="search-bar-panel">
          <div className="search-bar-input-wrap">
            <input
              type="text"
              className="search-bar-input"
              placeholder={placeholder}
              value={value}
              onChange={e => onChange(e.target.value)}
              autoFocus
            />
            {value && (
              <button className="search-bar-clear" onClick={() => onChange('')}>
                <X size={16} />
              </button>
            )}
          </div>
          {filters.map(f => (
            <select
              key={f.key}
              className="search-bar-select"
              value={filterValues[f.key] || 'ALL'}
              onChange={e => onFilterChange(f.key, e.target.value)}
            >
              <option value="ALL">{f.label}</option>
              {f.options.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          ))}
          <button className="search-bar-clear-all" onClick={handleClear}>
            <X size={14} /> Limpiar
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
