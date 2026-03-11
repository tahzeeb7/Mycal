/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, 
  Delete, 
  RotateCcw, 
  ChevronRight,
  Calculator
} from 'lucide-react';

interface HistoryItem {
  expression: string;
  result: string;
  timestamp: number;
}

export default function App() {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isScientific, setIsScientific] = useState(true);
  const [memory, setMemory] = useState<number>(0);
  const [showHistory, setShowHistory] = useState(false);

  // Core Calculator Logic
  const handleNumber = (num: string) => {
    setDisplay(prev => {
      if (prev === '0' || prev === 'Error') return num;
      return prev + num;
    });
  };

  const handleDecimal = () => {
    if (!display.includes('.')) {
      setDisplay(prev => prev + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setEquation('');
  };

  const deleteLast = () => {
    setDisplay(prev => {
      if (prev.length === 1 || prev === 'Error') return '0';
      return prev.slice(0, -1);
    });
  };

  const calculate = useCallback(() => {
    try {
      let expression = equation + display;
      // Replace symbols for evaluation
      const evalExpr = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, Math.PI.toString())
        .replace(/e/g, Math.E.toString());

      // Simple evaluation using Function constructor (safer than eval)
      const result = new Function(`return ${evalExpr}`)();
      
      const resultStr = Number.isFinite(result) 
        ? parseFloat(result.toFixed(8)).toString() 
        : 'Error';

      setHistory(prev => [{
        expression: expression,
        result: resultStr,
        timestamp: Date.now()
      }, ...prev].slice(0, 20));

      setDisplay(resultStr);
      setEquation('');
    } catch (error) {
      setDisplay('Error');
    }
  }, [display, equation]);

  const handleOperator = (op: string) => {
    if (display === 'Error') return;
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const handleScientific = (fn: string) => {
    try {
      const val = parseFloat(display);
      let result: number;

      switch (fn) {
        case 'sin': result = Math.sin(val); break;
        case 'cos': result = Math.cos(val); break;
        case 'tan': result = Math.tan(val); break;
        case 'sqrt': result = Math.sqrt(val); break;
        case 'log': result = Math.log10(val); break;
        case 'ln': result = Math.log(val); break;
        case 'exp': result = Math.exp(val); break;
        case 'square': result = Math.pow(val, 2); break;
        case 'cube': result = Math.pow(val, 3); break;
        case 'inv': result = 1 / val; break;
        case 'abs': result = Math.abs(val); break;
        default: return;
      }

      const resultStr = Number.isFinite(result) 
        ? parseFloat(result.toFixed(8)).toString() 
        : 'Error';

      setHistory(prev => [{
        expression: `${fn}(${display})`,
        result: resultStr,
        timestamp: Date.now()
      }, ...prev].slice(0, 20));

      setDisplay(resultStr);
    } catch (error) {
      setDisplay('Error');
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/[0-9]/.test(e.key)) handleNumber(e.key);
      if (e.key === '.') handleDecimal();
      if (e.key === 'Enter' || e.key === '=') calculate();
      if (e.key === 'Backspace') deleteLast();
      if (e.key === 'Escape') clear();
      if (['+', '-', '*', '/'].includes(e.key)) {
        const opMap: Record<string, string> = { '*': '×', '/': '÷' };
        handleOperator(opMap[e.key] || e.key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [calculate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Calculator */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8 glass-panel rounded-3xl overflow-hidden flex flex-col"
          id="calculator-main"
        >
          {/* Display Area */}
          <div className="p-8 bg-black/20 flex flex-col items-end justify-end min-h-[160px] gap-2">
            <div className="text-zinc-500 font-mono text-sm h-6 overflow-hidden text-right w-full">
              {equation}
            </div>
            <motion.div 
              key={display}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-5xl md:text-6xl font-mono font-light tracking-tighter break-all text-right w-full"
            >
              {display}
            </motion.div>
          </div>

          {/* Controls Header */}
          <div className="px-6 py-3 border-y border-white/5 flex items-center justify-between bg-white/5">
            <div className="flex gap-4">
              <button 
                onClick={() => setIsScientific(!isScientific)}
                className={`text-xs uppercase tracking-widest font-bold transition-colors ${isScientific ? 'text-amber-500' : 'text-zinc-500'}`}
              >
                Scientific
              </button>
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <History size={18} />
              </button>
            </div>
            <div className="flex gap-2 text-[10px] font-mono text-zinc-500 uppercase">
              <span>Memory: {memory.toFixed(2)}</span>
            </div>
          </div>

          {/* Keypad */}
          <div className="p-6 grid grid-cols-4 md:grid-cols-5 gap-3">
            {/* Scientific Row (Visible on Desktop or if toggled) */}
            <AnimatePresence>
              {isScientific && (
                <>
                  <button onClick={() => handleScientific('sin')} className="calc-button calc-button-fn" id="btn-sin">sin</button>
                  <button onClick={() => handleScientific('cos')} className="calc-button calc-button-fn" id="btn-cos">cos</button>
                  <button onClick={() => handleScientific('tan')} className="calc-button calc-button-fn" id="btn-tan">tan</button>
                  <button onClick={() => handleScientific('sqrt')} className="calc-button calc-button-fn" id="btn-sqrt">√</button>
                  <button onClick={() => handleScientific('log')} className="calc-button calc-button-fn" id="btn-log">log</button>
                  
                  <button onClick={() => handleScientific('ln')} className="calc-button calc-button-fn" id="btn-ln">ln</button>
                  <button onClick={() => handleScientific('exp')} className="calc-button calc-button-fn" id="btn-exp">exp</button>
                  <button onClick={() => handleScientific('square')} className="calc-button calc-button-fn" id="btn-sq">x²</button>
                  <button onClick={() => handleScientific('cube')} className="calc-button calc-button-fn" id="btn-cube">x³</button>
                  <button onClick={() => handleScientific('inv')} className="calc-button calc-button-fn" id="btn-inv">1/x</button>
                </>
              )}
            </AnimatePresence>

            {/* Standard Grid */}
            <button onClick={clear} className="calc-button calc-button-clear col-span-2 font-bold" id="btn-clear">CLEAR</button>
            <button onClick={deleteLast} className="calc-button calc-button-num" id="btn-del"><Delete size={20} /></button>
            <button onClick={() => handleOperator('÷')} className="calc-button calc-button-op text-xl" id="btn-div">÷</button>
            <button onClick={() => setMemory(parseFloat(display))} className="calc-button calc-button-fn hidden md:flex" id="btn-ms">MS</button>

            <button onClick={() => handleNumber('7')} className="calc-button calc-button-num text-xl" id="btn-7">7</button>
            <button onClick={() => handleNumber('8')} className="calc-button calc-button-num text-xl" id="btn-8">8</button>
            <button onClick={() => handleNumber('9')} className="calc-button calc-button-num text-xl" id="btn-9">9</button>
            <button onClick={() => handleOperator('×')} className="calc-button calc-button-op text-xl" id="btn-mul">×</button>
            <button onClick={() => setDisplay(memory.toString())} className="calc-button calc-button-fn hidden md:flex" id="btn-mr">MR</button>

            <button onClick={() => handleNumber('4')} className="calc-button calc-button-num text-xl" id="btn-4">4</button>
            <button onClick={() => handleNumber('5')} className="calc-button calc-button-num text-xl" id="btn-5">5</button>
            <button onClick={() => handleNumber('6')} className="calc-button calc-button-num text-xl" id="btn-6">6</button>
            <button onClick={() => handleOperator('-')} className="calc-button calc-button-op text-xl" id="btn-sub">-</button>
            <button onClick={() => setMemory(0)} className="calc-button calc-button-fn hidden md:flex" id="btn-mc">MC</button>

            <button onClick={() => handleNumber('1')} className="calc-button calc-button-num text-xl" id="btn-1">1</button>
            <button onClick={() => handleNumber('2')} className="calc-button calc-button-num text-xl" id="btn-2">2</button>
            <button onClick={() => handleNumber('3')} className="calc-button calc-button-num text-xl" id="btn-3">3</button>
            <button onClick={() => handleOperator('+')} className="calc-button calc-button-op text-xl" id="btn-add">+</button>
            <button onClick={() => setMemory(memory + parseFloat(display))} className="calc-button calc-button-fn hidden md:flex" id="btn-mplus">M+</button>

            <button onClick={() => handleNumber('0')} className="calc-button calc-button-num text-xl col-span-2" id="btn-0">0</button>
            <button onClick={handleDecimal} className="calc-button calc-button-num text-xl" id="btn-dot">.</button>
            <button onClick={calculate} className="calc-button calc-button-eq text-xl" id="btn-eq">=</button>
            <button onClick={() => setMemory(memory - parseFloat(display))} className="calc-button calc-button-fn hidden md:flex" id="btn-mminus">M-</button>
          </div>
        </motion.div>

        {/* Sidebar: History & Info */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* History Panel */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel rounded-3xl flex-1 flex flex-col overflow-hidden"
            id="history-panel"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-widest font-bold text-zinc-400">History</h3>
              <button 
                onClick={() => setHistory([])}
                className="text-zinc-500 hover:text-rose-500 transition-colors"
              >
                <RotateCcw size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[400px]">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-2 py-12">
                  <History size={32} strokeWidth={1} />
                  <p className="text-xs">No recent calculations</p>
                </div>
              ) : (
                history.map((item) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={item.timestamp}
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                    onClick={() => setDisplay(item.result)}
                  >
                    <div className="text-[10px] text-zinc-500 font-mono mb-1">{item.expression}</div>
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-mono text-amber-500">{item.result}</div>
                      <ChevronRight size={14} className="text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* Quick Info */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel rounded-3xl p-6"
            id="info-panel"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                <Calculator size={20} />
              </div>
              <h3 className="text-sm font-bold">Precision Engine</h3>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed mb-4">
              Advanced scientific calculator with 8-decimal precision. Supports keyboard input and memory operations.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-[10px] text-zinc-400">
                <span className="block text-zinc-600 mb-1 uppercase tracking-tighter">Constants</span>
                π, e supported
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-[10px] text-zinc-400">
                <span className="block text-zinc-600 mb-1 uppercase tracking-tighter">Trig</span>
                Radians mode
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}

