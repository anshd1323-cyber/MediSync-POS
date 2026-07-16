// ============================================================
// DataTable — full-featured table component
// ============================================================
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

/**
 * @param {object} props
 * @param {Array<{key, label, render?, width?}>} props.columns
 * @param {Array} props.data
 * @param {boolean} props.loading
 * @param {string} props.emptyTitle
 * @param {string} props.emptyMessage
 * @param {function} props.onRowClick
 * @param {boolean} props.pagination
 * @param {number} props.pageSize
 * @param {string} props.id
 */
export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  emptyTitle = 'No data found',
  emptyMessage = 'There are no records to display.',
  onRowClick,
  pagination = true,
  pageSize = 10,
  id = 'data-table',
  title,
  headerActions,
}) {
  const [page, setPage] = useState(1);

  const totalPages = pagination ? Math.ceil(data.length / pageSize) : 1;
  const paged = pagination ? data.slice((page - 1) * pageSize, page * pageSize) : data;

  return (
    <div className="data-table-wrapper" id={id}>
      {(title || headerActions) && (
        <div className="data-table-header">
          {title && <h3 className="data-table-title">{title}</h3>}
          {headerActions && <div className="flex gap-3">{headerActions}</div>}
        </div>
      )}

      {loading ? (
        <div className="table-loading">
          <LoadingSpinner message="Loading data…" />
        </div>
      ) : data.length === 0 ? (
        <div className="table-empty">
          <div className="table-empty-icon">
            <Inbox size={28} />
          </div>
          <div className="table-empty-title">{emptyTitle}</div>
          <div className="table-empty-text">{emptyMessage}</div>
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col.key} style={col.width ? { width: col.width } : undefined}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((row, i) => (
                  <tr
                    key={row.id || row._id || i}
                    className={onRowClick ? 'clickable' : ''}
                    onClick={() => onRowClick?.(row)}
                    id={`${id}-row-${i}`}
                  >
                    {columns.map((col) => (
                      <td key={col.key}>
                        {col.render ? col.render(row, i) : row[col.key] ?? '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && totalPages > 1 && (
            <div className="table-pagination">
              <span className="table-pagination-info">
                Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, data.length)} of{' '}
                {data.length}
              </span>
              <div className="table-pagination-controls">
                <button
                  className="table-pagination-btn"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  id={`${id}-prev`}
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                <span className="text-sm font-medium" style={{ padding: '0 8px' }}>
                  {page} / {totalPages}
                </span>
                <button
                  className="table-pagination-btn"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  id={`${id}-next`}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
