import type Database from 'better-sqlite3';

export type AlertStatus = 'open' | 'reviewed' | 'closed';

export interface Alert {
  alert_id: string;
  cluster_id: string;
  escalated_at: string;
  notified_authority_id: string | null;
  status: AlertStatus;
}

export class AlertRepository {
  constructor(private readonly db: Database.Database) {}

  create(alert: Alert): Alert {
    this.db
      .prepare(
        `INSERT INTO alerts (alert_id, cluster_id, escalated_at, notified_authority_id, status)
         VALUES (@alert_id, @cluster_id, @escalated_at, @notified_authority_id, @status)`
      )
      .run(alert);
    return alert;
  }

  findById(alertId: string): Alert | undefined {
    return this.db.prepare(`SELECT * FROM alerts WHERE alert_id = ?`).get(alertId) as Alert | undefined;
  }

  list(status?: AlertStatus): Alert[] {
    if (status) {
      return this.db.prepare(`SELECT * FROM alerts WHERE status = ? ORDER BY escalated_at DESC`).all(status) as Alert[];
    }
    return this.db.prepare(`SELECT * FROM alerts ORDER BY escalated_at DESC`).all() as Alert[];
  }

  updateStatus(alertId: string, status: AlertStatus): Alert | undefined {
    this.db.prepare(`UPDATE alerts SET status = ? WHERE alert_id = ?`).run(status, alertId);
    return this.findById(alertId);
  }
}
