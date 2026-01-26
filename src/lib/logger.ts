export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    context?: Record<string, unknown>;
    error?: unknown;
}

const isProduction = process.env.NODE_ENV === 'production';

export const logger = {
    info: (message: string, context?: Record<string, unknown>) => {
        log('info', message, context);
    },
    warn: (message: string, context?: Record<string, unknown>) => {
        log('warn', message, context);
    },
    error: (message: string, error?: unknown, context?: Record<string, unknown>) => {
        log('error', message, context, error);
    },
    debug: (message: string, context?: Record<string, unknown>) => {
        if (!isProduction) {
            log('debug', message, context);
        }
    }
};

function log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: unknown) {
    const entry: LogEntry = {
        level,
        message,
        timestamp: new Date().toISOString(),
        context
    };

    if (error) {
        entry.error = serializeError(error);
    }

    // In production, you might pipe this to a service like Datadog/Sentry
    // For Vercel, console.log/error with JSON is automatically captured
    const output = JSON.stringify(entry);

    switch (level) {
        case 'error':
            console.error(output);
            break;
        case 'warn':
            console.warn(output);
            break;
        default:
            console.log(output);
    }
}

function serializeError(error: unknown) {
    if (error instanceof Error) {
        return {
            name: error.name,
            message: error.message,
            stack: error.stack,
            cause: (error as { cause?: unknown }).cause // Capture cause if present
        };
    }
    return error;
}
