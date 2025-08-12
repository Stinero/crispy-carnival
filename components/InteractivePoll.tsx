

import React, { useState, useMemo } from 'react';

interface InteractivePollProps {
  question: string;
  options: string[];
}

const InteractivePoll: React.FC<InteractivePollProps> = ({ question, options }) => {
  const [votes, setVotes] = useState<number[]>(() => options.map(() => 0));
  const [hasVoted, setHasVoted] = useState(false);

  const totalVotes = useMemo(() => votes.reduce((sum, count) => sum + count, 0), [votes]);

  const handleVote = (index: number) => {
    if (hasVoted) return;
    setVotes(currentVotes => {
      const newVotes = [...currentVotes];
      newVotes[index] += 1;
      return newVotes;
    });
    setHasVoted(true);
  };

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-gray-800 dark:text-gray-100">{question}</h4>
      <div className="space-y-2">
        {options.map((option, index) => {
          const percentage = totalVotes > 0 ? (votes[index] / totalVotes) * 100 : 0;
          return (
            <button
              key={index}
              onClick={() => handleVote(index)}
              disabled={hasVoted}
              className="w-full text-left p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 relative overflow-hidden group disabled:cursor-not-allowed transition-all duration-300 hover:border-blue-500 dark:hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800"
            >
              <div
                className={`absolute top-0 left-0 h-full bg-blue-100 dark:bg-blue-900/50 transition-all duration-500 ease-out ${hasVoted ? 'opacity-100' : 'opacity-0'}`}
                style={{ width: `${percentage}%` }}
              ></div>
              <div className="relative flex justify-between items-center">
                <span className="font-medium text-gray-700 dark:text-gray-200">{option}</span>
                {hasVoted && (
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-300">
                    {percentage.toFixed(0)}% ({votes[index]})
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      {hasVoted && (
        <p className="text-xs text-right text-gray-500 dark:text-gray-400">
          Total votes: {totalVotes}
        </p>
      )}
    </div>
  );
};

export default InteractivePoll;