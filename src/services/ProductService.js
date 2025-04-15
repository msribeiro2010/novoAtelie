  static async createProduct(productData) {
    try {
      const { nome, categoria, preco, disponivel, sobConsulta } = productData;
      const response = await api.post('/produtos', {
        nome,
        categoria,
        preco: sobConsulta ? null : preco,
        disponivel,
        sobConsulta
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async updateProduct(id, productData) {
    try {
      const { nome, categoria, preco, disponivel, sobConsulta } = productData;
      const response = await api.put(`/produtos/${id}`, {
        nome,
        categoria,
        preco: sobConsulta ? null : preco,
        disponivel,
        sobConsulta
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  } 