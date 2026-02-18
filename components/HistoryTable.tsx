
import React from 'react';
import { SpinRecord } from '../types';
import { format } from 'date-fns';

interface HistoryTableProps {
  history: SpinRecord[];
  onClear: () => void;
}

const HistoryTable: React.FC<HistoryTableProps> = ({ history, onClear }) => {
  return (
    <div className="bg-white/95 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-full border-2 border-white/50">
      <div className="p-5 bg-mpt-blue flex justify-between items-center shrink-0">
        <h2 className="text-white font-black text-base uppercase tracking-widest flex items-center gap-3">
            <span className="text-2xl">📜</span> Recent Winners
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
          <div className="flex flex-col items-center justify-center h-full min-h-[250px] text-gray-300">
             <span className="text-6xl mb-4 opacity-50">🎈</span>
             <p className="text-sm font-black uppercase tracking-[0.25em] text-center px-6 leading-relaxed">No shout records yet. Be the first to win!</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="text-[12px] text-gray-400 uppercase font-black bg-gray-50/80 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 border-b border-gray-100">Reward</th>
                <th className="px-6 py-4 border-b border-gray-100">Value</th>
                <th className="px-6 py-4 border-b border-gray-100 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.map((record) => (
                <tr key={record.id} className="hover:bg-blue-50/50 transition-colors animate-in fade-in duration-300">
                  <td className="px-6 py-5 text-base font-black text-gray-700 truncate max-w-[130px]">{record.title}</td>
                  <td className="px-6 py-5 text-base text-blue-600 font-black">{record.amount}</td>
                  <td className="px-6 py-5 text-[13px] font-bold text-gray-400 text-right">
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
