
import React from 'react';
import { SpinRecord } from '../types';
import { format } from 'date-fns';

interface HistoryTableProps {
  history: SpinRecord[];
  onClear: () => void;
}

const HistoryTable: React.FC<HistoryTableProps> = ({ history, onClear }) => {
  return (
    <div className="bg-white/95 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-full border-2 border-white/50">
      <div className="p-4 bg-mpt-blue flex justify-between items-center shrink-0">
        <h2 className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-2">
            <span className="text-lg">📜</span> Recent Winners
        </h2>
        {history.length > 0 && (
          <button 
            onClick={onClear}
            className="text-xs font-black uppercase text-mpt-yellow hover:text-white underline transition-colors"
          >
            Clear All
          </button>
        )}
      </div>
      <div className="overflow-y-auto flex-1 custom-scrollbar">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-gray-300">
             <span className="text-5xl mb-3 opacity-50">🎈</span>
             <p className="text-xs font-black uppercase tracking-[0.2em]">No spins recorded yet</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="text-[10px] text-gray-400 uppercase font-black bg-gray-50/80 sticky top-0 z-10">
              <tr>
                <th className="px-5 py-3 border-b border-gray-100">Reward Item</th>
                <th className="px-5 py-3 border-b border-gray-100">Value</th>
                <th className="px-5 py-3 border-b border-gray-100 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.map((record) => (
                <tr key={record.id} className="hover:bg-blue-50/50 transition-colors animate-in fade-in duration-300">
                  <td className="px-5 py-4 text-sm font-black text-gray-700 truncate max-w-[120px]">{record.title}</td>
                  <td className="px-5 py-4 text-sm text-blue-600 font-black">{record.amount}</td>
                  <td className="px-5 py-4 text-[11px] font-bold text-gray-400 text-right">
                    {format(record.timestamp, 'HH:mm')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default HistoryTable;
