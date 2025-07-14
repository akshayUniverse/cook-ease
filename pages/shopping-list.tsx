import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';

interface ShoppingListItem {
  id: string;
  item: string;
  amount: string;
  recipeId?: string;
  completed: boolean;
  createdAt: string;
}

export default function ShoppingList() {
  const { user } = useAuth();
  const router = useRouter();
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }
    fetchShoppingList();
  }, [user, router]);

  const fetchShoppingList = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/shopping-list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setShoppingList(data);
      } else {
        setError('Failed to fetch shopping list');
      }
    } catch (err) {
      setError('Error loading shopping list');
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = async (itemId: string, completed: boolean) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`/api/shopping-list/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ completed: !completed })
      });

      if (response.ok) {
        setShoppingList(prev => 
          prev.map(item => 
            item.id === itemId ? { ...item, completed: !completed } : item
          )
        );
      }
    } catch (err) {
      console.error('Error updating item:', err);
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`/api/shopping-list/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setShoppingList(prev => prev.filter(item => item.id !== itemId));
      }
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  const clearCompleted = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const completedItems = shoppingList.filter(item => item.completed);
      
      await Promise.all(
        completedItems.map(item => 
          fetch(`/api/shopping-list/${item.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        )
      );

      setShoppingList(prev => prev.filter(item => !item.completed));
    } catch (err) {
      console.error('Error clearing completed items:', err);
    }
  };

  const clearAll = async () => {
    if (!confirm('Are you sure you want to clear all items?')) return;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/shopping-list', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setShoppingList([]);
      }
    } catch (err) {
      console.error('Error clearing all items:', err);
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>Shopping List | CookEase</title>
        </Head>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500">Loading shopping list...</p>
          </div>
        </div>
      </>
    );
  }

  const pendingItems = shoppingList.filter(item => !item.completed);
  const completedItems = shoppingList.filter(item => item.completed);

  return (
    <>
      <Head>
        <title>Shopping List | CookEase</title>
        <meta name="description" content="Manage your shopping list" />
      </Head>
      <Header />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              🛒 Shopping List
            </h1>
            <div className="flex space-x-2">
              {completedItems.length > 0 && (
                <button
                  onClick={clearCompleted}
                  className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors text-sm"
                >
                  Clear Completed
                </button>
              )}
              {shoppingList.length > 0 && (
                <button
                  onClick={clearAll}
                  className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors text-sm"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {shoppingList.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Your shopping list is empty</h2>
              <p className="text-gray-500 mb-4">
                Start by adding ingredients from your favorite recipes!
              </p>
              <button
                onClick={() => router.push('/home')}
                className="px-6 py-3 bg-primary text-white rounded-full hover:bg-orange-700 transition-colors"
              >
                Browse Recipes
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Pending Items */}
              {pendingItems.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    To Buy ({pendingItems.length})
                  </h2>
                  <div className="space-y-3">
                    {pendingItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => toggleItem(item.id, item.completed)}
                            className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                          <div>
                            <div className="font-medium">
                              {item.amount} {item.item}
                            </div>
                            <div className="text-sm text-gray-500">
                              Added {new Date(item.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Items */}
              {completedItems.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Completed ({completedItems.length})
                  </h2>
                  <div className="space-y-3">
                    {completedItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => toggleItem(item.id, item.completed)}
                            className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                          />
                          <div>
                            <div className="font-medium text-green-700 line-through">
                              {item.amount} {item.item}
                            </div>
                            <div className="text-sm text-green-600">
                              Completed
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
} 