function successResponse(success, message, data) {
    // if using pagination, add the pagination object to the response
    if (data && typeof data === 'object' && 'total' in data && 'limit' in data) {
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

export default {
    successResponse,
    errorResponse
}
