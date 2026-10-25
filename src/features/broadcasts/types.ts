export type BroadcastStatus =
  | "queued"
  | "sending"
  | "sent"
  | "partial"
  | "failed";

export type Broadcast = {
  id: string;
  createdAt: string;
  finishedAt: string | null;
  text: string;
  status: BroadcastStatus;
  delivery: {
    total: number;
    delivered: number;
    failed: number;
    pending: number;
  };
  author: string;
};

export type BroadcastStats = {
  total: number;
  queued: number;
  sent: number;
  failed: number;
  reach: number;
  delivered: number;
};

export type BroadcastList = { items: Broadcast[]; stats: BroadcastStats };
