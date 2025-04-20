// app/admin/products/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminProductsPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    price: '',
    imageUrl: '',
    description: ''
  });
  
  useEffect(() => {
    fetchProducts();
  }, []);
  
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/products');
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOpenForm = (mode, product = null) => {
    if (mode === 'add') {
      setFormData({
        id: '',
        name: '',
        price: '',
        imageUrl: '',
        description: ''
      });
    } else if (mode === 'edit' && product) {
      setFormData({
        id: product.id,
        name: product.name,
        price: product.price.toString(),
        imageUrl: product.imageUrl,
        description: product.description || ''
      });
    }
    
    setFormMode(mode);
    setIsFormOpen(true);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let response;
      
      if (formMode === 'add') {
        response = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            price: parseFloat(formData.price),
            imageUrl: formData.imageUrl,
            description: formData.description || `Delicious ${formData.name}`,
            inStock: true
          })
        });
      } else {
        response = await fetch(`/api/products/${formData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            price: parseFloat(formData.price),
            imageUrl: formData.imageUrl,
            description: formData.description
          })
        });
      }
      
      if (!response.ok) {
        throw new Error('Failed to save product');
      }
      
      fetchProducts();
      setIsFormOpen(false);
    } catch (error) {
      alert('Error saving product: ' + error.message);
    }
  };
  
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      
      fetchProducts();
    } catch (error) {
      alert('Error deleting product: ' + error.message);
    }
  };
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }
    
    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const data = await response.json();
      
      setFormData(prev => ({
        ...prev,
        imageUrl: data.url
      }));
    } catch (error) {
      alert('Error uploading image: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };
  
  if (isLoading) {
    return <div className="p-4 text-center">Loading products...</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manage Products</h1>
        <button
          onClick={() => handleOpenForm('add')}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          Add New Dessert
        </button>
      </div>
      
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map(product => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-16 w-16 relative">
                    <Image 
                      src={product.imageUrl} 
                      alt={product.name} 
                      fill 
                      style={{objectFit: 'cover'}} 
                      className="rounded" 
                    />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">${product.price.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <button
                    onClick={() => handleOpenForm('edit', product)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Product Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">{formMode === 'add' ? 'Add New Dessert' : 'Edit Dessert'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Price ($)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                  rows={3}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Image</label>
                
                {formData.imageUrl && (
                  <div className="mb-2">
                    <div className="relative h-40 w-full mb-2">
                      <Image 
                        src={formData.imageUrl} 
                        alt="Product preview" 
                        fill 
                        className="object-contain rounded"
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex items-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded mr-2"
                    disabled={isUploading}
                  >
                    {isUploading ? 'Uploading...' : 'Upload Image'}
                  </button>
                  <span className="text-sm text-gray-500">or</span>
                </div>
                
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Enter image URL"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                  disabled={!formData.imageUrl || !formData.name || !formData.price}
                >
                  {formMode === 'add' ? 'Add' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}