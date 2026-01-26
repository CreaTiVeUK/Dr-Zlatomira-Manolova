export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    context?: Record<string, any>;
    error?: any;
}

const isProduction = process.env.NODE_ENV === 'production';

export const logger = {
    info: (message: string, context?: Record<string, any>) => {
        log('info', message, context);
    },
    warn: (message: string, context?: Record<string, any>) => {
        log('warn', message, context);
    },
    error: (message: string, error?: any, context?: Record<string, any>) => {
        log('error', message, context, error);
    },
    debug: (message: string, context?: Record<string, any>) => {
        if (!isProduction) {
            log('debug', message, context);
        }
    }
};

function log(level: LogLevel, message: string, context?: Record<string, any>, error?: any) {
    const entry: LogEntry = {
        level,
        message,
        timestamp: new Date().toISOString(),
        context,
        ...(error && { error: serializeError(error) })
    };

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

function serializeError(error: any) {
    if (error instanceof Error) {
        return {
            name: error.name,
            message: error.message,
            stack: error.stack,
            cause: (error as any).cause // Capture cause if present
        };
    }
    return error;
}
