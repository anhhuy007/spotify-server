function successResponse(success, message, data) {
    // if using pagination, add the pagination object to the response
    if (data && typeof data === 'object' && 'page' in data && 'limit' in data && 'total' in data) {
        const pagination = {
            total: data.total,
            limit: data.limit,
            page: data.page,
            totalPages: Math.ceil(data.total / data.limit),
        };

        const dataRes = {
            pagination, 
            items: data.items
        };

        return {
            success,
            message, 
            data: dataRes
        }
    }   

    // if not using pagination, return the data directly
    return {
        success,
        message,
        data
    }
}

function errorResponse(success, message) {
    return {
        success,
        message
    }
}

function validatePaginationOptions(options) {
    let { page = 1, limit = 10, filter = {} } = options;

    if (typeof page !== 'number') {
        page = parseInt(page);
    }

    if (typeof limit !== 'number') {
        limit = parseInt(limit);
    }

    if (page < 1) {
        page = 1;
    }

    if (limit < 1) {
        limit = 10;
    }

    return { page, limit, filter };
}

function validateSortOptions(options) {
    let { sortBy, sortOrder } = options;

    if (!sortBy) {
        sortBy = 'createdAt';
    }

    if (!sortOrder) {
        sortOrder = 'desc';
    }

    return { sortBy, sortOrder };
}

export default {
    successResponse,
    errorResponse,
    validatePaginationOptions,
    validateSortOptions
}
