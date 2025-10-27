import React, { useState, useMemo, useRef, useEffect } from 'react';
import { COLORS } from '../../constants';

interface SearchableSelectProps {
    options: string[];
    value: string;
    onChange: (value: string) => void;
    disabled: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
    options,
    value,
    onChange,
    disabled,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    const filteredOptions = useMemo(
        () =>
            options.filter((option) =>
                option.toLowerCase().includes(searchTerm.toLowerCase())
            ),
        [options, searchTerm]
    );

    const handleSelect = (option: string) => {
        onChange(option);
        setIsOpen(false);
        setSearchTerm('');
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const ChevronIcon = () => (
        <svg className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
    )

    return (
        <div ref={wrapperRef} className="relative w-full md:w-48">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={disabled}
                className="w-full flex items-center justify-between bg-[#171528]/80 border border-purple-400/30 rounded-md p-2 text-white font-semibold focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition disabled:opacity-70"
            >
                <span>{value}</span>
                <ChevronIcon />
            </button>
            {isOpen && (
                <div className="absolute top-full mt-1 w-full bg-[#171528] border border-purple-400/30 rounded-md shadow-lg overflow-hidden">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 bg-black/30 text-white border-b border-purple-400/30 focus:outline-none"
                        autoFocus
                    />
                    <ul className="max-h-60 overflow-y-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <li
                                    key={option}
                                    onClick={() => handleSelect(option)}
                                    className="p-2 cursor-pointer hover:bg-cyan-500/20 text-gray-300"
                                >
                                    {option}
                                </li>
                            ))
                        ) : (
                            <li className="p-2 text-gray-500">No results</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;
