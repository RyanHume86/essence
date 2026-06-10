// PowerSync <-> Supabase connector.
//
// - fetchCredentials() hands PowerSync the current Supabase session token so the
//   sync service can authorise the user's bucket.
// - uploadData() flushes the local write queue back to Supabase. Conflict
//   resolution is last-write-wins, implemented here in the upload handler (not
//   in app logic): we simply upsert/patch on the primary key and let the latest
//   write stand.
import { supabase, POWERSYNC_URL } from '@/lib/supabaseClient';

// Postgres error codes that indicate the data is fatally rejected (constraint
// violations etc). For these we drop the offending op rather than retrying
// forever, otherwise a single bad row would wedge the whole upload queue.
const FATAL_PG_CODES = ['23', '42', '22'];

function isFatalPostgresError(error) {
  const code = error?.code;
  return typeof code === 'string' && FATAL_PG_CODES.includes(code.slice(0, 2));
}

export class SupabaseConnector {
  /** Provide PowerSync with the endpoint + a fresh Supabase token. */
  async fetchCredentials() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) throw error;
    if (!session) return null; // not signed in -> PowerSync stays disconnected

    return {
      endpoint: POWERSYNC_URL,
      token: session.access_token,
    };
  }

  /** Flush queued local writes to Supabase. */
  async uploadData(database) {
    const tx = await database.getNextCrudTransaction();
    if (!tx) return;

    let lastOp = null;
    try {
      for (const op of tx.crud) {
        lastOp = op;
        const table = supabase.from(op.table);
        let result;
        if (op.op === 'PUT') {
          result = await table.upsert({ id: op.id, ...op.opData });
        } else if (op.op === 'PATCH') {
          result = await table.update(op.opData).eq('id', op.id);
        } else if (op.op === 'DELETE') {
          result = await table.delete().eq('id', op.id);
        }
        if (result?.error) throw result.error;
      }
      await tx.complete();
    } catch (e) {
      if (isFatalPostgresError(e)) {
        // Data is permanently rejected (e.g. check-constraint violation).
        // Discard the transaction so the queue can move on.
        console.error('Discarding crud op rejected by Postgres', lastOp, e);
        await tx.complete();
        return;
      }
      // Transient (network) errors: do not complete, let PowerSync retry on
      // reconnect.
      throw e;
    }
  }
}
