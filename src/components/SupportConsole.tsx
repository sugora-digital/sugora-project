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
  selectedFilter?: 'all' | 'open' | 'assigned' | 'resolved';
  onFilterChange?: (filter: 'all' | 'open' | 'assigned' | 'resolved') => void;
}

export default function SupportConsole({ 
  tickets, 
  onResolveTicket,
  selectedFilter,
  onFilterChange 
}: SupportConsoleProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'assigned' | 'resolved'>('all');

  const currentFilter = selectedFilter !== undefined ? selectedFilter : filterStatus;
  const setCurrentFilter = onFilterChange !== undefined ? onFilterChange : setFilterStatus;

  const filteredTickets = tickets.filter(t => {
    if (currentFilter === 'all') return true;
    return t.status === currentFilter;
  });

  return (
    <div id="support-console-wrapper" className="space-y-6 bg-slate-50/20 p-1 md:p-4 rounded-3xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5 border-slate-105 bg-white p-5 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-indigo-600 animate-pulse" />
            Support desk Operations
          </h1>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Resolve user tickets, verify disputes payment files on Razorpay, and authorize wallet revisions.
          </p>
        </div>

        {/* Filters */}
        {!selectedFilter && (
          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-2xl w-fit">
            {(['all', 'open', 'assigned', 'resolved'] as const).map(f => (
              <button
                key={f}
                onClick={() => setCurrentFilter(f)}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold capitalize transition ${
                  currentFilter === f
                    ? 'bg-blue-600 shadow-sm text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      {filteredTickets.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border flex flex-col justify-center items-center shadow-xs">
          <ShieldCheck className="h-10 w-10 text-emerald-500 mb-2 animate-bounce" />
          <h3 className="font-extrabold text-slate-800">Support Desk Queue Pristine</h3>
          <p className="text-xs text-slate-400 max-w-xs mt-1 leading-relaxed">All customer support reports are completely resolved!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {filteredTickets.map(t => (
            <div key={t.id} className="bg-white border p-5 rounded-3xl shadow-sm space-y-4 hover:border-slate-350 transition duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[9.5px] font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg uppercase tracking-wider border border-indigo-100">
                    {t.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">ID: {t.id}</span>
                </div>

                <div className="flex items-center gap-1">
                  <span className={`inline-flex items-center gap-1 text-[10.5px] uppercase font-black ${
                    t.status === 'open' ? 'text-red-600' : t.status === 'assigned' ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {t.status === 'open' ? <AlertTriangle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                    {t.status}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-800 leading-snug">{t.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-2.5 whitespace-pre-wrap">{t.description}</p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t text-xs">
                <div className="flex items-center gap-4 text-[10.5px] text-slate-400">
                  <span className="flex items-center gap-1.5 font-bold"><User className="h-4 w-4" /> Creator: @{t.username}</span>
                  {t.assigned_to && (
                    <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-xl font-extrabold text-slate-600">
                      Representative: {t.assigned_to}
                    </span>
                  )}
                </div>

                {t.status !== 'resolved' && (
                  <button
                    onClick={() => onResolveTicket(t.id)}
                    className="rounded-xl text-xs bg-emerald-600 hover:bg-emerald-700 font-extrabold text-[#FFFFFF] px-4 py-2.5 shadow-sm transition active:scale-95"
                  >
                    Close & Resolve File
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
