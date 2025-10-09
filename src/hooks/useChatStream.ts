import { useCallback, useRef } from 'react';
import { StreamingResponse } from '@interfaces';

export interface UseChatStreamParams {
    onThinking?: (message: string, sessionId?: string) => void;
    onToolStart?: (tool: string, status: string, sessionId?: string) => void;
    onResponse?: (response: StreamingResponse & { type: 'response' }) => void;
    onRawProducts?: (response: StreamingResponse & { type: 'raw_products' }) => void;
    onRawCart?: (response: StreamingResponse & { type: 'raw_cart' }) => void;
    onError?: (error: Error) => void;
    onComplete?: () => void;
}

export const useChatStream = ({
    onThinking,
    onToolStart,
    onResponse,
    onRawProducts,
    onRawCart,
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
                const response = await fetch('http://localhost:8001/api/v1/chat/stream', {
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

                                console.log('📡 SSE Data received:', data);

                                if (data.type === 'thinking') {
                                    onThinking?.(data.message, data.session_id);
                                } else if (data.type === 'tool_start') {
                                    console.log('🔧 Tool execution started:', data.tool);
                                    onToolStart?.(data.tool, data.status, data.session_id);
                                } else if (data.type === 'response') {
                                    console.log('✅ Response received, calling onResponse');
                                    onResponse?.(data);
                                } else if (data.type === 'raw_products') {
                                    console.log('🛍️ Raw products received, calling onRawProducts');
                                    onRawProducts?.(data);
                                } else if (data.type === 'raw_cart') {
                                    console.log('🛒 Raw cart received, calling onRawCart');
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
                        console.log('Stream aborted');
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

