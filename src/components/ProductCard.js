import React from 'react';

const ProductCard = ({ product, onEdit, onDelete }) => {
  const formatPrice = (price, sobConsulta) => {
    if (sobConsulta) {
      return 'Sob Consulta';
    }
    return price ? `R$ ${Number(price).toFixed(2)}` : '';
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{product.nome}</h3>
          <p className="text-sm text-gray-500">{product.categoria}</p>
          <p className="mt-2 text-lg font-semibold text-gray-900">
            {formatPrice(product.preco, product.sobConsulta)}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Status: {product.disponivel ? 'Disponível' : 'Indisponível'}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(product)}
            className="text-indigo-600 hover:text-indigo-900"
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="text-red-600 hover:text-red-900"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 