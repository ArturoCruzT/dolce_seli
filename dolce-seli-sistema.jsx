import React, { useState, useEffect } from 'react';
import { Plus, Clock, Package, Truck, MapPin, DollarSign, Phone, User, CheckCircle, AlertCircle, ChevronRight, Calendar, Edit2, Trash2, X } from 'lucide-react';

// ============= CATÁLOGO DE PRODUCTOS =============
const CATALOGO_PRODUCTOS = {
  individuales: [
    { 
      id: 'seli-mediano', 
      nombre: 'Seli Mediano', 
      precio: 50, 
      descripcion: 'Fresas con crema (12 oz)',
      icono: '🍓',
      categoria: 'individual'
    },
    { 
      id: 'seli-choco', 
      nombre: 'Seli Choco', 
      precio: 35, 
      descripcion: 'Fresas con chocolate semiamargo',
      icono: '🍫',
      categoria: 'individual'
    },
    { 
      id: 'seli-clasico', 
      nombre: 'Seli Clásico', 
      precio: 30, 
      descripcion: 'Fresas con crema (6 oz)',
      icono: '🍓',
      categoria: 'individual'
    }
  ],
  paquetes: [
    { 
      id: 'esencia-seli', 
      nombre: 'Esencia Seli', 
      precio: 65, 
      descripcion: '1 Seli Clásico + 1 Seli Choco',
      icono: '💝',
      categoria: 'paquete',
      items: ['1 Seli Clásico', '1 Seli Choco']
    },
    { 
      id: 'duo-dolce', 
      nombre: 'Dúo Dolce', 
      precio: 90, 
      descripcion: '1 Seli Mediano + 1 Seli Choco',
      icono: '💕',
      categoria: 'paquete',
      items: ['1 Seli Mediano', '1 Seli Choco']
    },
    { 
      id: 'para-compartir', 
      nombre: 'Para Compartir', 
      precio: 100, 
      descripcion: '2 Seli Medianos',
      icono: '🎁',
      categoria: 'paquete',
      items: ['2 Seli Medianos']
    },
    { 
      id: 'familia-seli', 
      nombre: 'Familia Seli', 
      precio: 140, 
      descripcion: '3 Seli Medianos',
      icono: '👨‍👩‍👧',
      categoria: 'paquete',
      items: ['3 Seli Medianos']
    },
    { 
      id: 'momento-dolce', 
      nombre: 'Momento Dolce', 
      precio: 135, 
      descripcion: '2 Seli Medianos',
      icono: '💖',
      categoria: 'paquete',
      items: ['2 Seli Medianos']
    }
  ],
  especiales: [
    { 
      id: 'oreo-especial', 
      nombre: 'Edición Especial Oreo', 
      precio: 79, 
      descripcion: '2 vasos con fresas, crema y Oreo triturado',
      icono: '🎉',
      categoria: 'especial'
    }
  ],
  toppings: [
    { id: 'nuez', nombre: 'Nuez', precio: 5, icono: '🥜' },
    { id: 'coco-rallado', nombre: 'Coco rallado', precio: 5, icono: '🥥' },
    { id: 'chocoreta', nombre: 'Chocoreta', precio: 5, icono: '🍫' },
    { id: 'choco-crispis', nombre: 'ChocoCrispis', precio: 5, icono: '🍪' },
    { id: 'arroz-inflado', nombre: 'Arroz inflado', precio: 5, icono: '🌾' },
    { id: 'krankys', nombre: 'Krankys', precio: 5, icono: '🍬' },
    { id: 'fruti-lupis', nombre: 'Fruti Lupis', precio: 5, icono: '🍭' }
  ]
};

