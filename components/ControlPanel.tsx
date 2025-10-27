import React from 'react';
import { FONT_SIZES, ALL_NOTES, SCALE_FORMULAS } from '../constants';
import type { FontSizeKey } from '../types';
import SearchableSelect from './common/SearchableSelect';

interface ControlPanelProps {
    rootNote: string;
    setRootNote: (note: string) => void;
    scaleName: string;
    setScaleName: (scale: string) => void;
    onGenerate: () => void;
    onSavePdf: () => void;
    isLoading: boolean;
    isSavingPdf: boolean;
    hasContent: boolean;
    fontSize: FontSizeKey;
    setFontSize: (size: FontSizeKey) => void;
}

const scaleNames = Object.keys(SCALE_FORMULAS);

const ControlPanel: React.FC<ControlPanelProps> = ({
    rootNote,
    setRootNote,
    scaleName,
    setScaleName,
    onGenerate,
    onSavePdf,
    isLoading,
    isSavingPdf,
    hasContent,
    fontSize,
    setFontSize,
}) => {
    return (
        <div className="sticky top-4 z-10 bg-[#171528]/80 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-purple-400/30">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 flex-wrap">
                {/* Root Note Selector */}
                <div className="flex items-center gap-2 w-full md:w-auto z-30">
                    <label className="font-bold text-lg text-gray-300">
                        Root:
                    </label>
                    <SearchableSelect
                        options={ALL_NOTES}
                        value={rootNote}
                        onChange={setRootNote}
                        disabled={isLoading}
                    />
                </div>

                {/* Scale Name Selector */}
                <div className="flex items-center gap-2 w-full md:w-auto z-20">
                    <label className="font-bold text-lg text-gray-300">
                        Scale:
                    </label>
                    <SearchableSelect
                        options={scaleNames}
                        value={scaleName}
                        onChange={setScaleName}
                        disabled={isLoading}
                    />
                </div>

                {/* Generate Button */}
                <button
                    onClick={onGenerate}
                    disabled={isLoading}
                    className="w-full md:w-auto bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:shadow-xl hover:from-cyan-600 hover:to-fuchsia-700 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isLoading && !isSavingPdf ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                        'Generate Materials'
                    )}
                </button>

                {/* Save to PDF Button */}
                {hasContent && (
                    <button
                        onClick={onSavePdf}
                        disabled={isSavingPdf || isLoading}
                        className="w-full md:w-auto bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:shadow-xl hover:from-purple-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isSavingPdf ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            'Save to PDF'
                        )}
                    </button>
                )}

                {/* Font Size Selector */}
                <div className="flex items-center gap-2 border-l border-purple-400/20 pl-4 ml-2">
                    <span className="font-bold text-lg text-gray-300">
                        Size:
                    </span>
                    {(Object.keys(FONT_SIZES) as FontSizeKey[]).map((key) => (
                        <button
                            key={key}
                            onClick={() => setFontSize(key)}
                            disabled={isLoading}
                            className={`w-8 h-8 rounded-md font-bold transition-colors disabled:opacity-70 ${
                                fontSize === key
                                    ? 'bg-cyan-500 text-white'
                                    : 'bg-black/20 text-gray-300 hover:bg-black/40'
                            }`}
                        >
                            {key}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ControlPanel;
