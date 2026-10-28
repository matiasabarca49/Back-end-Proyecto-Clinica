class IRepository {
    async findAll(filter = {}, options = {}) {
        throw new Error('Method findAll() must be implemented');
    }

    async findById(id, options = {}) {
        throw new Error('Method findById() must be implemented');
    }

    async findByFilter(filter, options = {}) {
        throw new Error('Method findByFilter() must be implemented');
    }

    async findByQuery(query){
        throw new Error('Method findByQuery() must be implemented');
    }

    async findManyByFilter(filter, options = {}){
        throw new Error('Method findManyByFilter() must be implemented');
    }

    async findPaginate(query, limit, page, sort) {
        throw new Error('Method findPaginate() must be implemented');
    }

    async create(data, options = {}) {
        throw new Error('Method create() must be implemented');
    }

    async createMany(dataArray, options = {}) {
        throw new Error('Method createMany() must be implemented');
    }

    async update(id, data, options = {}) {
        throw new Error('Method update() must be implemented');
    }

    async delete(id, options = {}) {
        throw new Error('Method delete() must be implemented');
    }

    deleteByFilter(filter, options = {}) {
        throw new Error('Method deleteByFilter() must be implemented');
    }

    async deleteManyByFilter(filter, options = {}){
        throw new Error('Method deleteManyByFilter() must be implemented');
    }

    async count(filter = {}) {
        throw new Error('Method count() must be implemented');
    }

    async exists(filter) {
        throw new Error('Method exists() must be implemented');
    }
}

export default IRepository;