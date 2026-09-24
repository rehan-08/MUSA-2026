import type Database from 'better-sqlite3';
import { AlertRepository, type Alert, type AlertStatus } from '../models/alert.js';
import { ClusterRepository } from '../models/cluster.js';

export interface AlertWithClusterSummary extends Alert {
  cluster_summary: {
    cluster_id: string;
    geohash_bucket: string;
    state: string;
    confidence_score: number;
  } | null;
}

export class AlertsService {
  private readonly alertRepo: AlertRepository;
  private readonly clusterRepo: ClusterRepository;

  constructor(db: Database.Database) {
    this.alertRepo = new AlertRepository(db);
    this.clusterRepo = new ClusterRepository(db);
  }

  list(status?: AlertStatus): AlertWithClusterSummary[] {
    return this.alertRepo.list(status).map((alert) => {
      const cluster = this.clusterRepo.findById(alert.cluster_id);
      return {
        ...alert,
        cluster_summary: cluster
          ? {
              cluster_id: cluster.cluster_id,
              geohash_bucket: cluster.geohash_bucket,
              state: cluster.state,
              confidence_score: cluster.confidence_score,
            }
          : null,
      };
    });
  }

  updateStatus(alertId: string, status: AlertStatus): Alert | undefined {
    return this.alertRepo.updateStatus(alertId, status);
  }

  findById(alertId: string): Alert | undefined {
    return this.alertRepo.findById(alertId);
  }
}
