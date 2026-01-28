class SessionRepository {
    // Métodos del repositorio de sesiones
    
  async create(session){
    throw new Error('Method count() must be implemented');
  }
  async findById(sessionId) {
    throw new Error('Method findById() must be implemented');
  }
  async delete(sessionId) {
    throw new Error('Method delete() must be implemented');
  }
  async deleteByUserId(userId) {
    throw new Error('Method deleteByUserId() must be implemented');
  }
}

export default SessionRepository;