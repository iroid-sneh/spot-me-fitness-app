class commonService {
    static async findOne(model, where, options = {}) {
        return await model.findOne({ where, ...options });
    }

    static async findAll(model, where = {}, options = {}) {
        return await model.findAll({ where, ...options });
    }

    static async findById(model, id, options = {}) {
        return await model.findByPk(id, options);
    }

    static async create(model, data, options = {}) {
        return await model.create(data, options);
    }

    static async bulkCreate(model, rows, options = {}) {
        return await model.bulkCreate(rows, options);
    }

    static async updateOne(model, where, data, options = {}) {
        const [affectedCount] = await model.update(data, { where, ...options });
        if (affectedCount > 0) {
            return await model.findOne({ where, ...options });
        }
        return null;
    }

    static async updateMany(model, where, data, options = {}) {
        return await model.update(data, { where, ...options });
    }

    static async findOneAndUpdate(model, where, data, options = {}) {
        const [affectedCount] = await model.update(data, { where, ...options });
        if (affectedCount > 0) {
            return await model.findOne({ where, ...options });
        }
        if (options.upsert) {
            return await model.create({ ...where, ...data }, options);
        }
        return null;
    }

    static async deleteOne(model, where, options = {}) {
        return await model.destroy({ where, ...options });
    }

    static async deleteMany(model, where, options = {}) {
        return await model.destroy({ where, ...options });
    }

    static async count(model, where = {}, options = {}) {
        return await model.count({ where, ...options });
    }

    static async findOrCreate(model, where, defaults = {}, options = {}) {
        return await model.findOrCreate({ where, defaults: { ...where, ...defaults }, ...options });
    }

    static async paginate(model, where = {}, { page = 1, perPage = 10, order = [["id", "DESC"]], include, attributes } = {}) {
        const parsedPage = parseInt(page, 10) || 1;
        const parsedLimit = parseInt(perPage, 10) || 10;
        const offset = (parsedPage - 1) * parsedLimit;

        const { count, rows } = await model.findAndCountAll({
            where,
            limit: parsedLimit,
            offset,
            order,
            ...(include && { include }),
            ...(attributes && { attributes }),
        });

        return {
            rows,
            meta: {
                total: count,
                perPage: parsedLimit,
                currentPage: parsedPage,
                lastPage: Math.ceil(count / parsedLimit) || 1,
            },
        };
    }
}

export default commonService;
