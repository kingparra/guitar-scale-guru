import React from 'react';

const IconWrapper: React.FC<{ children: React.ReactNode; className?: string }> =
    ({ children, className }) => (
        <div
            className={`h-8 w-8 flex items-center justify-center rounded-full ${className}`}
        >
            {children}
        </div>
    );

export const SpotifyIcon = () => (
    <IconWrapper className="bg-[#1DB954] text-white">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="currentColor"
        >
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.43 17.388c-.22.36-.675.472-1.035.252-2.955-1.808-6.66-2.22-11.04-1.218-.45.105-.9-.18-.99-.63-.105-.45.18-.9.63-.99 4.74-1.08 8.805-.615 12.045 1.41.345.21.45.675.24 1.035v-.135zm1.26-2.955c-.27.45-.825.6-1.275.33-3.24-1.98-8.145-2.58-13.44-1.41-.54.12-.99-.24-.99-.78s.33-1.05.87-.93c5.775-1.26 11.085-.585 14.715 1.635.45.27.6.825.33 1.275zm.12-3.15c-3.84-2.295-10.14-2.505-15.615-1.38-.63.135-1.245-.255-1.38-.885-.135-.63.255-1.245.885-1.38 6.03-1.23 12.915-.96 17.34 1.62.555.33.765.99.435 1.545-.33.555-.99.765-1.545.435z" />
        </svg>
    </IconWrapper>
);
export const YouTubeIcon = () => (
    <IconWrapper className="bg-[#FF0000] text-white">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="currentColor"
        >
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
    </IconWrapper>
);
export const MusicNoteIcon = () => (
    <IconWrapper className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 19V6l10-3v13m-10 0a2 2 0 100 4 2 2 0 000-4zm10-13a2 2 0 100 4 2 2 0 000-4z"
            />
        </svg>
    </IconWrapper>
);
export const FireIcon = () => (
    <IconWrapper className="bg-gradient-to-br from-amber-400 to-orange-600 text-white">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 20 20"
        >
            <path
                fillRule="evenodd"
                d="M12.39 3.73a1 1 0 00-1.15.53l-3.36 6.72a1 1 0 00-.03.35 1 1 0 001.03.97h2.12a1 1 0 01.97 1.03 1 1 0 01-.35.03l-6.72 3.36a1 1 0 00-.53 1.15 1 1 0 001.68.68l3.36-6.72a1 1 0 00.03-.35 1 1 0 00-1.03-.97H5.9a1 1 0 01-.97-1.03 1 1 0 01.35-.03l6.72-3.36a1 1 0 00.53-1.15 1 1 0 00-1.68-.68z"
                clipRule="evenodd"
            />
        </svg>
    </IconWrapper>
);
export const BookOpenIcon = () => (
    <IconWrapper className="bg-gradient-to-br from-orange-400 to-yellow-500 text-white">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 20 20"
        >
            <path
                fillRule="evenodd"
                d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm.293 2.293A1 1 0 015 4h8a1 1 0 01.707.293l2 2a1 1 0 010 1.414l-2 2A1 1 0 0113 10H5a1 1 0 01-.707-.293l-2-2a1 1 0 010-1.414l2-2z"
                clipRule="evenodd"
            />
        </svg>
    </IconWrapper>
);
export const SparklesIcon = () => (
    <IconWrapper className="bg-gradient-to-br from-sky-400 to-indigo-500 text-white">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 20 20"
        >
            <path
                fillRule="evenodd"
                d="M10 2a.75.75 0 01.75.75V4a.75.75 0 01-1.5 0V2.75A.75.75 0 0110 2zM5.21 5.21a.75.75 0 011.06 0l.707.707a.75.75 0 01-1.06 1.06l-.707-.707a.75.75 0 010-1.06zM2 10a.75.75 0 01.75-.75h1.25a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm3.21 3.72a.75.75 0 010 1.06l-.707.707a.75.75 0 01-1.06-1.06l.707-.707a.75.75 0 011.06 0zm4.58 3.07a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM14.79 14.79a.75.75 0 01-1.06 0l-.707-.707a.75.75 0 011.06-1.06l.707.707a.75.75 0 010 1.06zm3.21-4.79a.75.75 0 01-.75.75h-1.25a.75.75 0 010-1.5h1.25a.75.75 0 01.75.75zm-3.21-3.72a.75.75 0 010-1.06l.707-.707a.75.75 0 011.06 1.06l-.707.707a.75.75 0 01-1.06 0z"
                clipRule="evenodd"
            />
        </svg>
    </IconWrapper>
);
export const GlobeIcon = () => (
    <IconWrapper className="bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 20 20"
        >
            <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.74 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a1 1 0 00-2 0 1.5 1.5 0 01-1.5 1.5c-.256 0-.512-.098-.707-.293l-1.414 1.414c.41.41.92.68 1.464.766A5.003 5.003 0 0010 15a5 5 0 003.182-1.252 6.012 6.012 0 01-1.912-2.706 1.5 1.5 0 01-1.464-.766 1.5 1.5 0 01-1.464.766 1.5 1.5 0 01-1.293-.707z"
                clipRule="evenodd"
            />
        </svg>
    </IconWrapper>
);
export const LightbulbIcon = () => (
    <IconWrapper className="bg-gradient-to-br from-yellow-400 to-amber-500 text-white">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
        >
            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.657a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 14.95a1 1 0 001.414 1.414l.707-.707a1 1 0 00-1.414-1.414l-.707.707zM4 10a1 1 0 01-1-1V7a1 1 0 012 0v2a1 1 0 01-1 1zm1 4a1 1 0 100 2h-1a1 1 0 100-2h1zM10 18a1 1 0 001-1v-1a1 1 0 10-2 0v1a1 1 0 001 1zM8.94 6.553a1 1 0 00-1.88 0l-1.5 4A1 1 0 007 12h6a1 1 0 00.94-1.447l-1.5-4z" />
        </svg>
    </IconWrapper>
);
export const JamIcon = () => (
    <IconWrapper className="bg-gradient-to-br from-red-500 to-pink-500 text-white">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
        >
            <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
            />
        </svg>
    </IconWrapper>
);
export const GearIcon = () => (
    <IconWrapper className="bg-gradient-to-br from-gray-400 to-gray-600 text-white">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
        >
            <path
                fillRule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
            />
        </svg>
    </IconWrapper>
);
export const RightArrowIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8 text-purple-400/60"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 8l4 4m0 0l-4 4m4-4H3"
        />
    </svg>
);
export const InfoIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
    >
        <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
        />
    </svg>
);

export const DiagramsIcon = () => (
    <IconWrapper className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
        >
            <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
        </svg>
    </IconWrapper>
);