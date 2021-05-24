const advancedResults = (model, populate) => async (req, res, next) => {
  let query;

  // copy of req.query
  const reqQuery = { ...req.query };

  //  fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Loop over removeFileds and delete them form reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);

  // creat query string
  let queryStr = JSON.stringify(reqQuery);

  // create operators(gt,gte.etc)
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in|push)\b/g,
    (match) => `$${match}`
  );
  // finding rescurce
  query = model.find(JSON.parse(queryStr));

  // select fileds
  if (req.query.select) {
    const fileds = req.query.select.split(',').join(' ');
    query = query.select(fileds);
  }

  // sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();

  query = query.skip(startIndex).limit(limit);

  if (populate) {
    query = query.populate(populate);
  }
  // excuring query
  const results = await query;

  // pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }
  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results,
  };

  next();
};

module.exports = advancedResults;
