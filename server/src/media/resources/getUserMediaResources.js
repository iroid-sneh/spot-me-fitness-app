import { baseUrl } from "../../common/helper.js";

export default class getUserMediaResources {
    constructor(data) {
        return {
            id: data.id,
            userId: data.user_id,
            url: data.url ? (data.url.startsWith("http") ? data.url : baseUrl(data.url)) : null,
            type: data.type,
            durationSec: data.duration_sec,
            isFitness: data.is_fitness,
            isMainPhoto: data.is_main_photo,
            orderIndex: data.order_index,
            source: data.source,
            mimeType: data.mime_type,
            sizeBytes: data.size_bytes,
        };
    }
}
