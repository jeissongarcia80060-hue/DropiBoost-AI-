import React, { useState, useEffect } from 'react';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null); // Estado para el producto ampliado

  // Estado del Formulario
  const [formData, setFormData] = useState({
    name: '',
    category: 'General',
    provider_price: '',
    stock: 100,
    image_url: '',
    description: ''
  });

  const [simulation, setSimulation] = useState(null);

  const loadProducts = () => {
    fetch('http://127.0.0.1:8000/api/products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar productos:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Función para eliminar producto con confirmación
  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Evita abrir el modal de detalles al hacer clic en la papelera
    if (window.confirm("¿Estás seguro de que deseas eliminar este producto del catálogo?")) {
      try {
        await fetch(`http://127.0.0.1:8000/api/products/${id}`, {
          method: 'DELETE',
        });
        loadProducts();
      } catch (err) {
        console.error("Error al eliminar el producto:", err);
      }
    }
  };

  const handleSimulate = async () => {
    if (!formData.provider_price) return;
    const res = await fetch('http://127.0.0.1:8000/api/products/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    setSimulation(data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!simulation) return;

    const payload = {
      ...formData,
      provider_price: parseFloat(formData.provider_price),
      suggested_price: simulation.precio_sugerido,
      potential_profit: simulation.ganancia_neta_estimada,
      stock: parseInt(formData.stock)
    };

    await fetch('http://127.0.0.1:8000/api/products/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    setShowModal(false);
    setSimulation(null);
    setFormData({ name: '', category: 'General', provider_price: '', stock: 100, image_url: '', description: '' });
    loadProducts();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 py-6 px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-wider text-emerald-400">⚡ DropiPulse Pro</h1>
            <p className="text-xs text-slate-400">Cotizador de Envíos & Evaluador Inteligente Colombia 🇨🇴</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-5 py-2.5 rounded-lg shadow-lg text-sm transition-all flex items-center gap-2"
          >
            ➕ Evaluar Nuevo Producto
          </button>
        </div>
      </header>

      {/* Catálogo de Productos */}
      <main className="max-w-7xl mx-auto py-8 px-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-1">Productos Analizados en Catálogo</h2>
          <p className="text-sm text-slate-400">Haz clic en cualquier producto para ampliar su información y detalles.</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400">Cargando catálogo...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div 
                key={product.id} 
                onClick={() => setSelectedProduct(product)}
                className="bg-slate-800 border border-slate-700 hover:border-emerald-500/60 rounded-xl overflow-hidden shadow-lg relative flex flex-col justify-between cursor-pointer transition-all group"
              >
                <div>
                  <div className="relative h-48 bg-slate-700 overflow-hidden">
                    <img 
                      src={product.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" 
                    />
                    
                    {/* Botón de eliminar discreto integrado */}
                    <button 
                      onClick={(e) => handleDelete(e, product.id)}
                      className="absolute top-3 left-3 bg-slate-900/80 hover:bg-slate-900 text-slate-400 hover:text-red-400 p-1.5 rounded-full text-xs shadow border border-slate-700/80 transition-all flex items-center justify-center w-7 h-7 backdrop-blur-sm z-10"
                      title="Eliminar producto"
                    >
                      🗑️
                    </button>

                    <div className="absolute top-3 right-3 bg-slate-900/90 border border-slate-700 px-3 py-1 rounded-full text-xs font-bold text-emerald-400 backdrop-blur-sm">
                      Score: {product.score}/100
                    </div>
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-medium text-emerald-400 uppercase">{product.category}</span>
                    <h3 className="text-lg font-bold text-white mt-1 mb-2 line-clamp-1">{product.name}</h3>
                    <div className="grid grid-cols-2 gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 text-xs mb-3">
                      <div><span className="text-slate-400 block">Costo Dropi:</span><span className="font-semibold text-slate-200">${product.provider_price?.toLocaleString()} COP</span></div>
                      <div><span className="text-slate-400 block">Venta Sugerida:</span><span className="font-semibold text-emerald-400">${product.suggested_price?.toLocaleString()} COP</span></div>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-0">
                  <div className="text-xs text-slate-400 flex justify-between border-t border-slate-700/60 pt-3">
                    <span>Ganancia Est.: <strong className="text-emerald-400">${product.potential_profit?.toLocaleString()} COP</strong></span>
                    <span>Potencial: <strong className="text-white">{product.commercial_potential}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 🔍 MODAL DE DETALLES Y AMPLIACIÓN DE IMAGEN */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4 z-50" onClick={() => setSelectedProduct(null)}>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-900/80 p-2 rounded-full w-8 h-8 flex items-center justify-center border border-slate-700 transition-all z-10"
            >
              ✕
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Imagen Ampliada */}
              <div className="relative h-64 md:h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-700/60">
                <img 
                  src={selectedProduct.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"} 
                  alt={selectedProduct.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-700 px-3 py-1 rounded-full text-xs font-bold text-emerald-400">
                  Score: {selectedProduct.score}/100
                </div>
              </div>

              {/* Información Detallada */}
              <div className="flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">{selectedProduct.category}</span>
                  <h3 className="text-xl font-bold text-white mt-1 mb-2">{selectedProduct.name}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 mb-4">
                    {selectedProduct.description || "Sin descripción detallada registrada para este producto en el sistema."}
                  </p>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/50">
                      <span className="text-slate-400">Costo Proveedor Dropi:</span>
                      <span className="font-bold text-slate-200">${selectedProduct.provider_price?.toLocaleString()} COP</span>
                    </div>
                    <div className="flex justify-between bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/50">
                      <span className="text-slate-400">Precio Venta Sugerido:</span>
                      <span className="font-bold text-emerald-400">${selectedProduct.suggested_price?.toLocaleString()} COP</span>
                    </div>
                    <div className="flex justify-between bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/50">
                      <span className="text-slate-400">Ganancia Estimada:</span>
                      <span className="font-bold text-emerald-400">${selectedProduct.potential_profit?.toLocaleString()} COP</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs border-t border-slate-700 pt-3 text-slate-400">
                  <span>Potencial Comercial: <strong className="text-white">{selectedProduct.commercial_potential}</strong></span>
                  <span>Stock Actual: <strong className="text-white">{selectedProduct.stock} un.</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ➕ MODAL DE EVALUACIÓN Y COTIZADOR DROPI */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
              <h3 className="text-xl font-bold text-emerald-400">🔍 Evaluador en Tiempo Real & Cotizador Dropi</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Formulario */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre del Producto</label>
                  <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ej: Smartwatch T800 Ultra" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Categoría</label>
                  <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Costo Proveedor en Dropi (COP)</label>
                  <input type="number" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-emerald-400 font-bold focus:outline-none focus:border-emerald-500" value={formData.provider_price} onChange={e => setFormData({...formData, provider_price: e.target.value})} placeholder="Ej: 25000" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">URL Imagen (Opcional)</label>
                  <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Descripción</label>
                  <textarea className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white" rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Descripción del producto..."></textarea>
                </div>

                <button type="button" onClick={handleSimulate} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-lg shadow text-sm transition-all">
                  ⚡ Simular Precio & Cotizar Envíos
                </button>
              </div>

              {/* Resultados de Simulación */}
              <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-700/80 flex flex-col justify-between">
                {simulation ? (
                  <div className="space-y-4">
                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-lg text-center">
                      <span className="text-xs text-slate-400 block">Precio de Venta Sugerido (30% Margen Neto):</span>
                      <span className="text-2xl font-black text-emerald-400">${simulation.precio_sugerido.toLocaleString()} COP</span>
                      <span className="text-xs text-slate-300 block mt-1">Ganancia Estimada: <strong>${simulation.ganancia_neta_estimada.toLocaleString()} COP / venta</strong></span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">🚚 Cotización Envíos Dropi Colombia (Contra Entrega):</h4>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {simulation.cotizaciones_envio.map(c => (
                          <div key={c.key} className="flex justify-between items-center bg-slate-800 p-2 rounded border border-slate-700 text-xs">
                            <span className="font-semibold text-slate-200">{c.nombre}</span>
                            <div className="text-right">
                              <span className="text-emerald-400 font-bold block">${c.costo_total_envio.toLocaleString()} COP</span>
                              <span className="text-[10px] text-slate-400">Flete: ${c.flete_base.toLocaleString()} + Recaudo: ${c.comision_recaudo.toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button type="button" onClick={handleCreate} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2.5 rounded-lg shadow text-sm transition-all">
                      💾 Guardar en Catálogo con Score {simulation.analysis.score}/100
                    </button>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-center text-slate-500 text-xs py-10">
                    Ingresa el costo del producto y haz clic en "Simular Precio & Cotizar Envíos" para calcular fletes con Inter Rapidísimo, Servientrega, Coordinadora, Envía y TCC.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;