/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AngleUnit, CalculatorTab, HistoryItem, NumberFormat } from './types';
import { evaluateExpression, formatNumber } from './utils/mathEngine';
import { Header } from './components/Header';
import { Display } from './components/Display';
import { Keypad } from './components/Keypad';
import { HistoryDrawer } from './components/HistoryDrawer';
import { Grapher2D } from './components/Grapher2D';
import { Grapher3D } from './components/Grapher3D';
import { CalculusSolver } from './components/CalculusSolver';
import { ProgrammerMode } from './components/ProgrammerMode';
import { ConverterMode } from './components/ConverterMode';
import { HelpModal } from './components/HelpModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { StepByStepModal } from './components/StepByStepModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { generateStepByStepProcedure } from './utils/stepSolver';
import { StepProcedure } from './types';
import { User } from 'firebase/auth';
import {
  initAuthListener,
  testFirestoreConnection,
  saveHistoryItemToCloud,
  loadHistoryFromCloud,
  clearAllHistoryFromCloud,
  savePreferencesToCloud
} from './lib/firebase';

export default function App() {
  const [activeTab, setActiveTab] = useState<CalculatorTab>('scientific');
  const [expression, setExpression] = useState<string>('');
  const [result, setResult] = useState<string>('0');
  const [previousAnswer, setPreviousAnswer] = useState<number>(0);
  const [numericResult, setNumericResult] = useState<number | null>(0);

  const [angleUnit, setAngleUnit] = useState<AngleUnit>('DEG');
  const [isSecondActive, setIsSecondActive] = useState<boolean>(false);
  const [isHypActive, setIsHypActive] = useState<boolean>(false);
  const [memory, setMemory] = useState<number>(0);
  const [numberFormat, setNumberFormat] = useState<NumberFormat>('standard');

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('calc_history_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(() => {
    return typeof window !== 'undefined' && (
      window.location.search.includes('privacy') ||
      window.location.hash.includes('privacy')
    );
  });
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [livePreview, setLivePreview] = useState<string | null>(null);

  // Step-by-Step procedure state
  const [lastCalculatedExpression, setLastCalculatedExpression] = useState<string>('');
  const [isStepModalOpen, setIsStepModalOpen] = useState(false);
  const [currentProcedure, setCurrentProcedure] = useState<StepProcedure | null>(null);

  const handleOpenStepByStep = (targetExpr?: string, targetAngle?: AngleUnit) => {
    const exprToSolve = targetExpr || expression || lastCalculatedExpression;
    if (!exprToSolve) return;
    const unit = targetAngle || angleUnit;
    const proc = generateStepByStepProcedure(exprToSolve, unit);
    setCurrentProcedure(proc);
    setIsStepModalOpen(true);
  };

  // Firebase Auth and Cloud Sync state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Initialize Firebase and Cloud sync
  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = initAuthListener(async user => {
      setCurrentUser(user);
      if (user) {
        setIsSyncing(true);
        try {
          const cloudHistory = await loadHistoryFromCloud();
          if (cloudHistory.length > 0) {
            setHistory(prev => {
              const existingIds = new Set(cloudHistory.map(item => item.id));
              const uniqueLocal = prev.filter(item => !existingIds.has(item.id));
              return [...cloudHistory, ...uniqueLocal].slice(0, 50);
            });
          }
        } finally {
          setIsSyncing(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSyncNow = async () => {
    if (!currentUser) return;
    setIsSyncing(true);
    try {
      const cloudHistory = await loadHistoryFromCloud();
      if (cloudHistory.length > 0) {
        setHistory(prev => {
          const existingIds = new Set(cloudHistory.map(item => item.id));
          const uniqueLocal = prev.filter(item => !existingIds.has(item.id));
          return [...cloudHistory, ...uniqueLocal].slice(0, 50);
        });
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('calc_history_items', JSON.stringify(history.slice(0, 50)));
    } catch {
      // Ignore storage errors
    }
  }, [history]);

  // Real-time live preview of calculation as user types
  useEffect(() => {
    if (!expression.trim()) {
      setLivePreview(null);
      return;
    }

    // Attempt gentle evaluation
    const res = evaluateExpression(expression, angleUnit, previousAnswer);
    if (!res.isError && typeof res.result === 'number' && isFinite(res.result)) {
      setLivePreview(formatNumber(res.result, numberFormat));
    } else {
      setLivePreview(null);
    }
  }, [expression, angleUnit, previousAnswer, numberFormat]);

  // Insert token into current expression
  const handleInsert = (token: string) => {
    setIsError(false);
    setErrorMessage(undefined);

    // If previous calculation just finished and user inputs an operator, chain with Ans
    const isOp = ['+', '-', '×', '÷', '^', '%', ' mod '].includes(token);
    if (expression === '' && result !== '0' && isOp) {
      setExpression(`Ans${token}`);
      return;
    }

    setExpression(prev => prev + token);
  };

  // Backspace
  const handleBackspace = () => {
    setIsError(false);
    setErrorMessage(undefined);
    setExpression(prev => {
      if (prev.length <= 1) return '';
      // Special tokens: check if ends with e.g. "sinh(", "asin(", " mod ", "Ans"
      const multiTokens = [
        'sinh(', 'cosh(', 'tanh(', 'asinh(', 'acosh(', 'atanh(',
        'sin(', 'cos(', 'tan(', 'asin(', 'acos(', 'atan(',
        'sqrt(', 'cbrt(', 'nthRoot(', 'log10(', 'log2(', 'ln(',
        ' mod ', 'Ans', 'abs('
      ];
      for (const t of multiTokens) {
        if (prev.endsWith(t)) {
          return prev.slice(0, -t.length);
        }
      }
      return prev.slice(0, -1);
    });
  };

  // Clear entry / Clear all
  const handleClearEntry = () => {
    setExpression('');
    setIsError(false);
    setErrorMessage(undefined);
  };

  const handleClear = () => {
    setExpression('');
    setLastCalculatedExpression('');
    setResult('0');
    setNumericResult(0);
    setIsError(false);
    setErrorMessage(undefined);
    setLivePreview(null);
  };

  // Primary Calculate Action (=)
  const handleCalculate = () => {
    if (!expression.trim()) return;

    const res = evaluateExpression(expression, angleUnit, previousAnswer);

    if (res.isError) {
      setIsError(true);
      setErrorMessage(res.errorMsg || 'Error de sintaxis');
      setResult('Error');
      return;
    }

    setIsError(false);
    setErrorMessage(undefined);

    let displayFormatted = res.formatted;
    if (typeof res.result === 'number') {
      setNumericResult(res.result);
      setPreviousAnswer(res.result);
      displayFormatted = formatNumber(res.result, numberFormat);
    }

    setResult(displayFormatted);
    setLastCalculatedExpression(expression);

    // Save to history
    const newItem: HistoryItem = {
      id: String(Date.now()),
      expression,
      result: displayFormatted,
      timestamp: Date.now(),
      angleUnit,
    };
    setHistory(prev => [newItem, ...prev.slice(0, 49)]);
    saveHistoryItemToCloud(newItem);
    setExpression('');
  };

  // Negate current expression / result (±)
  const handleNegate = () => {
    if (expression) {
      if (expression.startsWith('-(') && expression.endsWith(')')) {
        setExpression(expression.slice(2, -1));
      } else {
        setExpression(`-(${expression})`);
      }
    } else if (numericResult !== null) {
      const negated = -numericResult;
      setNumericResult(negated);
      setPreviousAnswer(negated);
      setResult(formatNumber(negated, numberFormat));
    }
  };

  // Toggle Angle Unit (DEG -> RAD -> GRAD)
  const handleCycleAngleUnit = () => {
    setAngleUnit(prev => {
      if (prev === 'DEG') return 'RAD';
      if (prev === 'RAD') return 'GRAD';
      return 'DEG';
    });
  };

  // Toggle Number Format (standard -> scientific -> fraction)
  const handleCycleNumberFormat = () => {
    const nextFormat: NumberFormat =
      numberFormat === 'standard'
        ? 'scientific'
        : numberFormat === 'scientific'
        ? 'fraction'
        : 'standard';

    setNumberFormat(nextFormat);
    if (numericResult !== null && isFinite(numericResult)) {
      setResult(formatNumber(numericResult, nextFormat));
    }
  };

  // Memory Handlers
  const handleMemoryClear = () => setMemory(0);

  const handleMemoryRecall = () => {
    handleInsert(String(memory));
  };

  const handleMemoryAdd = () => {
    if (numericResult !== null) {
      setMemory(prev => prev + numericResult);
    }
  };

  const handleMemorySubtract = () => {
    if (numericResult !== null) {
      setMemory(prev => prev - numericResult);
    }
  };

  const handleMemoryStore = () => {
    if (numericResult !== null) {
      setMemory(numericResult);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top App Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          const next = !soundEnabled;
          setSoundEnabled(next);
          savePreferencesToCloud({ angleUnit, numberFormat, soundEnabled: next });
        }}
        onToggleHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
        onOpenHelp={() => setIsHelpOpen(true)}
        user={currentUser}
        onSyncNow={handleSyncNow}
        isSyncing={isSyncing}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-4 md:p-6 flex flex-col justify-start">
        {activeTab === 'scientific' && (
          <div className="w-full max-w-3xl mx-auto flex flex-col gap-3">
            {/* Display Screen */}
            <Display
              expression={expression || lastCalculatedExpression}
              result={result}
              livePreview={livePreview}
              angleUnit={angleUnit}
              onCycleAngleUnit={handleCycleAngleUnit}
              isSecondActive={isSecondActive}
              isHypActive={isHypActive}
              hasMemory={memory !== 0}
              numberFormat={numberFormat}
              onCycleNumberFormat={handleCycleNumberFormat}
              isError={isError}
              errorMessage={errorMessage}
              onInsertAns={() => handleInsert('Ans')}
              hasProcedure={Boolean((expression || lastCalculatedExpression) && result && result !== 'Error')}
              onOpenStepByStep={() => handleOpenStepByStep()}
            />

            {/* Scientific Keypad */}
            <div className="bg-slate-900/90 border border-slate-800/90 p-3 sm:p-4 rounded-2xl shadow-xl">
              <Keypad
                onInsert={handleInsert}
                onClear={handleClear}
                onClearEntry={handleClearEntry}
                onBackspace={handleBackspace}
                onCalculate={handleCalculate}
                onNegate={handleNegate}
                angleUnit={angleUnit}
                onCycleAngleUnit={handleCycleAngleUnit}
                isSecondActive={isSecondActive}
                onToggleSecond={() => setIsSecondActive(!isSecondActive)}
                isHypActive={isHypActive}
                onToggleHyp={() => setIsHypActive(!isHypActive)}
                onMemoryAdd={handleMemoryAdd}
                onMemorySubtract={handleMemorySubtract}
                onMemoryRecall={handleMemoryRecall}
                onMemoryClear={handleMemoryClear}
                onMemoryStore={handleMemoryStore}
                soundEnabled={soundEnabled}
              />
            </div>
          </div>
        )}

        {activeTab === 'grapher' && (
          <div className="w-full">
            <Grapher2D onSwitchTo3D={() => setActiveTab('grapher3d')} />
          </div>
        )}

        {activeTab === 'grapher3d' && (
          <div className="w-full">
            <Grapher3D onSwitchTo2D={() => setActiveTab('grapher')} />
          </div>
        )}

        {activeTab === 'calculus' && (
          <div className="w-full">
            <CalculusSolver />
          </div>
        )}

        {activeTab === 'programmer' && (
          <div className="w-full">
            <ProgrammerMode />
          </div>
        )}

        {activeTab === 'converter' && (
          <div className="w-full">
            <ConverterMode />
          </div>
        )}
      </main>

      {/* History Slide-over Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectExpression={expr => {
          setExpression(expr);
          setIsHistoryOpen(false);
          setActiveTab('scientific');
        }}
        onSelectResult={res => {
          handleInsert(res);
          setIsHistoryOpen(false);
          setActiveTab('scientific');
        }}
        onViewStepByStep={item => {
          handleOpenStepByStep(item.expression, item.angleUnit);
          setIsHistoryOpen(false);
        }}
        onClearHistory={() => {
          clearAllHistoryFromCloud(history);
          setHistory([]);
        }}
      />

      {/* Step-by-Step Procedure Modal */}
      <StepByStepModal
        isOpen={isStepModalOpen}
        onClose={() => setIsStepModalOpen(false)}
        procedure={currentProcedure}
      />

      {/* Help & Shortcuts Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Privacy Policy Modal (Google Play Compliance) */}
      <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />

      {/* Offline Status Toast */}
      <OfflineIndicator />

      {/* Footer / Privacy & Legal Links */}
      <footer className="w-full max-w-5xl mx-auto mt-8 py-4 px-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-500">
        <div className="text-center sm:text-left">
          <span>© 2026 Calculadora Científica Avanzada & Trazador 3D WebGL</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPrivacyOpen(true)}
            className="hover:text-cyan-400 underline underline-offset-2 transition-colors cursor-pointer"
          >
            Política de Privacidad
          </button>
        </div>
      </footer>
    </div>
  );
}
