import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";


function Parents() {
  const navigate = useNavigate();

  const [parents, setParents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingParent, setEditingParent] = useState(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    relationship: "",
    phone: "",
    alternate_phone: "",
    email: "",
    address: "",
    occupation: "",
    status: "ACTIVE",
  });


  const loadParents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/parents");

      setParents(response.data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Unable to load parents."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadParents();
  }, []);


  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };


  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      relationship: "",
      phone: "",
      alternate_phone: "",
      email: "",
      address: "",
      occupation: "",
      status: "ACTIVE",
    });

    setEditingParent(null);
  };


  const startEditing = (parent) => {
    setEditingParent(parent);

    setFormData({
      first_name: parent.first_name || "",
      last_name: parent.last_name || "",
      relationship: parent.relationship || "",
      phone: parent.phone || "",
      alternate_phone: parent.alternate_phone || "",
      email: parent.email || "",
      address: parent.address || "",
      occupation: parent.occupation || "",
      status: parent.status || "ACTIVE",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setError("");

      if (!formData.first_name.trim()) {
        setError("First name is required.");
        return;
      }

      if (editingParent) {
        await api.put(
          `/parents/${editingParent.id}`,
          formData
        );
      } else {
        await api.post(
          "/parents",
          formData
        );
      }

      resetForm();
      await loadParents();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Unable to save parent."
      );
    }
  };


  const handleDelete = async (parent) => {
    const parentName = [
      parent.first_name,
      parent.last_name,
    ]
      .filter(Boolean)
      .join(" ");

    const confirmed = window.confirm(
      `Are you sure you want to delete ${parentName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(
        `/parents/${parent.id}`
      );

      if (
        editingParent &&
        editingParent.id === parent.id
      ) {
        resetForm();
      }

      await loadParents();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Unable to delete parent."
      );
    }
  };


  const filteredParents = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    if (!searchValue) {
      return parents;
    }

    return parents.filter((parent) => {
      const fullName = [
        parent.first_name,
        parent.last_name,
      ]
        .filter(Boolean)
        .join(" ");

      return (
        fullName
          .toLowerCase()
          .includes(searchValue) ||
        (parent.phone || "")
          .toLowerCase()
          .includes(searchValue) ||
        (parent.email || "")
          .toLowerCase()
          .includes(searchValue) ||
        (parent.relationship || "")
          .toLowerCase()
          .includes(searchValue)
      );
    });
  }, [parents, search]);


  const getFullName = (parent) => {
    return [
      parent.first_name,
      parent.last_name,
    ]
      .filter(Boolean)
      .join(" ");
  };


  const getStatusStyle = (status) => {
    if (status === "ACTIVE") {
      return {
        background: "#dcfce7",
        color: "#166534",
      };
    }

    return {
      background: "#fee2e2",
      color: "#991b1b",
    };
  };


  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "32px",
        color: "#0f172a",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >

        {/* Header */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            marginBottom: "28px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <button
              onClick={() =>
                navigate("/owner-dashboard")
              }
              style={{
                border: "none",
                background: "transparent",
                color: "#475569",
                cursor: "pointer",
                padding: 0,
                marginBottom: "10px",
                fontSize: "14px",
              }}
            >
              ← Back to Dashboard
            </button>

            <h1
              style={{
                margin: 0,
                fontSize: "32px",
                fontWeight: 800,
              }}
            >
              Parent Management
            </h1>

            <p
              style={{
                marginTop: "8px",
                marginBottom: 0,
                color: "#64748b",
              }}
            >
              Manage parent and guardian records.
            </p>
          </div>

          <div
            style={{
              background: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "14px",
              padding: "16px 20px",
              minWidth: "150px",
              boxShadow:
                "0 4px 12px rgba(15, 23, 42, 0.05)",
            }}
          >
            <div
              style={{
                color: "#64748b",
                fontSize: "13px",
              }}
            >
              Total Parents
            </div>

            <div
              style={{
                fontSize: "26px",
                fontWeight: 800,
                marginTop: "4px",
              }}
            >
              {parents.length}
            </div>
          </div>
        </div>


        {/* Error */}

        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#991b1b",
              padding: "14px 16px",
              borderRadius: "10px",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}


        {/* Form */}

        <div
          style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "24px",
            boxShadow:
              "0 4px 12px rgba(15, 23, 42, 0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              gap: "12px",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "20px",
                }}
              >
                {editingParent
                  ? "Edit Parent"
                  : "Add Parent"}
              </h2>

              <p
                style={{
                  margin: "6px 0 0",
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                Enter parent or guardian information.
              </p>
            </div>

            {editingParent && (
              <button
                type="button"
                onClick={resetForm}
                style={{
                  border: "1px solid #cbd5e1",
                  background: "white",
                  color: "#334155",
                  borderRadius: "8px",
                  padding: "9px 14px",
                  cursor: "pointer",
                }}
              >
                Cancel Edit
              </button>
            )}
          </div>


          <form onSubmit={handleSubmit}>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "16px",
              }}
            >

              <div>
                <label>First Name</label>
                <input
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="First name"
                  style={inputStyle}
                />
              </div>


              <div>
                <label>Last Name</label>
                <input
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Last name"
                  style={inputStyle}
                />
              </div>


              <div>
                <label>Relationship</label>
                <select
                  name="relationship"
                  value={formData.relationship}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="">
                    Select relationship
                  </option>
                  <option value="FATHER">
                    Father
                  </option>
                  <option value="MOTHER">
                    Mother
                  </option>
                  <option value="GUARDIAN">
                    Guardian
                  </option>
                  <option value="OTHER">
                    Other
                  </option>
                </select>
              </div>


              <div>
                <label>Phone</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone number"
                  style={inputStyle}
                />
              </div>


              <div>
                <label>Alternate Phone</label>
                <input
                  name="alternate_phone"
                  value={formData.alternate_phone}
                  onChange={handleChange}
                  placeholder="Alternate phone"
                  style={inputStyle}
                />
              </div>


              <div>
                <label>Email</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email address"
                  style={inputStyle}
                />
              </div>


              <div>
                <label>Occupation</label>
                <input
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  placeholder="Occupation"
                  style={inputStyle}
                />
              </div>


              <div>
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="ACTIVE">
                    Active
                  </option>
                  <option value="INACTIVE">
                    Inactive
                  </option>
                </select>
              </div>


              <div
                style={{
                  gridColumn:
                    "1 / -1",
                }}
              >
                <label>Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Address"
                  rows="3"
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                  }}
                />
              </div>

            </div>


            <div
              style={{
                marginTop: "20px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="submit"
                style={{
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "9px",
                  padding: "11px 20px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {editingParent
                  ? "Update Parent"
                  : "Add Parent"}
              </button>
            </div>

          </form>
        </div>


        {/* Parent List */}

        <div
          style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow:
              "0 4px 12px rgba(15, 23, 42, 0.04)",
          }}
        >

          <div
            style={{
              padding: "20px 24px",
              borderBottom:
                "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "20px",
                }}
              >
                Parent Directory
              </h2>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                Search and manage registered parents.
              </p>
            </div>

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search parents..."
              style={{
                ...inputStyle,
                width: "260px",
              }}
            />
          </div>


          {loading ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "#64748b",
              }}
            >
              Loading parents...
            </div>
          ) : filteredParents.length === 0 ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "#64748b",
              }}
            >
              No parents found.
            </div>
          ) : (
            <div
              style={{
                overflowX: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#f8fafc",
                    }}
                  >
                    <th style={thStyle}>
                      Name
                    </th>

                    <th style={thStyle}>
                      Relationship
                    </th>

                    <th style={thStyle}>
                      Phone
                    </th>

                    <th style={thStyle}>
                      Email
                    </th>

                    <th style={thStyle}>
                      Occupation
                    </th>

                    <th style={thStyle}>
                      Status
                    </th>

                    <th style={thStyle}>
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredParents.map(
                    (parent) => (
                      <tr
                        key={parent.id}
                        style={{
                          borderTop:
                            "1px solid #e2e8f0",
                        }}
                      >
                        <td style={tdStyle}>
                          <strong>
                            {getFullName(parent)}
                          </strong>
                        </td>

                        <td style={tdStyle}>
                          {parent.relationship ||
                            "—"}
                        </td>

                        <td style={tdStyle}>
                          {parent.phone || "—"}
                        </td>

                        <td style={tdStyle}>
                          {parent.email || "—"}
                        </td>

                        <td style={tdStyle}>
                          {parent.occupation ||
                            "—"}
                        </td>

                        <td style={tdStyle}>
                          <span
                            style={{
                              ...getStatusStyle(
                                parent.status
                              ),
                              padding:
                                "5px 10px",
                              borderRadius:
                                "999px",
                              fontSize: "12px",
                              fontWeight: 700,
                            }}
                          >
                            {parent.status}
                          </span>
                        </td>

                        <td style={tdStyle}>
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                            }}
                          >
                            <button
                              onClick={() =>
                                startEditing(
                                  parent
                                )
                              }
                              style={{
                                border:
                                  "1px solid #cbd5e1",
                                background:
                                  "white",
                                color:
                                  "#334155",
                                borderRadius:
                                  "7px",
                                padding:
                                  "7px 11px",
                                cursor:
                                  "pointer",
                              }}
                            >
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                handleDelete(
                                  parent
                                )
                              }
                              style={{
                                border:
                                  "1px solid #fecaca",
                                background:
                                  "#fff1f2",
                                color:
                                  "#be123c",
                                borderRadius:
                                  "7px",
                                padding:
                                  "7px 11px",
                                cursor:
                                  "pointer",
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}


const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  padding: "10px 12px",
  marginTop: "7px",
  fontSize: "14px",
  outline: "none",
};


const thStyle = {
  textAlign: "left",
  padding: "13px 16px",
  fontSize: "12px",
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};


const tdStyle = {
  padding: "14px 16px",
  fontSize: "14px",
  color: "#334155",
};


export default Parents;