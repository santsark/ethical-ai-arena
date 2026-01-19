import React from 'react';

export default function PrivacyPage() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 prose">
            <h1>Privacy Policy</h1>
            <p>Last updated: {new Date().toLocaleDateString()}</p>

            <h2>1. Introduction</h2>
            <p>Welcome to Ethical AI Arena. We respect your privacy and represent that we do not collect personal data from users beyond necessary functional cookies and server logs.</p>

            <h2>2. Data Collection</h2>
            <p>We do not track personal identifiable information (PII). We store:</p>
            <ul>
                <li>Inputs submitted to the AI models (questions/prompts).</li>
                <li>AI generated responses for analysis.</li>
            </ul>

            <h2>3. Third-Party Services</h2>
            <p>We use APIs from OpenAI, Google, and Anthropic. Your prompts are sent to these services for processing.</p>
        </div>
    );
}
