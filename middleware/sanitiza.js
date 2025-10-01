
export const sanitizeObject = (obj) => {
    const forbiddenKeys = ['$where', '$gt', '$gte', '$lt', '$lte', '$ne', '$nin', '$in', '$regex'];
    Object.keys(obj).forEach(key => {
        if (forbiddenKeys.includes(key)) {
            delete obj[key];
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            sanitizeObject(obj[key]);
        }
    });
}