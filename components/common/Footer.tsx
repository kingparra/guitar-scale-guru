
import React from 'react';
import { COLORS } from '../../constants';

const Footer = () => (
    <footer className="text-center py-8 mt-16 border-t border-purple-400/20">
        <p style={{ color: COLORS.textSecondary }}>Crafted by a World-Class Senior Frontend Engineer</p>
        <p className="text-purple-400/50 text-sm">Powered by Gemini API & React</p>
    </footer>
);

export default Footer;
