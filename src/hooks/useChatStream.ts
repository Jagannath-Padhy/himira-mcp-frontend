import { useCallback, useRef } from 'react';
import { StreamingResponse } from '@interfaces';

export interface UseChatStreamParams {
  onThinking?: (message: string, sessionId?: string) => void;
  onToolStart?: (tool: string, status: string, sessionId?: string) => void;
  onResponse?: (response: StreamingResponse & { type: 'response' }) => void;
  onRawProducts?: (response: StreamingResponse & { type: 'raw_products' }) => void;
  onRawCart?: (response: StreamingResponse & { type: 'raw_cart' }) => void;
  onConversationChunk?: (response: StreamingResponse & { type: 'conversation_chunk' }) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

export const useChatStream = ({
  onThinking,
  onToolStart,
  onResponse,
  onRawProducts,
  onRawCart,
  onConversationChunk,
  onError,
  onComplete,
}: UseChatStreamParams) => {
  const abortControllerRef = useRef<AbortController | null>(null);
  const isStreamingRef = useRef(false);

  const sendMessage = useCallback(
    async (message: string, sessionId: string | null) => {
      // Abort any existing stream
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();
      isStreamingRef.current = true;

      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/chat/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
          },
          body: JSON.stringify({
            message,
            session_id: sessionId,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('No reader available');
        }

        let buffer = '';

        while (isStreamingRef.current) {
          const { done, value } = await reader.read();

          if (done) {
            isStreamingRef.current = false;
            onComplete?.();
            break;
          }

          // Decode the chunk and add to buffer
          buffer += decoder.decode(value, { stream: true });

          // Process complete lines
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer

          for (const line of lines) {
            const trimmedLine = line.trim();

            // Skip empty lines and comments
            if (!trimmedLine || trimmedLine.startsWith(':')) {
              continue;
            }

            // Check for [DONE] marker
            if (trimmedLine === '[DONE]' || trimmedLine === 'data: [DONE]') {
              isStreamingRef.current = false;
              onComplete?.();
              return;
            }

            // Parse SSE data
            if (trimmedLine.startsWith('data:')) {
              const jsonStr = trimmedLine.substring(5).trim();

              try {
                const data = JSON.parse(jsonStr) as StreamingResponse;


                if (data.type === 'thinking') {
                  onThinking?.(data.message, data.session_id);
                } else if (data.type === 'conversation_chunk') {
                  onConversationChunk?.(data as StreamingResponse & { type: 'conversation_chunk' });
                } else if (data.type === 'tool_start') {
                  onToolStart?.(data.tool, data.status, data.session_id);
                } else if (data.type === 'response') {
                  onResponse?.(data);
                } else if (data.type === 'raw_products') {
                  onRawProducts?.(data);
                } else if (data.type === 'raw_cart') {
                  onRawCart?.(data);
                }
              } catch (parseError) {
                console.warn('Failed to parse SSE data:', jsonStr, parseError);
              }
            }
          }
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            return;
          }
          onError?.(error);
        }
      } finally {
        isStreamingRef.current = false;
        abortControllerRef.current = null;
      }
    },
    [onThinking, onToolStart, onResponse, onRawProducts, onRawCart, onError, onComplete],
  );

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      isStreamingRef.current = false;
    }
  }, []);

  return {
    sendMessage,
    abort,
    isStreaming: isStreamingRef.current,
  };
};

export default useChatStream;
