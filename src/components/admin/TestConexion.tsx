'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestConexion() {
  const [estado, setEstado] = useState<'verificando' | 'conectado' | 'error'>('verificando');
  const [mensaje, setMensaje] = useState('');
  const [detalles, setDetalles] = useState<any>(null);

  useEffect(() => {
    verificarConexion();
  }, []);

  const verificarConexion = async () => {
    try {
      // Verificar que las variables de entorno existen
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!url || !key || url.includes('xxxxxxxxxx') || key.includes('xxxxxx')) {
        setEstado('error');
        setMensaje('Variables de entorno no configuradas');
        setDetalles({
          url: url || 'NO DEFINIDA',
          key: key ? 'DEFINIDA (pero parece de ejemplo)' : 'NO DEFINIDA'
        });
        return;
      }

      // Intentar hacer una consulta simple
      const { data, error } = await supabase
        .from('productos')
        .select('count')
        .limit(1);

      if (error) {
        setEstado('error');
        setMensaje(`Error de Supabase: ${error.message}`);
        setDetalles(error);
        return;
      }

      setEstado('conectado');
      setMensaje('✅ Conexión exitosa con Supabase');
      setDetalles({ url, data });
    } catch (error: any) {
      setEstado('error');
      setMensaje(`Error: ${error.message}`);
      setDetalles(error);
    }
  };

  return (
    <div className="bg-white rounded-dolce-lg shadow-dolce p-6 mb-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        🔌 Estado de Conexión a Supabase
      </h3>

      {estado === 'verificando' && (
        <div className="flex items-center gap-3">
          <div className="spinner"></div>
          <span className="text-gray-600">Verificando conexión...</span>
        </div>
      )}

      {estado === 'conectado' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-700 font-medium">{mensaje}</p>
          <p className="text-sm text-green-600 mt-2">
            La base de datos está lista para usar
          </p>
        </div>
      )}

      {estado === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-medium mb-2">❌ {mensaje}</p>
          
          <div className="mt-4 bg-white rounded-lg p-3 border border-red-100">
            <p className="text-sm font-medium text-gray-700 mb-2">Pasos para solucionar:</p>
            <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
              <li>Abre el archivo <code className="bg-gray-100 px-1 rounded">.env.local</code></li>
              <li>Ve a <a href="https://app.supabase.com/project/_/settings/api" target="_blank" className="text-blue-600 underline">Supabase → Settings → API</a></li>
              <li>Copia el <strong>Project URL</strong> y <strong>anon public key</strong></li>
              <li>Pégalos en <code className="bg-gray-100 px-1 rounded">.env.local</code></li>
              <li>Reinicia el servidor (Ctrl+C y <code className="bg-gray-100 px-1 rounded">npm run dev</code>)</li>
            </ol>
          </div>

          {detalles && (
            <details className="mt-3">
              <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                Ver detalles técnicos
              </summary>
              <pre className="mt-2 bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(detalles, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}

      <button
        onClick={verificarConexion}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
      >
        🔄 Volver a verificar
      </button>
    </div>
  );
}
