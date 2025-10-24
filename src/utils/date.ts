import type { Time } from '@internationalized/date';

export class TimeFormatter {
    formatRange(time: Time) {
        const parts: string[] = [];
        if (time.hour > 0) {
            parts.push(`${time.hour} hour${time.hour > 1 ? 's' : ''}`);
        }
        if (time.minute > 0) {
            parts.push(`${time.minute} minute${time.minute > 1 ? 's' : ''}`);
        }
        if (time.second > 0) {
            parts.push(`${time.second} second${time.second > 1 ? 's' : ''}`);
        }
        return parts.join(' ');
    }
}
