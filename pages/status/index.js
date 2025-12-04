import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

function StatusPage() {
  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <h1 style={styles.title}>Status do Sistema</h1>
        <UpdatedAt />
      </div>
    </div>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  if (isLoading) {
    return <div style={styles.loading}>Carregando dados...</div>;
  }

  if (!isLoading && data) {
    let updatedAtText = new Date(data.updated_at).toLocaleString("pt-BR");

    return (
      <div style={styles.card}>
        <div style={styles.headerRow}>
          <span style={styles.statusIndicator}></span>
          <p style={styles.lastUpdate}>Última atualização: {updatedAtText}</p>
        </div>

        <h2 style={styles.sectionTitle}>Banco de Dados</h2>

        <div style={styles.statsGrid}>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Versão</span>
            <span style={styles.statValue}>
              {data.dependencies.database.version}
            </span>
          </div>

          <div style={styles.statItem}>
            <span style={styles.statLabel}>Conexões Máximas</span>
            <span style={styles.statValue}>
              {data.dependencies.database.max_connections}
            </span>
          </div>

          <div style={styles.statItem}>
            <span style={styles.statLabel}>Conexões Abertas</span>
            <span style={styles.statValue}>
              {data.dependencies.database.active_connections}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

// Estilos (CSS-in-JS)
const styles = {
  pageWrapper: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: "#f4f4f5",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    padding: "40px 20px",
    color: "#333",
  },
  container: {
    width: "100%",
    maxWidth: "600px",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
    fontSize: "2rem",
    color: "#18181b",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    border: "1px solid #e4e4e7",
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    marginBottom: "20px",
    paddingBottom: "15px",
    borderBottom: "1px solid #f4f4f5",
  },
  statusIndicator: {
    width: "10px",
    height: "10px",
    backgroundColor: "#22c55e", // Verde (Online)
    borderRadius: "50%",
    marginRight: "10px",
    boxShadow: "0 0 0 4px rgba(34, 197, 94, 0.2)", // Efeito de brilho
  },
  lastUpdate: {
    fontSize: "0.9rem",
    color: "#71717a",
    margin: 0,
  },
  sectionTitle: {
    fontSize: "1.25rem",
    marginBottom: "15px",
    color: "#27272a",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr", // Uma coluna por padrão
    gap: "10px",
  },
  statItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px dashed #e4e4e7",
  },
  statLabel: {
    color: "#52525b",
    fontWeight: "500",
  },
  statValue: {
    fontFamily: "monospace", // Fonte monoespaçada para números (estilo dev)
    fontWeight: "bold",
    backgroundColor: "#f4f4f5",
    padding: "2px 6px",
    borderRadius: "4px",
    color: "#09090b",
  },
  loading: {
    textAlign: "center",
    marginTop: "20px",
    color: "#71717a",
    animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
  },
};

export default StatusPage;
