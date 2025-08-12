const paginate = async (model, query = {}, reqQuery = {}, options = {}) => {
  try {
    const { page = 1, limit = 6, sort = '-createdAt' } = reqQuery;

    const paginateOptions = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      ...options,
    };

    const result = await model.paginate(query, paginateOptions);

    return {
      data: result.docs,
      limit: result.limit,
      totalDocs: result.totalDocs,
      totalPages: result.totalPages,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      counter: result.pagingCounter,
      currentPage: result.page,
    };
  } catch (error) {
    console.log("Pagination Error:", error);
    return null;
  }
};

module.exports = paginate;
