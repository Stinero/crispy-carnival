
import React from 'react';
import { BudgetTotals, ChargeRecord } from '../types';
import { DollarSignIcon, ZapIcon } from '../constants';

const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="bg-gray-100/70 dark:bg-gray-800/50 p-4 rounded-xl flex items-center gap-4 border border-gray-200 dark:border-gray-700/50 shadow-sm">
        <div className="text-blue-500 dark:text-blue-400 p-3 bg-blue-100/50 dark:bg-blue-900/30 rounded-full">{icon}</div>
        <div>
            <p className="text-xl font-bold text-gray-800 dark:text-white">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
        </div>
    </div>
);

const CostTracker: React.FC<{ budgetTotals: BudgetTotals; costHistory: ChargeRecord[] }> = ({ budgetTotals, costHistory }) => {
    
    const totalTokens = budgetTotals.prompt_tokens + budgetTotals.completion_tokens;

    return (
        <div className="h-full flex flex-col p-4 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4 mb-6">
                <StatCard 
                    label="Session Cost" 
                    value={`$${budgetTotals.cost_usd.toFixed(5)}`}
                    icon={<DollarSignIcon />}
                />
                <StatCard 
                    label="Total Tokens"
                    value={totalTokens.toLocaleString()}
                    icon={<ZapIcon />}
                />
            </div>
            
            <h3 className="font-semibold mb-3 text-lg text-gray-800 dark:text-gray-200">Charge History</h3>
            
            {costHistory.length === 0 ? (
                <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-8 bg-gray-100 dark:bg-gray-800/30 rounded-lg">
                    No API calls have been made in this session yet.
                </div>
            ) : (
                <div className="space-y-2">
                    {[...costHistory].reverse().map((record, index) => (
                        <div key={index} className="bg-gray-100 dark:bg-gray-800/50 p-3 rounded-lg text-sm border border-gray-200 dark:border-gray-700/50">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-700 dark:text-gray-300">{record.label || 'Unlabeled Charge'}</span>
                                <span className="font-mono text-green-600 dark:text-green-400 font-semibold">${record.cost_usd.toFixed(5)}</span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
                                <span>Prompt: {record.prompt_tokens.toLocaleString()} tk</span>
                                <span className="mx-2">|</span>
                                <span>Completion: {record.completion_tokens.toLocaleString()} tk</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CostTracker;