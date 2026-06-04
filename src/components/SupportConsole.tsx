/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HelpCircle, CheckCircle, Clock, User, AlertTriangle, ShieldCheck, MessageSquare } from 'lucide-react';
import { SupportTicket } from '../types';

interface SupportConsoleProps {
  tickets: SupportTicket[];
  onResolveTicket: (ticketId: string) => void;
}

export default function SupportConsole({ tickets, onResolveTicket }: SupportConsoleProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'assigned' | 'resolved'>('all');

  const filteredTickets = tickets.filter(t => {
    if (filterStatus === 'all') return true;
    return t.status === filterStatus;
  });

  return (
    <div id="support-console-root" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 border-gray-50 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-teal-600 animate-pulse" />
            Sugora Support Representative Console
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Resolve user complaints, verify disputed payment logs, and ensure seamless portal operations.
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-1 bg-gray-50 dark:bg-zinc-900 p-1 rounded-xl">
          {(['all', 'open', 'assigned', 'resolved'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                filterStatus === f
                  ? 'bg-white text-teal-700 shadow-xs dark:bg-zinc-800 dark:text-zinc-100'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filteredTickets.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 p-12 text-center rounded-2xl border flex flex-col justify-center items-center">
          <ShieldCheck className="h-10 w-10 text-emerald-500 mb-2" />
          <h3 className="font-bold text-gray-900 dark:text-zinc-200">Representative Queue Pristine</h3>
          <p className="text-xs text-gray-400 max-w-xs mt-1">No active reports match the filter setting.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTickets.map(t => (
            <div key={t.id} className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/60 p-5 rounded-2xl shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-50 dark:bg-teal-950/20 px-2 py-0.5 rounded uppercase">
                    {t.category}
                  </span>
                  <span className="text-[11px] font-mono text-gray-400">ID: {t.id}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold ${
                    t.status === 'open' ? 'text-red-500' : t.status === 'assigned' ? 'text-amber-500' : 'text-emerald-500'
                  }`}>
                    {t.status === 'open' ? <AlertTriangle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                    {t.status}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-zinc-100">{t.title}</h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed mt-1.5 whitespace-pre-wrap">{t.description}</p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-50 dark:border-zinc-800/10">
                <div className="flex items-center gap-4 text-[10px] text-gray-400">
                  <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> Filed by: @{t.username}</span>
                  {t.assigned_to && (
                    <span className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded font-bold">
                      Assigned to: {t.assigned_to}
                    </span>
                  )}
                </div>

                {t.status !== 'resolved' && (
                  <button
                    onClick={() => onResolveTicket(t.id)}
                    className="self-start sm:self-center text-xs bg-teal-600 hover:bg-teal-700 font-bold text-white px-4 py-2 rounded-xl shadow-xs transition active:scale-95"
                  >
                    Mark as Resolved
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
