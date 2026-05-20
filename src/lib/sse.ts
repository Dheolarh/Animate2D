/**
 * sse.ts — SSE streaming utility for consuming edge function streams
 */

import ky from 'ky';
import { createParser } from 'eventsource-parser';

export interface SSEOptions {
  onData: (data: string) => void;
  onCompleted?: (error?: Error) => void;
  onAborted?: () => void;
}

export interface StreamRequestOptions {
  functionUrl: string;
  requestBody: unknown;
  supabaseAnonKey: string;
  onData: (data: string) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
  signal?: AbortSignal;
}

export async function sendStreamRequest(options: StreamRequestOptions): Promise<void> {
  const { functionUrl, requestBody, supabaseAnonKey, onData, onComplete, onError, signal } = options;

  let completed = false;
  const finish = (err?: Error) => {
    if (!completed) {
      completed = true;
      if (err) onError(err);
      else onComplete();
    }
  };

  try {
    await ky.post(functionUrl, {
      json: requestBody,
      headers: {
        Authorization: `Bearer ${supabaseAnonKey}`,
        apikey: supabaseAnonKey,
        'Content-Type': 'application/json',
      },
      signal,
      timeout: 90_000,
      hooks: {
        afterResponse: [
          async (_req, _opts, response) => {
            if (!response.ok || !response.body) return response;

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            const parser = createParser({
              onEvent: (event) => {
                if (!event.data || event.data === '[DONE]') return;
                onData(event.data);
              },
            });

            const read = (): void => {
              reader
                .read()
                .then(({ done, value }) => {
                  if (done) {
                    finish();
                    return;
                  }
                  parser.feed(decoder.decode(value, { stream: true }));
                  read();
                })
                .catch((err: Error) => {
                  if (signal?.aborted) return;
                  finish(err);
                });
            };

            read();
            return response;
          },
        ],
      },
    });
  } catch (err) {
    if (!signal?.aborted) finish(err as Error);
  }
}
