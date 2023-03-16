class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }
    filter() {
        // 1A) Filtring
        // URL: ?difficulty=easy
        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);

        // 1B) Advanced filtering
        // URL: ?duration[gte]=5

        // mongoDB query: { duration: { $gte: 5 } } 
        // req query from url:  { duration: { gte: 5 } }

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        // (\b) because we only want to match these exact words.
        // (g) is if u see more that one words then replace all of it not the first one.
        // match => `$${match}` 
        this.query = this.query.find(JSON.parse(queryStr));

        return this; // To do this => sort().filter()..
    }

    sort() {
        // 2) Sorting
        // URL: sort=price => asc | sort=-price desc
        // URL: sort=-ratingsAverage.price (sort on ratingsAverage then by price)
        if (this.queryString.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
            // sort('price reatingAvg'); )
        } else {
            // Default sorting
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }

    limitFields() {

        // 3) reutrun field
        if (this.queryString.field) {
            const field = req.query.field.split(',').join(' ');
            this.query = this.query.select(field);
            // this.query.select('name duration price');
        } else {
            // - => everything except __v
            this.query = this.query.select('-__v');
        }
        return this;
    }

    paginate() {

        // 4) Pagination

        // URL: page=2&limit=10 => 1 - 10 page 1 .. 11 - 20 page 2 ...'
        const page = this.queryString.page * 1 || 1; // convert to number , || 1 => means that by default page is 1
        const limit = this.queryString.limit * 1 || 10;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);
        return this;
    }

}
module.exports = APIFeatures;