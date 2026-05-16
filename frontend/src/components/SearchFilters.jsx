const statuses = ["", "Student", "Intern", "Full-time", "Freelancer"];

function SearchFilters({ filters, onChange, onSubmit, onReset }) {
  const updateFilter = (event) => {
    onChange({ ...filters, [event.target.name]: event.target.value, page: 1 });
  };

  return (
    <form className="filters-panel" onSubmit={onSubmit}>
      <label>
        Search
        <input
          name="search"
          value={filters.search}
          onChange={updateFilter}
          placeholder="Name, student ID, department, batch, company"
        />
      </label>

      <label>
        Status
        <select name="status" value={filters.status} onChange={updateFilter}>
          {statuses.map((status) => (
            <option key={status || "all"} value={status}>
              {status || "All statuses"}
            </option>
          ))}
        </select>
      </label>

      <label>
        Location
        <input name="location" value={filters.location} onChange={updateFilter} placeholder="City or country" />
      </label>

      <label>
        Sort
        <select name="sortBy" value={filters.sortBy} onChange={updateFilter}>
          <option value="createdAt">Newest</option>
          <option value="name">Name</option>
          <option value="studentId">Student ID</option>
          <option value="work.company">Company</option>
          <option value="work.experienceYears">Experience</option>
        </select>
      </label>

      <label>
        Direction
        <select name="sortOrder" value={filters.sortOrder} onChange={updateFilter}>
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </label>

      <div className="filter-actions">
        <button type="submit" className="button button-primary">
          Apply
        </button>
        <button type="button" className="button button-secondary" onClick={onReset}>
          Reset
        </button>
      </div>
    </form>
  );
}

export default SearchFilters;
