import React from 'react';
import Card from '../common/Card';
import SectionHeader from '../common/SectionHeader';
import { renderStructuredTab } from '../../utils/markdownUtils';
import { MusicNoteIcon, FireIcon, BookOpenIcon, SparklesIcon, GlobeIcon, GearIcon } from '../common/Icons';
import { COLORS } from '../../constants';
import type { ScaleDetails } from '../../types';

interface PracticeSectionProps {
    scaleDetails: ScaleDetails;
}

const PracticeSection: React.FC<PracticeSectionProps> = ({ scaleDetails }) => {
    const { keyChords, licks, advancedHarmonization, etudes, modeSpotlight, toneAndGear } = scaleDetails;

    return (
        <>
            {toneAndGear && (
                 <Card>
                    <SectionHeader title="Tone & Gear Suggestions" icon={<GearIcon />} />
                    <div className="space-y-4">
                        {toneAndGear.suggestions.map(s => (
                            <div key={s.setting}><p><strong className="text-amber-400">{s.setting}:</strong> {s.description}</p></div>
                        ))}
                        <div><p><strong className="text-amber-400">Famous Artists:</strong> {toneAndGear.famousArtists}</p></div>
                    </div>
                </Card>
            )}

            {keyChords && (
                <Card>
                    <SectionHeader title="Key Chords & Progressions" icon={<MusicNoteIcon />} />
                    <div className="space-y-6">
                        <p>
                            <strong className="text-cyan-400">Diatonic Chord Qualities:</strong>
                            <code className="bg-black/20 text-cyan-300 p-1 rounded-md ml-2">{keyChords.diatonicQualities}</code>
                        </p>
                        <div>
                            {keyChords.progressions.map(p => (
                                <div key={p.name} className="mt-4">
                                    <p className="font-semibold text-lg">{p.name}</p>
                                    <p className="text-sm italic mb-2" style={{ color: COLORS.textSecondary }}>{p.analysis}</p>
                                    {renderStructuredTab(p.tab)}
                                    {p.harmonicFunctionAnalysis && (
                                        <div className="mt-3 bg-black/20 p-3 rounded-md border border-purple-400/20">
                                            <p className="font-semibold text-purple-300">Harmonic Function:</p>
                                            <p className="text-sm" style={{ color: COLORS.textSecondary }}>{p.harmonicFunctionAnalysis}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            )}

            {licks?.length > 0 && (
                <Card>
                    <SectionHeader title="🔥 Classic Licks & Phrases" icon={<FireIcon />} />
                    <div className="space-y-6">
                        {licks.map(l => (
                            <div key={l.name}>
                                <div className="flex justify-between items-center">
                                    <div className="flex-grow">
                                        <p className="font-semibold text-lg">{l.name}</p>
                                        <p className="text-sm italic mb-2" style={{ color: COLORS.textSecondary }}>{l.description}</p>
                                    </div>
                                    <a href={l.sourceUrl} target="_blank" rel="noopener noreferrer" className="ml-4 flex-shrink-0 bg-fuchsia-500/80 hover:bg-fuchsia-500 text-white font-bold py-1 px-3 rounded-md transition-colors">View Source</a>
                                </div>
                                {renderStructuredTab(l.tab)}
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {advancedHarmonization?.length > 0 && (
                <Card>
                    <SectionHeader title="Advanced Harmonization" icon={<BookOpenIcon />} />
                    <div className="space-y-6">
                        {advancedHarmonization.map(h => (
                             <div key={h.name}>
                                <p className="font-semibold text-lg">{h.name}</p>
                                <p className="text-sm italic mb-2" style={{ color: COLORS.textSecondary }}>{h.description}</p>
                                {renderStructuredTab(h.tab)}
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {etudes?.length > 0 && (
                 <Card>
                    <SectionHeader title="✨ Comprehensive Etudes" icon={<SparklesIcon />} />
                     <div className="space-y-6">
                        {etudes.map(e => (
                             <div key={e.name}>
                                <p className="font-semibold text-lg">{e.name}</p>
                                <p className="text-sm italic mb-2" style={{ color: COLORS.textSecondary }}>{e.description}</p>
                                {renderStructuredTab(e.tab)}
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {modeSpotlight && (
                 <Card>
                    <SectionHeader title="🌍 Beyond the Scale" icon={<GlobeIcon />} />
                    <p className="font-semibold text-lg">{modeSpotlight.name}</p>
                    <p className="my-2">{modeSpotlight.explanation}</p>
                    <p>{modeSpotlight.soundAndApplication}</p>
                </Card>
            )}
        </>
    );
};

export default PracticeSection;