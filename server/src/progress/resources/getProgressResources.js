import { baseUrl } from "../../common/helper.js";

export default class getProgressResources {
    constructor(data) {
        return {
            id: data.id,
            userId: data.user_id,
            mediaUrl: data.media_url ? (data.media_url.startsWith("http") ? data.media_url : baseUrl(data.media_url)) : null,
            type: data.type,
            durationSec: data.duration_sec,
            capturedMonth: data.captured_month,
            capturedYear: data.captured_year,
            workoutType: data.workout_type,
            caption: data.caption,
            source: data.source,
            isRawVerified: data.is_raw_verified,
            createdAt: data.created_at,
        };
    }
}

export class getBadgeResources {
    constructor(data) {
        return {
            userId: data.user_id,
            status: data.status,
            lastActivityAt: data.last_activity_at,
            lastUpdated: data.last_updated,
        };
    }
}
