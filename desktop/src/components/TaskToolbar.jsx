export default function TaskToolbar({
                                        search,
                                        setSearch,
                                        statusFilter,
                                        setStatusFilter,
                                        priorityFilter,
                                        setPriorityFilter,
                                        sortBy,
                                        setSortBy,
                                    }) {
    return (
        <div className="d-flex gap-2 align-items-center flex-wrap">
            <input
                className="form-control bg-dark text-light border-secondary"
                style={{ maxWidth: 320 }}
                placeholder="Cerca task..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <select
                className="form-select bg-dark text-light border-secondary"
                style={{ maxWidth: 160 }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
            >
                <option value="ALL">Status: Tutti</option>
                <option value="TODO">TODO</option>
                <option value="DOING">DOING</option>
                <option value="DONE">DONE</option>
            </select>

            <select
                className="form-select bg-dark text-light border-secondary"
                style={{ maxWidth: 170 }}
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
            >
                <option value="ALL">PrioritÃ : Tutte</option>
                <option value="LOW">LOW</option>
                <option value="MED">MED</option>
                <option value="HIGH">HIGH</option>
            </select>

            <select
                className="form-select bg-dark text-light border-secondary"
                style={{ maxWidth: 190 }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
            >
                <option value="UPDATED_DESC">Ordina: Ultimo aggiornato</option>
                <option value="CREATED_DESC">Ordina: PiÃ¹ recente</option>
                <option value="PRIORITY_DESC">Ordina: PrioritÃ  alta</option>
                <option value="TITLE_ASC">Ordina: Titolo A-Z</option>
            </select>

            <button
                className="btn btn-outline-secondary"
                onClick={() => {
                    setSearch("");
                    setStatusFilter("ALL");
                    setPriorityFilter("ALL");
                    setSortBy("UPDATED_DESC");
                }}
            >
                Reset
            </button>
        </div>
    );
}
