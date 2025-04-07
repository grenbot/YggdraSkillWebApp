// src/types/firestoreTypes.ts

import { TreeMetadata } from './sharedTypes';

export interface FirestoreSkillNode {
  id: string;
  label: string;
  description?: string;
  subskills?: string[];
  prerequisites?: string[];
  position?: { x: number; y: number };
  metadata?: Record<string, any>;
}

export interface FirestoreSkillEdge {
  id: string;
  source: string;
  target: string;
  metadata?: Record<string, any>;
}

export interface FirestoreSkillTree {
  key: string;
  title: string;
  description?: string;
  tags?: string[];
  nodes: FirestoreSkillNode[];
  edges: FirestoreSkillEdge[];
  partition?: string;
  metadata?: TreeMetadata;
}

export interface FirestoreNodeProgress {
  subskills: string[];
  completedAt?: string;
  certification?: 'self' | 'soft' | 'hard';
}

export interface FirestoreTreeProgress {
  [nodeId: string]: FirestoreNodeProgress;
}

export interface FirestoreForestProgress {
  [treeId: string]: FirestoreTreeProgress;
}
export interface FirestoreUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  trees?: FirestoreForestProgress;
  verifiedCerts?: CertificationEvent[];
  syncStatus?: SyncStatus;
  verificationLogs?: VerificationLog[];
}
export interface CertificationEvent {
  treeId: string;
  nodeId: string;
  date: string;
  type: 'self' | 'soft' | 'hard';
  metadata?: Record<string, any>;
}
export interface VerificationLog {
  treeId: string;
  nodeId: string;
  date: string;
  type: 'self' | 'soft' | 'hard';
  metadata?: Record<string, any>;
}
export interface SyncStatus {
  lastSync: string;
  status: 'syncing' | 'synced' | 'error';
  error?: string;
}
export interface SyncProgress {
  total: number;
  completed: number;
  errors: number;
  lastSync: string;
  status: 'syncing' | 'synced' | 'error';
  error?: string;
}
export interface SyncError {
  message: string;
  nodeId: string;
  treeId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}
export interface SyncSuccess {
  message: string;
  nodeId: string;
  treeId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}
export interface SyncWarning {
  message: string;
  nodeId: string;
  treeId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}
export interface SyncResult {
  success: SyncSuccess[];
  error: SyncError[];
  warning: SyncWarning[];
}
export interface SyncSummary {
  total: number;
  success: number;
  error: number;
  warning: number;
  lastSync: string;
  status: 'syncing' | 'synced' | 'error';
  errorDetails?: string;
  metadata?: Record<string, any>;
}