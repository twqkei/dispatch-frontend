import { useEffect, useState } from "react";

export default function RequestStatus() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetch("https://sheetdb.io/api/v1/cyqjdv9avucvn")
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  // Auto refresh every 15 seconds (optional)
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("https://sheetdb.io/api/v1/cyqjdv9avucvn")
        .then((res) => res.json())
        .then((data) => setData(data));
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Filter logic
  const filteredData = data.filter((item) => {
    const name = (item["Name:"] || "").toLowerCase();
    const dest = (item["Travel Destination"] || "").toLowerCase();
    const status = (item["STATUS"] || "");

    const matchesSearch =
      name.includes(search.toLowerCase()) ||
      dest.includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Status color function
  const getStatusStyle = (status) => {
    switch (status) {
      case "Approved":
        return { background: "#d1fae5", color: "#065f46" };
      case "Pending":
        return { background: "#fef3c7", color: "#92400e" };
      case "Done":
        return { background: "#dbeafe", color: "#1e3a8a" };
      default:
        return { background: "#e5e7eb", color: "#374151" };
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "15px" }}>
        Request Form Status
      </h1>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        <input
          type="text"
          placeholder="Search name or destination..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            flex: 1,
          }}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Done">Done</option>
        </select>
      </div>

      {/* Table */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f3f4f6" }}>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Name</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Destination</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Status</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Driver</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Vehicle</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Remarks</th>
          </tr>
        </thead>

        <tbody>
          {filteredData.map((item, index) => (
            <tr key={index}>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {item["Name:"]}
              </td>

              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {item["Travel Destination"]}
              </td>

              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                <span
                  style={{
                    padding: "4px 8px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    ...getStatusStyle(item["STATUS"]),
                  }}
                >
                  {item["STATUS"]}
                </span>
              </td>

              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {item["Assigned Driver"]}
              </td>

              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {item["Assigned Vehicle"]}
              </td>

              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {item["Remarks"]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}