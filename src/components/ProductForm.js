import React, { useState } from 'react';
import ProductService from '../services/ProductService';

const ProductForm = ({ product, onSubmitSuccess }) => {
  const [nome, setNome] = useState(product ? product.nome : '');
  const [categoria, setCategoria] = useState(product ? product.categoria : '');
  const [preco, setPreco] = useState(product ? product.preco : '');
  const [disponivel, setDisponivel] = useState(product ? product.disponivel : true);
  const [sobConsulta, setSobConsulta] = useState(product ? product.sobConsulta : false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const productData = {
      nome,
      categoria,
      preco,
      disponivel,
      sobConsulta
    };

    try {
      if (product) {
        await ProductService.updateProduct(product.id, productData);
      } else {
        await ProductService.createProduct(productData);
      }
      onSubmitSuccess();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nome</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Categoria</label>
        <input
          type="text"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Preço</label>
        <input
          type="number"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          disabled={sobConsulta}
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          checked={disponivel}
          onChange={(e) => setDisponivel(e.target.checked)}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-900">
          Disponível
        </label>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          checked={sobConsulta}
          onChange={(e) => {
            setSobConsulta(e.target.checked);
            if (e.target.checked) {
              setPreco('');
            }
          }}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-900">
          Sob Consulta
        </label>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Salvar
        </button>
      </div>
    </form>
  );
};

export default ProductForm; 