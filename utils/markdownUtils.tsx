import React from 'react';
import type { StructuredTab } from '../types';
import { TUNING } from '../constants';

export const renderStructuredTab = (tab: StructuredTab) => {
    if (!tab || !tab.columns || tab.columns.length === 0) {
        return null;
    }

    // Initialize string lines with tuning, padded for alignment
    const strings = Array.from(
        { length: 7 },
        (_, i) => TUNING[i].padEnd(2, ' ') + '|'
    );

    for (const column of tab.columns) {
        // Handle bar lines
        const isBarLine =
            column.length > 0 && column.every((note) => note.fret === '|');
        if (isBarLine) {
            strings.forEach((_, i) => (strings[i] += '|'));
            continue;
        }

        const columnFrets = Array(7).fill('-');
        let maxWidth = 1;

        for (const note of column) {
            if (note.string >= 0 && note.string < 7) {
                columnFrets[note.string] = note.fret;
                if (note.fret.length > maxWidth) {
                    maxWidth = note.fret.length;
                }
            }
        }

        for (let i = 0; i < 7; i++) {
            const fret = columnFrets[i];
            const padding = '-'.repeat(maxWidth - fret.length);
            strings[i] += `${padding}${fret}-`;
        }
    }

    // Add final bar line
    strings.forEach((_, i) => (strings[i] += '|'));

    return (
        <pre
            className="bg-[#0D0B1A]/70 text-gray-300 p-4 rounded-md overflow-x-auto text-base font-mono whitespace-pre leading-relaxed border border-purple-400/20"
            style={{ fontFamily: "'Roboto Mono', monospace" }}
        >
            {strings.join('\n')}
        </pre>
    );
};

export const renderMarkdownTable = (markdownString: string) => {
    if (!markdownString || !markdownString.includes('|')) {
        return <p>{markdownString}</p>;
    }
    try {
        const rows = markdownString.trim().split('\n');
        const headerRow = rows[0];
        const dataRows = rows.slice(2);

        const headers = headerRow
            .split('|')
            .map((h) => h.trim())
            .filter(Boolean);
        const body = dataRows.map((row, rowIndex) => {
            const cells = row
                .split('|')
                .map((c) => c.trim())
                .filter(Boolean);
            return (
                <tr key={rowIndex} className="hover:bg-purple-500/10">
                    {cells.map((cell, cellIndex) => (
                        <td
                            key={cellIndex}
                            className="py-2 px-4 border-b border-purple-400/20"
                        >
                            {cell}
                        </td>
                    ))}
                </tr>
            );
        });

        return (
            <div className="overflow-x-auto rounded-lg border border-purple-400/20 mt-2">
                <table className="w-full text-left">
                    <thead className="bg-[#0D0B1A]/70">
                        <tr>
                            {headers.map((header, index) => (
                                <th
                                    key={index}
                                    className="py-2 px-4 text-cyan-400 uppercase tracking-wider font-semibold text-sm border-b-2 border-purple-400/40"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>{body}</tbody>
                </table>
            </div>
        );
    } catch (e: unknown) {
        console.error('Failed to parse markdown table:', e);
        return <pre className="whitespace-pre-wrap">{markdownString}</pre>; // Fallback to preformatted text
    }
};