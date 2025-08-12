

import React, { useState } from 'react';
import { Plan, PlanStep } from '../types';
import Button from './ui/Button';
import { BrainCircuitIcon, ChevronDownIcon, CheckIcon, XIcon, EditIcon } from '../constants';

interface PlanApprovalCardProps {
    plan: Plan;
    onApprove: (plan: Plan) => void;
    onCancel: () => void;
}

const PlanApprovalCard: React.FC<PlanApprovalCardProps> = ({ plan, onApprove, onCancel }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedPlanJson, setEditedPlanJson] = useState(() => JSON.stringify(plan, null, 2));
    const [isValidJson, setIsValidJson] = useState(true);

    const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newJson = e.target.value;
        setEditedPlanJson(newJson);
        try {
            JSON.parse(newJson);
            setIsValidJson(true);
        } catch {
            setIsValidJson(false);
        }
    };
    
    const handleApproveOriginal = () => {
        onApprove(plan);
    };
    
    const handleApproveEdited = () => {
        if (isValidJson) {
            onApprove(JSON.parse(editedPlanJson));
        }
    };

    return (
        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl my-4 p-5 border border-indigo-500/30 space-y-4 max-w-3xl mx-auto animate-slide-in-up backdrop-blur-sm shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
            <div className="text-center">
                <h3 className="font-semibold text-xl text-indigo-600 dark:text-indigo-300 flex items-center justify-center gap-2">
                    <BrainCircuitIcon className="h-6 w-6" />
                    Plan Ready for Execution
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review the proposed plan before execution.</p>
            </div>
            
            {isEditing ? (
                 <div className="space-y-2">
                     <textarea
                         value={editedPlanJson}
                         onChange={handleJsonChange}
                         rows={12}
                         className={`w-full bg-white dark:bg-gray-900/80 text-gray-800 dark:text-gray-200 border rounded-md p-2 text-xs font-mono focus:outline-none focus:ring-2  ${isValidJson ? 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500' : 'border-red-500 focus:ring-red-500'}`}
                     />
                     {!isValidJson && <p className="text-xs text-red-500">Invalid JSON format.</p>}
                 </div>
            ) : (
                <div className="space-y-3 bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700/50">
                    {plan.steps.map((step, index) => (
                        <div key={index} className="pl-4 border-l-2 border-indigo-400/30">
                            <p className="font-semibold text-sm">Step {index + 1}: <span className="font-mono text-indigo-500 dark:text-indigo-300">{step.tool_name}</span></p>
                            <p className="text-xs italic text-gray-500 dark:text-gray-400">"{step.thought}"</p>
                            <details className="text-xs group mt-1">
                                <summary className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white select-none flex items-center">
                                    Arguments <ChevronDownIcon />
                                </summary>
                                <pre className="mt-1 p-2 bg-gray-200/70 dark:bg-gray-800/70 rounded text-[11px] text-gray-700 dark:text-gray-300 overflow-x-auto font-mono">
                                    {JSON.stringify(step.args, null, 2)}
                                </pre>
                            </details>
                        </div>
                    ))}
                </div>
            )}
            
            <div className="flex justify-end gap-3">
                {isEditing ? (
                    <>
                        <Button onClick={onCancel} variant="secondary"><XIcon /> Cancel</Button>
                        <Button onClick={handleApproveEdited} disabled={!isValidJson} variant="primary" className="!bg-indigo-600 hover:!bg-indigo-700 focus:!ring-indigo-500">
                            <CheckIcon /> Approve Modified Plan
                        </Button>
                    </>
                ) : (
                    <>
                        <Button onClick={onCancel} variant="secondary"><XIcon /> Cancel</Button>
                        <Button onClick={() => setIsEditing(true)} variant="secondary"><EditIcon /> Edit Plan</Button>
                        <Button onClick={handleApproveOriginal} variant="primary" className="!bg-indigo-600 hover:!bg-indigo-700 focus:!ring-indigo-500">
                           <CheckIcon /> Approve Plan
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
};

export default PlanApprovalCard;