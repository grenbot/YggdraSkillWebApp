export interface AppUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

export interface SkillEdge {
  id: string;
  source: string;
  target: string;
}

export interface SkillNode {
  id: string;
  label: string;
  description?: string;
  subskills?: string[]; // Matches Firestore structure
  prerequisites?: string[];
  position?: { x: number; y: number };
  metadata?: Record<string, any>; // includes e.g. level, future styling info
}

export interface SkillTree {
  key: string; // This is the Firestore document ID (treeId)
  title: string;
  description?: string;
  tags?: string[];
  nodes: SkillNode[];
  partition?: string;
  metadata?: {
    edges?: SkillEdge[]; // Tree-level connections
    [key: string]: any;
  };
}

export interface NodeProgress {
  subskills: string[];
  completedAt?: string;
  certification?: 'self' | 'soft' | 'hard';
}

export interface TreeProgress {
  [nodeId: string]: NodeProgress;
}

export interface ForestProgress {
  [treeId: string]: TreeProgress;
}

export interface TreeMetadata {
  author?: string;
  createdAt?: string;
  updatedAt?: string;
  contributors?: string[];
  license?: string;
}

export interface CertificationEvent {
  certifierId: string;
  type: 'soft' | 'hard';
  timestamp: string;
  notes?: string;
}

export interface VerificationLog {
  requester: string;
  timestamp: string;
  reason?: string;
}

export interface SyncStatus {
  lastSyncedAt: string;
  hasConflicts: boolean;
  pendingUpdates: boolean;
}

export interface NodePositionMap {
  [nodeId: string]: {
    x: number;
    y: number;
  };
}

export interface TreeFilterOptions {
  tags?: string[];
  partitions?: string[];
  authors?: string[];
  minNodes?: number;
  maxNodes?: number;
}

export interface FirestoreTree {
  key: string;
  title: string;
  description?: string;
  tags?: string[];
  nodes: SkillNode[];
  partition?: string;
  metadata?: TreeMetadata;
}

export interface FirestoreUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  trees?: ForestProgress;
  verifiedCerts?: CertificationEvent[];
  syncStatus?: SyncStatus;
  verificationLogs?: VerificationLog[];
}