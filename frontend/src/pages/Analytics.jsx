import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

function StatCard({ title, value, subtitle }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statTitle}>{title}</div>
      <div style={styles.statValue}>{value}</div>
      {subtitle && <div style={styles.statSubtitle}>{subtitle}</div>}
    </div>
  );
}

function HorizontalBar({ label, value, maxValue }) {
  const width =
    maxValue > 0
      ? Math.max((value / maxValue) * 100, 3)
      : 0;

  return (
    <div style={styles.barRow}>
      <div style={styles.barLabel}>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>

      <div style={styles.barTrack}>
        <div
          style={{
            ...styles.barFill,
            width: `${width}%`,
          }}
        />
      </div>
    </div>
  );
}

function Analytics() {
  const [overview, setOverview] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [classes, setClasses] = useState([]);
  const [admissions, setAdmissions] = useState({});
  const [attendance, setAttendance] = useState([]);

  const [months, setMonths] = useState(12);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        overviewResponse,
        monthlyResponse,
        classesResponse,
        admissionsResponse,
        attendanceResponse,
      ] = await Promise.all([
        api.get("/analytics/overview"),
        api.get(`/analytics/monthly?months=${months}`),
        api.get("/analytics/classes"),
        api.get("/analytics/admissions"),
        api.get("/analytics/attendance"),
      ]);

      setOverview(overviewResponse.data);
      setMonthly(monthlyResponse.data.months || []);
      setClasses(classesResponse.data.data || []);
      setAdmissions(admissionsResponse.data || {});
      setAttendance(attendanceResponse.data.data || []);
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          "Unable to load analytics."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [months]);

  const classMax = useMemo(() => {
    return Math.max(
      ...classes.map((item) => item.students),
      0
    );
  }, [classes]);

  const maxMonthlyIncome = useMemo(() => {
    return Math.max(
      ...monthly.map((item) =>
        Math.max(item.income || 0, item.expenses || 0)
      ),
      0
    );
  }, [monthly]);

  const maxAttendance = useMemo(() => {
    return Math.max(
      ...attendance.map((item) => item.total || 0),
      0
    );
  }, [attendance]);

  if (loading && !overview) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>
          Loading analytics...
        </div>
      </div>
    );
  }

  if (error && !overview) {
    return (
      <div style={styles.page}>
        <div style={styles.errorBox}>
          <h2>Analytics could not be loaded</h2>
          <p>{error}</p>

          <button
            style={styles.primaryButton}
            onClick={loadAnalytics}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const formatMoney = (value) =>
    `NPR ${Number(value || 0).toLocaleString()}`;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            School Analytics
          </h1>

          <p style={styles.subtitle}>
            Centralized performance, finance,
            attendance and admissions intelligence.
          </p>
        </div>

        <div style={styles.headerActions}>
          <select
            value={months}
            onChange={(event) =>
              setMonths(Number(event.target.value))
            }
            style={styles.select}
          >
            <option value={6}>Last 6 months</option>
            <option value={12}>Last 12 months</option>
            <option value={18}>Last 18 months</option>
            <option value={24}>Last 24 months</option>
          </select>

          <button
            style={styles.secondaryButton}
            onClick={loadAnalytics}
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div style={styles.warningBox}>
          {error}
        </div>
      )}

      <section>
        <h2 style={styles.sectionTitle}>
          School Overview
        </h2>

        <div style={styles.statsGrid}>
          <StatCard
            title="Total Students"
            value={overview?.students?.total ?? 0}
            subtitle={`Active: ${
              overview?.students?.active ?? 0
            }`}
          />

          <StatCard
            title="Parents"
            value={overview?.parents?.total ?? 0}
          />

          <StatCard
            title="Staff"
            value={overview?.staff?.total ?? 0}
            subtitle={`Teachers: ${
              overview?.staff?.teachers ?? 0
            }`}
          />

          <StatCard
            title="Pending Admissions"
            value={overview?.admissions?.pending ?? 0}
            subtitle={`Enrolled: ${
              overview?.admissions?.enrolled ?? 0
            }`}
          />

          <StatCard
            title="Fee Collected"
            value={formatMoney(
              overview?.fees?.total_paid
            )}
            subtitle={`Collection: ${
              overview?.fees?.collection_percentage ?? 0
            }%`}
          />

          <StatCard
            title="Fee Balance"
            value={formatMoney(
              overview?.fees?.balance
            )}
          />

          <StatCard
            title="Total Income"
            value={formatMoney(
              overview?.finance?.income
            )}
          />

          <StatCard
            title="Net Finance"
            value={formatMoney(
              overview?.finance?.net
            )}
            subtitle={`Expenses: ${formatMoney(
              overview?.finance?.expense
            )}`}
          />
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>
              Today's Attendance
            </h2>

            <p style={styles.muted}>
              Attendance recorded for today.
            </p>
          </div>

          <div style={styles.attendancePercentage}>
            {
              overview?.attendance_today
                ?.attendance_percentage ?? 0
            }
            %
          </div>
        </div>

        <div style={styles.attendanceGrid}>
          <div style={styles.attendanceCard}>
            <span>Present</span>
            <strong>
              {overview?.attendance_today?.PRESENT ?? 0}
            </strong>
          </div>

          <div style={styles.attendanceCard}>
            <span>Late</span>
            <strong>
              {overview?.attendance_today?.LATE ?? 0}
            </strong>
          </div>

          <div style={styles.attendanceCard}>
            <span>Absent</span>
            <strong>
              {overview?.attendance_today?.ABSENT ?? 0}
            </strong>
          </div>

          <div style={styles.attendanceCard}>
            <span>Leave</span>
            <strong>
              {overview?.attendance_today?.LEAVE ?? 0}
            </strong>
          </div>
        </div>
      </section>

      <div style={styles.twoColumn}>
        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <h2 style={styles.panelTitle}>
                Students by Class
              </h2>
              <p style={styles.muted}>
                Active student distribution.
              </p>
            </div>
          </div>

          {classes.length === 0 ? (
            <div style={styles.empty}>
              No class data available.
            </div>
          ) : (
            classes.map((item) => (
              <HorizontalBar
                key={item.class_name}
                label={`Class ${item.class_name}`}
                value={item.students}
                maxValue={classMax}
              />
            ))
          )}
        </section>

        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <h2 style={styles.panelTitle}>
                Admission Pipeline
              </h2>
              <p style={styles.muted}>
                Current application status distribution.
              </p>
            </div>
          </div>

          {Object.keys(
            admissions?.by_status || {}
          ).length === 0 ? (
            <div style={styles.empty}>
              No admission data available.
            </div>
          ) : (
            Object.entries(
              admissions.by_status
            ).map(([status, count]) => (
              <HorizontalBar
                key={status}
                label={status.replaceAll("_", " ")}
                value={count}
                maxValue={admissions.total || 0}
              />
            ))
          )}
        </section>
      </div>

      <section style={styles.panel}>
        <div style={styles.panelHeader}>
          <div>
            <h2 style={styles.panelTitle}>
              Monthly Financial Trend
            </h2>
            <p style={styles.muted}>
              Income, expenses and net financial position.
            </p>
          </div>
        </div>

        {monthly.length === 0 ? (
          <div style={styles.empty}>
            No monthly financial data available.
          </div>
        ) : (
          <div style={styles.monthlyList}>
            {monthly.map((item) => (
              <div
                key={item.month}
                style={styles.monthRow}
              >
                <div style={styles.monthLabel}>
                  {item.month}
                </div>

                <div style={styles.monthBars}>
                  <div>
                    <div style={styles.miniLabel}>
                      Income:{" "}
                      {formatMoney(item.income)}
                    </div>

                    <div style={styles.barTrack}>
                      <div
                        style={{
                          ...styles.incomeBar,
                          width: `${
                            maxMonthlyIncome
                              ? (item.income /
                                  maxMonthlyIncome) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div style={styles.miniLabel}>
                      Expenses:{" "}
                      {formatMoney(item.expenses)}
                    </div>

                    <div style={styles.barTrack}>
                      <div
                        style={{
                          ...styles.expenseBar,
                          width: `${
                            maxMonthlyIncome
                              ? (item.expenses /
                                  maxMonthlyIncome) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div style={styles.netValue}>
                  {formatMoney(item.net)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section style={styles.panel}>
        <div style={styles.panelHeader}>
          <div>
            <h2 style={styles.panelTitle}>
              Attendance Trend
            </h2>

            <p style={styles.muted}>
              Last 30 days of recorded attendance.
            </p>
          </div>
        </div>

        {attendance.length === 0 ? (
          <div style={styles.empty}>
            No attendance data available.
          </div>
        ) : (
          <div style={styles.attendanceTrend}>
            {attendance.map((item) => {
              const present =
                (item.present || 0) +
                (item.late || 0);

              const presentWidth =
                maxAttendance > 0
                  ? (present / maxAttendance) * 100
                  : 0;

              return (
                <div
                  key={item.date}
                  style={styles.trendRow}
                >
                  <div style={styles.trendDate}>
                    {item.date}
                  </div>

                  <div style={styles.barTrack}>
                    <div
                      style={{
                        ...styles.attendanceBar,
                        width: `${presentWidth}%`,
                      }}
                    />
                  </div>

                  <div style={styles.trendNumbers}>
                    {present} / {item.total}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    padding: "32px",
    fontFamily:
      "Inter, Arial, Helvetica, sans-serif",
    boxSizing: "border-box",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "24px",
    marginBottom: "30px",
  },

  title: {
    margin: 0,
    fontSize: "32px",
    color: "#172033",
  },

  subtitle: {
    margin: "8px 0 0",
    color: "#687386",
    fontSize: "15px",
  },

  headerActions: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },

  select: {
    padding: "10px 12px",
    border: "1px solid #d8deea",
    borderRadius: "8px",
    background: "#fff",
    fontSize: "14px",
  },

  primaryButton: {
    border: "none",
    borderRadius: "8px",
    padding: "11px 18px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },

  secondaryButton: {
    border: "1px solid #d8deea",
    borderRadius: "8px",
    padding: "10px 16px",
    background: "#fff",
    color: "#263248",
    cursor: "pointer",
    fontWeight: 600,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "16px",
  },

  statCard: {
    background: "#fff",
    border: "1px solid #e2e7f0",
    borderRadius: "14px",
    padding: "20px",
    boxShadow:
      "0 3px 12px rgba(25, 38, 65, 0.05)",
  },

  statTitle: {
    color: "#6b7587",
    fontSize: "13px",
    fontWeight: 600,
  },

  statValue: {
    marginTop: "10px",
    color: "#182237",
    fontSize: "25px",
    fontWeight: 700,
  },

  statSubtitle: {
    marginTop: "7px",
    color: "#7a8495",
    fontSize: "12px",
  },

  section: {
    marginTop: "28px",
  },

  sectionTitle: {
    margin: 0,
    color: "#1a2438",
    fontSize: "20px",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "14px",
  },

  muted: {
    margin: "6px 0 0",
    color: "#7a8495",
    fontSize: "13px",
  },

  attendancePercentage: {
    fontSize: "26px",
    fontWeight: 700,
    color: "#2563eb",
  },

  attendanceGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "14px",
  },

  attendanceCard: {
    background: "#fff",
    border: "1px solid #e2e7f0",
    borderRadius: "12px",
    padding: "18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  twoColumn: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
    marginTop: "24px",
  },

  panel: {
    marginTop: "24px",
    background: "#fff",
    border: "1px solid #e2e7f0",
    borderRadius: "14px",
    padding: "22px",
    boxShadow:
      "0 3px 12px rgba(25, 38, 65, 0.04)",
  },

  panelHeader: {
    marginBottom: "20px",
  },

  panelTitle: {
    margin: 0,
    color: "#1a2438",
    fontSize: "18px",
  },

  barRow: {
    marginBottom: "16px",
  },

  barLabel: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "7px",
    color: "#4d586b",
    fontSize: "13px",
  },

  barTrack: {
    width: "100%",
    height: "9px",
    background: "#edf0f5",
    borderRadius: "999px",
    overflow: "hidden",
  },

  barFill: {
    height: "100%",
    background: "#2563eb",
    borderRadius: "999px",
  },

  incomeBar: {
    height: "100%",
    background: "#16a34a",
    borderRadius: "999px",
  },

  expenseBar: {
    height: "100%",
    background: "#dc2626",
    borderRadius: "999px",
  },

  attendanceBar: {
    height: "100%",
    background: "#2563eb",
    borderRadius: "999px",
  },

  empty: {
    padding: "30px",
    textAlign: "center",
    color: "#7a8495",
  },

  monthlyList: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  monthRow: {
    display: "grid",
    gridTemplateColumns:
      "90px minmax(200px, 1fr) 130px",
    gap: "18px",
    alignItems: "center",
  },

  monthLabel: {
    fontWeight: 700,
    color: "#273248",
    fontSize: "13px",
  },

  monthBars: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  miniLabel: {
    marginBottom: "4px",
    color: "#6b7587",
    fontSize: "11px",
  },

  netValue: {
    textAlign: "right",
    fontWeight: 700,
    color: "#1f2937",
    fontSize: "13px",
  },

  attendanceTrend: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  trendRow: {
    display: "grid",
    gridTemplateColumns:
      "100px minmax(180px, 1fr) 80px",
    gap: "14px",
    alignItems: "center",
  },

  trendDate: {
    color: "#596579",
    fontSize: "12px",
  },

  trendNumbers: {
    textAlign: "right",
    color: "#374151",
    fontSize: "12px",
    fontWeight: 600,
  },

  loading: {
    padding: "80px",
    textAlign: "center",
    color: "#687386",
  },

  errorBox: {
    maxWidth: "600px",
    margin: "80px auto",
    background: "#fff",
    border: "1px solid #f0caca",
    borderRadius: "14px",
    padding: "30px",
    textAlign: "center",
  },

  warningBox: {
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    color: "#9a3412",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "20px",
  },
};

export default Analytics;
