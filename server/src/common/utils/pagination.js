const encodeCursor = (value) => Buffer.from(String(value), "utf8").toString("base64");
const decodeCursor = (value) => Buffer.from(String(value), "base64").toString("utf8");

export const createCursorPage = ({ rows, limit, getCursorValue }) => {
    const safeRows = Array.isArray(rows) ? rows : [];
    const hasMore = safeRows.length > limit;
    const pageRows = hasMore ? safeRows.slice(0, limit) : safeRows;
    const nextCursor = hasMore && pageRows.length
        ? encodeCursor(getCursorValue(pageRows[pageRows.length - 1]))
        : null;

    return {
        items: pageRows,
        pageInfo: {
            limit,
            hasMore,
            nextCursor,
        },
    };
};

export const parseCursor = (cursor) => {
    if (!cursor) return null;
    return decodeCursor(cursor);
};
