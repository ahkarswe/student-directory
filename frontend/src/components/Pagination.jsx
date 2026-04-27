function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.pages <= 1) {
    return null;
  }

  return (
    <div className="pagination" aria-label="Pagination">
      <button
        type="button"
        className="button button-secondary"
        disabled={pagination.page <= 1}
        onClick={() => onPageChange(pagination.page - 1)}
      >
        Previous
      </button>
      <span>
        Page {pagination.page} of {pagination.pages}
      </span>
      <button
        type="button"
        className="button button-secondary"
        disabled={pagination.page >= pagination.pages}
        onClick={() => onPageChange(pagination.page + 1)}
      >
        Next
      </button>
    </div>
  );
}

export default Pagination;