// ============= COMPONENTE PRINCIPAL =============
export default function DolceSeliSistema() {
  const [vista, setVista] = useState('pedidos'); // pedidos, preparacion, entregas
  const [pedidos, setPedidos] = useState([]);
  const [modalNuevoPedido, setModalNuevoPedido] = useState(false);
  const [pedidoActual, setPedidoActual] = useState({
    items: [],
    cliente: '',
    telefono: '',
    direccion: '',
    linkMaps: '',
    horaEntrega: '',
    tipoPago: 'efectivo',
    total: 0,
    estado: 'pendiente',
    timestamp: null
  });
  const [notificaciones, setNotificaciones] = useState([]);

  // Verificar recordatorios cada minuto
  useEffect(() => {
    const intervalo = setInterval(() => {
      verificarRecordatorios();
    }, 60000); // Cada minuto
    return () => clearInterval(intervalo);
  }, [pedidos]);

  const verificarRecordatorios = () => {
    const ahora = new Date();
    pedidos.forEach(pedido => {
      if (pedido.horaEntrega && pedido.estado === 'pendiente') {
        const horaEntrega = new Date(pedido.horaEntrega);
        const diferencia = (horaEntrega - ahora) / (1000 * 60); // Diferencia en minutos
        
        if (diferencia <= 30 && diferencia > 29) {
          mostrarNotificacion(pedido);
        }
      }
    });
  };

  const mostrarNotificacion = (pedido) => {
    const nuevaNotif = {
      id: Date.now(),
      pedido: pedido,
      mensaje: `¡Recuerda preparar el pedido de ${pedido.cliente}! Entrega en 30 minutos.`
    };
    setNotificaciones(prev => [...prev, nuevaNotif]);
    
    // Auto-remover después de 10 segundos
    setTimeout(() => {
      setNotificaciones(prev => prev.filter(n => n.id !== nuevaNotif.id));
    }, 10000);
  };

  const agregarItemPedido = (producto, cantidad = 1) => {
    const nuevoItem = {
      ...producto,
      cantidad,
      toppings: [],
      subtotal: producto.precio * cantidad
    };
    
    const itemsActualizados = [...pedidoActual.items, nuevoItem];
    const nuevoTotal = itemsActualizados.reduce((sum, item) => sum + item.subtotal, 0);
    
    setPedidoActual({
      ...pedidoActual,
      items: itemsActualizados,
      total: nuevoTotal
    });
  };

  const agregarTopping = (indexItem, topping) => {
    const itemsActualizados = [...pedidoActual.items];
    itemsActualizados[indexItem].toppings.push(topping);
    itemsActualizados[indexItem].subtotal += topping.precio;
    
    const nuevoTotal = itemsActualizados.reduce((sum, item) => sum + item.subtotal, 0);
    
    setPedidoActual({
      ...pedidoActual,
      items: itemsActualizados,
      total: nuevoTotal
    });
  };

  const eliminarItem = (index) => {
    const itemsActualizados = pedidoActual.items.filter((_, i) => i !== index);
    const nuevoTotal = itemsActualizados.reduce((sum, item) => sum + item.subtotal, 0);
    
    setPedidoActual({
      ...pedidoActual,
      items: itemsActualizados,
      total: nuevoTotal
    });
  };

  const crearPedido = () => {
    if (pedidoActual.items.length === 0 || !pedidoActual.cliente) {
      alert('Completa el nombre del cliente y agrega al menos un producto');
      return;
    }

    const nuevoPedido = {
      ...pedidoActual,
      id: Date.now(),
      timestamp: new Date(),
      estado: 'pendiente'
    };

    setPedidos([...pedidos, nuevoPedido]);
    
    // Resetear formulario
    setPedidoActual({
      items: [],
      cliente: '',
      telefono: '',
      direccion: '',
      linkMaps: '',
      horaEntrega: '',
      tipoPago: 'efectivo',
      total: 0,
      estado: 'pendiente',
      timestamp: null
    });
    
    setModalNuevoPedido(false);
  };

  const cambiarEstadoPedido = (pedidoId, nuevoEstado) => {
    setPedidos(pedidos.map(p => 
      p.id === pedidoId ? { ...p, estado: nuevoEstado } : p
    ));
  };

  const iniciarEntrega = (pedidoId) => {
    setPedidos(pedidos.map(p => 
      p.id === pedidoId ? { ...p, estado: 'en-camino', horaInicioEntrega: new Date() } : p
    ));
  };

  const completarEntrega = (pedidoId) => {
    setPedidos(pedidos.map(p => 
      p.id === pedidoId ? { ...p, estado: 'entregado', horaEntregaReal: new Date() } : p
    ));
  };

  // Filtrar pedidos por estado
  const pedidosPendientes = pedidos.filter(p => p.estado === 'pendiente');
  const pedidosEnPreparacion = pedidos.filter(p => p.estado === 'preparando');
  const pedidosListosParaEntregar = pedidos.filter(p => p.estado === 'listo');
  const pedidosEnCamino = pedidos.filter(p => p.estado === 'en-camino');
  const pedidosEntregados = pedidos.filter(p => p.estado === 'entregado');

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🍓</div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                  DOLCE SELI
                </h1>
                <p className="text-pink-100 text-sm">Sistema de Gestión de Pedidos</p>
              </div>
            </div>
            
            <button 
              onClick={() => setModalNuevoPedido(true)}
              className="bg-white text-pink-600 px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2"
            >
              <Plus size={20} />
              Nuevo Pedido
            </button>
          </div>
        </div>
      </header>

      {/* Notificaciones */}
      {notificaciones.length > 0 && (
        <div className="fixed top-20 right-4 z-50 space-y-2">
          {notificaciones.map(notif => (
            <div key={notif.id} className="bg-yellow-400 text-yellow-900 px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-bounce">
              <AlertCircle size={24} />
              <div>
                <p className="font-bold">¡Recordatorio!</p>
                <p className="text-sm">{notif.mensaje}</p>
              </div>
              <button 
                onClick={() => setNotificaciones(notif => notif.filter(n => n.id !== notif.id))}
                className="ml-4"
              >
                <X size={20} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Navegación */}
      <nav className="bg-white shadow-md sticky top-16 z-30">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setVista('pedidos')}
              className={`flex-1 py-4 px-6 font-semibold transition-all ${
                vista === 'pedidos' 
                  ? 'bg-pink-500 text-white' 
                  : 'text-gray-600 hover:bg-pink-50'
              }`}
            >
              <Package className="inline mr-2" size={20} />
              Pedidos ({pedidosPendientes.length})
            </button>
            <button
              onClick={() => setVista('preparacion')}
              className={`flex-1 py-4 px-6 font-semibold transition-all ${
                vista === 'preparacion' 
                  ? 'bg-pink-500 text-white' 
                  : 'text-gray-600 hover:bg-pink-50'
              }`}
            >
              <Clock className="inline mr-2" size={20} />
              Preparación ({pedidosEnPreparacion.length})
            </button>
            <button
              onClick={() => setVista('entregas')}
              className={`flex-1 py-4 px-6 font-semibold transition-all ${
                vista === 'entregas' 
                  ? 'bg-pink-500 text-white' 
                  : 'text-gray-600 hover:bg-pink-50'
              }`}
            >
              <Truck className="inline mr-2" size={20} />
              Entregas ({pedidosListosParaEntregar.length + pedidosEnCamino.length})
            </button>
          </div>
        </div>
      </nav>

      {/* Contenido Principal */}
      <main className="container mx-auto px-4 py-8">
        {vista === 'pedidos' && <VistaPedidos pedidos={pedidosPendientes} cambiarEstado={cambiarEstadoPedido} />}
        {vista === 'preparacion' && <VistaPreparacion pedidos={pedidosEnPreparacion} cambiarEstado={cambiarEstadoPedido} />}
        {vista === 'entregas' && (
          <VistaEntregas 
            pedidosListos={pedidosListosParaEntregar}
            pedidosEnCamino={pedidosEnCamino}
            pedidosEntregados={pedidosEntregados}
            iniciarEntrega={iniciarEntrega}
            completarEntrega={completarEntrega}
          />
        )}
      </main>

      {/* Modal Nuevo Pedido */}
      {modalNuevoPedido && (
        <ModalNuevoPedido
          pedidoActual={pedidoActual}
          setPedidoActual={setPedidoActual}
          agregarItemPedido={agregarItemPedido}
          agregarTopping={agregarTopping}
          eliminarItem={eliminarItem}
          crearPedido={crearPedido}
          cerrar={() => setModalNuevoPedido(false)}
        />
      )}

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&family=Pacifico&display=swap');
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

// ============= VISTA PEDIDOS =============
function VistaPedidos({ pedidos, cambiarEstado }) {
  // Ordenar por hora de entrega
  const pedidosOrdenados = [...pedidos].sort((a, b) => {
    if (!a.horaEntrega) return 1;
    if (!b.horaEntrega) return -1;
    return new Date(a.horaEntrega) - new Date(b.horaEntrega);
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pedidosOrdenados.length === 0 ? (
        <div className="col-span-full text-center py-20">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-gray-500 text-xl">No hay pedidos pendientes</p>
        </div>
      ) : (
        pedidosOrdenados.map(pedido => (
          <TarjetaPedido key={pedido.id} pedido={pedido} cambiarEstado={cambiarEstado} />
        ))
      )}
    </div>
  );
}

// ============= TARJETA PEDIDO =============
function TarjetaPedido({ pedido, cambiarEstado }) {
  const [expandido, setExpandido] = useState(false);
  
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden animate-slideIn border-2 border-pink-100">
      <div className="bg-gradient-to-r from-pink-400 to-rose-400 text-white px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <User size={20} />
            <h3 className="font-bold text-lg">{pedido.cliente}</h3>
          </div>
          {pedido.horaEntrega && (
            <div className="bg-white/20 px-3 py-1 rounded-full text-sm flex items-center gap-1">
              <Clock size={16} />
              {new Date(pedido.horaEntrega).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
        <div className="text-pink-100 text-sm flex items-center gap-2">
          <Phone size={16} />
          {pedido.telefono || 'Sin teléfono'}
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-3 mb-4">
          {pedido.items.slice(0, expandido ? pedido.items.length : 2).map((item, idx) => (
            <div key={idx} className="flex items-start justify-between text-sm">
              <div className="flex items-start gap-2">
                <span className="text-2xl">{item.icono}</span>
                <div>
                  <p className="font-semibold text-gray-800">{item.cantidad}x {item.nombre}</p>
                  {item.toppings.length > 0 && (
                    <p className="text-gray-500 text-xs">
                      + {item.toppings.map(t => t.nombre).join(', ')}
                    </p>
                  )}
                </div>
              </div>
              <span className="font-bold text-pink-600">${item.subtotal}</span>
            </div>
          ))}
          
          {pedido.items.length > 2 && !expandido && (
            <button 
              onClick={() => setExpandido(true)}
              className="text-pink-500 text-sm hover:underline"
            >
              Ver {pedido.items.length - 2} más...
            </button>
          )}
        </div>
        
        <div className="border-t-2 border-pink-100 pt-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-gray-700">Total:</span>
            <span className="text-2xl font-bold text-pink-600">${pedido.total}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign size={16} />
            <span className="capitalize">{pedido.tipoPago}</span>
          </div>
        </div>
        
        <button
          onClick={() => cambiarEstado(pedido.id, 'preparando')}
          className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-rose-600 transition-all transform hover:scale-105 shadow-md"
        >
          Iniciar Preparación
        </button>
      </div>
    </div>
  );
}

// ============= VISTA PREPARACIÓN =============
function VistaPreparacion({ pedidos, cambiarEstado }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pedidos.length === 0 ? (
        <div className="col-span-full text-center py-20">
          <div className="text-6xl mb-4">👨‍🍳</div>
          <p className="text-gray-500 text-xl">No hay pedidos en preparación</p>
        </div>
      ) : (
        pedidos.map(pedido => (
          <TarjetaPreparacion key={pedido.id} pedido={pedido} cambiarEstado={cambiarEstado} />
        ))
      )}
    </div>
  );
}

// ============= TARJETA PREPARACIÓN =============
function TarjetaPreparacion({ pedido, cambiarEstado }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-orange-200 animate-slideIn">
      <div className="bg-gradient-to-r from-orange-400 to-amber-400 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Clock className="animate-spin" size={20} />
            {pedido.cliente}
          </h3>
        </div>
      </div>
      
      <div className="p-6">
        <div className="bg-orange-50 rounded-xl p-4 mb-4">
          <h4 className="font-semibold mb-3 text-orange-800">Items a preparar:</h4>
          {pedido.items.map((item, idx) => (
            <div key={idx} className="mb-3 pb-3 border-b border-orange-200 last:border-0">
              <div className="flex items-start gap-2 mb-1">
                <span className="text-3xl">{item.icono}</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">
                    {item.cantidad}x {item.nombre}
                  </p>
                  <p className="text-sm text-gray-600">{item.descripcion}</p>
                  {item.toppings.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {item.toppings.map((topping, tIdx) => (
                        <span key={tIdx} className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs">
                          {topping.icono} {topping.nombre}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <button
          onClick={() => cambiarEstado(pedido.id, 'listo')}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 shadow-md flex items-center justify-center gap-2"
        >
          <CheckCircle size={20} />
          Marcar como Listo
        </button>
      </div>
    </div>
  );
}

// ============= VISTA ENTREGAS =============
function VistaEntregas({ pedidosListos, pedidosEnCamino, pedidosEntregados, iniciarEntrega, completarEntrega }) {
  return (
    <div className="space-y-8">
      {/* Listos para entregar */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Package size={28} className="text-green-500" />
          Listos para Entregar ({pedidosListos.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pedidosListos.length === 0 ? (
            <p className="text-gray-500 col-span-full text-center py-10">No hay pedidos listos</p>
          ) : (
            pedidosListos.map(pedido => (
              <TarjetaEntrega key={pedido.id} pedido={pedido} iniciarEntrega={iniciarEntrega} />
            ))
          )}
        </div>
      </div>

      {/* En camino */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Truck size={28} className="text-blue-500" />
          En Camino ({pedidosEnCamino.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pedidosEnCamino.length === 0 ? (
            <p className="text-gray-500 col-span-full text-center py-10">No hay entregas en camino</p>
          ) : (
            pedidosEnCamino.map(pedido => (
              <TarjetaEnCamino key={pedido.id} pedido={pedido} completarEntrega={completarEntrega} />
            ))
          )}
        </div>
      </div>

      {/* Entregados hoy */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <CheckCircle size={28} className="text-gray-400" />
          Entregados Hoy ({pedidosEntregados.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pedidosEntregados.length === 0 ? (
            <p className="text-gray-500 col-span-full text-center py-10">No hay entregas completadas</p>
          ) : (
            pedidosEntregados.map(pedido => (
              <TarjetaEntregado key={pedido.id} pedido={pedido} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ============= TARJETA ENTREGA =============
function TarjetaEntrega({ pedido, iniciarEntrega }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-green-200 animate-slideIn">
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4">
        <h3 className="font-bold text-lg">{pedido.cliente}</h3>
        <p className="text-green-100 text-sm">{pedido.telefono}</p>
      </div>
      
      <div className="p-6">
        <div className="mb-4">
          <div className="flex items-start gap-2 mb-3">
            <MapPin size={20} className="text-green-500 flex-shrink-0 mt-1" />
            <div>
              <p className="text-gray-800 font-medium">{pedido.direccion || 'Sin dirección'}</p>
              {pedido.linkMaps && (
                <a 
                  href={pedido.linkMaps} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 text-sm hover:underline flex items-center gap-1 mt-1"
                >
                  Abrir en Maps <ChevronRight size={16} />
                </a>
              )}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <p className="text-sm text-gray-600 mb-2">Resumen del pedido:</p>
            {pedido.items.map((item, idx) => (
              <p key={idx} className="text-sm">
                {item.cantidad}x {item.nombre}
              </p>
            ))}
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-gray-700">Total:</span>
            <span className="text-xl font-bold text-green-600">${pedido.total}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <DollarSign size={16} />
            <span className="capitalize font-medium">{pedido.tipoPago}</span>
          </div>
        </div>
        
        <button
          onClick={() => iniciarEntrega(pedido.id)}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all transform hover:scale-105 shadow-md flex items-center justify-center gap-2"
        >
          <Truck size={20} />
          Iniciar Entrega
        </button>
      </div>
    </div>
  );
}

// ============= TARJETA EN CAMINO =============
function TarjetaEnCamino({ pedido, completarEntrega }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-blue-300 animate-slideIn">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Truck className="animate-pulse" size={20} />
            {pedido.cliente}
          </h3>
        </div>
        <p className="text-blue-100 text-sm">{pedido.telefono}</p>
      </div>
      
      <div className="p-6">
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-2 mb-3">
            <MapPin size={20} className="text-blue-500 flex-shrink-0" />
            <p className="text-gray-800 font-medium">{pedido.direccion}</p>
          </div>
          {pedido.linkMaps && (
            <a 
              href={pedido.linkMaps} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 font-semibold hover:underline flex items-center gap-1"
            >
              Ver ubicación en Maps <ChevronRight size={16} />
            </a>
          )}
        </div>
        
        <div className="mb-4 text-center">
          <p className="text-2xl font-bold text-blue-600">${pedido.total}</p>
          <p className="text-sm text-gray-600 capitalize">{pedido.tipoPago}</p>
        </div>
        
        <button
          onClick={() => completarEntrega(pedido.id)}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 shadow-md flex items-center justify-center gap-2"
        >
          <CheckCircle size={20} />
          Marcar como Entregado
        </button>
      </div>
    </div>
  );
}

// ============= TARJETA ENTREGADO =============
function TarjetaEntregado({ pedido }) {
  return (
    <div className="bg-gray-50 rounded-2xl shadow-md overflow-hidden border-2 border-gray-200 opacity-75">
      <div className="bg-gray-400 text-white px-6 py-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <CheckCircle size={20} />
          {pedido.cliente}
        </h3>
      </div>
      
      <div className="p-6">
        <p className="text-gray-600 text-sm mb-2">Entregado a las {new Date(pedido.horaEntregaReal).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</p>
        <p className="text-xl font-bold text-gray-700">${pedido.total}</p>
      </div>
    </div>
  );
}

// ============= MODAL NUEVO PEDIDO =============
function ModalNuevoPedido({ pedidoActual, setPedidoActual, agregarItemPedido, agregarTopping, eliminarItem, crearPedido, cerrar }) {
  const [vista, setVista] = useState('productos'); // productos, detalles
  const [itemSeleccionado, setItemSeleccionado] = useState(null);
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-3xl font-bold mb-1">Nuevo Pedido</h2>
            <p className="text-pink-100">Selecciona los productos y completa los datos</p>
          </div>
          <button onClick={cerrar} className="text-white hover:bg-white/20 p-2 rounded-full transition-all">
            <X size={28} />
          </button>
        </div>
        
        <div className="flex border-b">
          <button
            onClick={() => setVista('productos')}
            className={`flex-1 py-4 font-semibold transition-all ${
              vista === 'productos' ? 'bg-pink-50 text-pink-600 border-b-2 border-pink-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            1. Productos ({pedidoActual.items.length})
          </button>
          <button
            onClick={() => setVista('detalles')}
            className={`flex-1 py-4 font-semibold transition-all ${
              vista === 'detalles' ? 'bg-pink-50 text-pink-600 border-b-2 border-pink-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            2. Datos del Cliente
          </button>
        </div>
        
        <div className="p-8">
          {vista === 'productos' ? (
            <VistaProductos 
              agregarItemPedido={agregarItemPedido}
              pedidoActual={pedidoActual}
              eliminarItem={eliminarItem}
              agregarTopping={agregarTopping}
              itemSeleccionado={itemSeleccionado}
              setItemSeleccionado={setItemSeleccionado}
            />
          ) : (
            <VistaDetallesCliente 
              pedidoActual={pedidoActual}
              setPedidoActual={setPedidoActual}
              crearPedido={crearPedido}
            />
          )}
        </div>
        
        {/* Footer con total */}
        <div className="sticky bottom-0 bg-gray-50 px-8 py-6 border-t-2 border-pink-200 flex items-center justify-between">
          <div>
            <p className="text-gray-600 mb-1">Total del pedido:</p>
            <p className="text-4xl font-bold text-pink-600">${pedidoActual.total}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={cerrar}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
            >
              Cancelar
            </button>
            {vista === 'productos' && pedidoActual.items.length > 0 && (
              <button
                onClick={() => setVista('detalles')}
                className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg"
              >
                Continuar →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============= VISTA PRODUCTOS =============
function VistaProductos({ agregarItemPedido, pedidoActual, eliminarItem, agregarTopping, itemSeleccionado, setItemSeleccionado }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Catálogo */}
      <div className="lg:col-span-2 space-y-8">
        {/* Paquetes */}
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            💝 Paquetes Dolce
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {CATALOGO_PRODUCTOS.paquetes.map(producto => (
              <button
                key={producto.id}
                onClick={() => agregarItemPedido(producto)}
                className="bg-gradient-to-br from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 p-4 rounded-xl border-2 border-pink-200 hover:border-pink-400 transition-all transform hover:scale-105 text-left"
              >
                <div className="text-4xl mb-2">{producto.icono}</div>
                <h4 className="font-bold text-gray-800 mb-1">{producto.nombre}</h4>
                <p className="text-xs text-gray-600 mb-2">{producto.descripcion}</p>
                <p className="text-2xl font-bold text-pink-600">${producto.precio}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Individuales */}
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            🍓 Individuales
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {CATALOGO_PRODUCTOS.individuales.map(producto => (
              <button
                key={producto.id}
                onClick={() => agregarItemPedido(producto)}
                className="bg-gradient-to-br from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 p-4 rounded-xl border-2 border-pink-200 hover:border-pink-400 transition-all transform hover:scale-105 text-left"
              >
                <div className="text-4xl mb-2">{producto.icono}</div>
                <h4 className="font-bold text-gray-800 mb-1">{producto.nombre}</h4>
                <p className="text-xs text-gray-600 mb-2">{producto.descripcion}</p>
                <p className="text-2xl font-bold text-pink-600">${producto.precio}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Especiales */}
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            🎉 Ediciones Especiales
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {CATALOGO_PRODUCTOS.especiales.map(producto => (
              <button
                key={producto.id}
                onClick={() => agregarItemPedido(producto)}
                className="bg-gradient-to-br from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 p-4 rounded-xl border-2 border-red-200 hover:border-red-400 transition-all transform hover:scale-105 text-left"
              >
                <div className="text-4xl mb-2">{producto.icono}</div>
                <h4 className="font-bold text-gray-800 mb-1">{producto.nombre}</h4>
                <p className="text-xs text-gray-600 mb-2">{producto.descripcion}</p>
                <p className="text-2xl font-bold text-red-600">${producto.precio}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resumen del pedido */}
      <div className="lg:col-span-1">
        <div className="sticky top-4 bg-white rounded-2xl border-2 border-pink-200 p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Pedido Actual</h3>
          
          {pedidoActual.items.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Agrega productos al pedido</p>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {pedidoActual.items.map((item, idx) => (
                <div key={idx} className="bg-pink-50 rounded-lg p-4 relative">
                  <button
                    onClick={() => eliminarItem(idx)}
                    className="absolute top-2 right-2 text-red-500 hover:bg-red-100 p-1 rounded-full"
                  >
                    <Trash2 size={16} />
                  </button>
                  
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-3xl">{item.icono}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{item.cantidad}x {item.nombre}</p>
                      <p className="text-sm text-gray-600">${item.precio} c/u</p>
                    </div>
                  </div>
                  
                  {/* Toppings */}
                  {item.toppings.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-600 mb-2">Toppings:</p>
                      <div className="flex flex-wrap gap-1">
                        {item.toppings.map((topping, tIdx) => (
                          <span key={tIdx} className="bg-white px-2 py-1 rounded-full text-xs">
                            {topping.icono} {topping.nombre}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={() => setItemSeleccionado(itemSeleccionado === idx ? null : idx)}
                    className="text-pink-600 text-sm hover:underline flex items-center gap-1"
                  >
                    <Plus size={14} />
                    Agregar topping
                  </button>
                  
                  {itemSeleccionado === idx && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {CATALOGO_PRODUCTOS.toppings.map(topping => (
                        <button
                          key={topping.id}
                          onClick={() => {
                            agregarTopping(idx, topping);
                            setItemSeleccionado(null);
                          }}
                          className="bg-white hover:bg-pink-100 p-2 rounded-lg text-xs border border-pink-200 transition-all"
                        >
                          <span className="text-lg">{topping.icono}</span>
                          <p className="font-medium">{topping.nombre}</p>
                          <p className="text-pink-600">+${topping.precio}</p>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-3 pt-3 border-t border-pink-200 flex justify-between items-center">
                    <span className="text-sm text-gray-600">Subtotal:</span>
                    <span className="font-bold text-pink-600">${item.subtotal}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============= VISTA DETALLES CLIENTE =============
function VistaDetallesCliente({ pedidoActual, setPedidoActual, crearPedido }) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <label className="block text-gray-700 font-semibold mb-2">Nombre del Cliente *</label>
        <input
          type="text"
          value={pedidoActual.cliente}
          onChange={(e) => setPedidoActual({ ...pedidoActual, cliente: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none"
          placeholder="Ej: María González"
        />
      </div>
      
      <div>
        <label className="block text-gray-700 font-semibold mb-2">Teléfono</label>
        <input
          type="tel"
          value={pedidoActual.telefono}
          onChange={(e) => setPedidoActual({ ...pedidoActual, telefono: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none"
          placeholder="Ej: 5512345678"
        />
      </div>
      
      <div>
        <label className="block text-gray-700 font-semibold mb-2">Dirección de Entrega</label>
        <textarea
          value={pedidoActual.direccion}
          onChange={(e) => setPedidoActual({ ...pedidoActual, direccion: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none"
          rows="3"
          placeholder="Ej: Calle Principal #123, Col. Centro"
        />
      </div>
      
      <div>
        <label className="block text-gray-700 font-semibold mb-2">Link de Google Maps (opcional)</label>
        <input
          type="url"
          value={pedidoActual.linkMaps}
          onChange={(e) => setPedidoActual({ ...pedidoActual, linkMaps: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none"
          placeholder="https://maps.google.com/..."
        />
      </div>
      
      <div>
        <label className="block text-gray-700 font-semibold mb-2">Hora de Entrega (opcional)</label>
        <input
          type="datetime-local"
          value={pedidoActual.horaEntrega}
          onChange={(e) => setPedidoActual({ ...pedidoActual, horaEntrega: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none"
        />
        <p className="text-sm text-gray-500 mt-1">Si no se especifica, se mostrará en orden de registro</p>
      </div>
      
      <div>
        <label className="block text-gray-700 font-semibold mb-2">Tipo de Pago</label>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setPedidoActual({ ...pedidoActual, tipoPago: 'efectivo' })}
            className={`py-3 rounded-xl font-semibold transition-all ${
              pedidoActual.tipoPago === 'efectivo'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            💵 Efectivo
          </button>
          <button
            onClick={() => setPedidoActual({ ...pedidoActual, tipoPago: 'tarjeta' })}
            className={`py-3 rounded-xl font-semibold transition-all ${
              pedidoActual.tipoPago === 'tarjeta'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            💳 Tarjeta
          </button>
          <button
            onClick={() => setPedidoActual({ ...pedidoActual, tipoPago: 'transferencia' })}
            className={`py-3 rounded-xl font-semibold transition-all ${
              pedidoActual.tipoPago === 'transferencia'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🏦 Transferencia
          </button>
        </div>
      </div>
      
      <div className="pt-6">
        <button
          onClick={crearPedido}
          disabled={!pedidoActual.cliente || pedidoActual.items.length === 0}
          className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-4 rounded-xl font-bold text-lg hover:from-pink-600 hover:to-rose-600 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          Crear Pedido - ${pedidoActual.total}
        </button>
      </div>
    </div>
  );
}
